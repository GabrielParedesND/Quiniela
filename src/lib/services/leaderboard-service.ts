import {
  getLeaderboard as getLeaderboardSnapshot,
  batchWriteSnapshot,
  deleteSnapshotForGroup,
} from "@/lib/data/leaderboard-snapshots";
import type { LeaderboardSnapshotInput } from "@/lib/data/leaderboard-snapshots";
import { listMembersByGroup } from "@/lib/data/memberships";
import type { Membership } from "@/lib/data/memberships";
import { requireRole } from "@/lib/services/authorization-service";
import type {
  PaginationInput,
  PaginatedResult,
  LeaderboardEntry,
} from "@/types/groups";
import { docClient, ScanCommand, GetCommand } from "@/lib/dynamodb";

const GROUPS_TABLE_NAME = process.env.DYNAMO_GROUPS_TABLE!;
const SCORE_AGGREGATE_TABLE = process.env.DYNAMO_SCORE_AGGREGATE_TABLE!;
const USERS_TABLE = process.env.DYNAMO_USERS_TABLE!;

/**
 * Get member scores from ScoreAggregateTable.
 * Reads the user's global score which includes streak and special match multipliers.
 */
async function getMemberScores(
  userId: string,
  _joinedAt: string,
  tournamentId: string
): Promise<{ totalPoints: number; correctPredictions: number; totalPredictions: number }> {
  try {
    const scoreId = `${tournamentId}#global#${userId}`;
    const result = await docClient.send(
      new GetCommand({
        TableName: SCORE_AGGREGATE_TABLE,
        Key: { id: scoreId },
      })
    );

    if (result.Item) {
      return {
        totalPoints: Number(result.Item.points || 0),
        correctPredictions: Number(result.Item.correctPredictions || 0),
        totalPredictions: Number(result.Item.totalPredictions || 0),
      };
    }

    return { totalPoints: 0, correctPredictions: 0, totalPredictions: 0 };
  } catch (error) {
    console.error(`[leaderboard-service] Failed to get scores for user ${userId}:`, error);
    return { totalPoints: 0, correctPredictions: 0, totalPredictions: 0 };
  }
}

/**
 * Get user display name and avatar from UsersTable.
 */
async function getUserProfile(userId: string): Promise<{ displayName: string; avatarUrl?: string }> {
  try {
    const result = await docClient.send(
      new GetCommand({
        TableName: USERS_TABLE,
        Key: { userId },
      })
    );

    if (result.Item) {
      const nombres = String(result.Item.nombres || '');
      const apellidos = String(result.Item.apellidos || '');
      const displayName = `${nombres} ${apellidos}`.trim() || String(result.Item.email || 'Usuario');
      const avatarUrl = result.Item.avatar ? String(result.Item.avatar) : undefined;
      return { displayName, avatarUrl };
    }

    return { displayName: 'Usuario' };
  } catch (error) {
    console.error(`[leaderboard-service] Failed to get profile for user ${userId}:`, error);
    return { displayName: 'Usuario' };
  }
}

/**
 * Tiebreaker comparison for leaderboard entries.
 * 1) Higher total points first (descending)
 * 2) More correct predictions first (descending)
 * 3) Earlier join date first (ascending)
 */
function compareMembers(
  a: { totalPoints: number; correctPredictions: number; joinedAt: string },
  b: { totalPoints: number; correctPredictions: number; joinedAt: string }
): number {
  // 1. Higher points first
  if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
  // 2. More correct predictions first
  if (b.correctPredictions !== a.correctPredictions)
    return b.correctPredictions - a.correctPredictions;
  // 3. Earlier join date first (joinedAt ascending)
  return a.joinedAt.localeCompare(b.joinedAt);
}

/**
 * Get the leaderboard for a group and tournament with pagination.
 * Requires the requesting user to be at least a 'member' of the group.
 *
 * Since DynamoDB doesn't support offset-based pagination natively,
 * we query with a higher limit and slice the results.
 */
export async function getLeaderboard(
  groupId: string,
  tournamentId: string,
  userId: string,
  pagination: PaginationInput
): Promise<PaginatedResult<LeaderboardEntry>> {
  // 1. Require user is a member
  await requireRole(groupId, userId, "member");

  // 2. Build groupTournamentId
  const groupTournamentId = `${groupId}#${tournamentId}`;

  // 3. Always recalculate to ensure fresh data (display names, scores, avatars)
  // Group sizes are small (tens of members), so this is affordable per-request.
  await recalculateGroupLeaderboard(groupId, tournamentId);

  // 4. Query LeaderboardSnapshotsTable with enough items to cover offset + limit
  const queryLimit = pagination.offset + pagination.limit;
  const result = await getLeaderboardSnapshot(groupTournamentId, {
    limit: queryLimit + 1, // fetch one extra to determine hasMore
  });

  if (result.error || !result.data) {
    return {
      data: [],
      pagination: {
        total: 0,
        limit: pagination.limit,
        offset: pagination.offset,
        hasMore: false,
      },
    };
  }

  const allItems = result.data;
  const total = allItems.length > queryLimit ? queryLimit + 1 : allItems.length;

  // 4. Sort by position to ensure correct order (DynamoDB sort key may differ from tiebreaker logic)
  allItems.sort((a, b) => a.position - b.position);

  // 5. Slice to get the page
  const pageItems = allItems.slice(pagination.offset, pagination.offset + pagination.limit);

  // 5. Map results to LeaderboardEntry format
  const entries: LeaderboardEntry[] = pageItems.map((item) => ({
    position: item.position,
    userId: item.userId,
    displayName: item.displayName,
    avatarUrl: item.avatarUrl,
    totalPoints: item.totalPoints,
    correctPredictions: item.correctPredictions,
    totalPredictions: item.totalPredictions,
  }));

  // Determine hasMore: if we fetched more items than offset + limit, there are more
  const hasMore = allItems.length > pagination.offset + pagination.limit;

  return {
    data: entries,
    pagination: {
      total: hasMore ? pagination.offset + pagination.limit + 1 : allItems.length,
      limit: pagination.limit,
      offset: pagination.offset,
      hasMore,
    },
  };
}

/**
 * Recalculate the leaderboard for a specific group and tournament.
 * 1. Query active members of the group
 * 2. For each member, get their scores filtered by joinedAt
 * 3. Sort using tiebreaker logic
 * 4. Assign positions (1-based)
 * 5. Delete old snapshot and batch write new one
 */
export async function recalculateGroupLeaderboard(
  groupId: string,
  tournamentId: string
): Promise<void> {
  // 1. Query active members of the group
  const membersResult = await listMembersByGroup(groupId, "active");

  if (membersResult.error || !membersResult.data || membersResult.data.length === 0) {
    return;
  }

  const activeMembers = membersResult.data;

  // 2. For each member, get their scores
  const memberScores: Array<{
    membership: Membership;
    totalPoints: number;
    correctPredictions: number;
    totalPredictions: number;
  }> = [];

  for (const member of activeMembers) {
    const scores = await getMemberScores(member.userId, member.joinedAt, tournamentId);
    memberScores.push({
      membership: member,
      ...scores,
    });
  }

  // 3. Sort members using tiebreaker logic
  memberScores.sort((a, b) =>
    compareMembers(
      { totalPoints: a.totalPoints, correctPredictions: a.correctPredictions, joinedAt: a.membership.joinedAt },
      { totalPoints: b.totalPoints, correctPredictions: b.correctPredictions, joinedAt: b.membership.joinedAt }
    )
  );

  // 4. Assign positions (1-based) with real user profiles
  const groupTournamentId = `${groupId}#${tournamentId}`;
  const now = new Date().toISOString();

  const snapshotEntries: LeaderboardSnapshotInput[] = [];
  for (let index = 0; index < memberScores.length; index++) {
    const entry = memberScores[index];
    const profile = await getUserProfile(entry.membership.userId);
    snapshotEntries.push({
      groupTournamentId,
      userId: entry.membership.userId,
      displayName: profile.displayName,
      avatarUrl: profile.avatarUrl,
      totalPoints: entry.totalPoints,
      correctPredictions: entry.correctPredictions,
      totalPredictions: entry.totalPredictions,
      position: index + 1,
      calculatedAt: now,
    });
  }

  // 5. Delete old snapshot for this group+tournament
  await deleteSnapshotForGroup(groupTournamentId);

  // 6. Batch write new snapshot
  if (snapshotEntries.length > 0) {
    const writeResult = await batchWriteSnapshot(snapshotEntries);
    if (!writeResult.success) {
      console.error(
        `Failed to write leaderboard snapshot for ${groupTournamentId}:`,
        writeResult.error
      );
    }
  }
}

/**
 * Recalculate leaderboards for all active groups.
 * Since we don't have a GSI by tournament, we scan all active groups
 * and process each in parallel using Promise.allSettled.
 * Logs failures but doesn't throw.
 */
export async function recalculateAllLeaderboards(
  tournamentId: string
): Promise<void> {
  // Query all active groups (scan since no GSI by tournament)
  const activeGroups = await getAllActiveGroups();

  // Process each group in parallel
  const results = await Promise.allSettled(
    activeGroups.map((group) =>
      recalculateGroupLeaderboard(group.groupId, tournamentId)
    )
  );

  // Log any failures
  results.forEach((result, index) => {
    if (result.status === "rejected") {
      console.error(
        `Failed to recalculate leaderboard for group ${activeGroups[index].groupId}:`,
        result.reason
      );
    }
  });
}

/**
 * Query all active groups from the GroupsTable.
 * Uses a scan with filter since there's no GSI by status.
 */
async function getAllActiveGroups(): Promise<Array<{ groupId: string }>> {
  const groups: Array<{ groupId: string }> = [];
  let lastEvaluatedKey: Record<string, unknown> | undefined;

  do {
    const result = await docClient.send(
      new ScanCommand({
        TableName: GROUPS_TABLE_NAME,
        FilterExpression: "#status = :active",
        ExpressionAttributeNames: { "#status": "status" },
        ExpressionAttributeValues: { ":active": "active" },
        ProjectionExpression: "groupId",
        ...(lastEvaluatedKey && { ExclusiveStartKey: lastEvaluatedKey }),
      })
    );

    if (result.Items) {
      groups.push(...(result.Items as Array<{ groupId: string }>));
    }

    lastEvaluatedKey = result.LastEvaluatedKey as Record<string, unknown> | undefined;
  } while (lastEvaluatedKey);

  return groups;
}
