import {
  docClient,
  handleDynamoDBError,
  QueryCommand,
  BatchWriteCommand,
} from "@/lib/dynamodb";

const TABLE_NAME = process.env.DYNAMO_LEADERBOARD_SNAPSHOTS_TABLE!;

const MAX_PADDED_POINTS = 99999;
const BATCH_WRITE_MAX = 25;

export interface LeaderboardSnapshot {
  groupTournamentId: string;
  sortKey: string;
  userId: string;
  displayName: string;
  avatarUrl?: string;
  totalPoints: number;
  correctPredictions: number;
  totalPredictions: number;
  position: number;
  calculatedAt: string;
}

export interface LeaderboardSnapshotInput {
  groupTournamentId: string;
  userId: string;
  displayName: string;
  avatarUrl?: string;
  totalPoints: number;
  correctPredictions: number;
  totalPredictions: number;
  position: number;
  calculatedAt: string;
}

/**
 * Build a padded sort key for natural descending order in DynamoDB.
 * Uses inverted padded points: `99999 - points` concatenated with userId.
 * Example: user with 45 points → sortKey = `99954#userId123`
 */
export function buildSortKey(points: number, userId: string): string {
  const invertedPoints = MAX_PADDED_POINTS - points;
  const padded = String(invertedPoints).padStart(5, "0");
  return `${padded}#${userId}`;
}

/**
 * Batch write leaderboard snapshot entries.
 * Handles DynamoDB's 25-item batch limit by splitting into multiple batches.
 */
export async function batchWriteSnapshot(
  entries: LeaderboardSnapshotInput[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const items = entries.map((entry) => ({
      ...entry,
      sortKey: buildSortKey(entry.totalPoints, entry.userId),
    }));

    // Split into batches of 25 (DynamoDB limit)
    for (let i = 0; i < items.length; i += BATCH_WRITE_MAX) {
      const batch = items.slice(i, i + BATCH_WRITE_MAX);

      await docClient.send(
        new BatchWriteCommand({
          RequestItems: {
            [TABLE_NAME]: batch.map((item) => ({
              PutRequest: { Item: item },
            })),
          },
        })
      );
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: handleDynamoDBError(error) };
  }
}

/**
 * Get leaderboard entries for a group+tournament, paginated.
 * Results are returned in natural descending order by points (due to padded sort key).
 */
export async function getLeaderboard(
  groupTournamentId: string,
  options?: { limit?: number; exclusiveStartKey?: Record<string, unknown> }
): Promise<{
  data?: LeaderboardSnapshot[];
  lastEvaluatedKey?: Record<string, unknown>;
  error?: string;
}> {
  try {
    const result = await docClient.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        KeyConditionExpression: "groupTournamentId = :groupTournamentId",
        ExpressionAttributeValues: {
          ":groupTournamentId": groupTournamentId,
        },
        ...(options?.limit && { Limit: options.limit }),
        ...(options?.exclusiveStartKey && {
          ExclusiveStartKey: options.exclusiveStartKey,
        }),
      })
    );

    return {
      data: (result.Items as LeaderboardSnapshot[]) || [],
      lastEvaluatedKey: result.LastEvaluatedKey as
        | Record<string, unknown>
        | undefined,
    };
  } catch (error) {
    return { error: handleDynamoDBError(error) };
  }
}

/**
 * Delete all leaderboard snapshot entries for a group+tournament.
 * Queries all items and batch deletes them (used to clear old snapshots before writing new ones).
 */
export async function deleteSnapshotForGroup(
  groupTournamentId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Query all items for this groupTournamentId
    let lastEvaluatedKey: Record<string, unknown> | undefined;

    do {
      const result = await docClient.send(
        new QueryCommand({
          TableName: TABLE_NAME,
          KeyConditionExpression: "groupTournamentId = :groupTournamentId",
          ExpressionAttributeValues: {
            ":groupTournamentId": groupTournamentId,
          },
          ProjectionExpression: "groupTournamentId, sortKey",
          ...(lastEvaluatedKey && { ExclusiveStartKey: lastEvaluatedKey }),
        })
      );

      const items = result.Items || [];

      // Batch delete in groups of 25
      for (let i = 0; i < items.length; i += BATCH_WRITE_MAX) {
        const batch = items.slice(i, i + BATCH_WRITE_MAX);

        await docClient.send(
          new BatchWriteCommand({
            RequestItems: {
              [TABLE_NAME]: batch.map((item) => ({
                DeleteRequest: {
                  Key: {
                    groupTournamentId: item.groupTournamentId,
                    sortKey: item.sortKey,
                  },
                },
              })),
            },
          })
        );
      }

      lastEvaluatedKey = result.LastEvaluatedKey as
        | Record<string, unknown>
        | undefined;
    } while (lastEvaluatedKey);

    return { success: true };
  } catch (error) {
    return { success: false, error: handleDynamoDBError(error) };
  }
}
