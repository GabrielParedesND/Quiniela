import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
  ScanCommand,
} from '@aws-sdk/lib-dynamodb';
import { getPhase, QuinielaSnapshot, TeamStanding } from '@/lib/db/quiniela';
import { computeMatchDeadline, PredictionDeadlineRule, resolveRule } from '@/lib/deadline';
import { logActivityServer } from '@/lib/logger/server-activity';

const client = new DynamoDBClient({
  region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
});

const docClient = DynamoDBDocumentClient.from(client, {
  marshallOptions: { removeUndefinedValues: true },
});

const getRequiredEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required env var: ${key}`);
  }
  return value;
};

const getOptionalEnv = (key: string): string | undefined => {
  const value = process.env[key];
  return value || undefined;
};

const getTables = () => ({
  tournaments: getRequiredEnv('DYNAMO_TOURNAMENTS_TABLE'),
  rounds: getRequiredEnv('DYNAMO_ROUNDS_TABLE'),
  teams: getRequiredEnv('DYNAMO_TEAMS_TABLE'),
  matches: getRequiredEnv('DYNAMO_MATCHES_TABLE'),
  predictions: getRequiredEnv('DYNAMO_PREDICTIONS_TABLE'),
  scoreAggregate: getRequiredEnv('DYNAMO_SCORE_AGGREGATE_TABLE'),
  brandingConfig: getOptionalEnv('DYNAMO_BRANDING_CONFIG_TABLE'),
  standings: getOptionalEnv('DYNAMO_STANDINGS_TABLE'),
});

/**
 * Resolve the active tournamentId dynamically.
 * 
 * Strategy order:
 * 1. BrandingConfig: active project with tournamentId set directly
 * 2. BrandingConfig → TournamentsTable: active project's brandingId matches a tournament's projectId
 * 3. TournamentsTable: any tournament that exists
 */
let _cachedTournamentId: string | null = null;
let _cacheTimestamp = 0;
const CACHE_TTL_MS = 60_000; // 1 minute

const resolveActiveTournamentId = async (): Promise<string> => {
  // Return cached value if fresh
  if (_cachedTournamentId && Date.now() - _cacheTimestamp < CACHE_TTL_MS) {
    return _cachedTournamentId;
  }

  const tables = getTables();

  // Strategy 1: Find active project in BrandingConfig with a tournamentId
  if (tables.brandingConfig) {
    try {
      const scanResponse = await docClient.send(
        new ScanCommand({
          TableName: tables.brandingConfig,
          FilterExpression: '#s = :active AND attribute_exists(tournamentId)',
          ExpressionAttributeNames: { '#s': 'status' },
          ExpressionAttributeValues: { ':active': 'active' },
          Limit: 10,
        })
      );
      const activeProject = scanResponse.Items?.[0];
      if (activeProject?.tournamentId) {
        _cachedTournamentId = String(activeProject.tournamentId);
        _cacheTimestamp = Date.now();
        return _cachedTournamentId;
      }
    } catch (err) {
      console.warn('[resolveActiveTournamentId] Strategy 1 failed:', (err as Error).message);
    }
  }

  // Strategy 2: Find active project, then look for a tournament linked to that project via projectId
  if (tables.brandingConfig) {
    try {
      const scanResponse = await docClient.send(
        new ScanCommand({
          TableName: tables.brandingConfig,
          FilterExpression: '#s = :active',
          ExpressionAttributeNames: { '#s': 'status' },
          ExpressionAttributeValues: { ':active': 'active' },
          Limit: 10,
        })
      );
      const activeProject = scanResponse.Items?.[0];
      if (activeProject?.brandingId) {
        // Look for a tournament whose projectId matches this project's brandingId
        const tournamentsResponse = await docClient.send(
          new ScanCommand({
            TableName: tables.tournaments,
            FilterExpression: 'projectId = :projectId',
            ExpressionAttributeValues: { ':projectId': String(activeProject.brandingId) },
            Limit: 1,
          })
        );
        const linkedTournament = tournamentsResponse.Items?.[0];
        if (linkedTournament?.tournamentId) {
          _cachedTournamentId = String(linkedTournament.tournamentId);
          _cacheTimestamp = Date.now();
          return _cachedTournamentId;
        }
      }
    } catch (err) {
      console.warn('[resolveActiveTournamentId] Strategy 2 failed:', (err as Error).message);
    }
  }

  // Strategy 3: Get the first tournament from TournamentsTable
  try {
    const scanResponse = await docClient.send(
      new ScanCommand({
        TableName: tables.tournaments,
        Limit: 1,
      })
    );
    const firstTournament = scanResponse.Items?.[0];
    if (firstTournament?.tournamentId) {
      _cachedTournamentId = String(firstTournament.tournamentId);
      _cacheTimestamp = Date.now();
      return _cachedTournamentId;
    }
  } catch (err) {
    console.warn('[resolveActiveTournamentId] Strategy 3 failed:', (err as Error).message);
  }

  throw new Error('No se encontró un torneo activo. Configura un proyecto con torneo en el CMS.');
};

const sumPointsForMatch = (
  predictedA: number,
  predictedB: number,
  officialA?: number,
  officialB?: number
): number => {
  if (officialA == null || officialB == null) return 0;
  if (predictedA === officialA && predictedB === officialB) return 5;

  const sameWinner =
    (predictedA > predictedB && officialA > officialB) ||
    (predictedB > predictedA && officialB > officialA) ||
    (predictedA === predictedB && officialA === officialB);

  return sameWinner ? 3 : 0;
};

const computeStandings = async (
  tournamentId: string,
  teams: Array<{ id: string; group: string }>,
  matches: Array<{
    teamAId: string;
    teamBId: string;
    status: 'played' | 'upcoming';
    scoreA?: number;
    scoreB?: number;
    apiRound?: string;
  }>
): Promise<Record<string, TeamStanding[]>> => {
  const tables = getTables();

  // Try to read official standings from DynamoDB first
  if (tables.standings) {
    try {
      const standingsResponse = await docClient.send(
        new QueryCommand({
          TableName: tables.standings,
          KeyConditionExpression: 'tournamentId = :tournamentId',
          ExpressionAttributeValues: { ':tournamentId': tournamentId },
        })
      );
      const rows = standingsResponse.Items || [];
      if (rows.length > 0) {
        const result: Record<string, TeamStanding[]> = {};
        for (const row of rows) {
          const group = String(row.group || 'General');
          if (!result[group]) result[group] = [];
          result[group].push({
            teamId: `af-${row.teamApiId}`,
            teamName: String(row.teamName),
            teamLogo: String(row.teamLogo),
            group,
            rank: Number(row.originalRank ?? row.rank),
            played: Number(row.played || 0),
            won: Number(row.won || 0),
            drawn: Number(row.drawn || 0),
            lost: Number(row.lost || 0),
            goalsFor: Number(row.goalsFor || 0),
            goalsAgainst: Number(row.goalsAgainst || 0),
            goalsDiff: Number(row.goalsDiff || 0),
            pts: Number(row.points || 0),
            form: row.form ? String(row.form) : null,
            description: row.description ? String(row.description) : null,
          });
        }
        // Sort each group by rank
        for (const group of Object.keys(result)) {
          result[group].sort((a, b) => a.rank - b.rank);
        }
        return result;
      }
    } catch (err) {
      console.warn('[computeStandings] Failed to read from DynamoDB:', (err as Error).message);
    }
  }

  // Fallback: compute from matches
  // First, try to infer group from apiRound (e.g. "Group A - 1" → "Group A")
  const teamGroupMap = new Map<string, string>();
  for (const match of matches) {
    if (match.apiRound && match.apiRound.startsWith('Group')) {
      const group = match.apiRound.replace(/\s*-\s*\d+$/, '').trim();
      if (group) {
        teamGroupMap.set(match.teamAId, group);
        teamGroupMap.set(match.teamBId, group);
      }
    }
  }

  // Use inferred group if team has no group assigned
  const teamsWithGroup = teams.map((t) => ({
    ...t,
    group: t.group || teamGroupMap.get(t.id) || 'General',
  }));

  const pointsByTeam: Record<string, { pts: number; pj: number; pg: number; pe: number; pp: number; gf: number; gc: number }> = {};
  for (const team of teamsWithGroup) pointsByTeam[team.id] = { pts: 0, pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0 };

  for (const match of matches) {
    if (match.status !== 'played' || match.scoreA == null || match.scoreB == null) continue;
    const h = pointsByTeam[match.teamAId];
    const a = pointsByTeam[match.teamBId];
    if (h) { h.pj++; h.gf += match.scoreA; h.gc += match.scoreB; }
    if (a) { a.pj++; a.gf += match.scoreB; a.gc += match.scoreA; }
    if (match.scoreA > match.scoreB) { if (h) { h.pg++; h.pts += 3; } if (a) a.pp++; }
    else if (match.scoreB > match.scoreA) { if (a) { a.pg++; a.pts += 3; } if (h) h.pp++; }
    else { if (h) { h.pe++; h.pts += 1; } if (a) { a.pe++; a.pts += 1; } }
  }

  const result: Record<string, TeamStanding[]> = {};
  const groups = [...new Set(teamsWithGroup.map((t) => t.group))];
  for (const group of groups) {
    result[group] = teamsWithGroup
      .filter((team) => team.group === group)
      .map((team, idx) => {
        const s = pointsByTeam[team.id] || { pts: 0, pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0 };
        return {
          teamId: team.id,
          teamName: '',
          teamLogo: '',
          group,
          rank: idx + 1,
          played: s.pj,
          won: s.pg,
          drawn: s.pe,
          lost: s.pp,
          goalsFor: s.gf,
          goalsAgainst: s.gc,
          goalsDiff: s.gf - s.gc,
          pts: s.pts,
          form: null,
          description: null,
        };
      })
      .sort((a, b) => b.pts - a.pts || b.goalsDiff - a.goalsDiff || b.goalsFor - a.goalsFor);
    // Re-assign ranks after sorting
    result[group].forEach((s, i) => { s.rank = i + 1; });
  }
  return result;
};

const getSnapshot = async (tournamentId: string, userId?: string): Promise<QuinielaSnapshot> => {
  const tables = getTables();

  // Fetch tournament record to read predictionDeadlineRule
  let predictionDeadlineRule: PredictionDeadlineRule = 'per-match';
  try {
    const tournamentResponse = await docClient.send(
      new GetCommand({
        TableName: tables.tournaments,
        Key: { tournamentId },
      })
    );
    predictionDeadlineRule = resolveRule(tournamentResponse.Item?.predictionDeadlineRule as string | undefined);
  } catch (err) {
    console.warn('[getSnapshot] Failed to read tournament record for deadline rule:', (err as Error).message);
  }

  // Use Scan with filter instead of GSI query because teams imported from
  // API-Football may not have groupCode, and the byTournamentAndGroup GSI
  // requires groupCode as range key (items without it won't appear in the index)
  const teamsResponse = await docClient.send(
    new ScanCommand({
      TableName: tables.teams,
      FilterExpression: 'tournamentId = :tournamentId',
      ExpressionAttributeValues: { ':tournamentId': tournamentId },
    })
  );

  const matchesResponse = await docClient.send(
    new QueryCommand({
      TableName: tables.matches,
      IndexName: 'byTournamentAndKickoff',
      KeyConditionExpression: 'tournamentId = :tournamentId',
      ExpressionAttributeValues: { ':tournamentId': tournamentId },
    })
  );

  const rawTeams = (teamsResponse.Items || []).map((item) => ({
    id: String(item.teamId),
    name: String(item.name),
    short: String(item.code),
    flagUrl: String(item.flagUrl),
    group: String(item.groupCode || ''),
  }));

  // Map CMS status to app status: 'final' → 'played', everything else → 'upcoming'
  const mapStatus = (cmsStatus: string): 'played' | 'upcoming' => {
    return cmsStatus === 'final' ? 'played' : 'upcoming';
  };

  // Build jornada map: each unique kickoff date (YYYY-MM-DD) in Guatemala timezone = 1 jornada, sorted chronologically
  const matchItems = matchesResponse.Items || [];

  // Helper to get the date in Guatemala timezone (UTC-6)
  const getGuatemalaDate = (isoString: string): string => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleDateString('en-CA', { timeZone: 'America/Guatemala' }); // en-CA gives YYYY-MM-DD format
  };

  const uniqueKickoffDates = [
    ...new Set(matchItems.map((item) => getGuatemalaDate(String(item.kickoffAt || ''))).filter(Boolean)),
  ].sort();
  const dateToJornada = new Map(uniqueKickoffDates.map((d, i) => [d, i + 1]));

  const rawMatches = matchItems
    .map((item) => {
      const kickoffAt = String(item.kickoffAt || '');
      const kickoffDate = getGuatemalaDate(kickoffAt);
      return {
        id: String(item.matchId),
        jornada: dateToJornada.get(kickoffDate) || 0,
        dateLabel: kickoffDate
          ? new Date(kickoffAt).toLocaleDateString('es-GT', { day: 'numeric', month: 'short', timeZone: 'America/Guatemala' })
          : '',
        kickoffAt,
        apiRound: String(item.apiRound || ''),
        teamAId: String(item.homeTeamId),
        teamBId: String(item.awayTeamId),
        status: mapStatus(String(item.status || 'scheduled')),
        scoreA: item.officialHomeScore != null ? Number(item.officialHomeScore) : undefined,
        scoreB: item.officialAwayScore != null ? Number(item.officialAwayScore) : undefined,
        isSpecial: item.isSpecial === true,
        multiplier: item.multiplier ? Number(item.multiplier) : undefined,
        closesAt: item.closesAt ? String(item.closesAt) : undefined,
      };
    })
    .sort((a, b) => a.jornada - b.jornada || a.kickoffAt.localeCompare(b.kickoffAt) || a.id.localeCompare(b.id));

  // Debug: log unique apiRound values
  const uniqueRounds = [...new Set(rawMatches.map(m => m.apiRound).filter(Boolean))];
  console.log(`[getSnapshot] Unique apiRound values (${uniqueRounds.length}):`, uniqueRounds.slice(0, 15));

  let userPredictions: Record<string, { a: string; b: string }> = {};
  if (userId) {
    const predictionsResponse = await docClient.send(
      new QueryCommand({
        TableName: tables.predictions,
        IndexName: 'byTournamentAndUser',
        KeyConditionExpression: 'tournamentId = :tournamentId AND userId = :userId',
        ExpressionAttributeValues: {
          ':tournamentId': tournamentId,
          ':userId': userId,
        },
      })
    );

    userPredictions = (predictionsResponse.Items || []).reduce<Record<string, { a: string; b: string }>>(
      (acc, prediction) => {
        const matchId = String(prediction.matchId);
        const predictedHomeScore = Number(prediction.predictedHomeScore);
        const predictedAwayScore = Number(prediction.predictedAwayScore);

        if (
          Number.isNaN(predictedHomeScore) ||
          Number.isNaN(predictedAwayScore) ||
          !Number.isInteger(predictedHomeScore) ||
          !Number.isInteger(predictedAwayScore) ||
          predictedHomeScore < 0 ||
          predictedAwayScore < 0
        ) {
          return acc;
        }

        acc[matchId] = {
          a: String(predictedHomeScore),
          b: String(predictedAwayScore),
        };
        return acc;
      },
      {}
    );
  }

  // Compute points per jornada dynamically based on actual rounds
  // Only include jornadas that have at least one played match
  const allJornadas = [...new Set(rawMatches.map((m) => m.jornada))].sort((a, b) => a - b);
  const playedJornadas = allJornadas.filter((jornada) =>
    rawMatches.some((match) => match.jornada === jornada && match.status === 'played')
  );
  const pointsByJornada = playedJornadas.map((jornada) => {
    const playedInRound = rawMatches.filter((match) => match.jornada === jornada && match.status === 'played');
    return playedInRound.reduce((total, match) => {
      const prediction = userPredictions[match.id];
      if (!prediction) return total;
      const predictedA = Number(prediction.a);
      const predictedB = Number(prediction.b);
      if (Number.isNaN(predictedA) || Number.isNaN(predictedB)) return total;
      let pts = sumPointsForMatch(predictedA, predictedB, match.scoreA, match.scoreB);
      // Apply special match multiplier
      if (pts > 0 && match.isSpecial && match.multiplier && match.multiplier > 1) {
        pts = pts * match.multiplier;
      }
      return total + pts;
    }, 0);
  });

  // Read streak config from BrandingConfig (set via CMS activations module)
  let streakEnabled = false;
  let streakThreshold = 3;
  let streakMultiplier = 2;

  if (tables.brandingConfig) {
    try {
      const scanResponse = await docClient.send(
        new ScanCommand({
          TableName: tables.brandingConfig,
          FilterExpression: '#s = :active',
          ExpressionAttributeNames: { '#s': 'status' },
          ExpressionAttributeValues: { ':active': 'active' },
          Limit: 10,
        })
      );
      const activeProject = scanResponse.Items?.[0];
      if (activeProject) {
        streakEnabled = activeProject.streakEnabled === true;
        if (activeProject.streakThreshold != null) streakThreshold = Number(activeProject.streakThreshold);
        if (activeProject.streakMultiplier != null) streakMultiplier = Number(activeProject.streakMultiplier);
      }
    } catch (err) {
      console.warn('[getSnapshot] Failed to read streak config:', (err as Error).message);
    }
  }

  // Apply streak multiplier only if enabled in CMS
  const jornadaParticipation = playedJornadas.map((jornada) => {
    const jornadaMatches = rawMatches.filter((m) => m.jornada === jornada);
    return jornadaMatches.some((m) => userPredictions[m.id] != null);
  });

  // Calculate current streak length (from the end)
  let currentStreak = 0;
  for (let i = jornadaParticipation.length - 1; i >= 0; i--) {
    if (jornadaParticipation[i]) currentStreak++;
    else break;
  }
  const streakActive = streakEnabled && currentStreak >= streakThreshold;

  if (streakEnabled) {
    for (let i = streakThreshold - 1; i < pointsByJornada.length; i++) {
      const streak = jornadaParticipation.slice(i - streakThreshold + 1, i + 1).every(Boolean);
      if (streak && pointsByJornada[i] > 0) {
        pointsByJornada[i] = pointsByJornada[i] * streakMultiplier;
      }
    }
  }

  // ===== RANKING: Read from ScoreAggregate (same source as CMS reports) =====
  // This ensures quiniela-v1 and CMS always show the same ranking.
  // ScoreAggregate is kept up-to-date by sync-results Lambda.
  // Paginate to ensure ALL records are fetched.
  const scoreAggregateItems: Record<string, unknown>[] = [];
  let saLastKey: Record<string, unknown> | undefined;
  do {
    const saResponse = await docClient.send(
      new QueryCommand({
        TableName: tables.scoreAggregate,
        IndexName: 'byTournamentAndPoints',
        KeyConditionExpression: 'tournamentId = :tournamentId',
        ExpressionAttributeValues: { ':tournamentId': tournamentId },
        ScanIndexForward: false,
        ExclusiveStartKey: saLastKey,
      })
    );
    scoreAggregateItems.push(...(saResponse.Items || []));
    saLastKey = saResponse.LastEvaluatedKey;
  } while (saLastKey);

  // Sort with same tiebreaker as CMS: points desc → correctPredictions desc → displayName asc
  const sortedScoreAggregates = scoreAggregateItems
    .filter((item) => item.scope === 'global')
    .sort((a, b) => {
      const ptsA = Number(a.points || 0);
      const ptsB = Number(b.points || 0);
      if (ptsB !== ptsA) return ptsB - ptsA;
      const exA = Number(a.correctPredictions || 0);
      const exB = Number(b.correctPredictions || 0);
      if (exB !== exA) return exB - exA;
      return String(a.displayName || '').localeCompare(String(b.displayName || ''));
    });

  // Build ranking entries from ScoreAggregate
  const allRankingEntries = sortedScoreAggregates.map((item) => ({
    uid: String(item.refId || ''),
    name: String(item.displayName || 'Usuario'),
    pts: Number(item.points || 0),
    exacts: Number(item.correctPredictions || 0),
    phase: getPhase(Number(item.points || 0)),
  }));

  // Find the current user's real position from the authoritative ScoreAggregate record
  let userPosition = 0;
  if (userId) {
    const userScoreRecord = sortedScoreAggregates.find((item) => String(item.refId || '') === userId);
    if (userScoreRecord?.currentPosition != null) {
      userPosition = Number(userScoreRecord.currentPosition);
    } else {
      // Fallback: if currentPosition not set (new user not yet in recalculation cycle)
      userPosition = allRankingEntries.findIndex((e) => e.uid === userId) + 1;
    }
  }

  // Return only top 20 for display (without uid)
  const rankingUsers = allRankingEntries.slice(0, 20).map(({ uid: _uid, ...rest }) => rest);

  return {
    teams: rawTeams,
    matches: rawMatches,
    standingsByGroup: await computeStandings(tournamentId, rawTeams, rawMatches),
    rankingUsers,
    userPredictions,
    points: pointsByJornada.reduce((total, value) => total + value, 0),
    pointsByJornada,
    userPosition,
    totalParticipants: allRankingEntries.length,
    streak: streakEnabled ? {
      current: currentStreak,
      threshold: streakThreshold,
      multiplier: streakMultiplier,
      active: streakActive,
    } : undefined,
    predictionDeadlineRule,
  };
};



export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || undefined;
    const requestedTournamentId = searchParams.get('tournamentId') || undefined;
    
    const tournamentId = requestedTournamentId || await resolveActiveTournamentId();
    const snapshot = await getSnapshot(tournamentId, userId);

    return NextResponse.json(snapshot);
  } catch (error: unknown) {
    console.error('[quiniela GET] Error:', error);
    const message = error instanceof Error ? error.message : 'No se pudo cargar la quiniela';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  let parsedUserId = '';
  try {
    const tables = getTables();
    const { userId, predictions, tournamentId: requestedTournamentId } = (await request.json()) as {
      userId?: string;
      predictions?: Record<string, { a: string; b: string }>;
      tournamentId?: string;
    };

    parsedUserId = userId || '';
    const tournamentId = requestedTournamentId || await resolveActiveTournamentId();

    if (!userId) {
      return NextResponse.json({ error: 'userId requerido' }, { status: 400 });
    }
    if (!predictions || typeof predictions !== 'object') {
      return NextResponse.json({ error: 'predictions requerido' }, { status: 400 });
    }

    const now = new Date().toISOString();
    const predictionEntries = Object.entries(predictions);

    // Build a map of match deadlines to enforce time-based locking on the server
    const matchesResponse = await docClient.send(
      new QueryCommand({
        TableName: tables.matches,
        IndexName: 'byTournamentAndKickoff',
        KeyConditionExpression: 'tournamentId = :tournamentId',
        ExpressionAttributeValues: { ':tournamentId': tournamentId },
      })
    );

    // Read tournament record to determine the deadline rule
    let rule: PredictionDeadlineRule = 'per-match';
    try {
      const tournamentResponse = await docClient.send(
        new GetCommand({
          TableName: tables.tournaments,
          Key: { tournamentId },
        })
      );
      rule = resolveRule(tournamentResponse.Item?.predictionDeadlineRule as string | undefined);
    } catch (err) {
      console.warn('[quiniela POST] Failed to read tournament record for deadline rule:', (err as Error).message);
    }

    const matchDeadlineMap = new Map<string, string>();
    for (const item of matchesResponse.Items || []) {
      const matchId = String(item.matchId);
      const deadline = computeMatchDeadline(
        {
          kickoffAt: item.kickoffAt ? String(item.kickoffAt) : undefined,
          closesAt: item.closesAt ? String(item.closesAt) : undefined,
        },
        rule
      );
      if (deadline) matchDeadlineMap.set(matchId, deadline);
    }

    const nowMs = Date.now();
    let skippedPastDeadline = 0;

    for (const [matchId, prediction] of predictionEntries) {
      const predictedHomeScore = Number(prediction.a);
      const predictedAwayScore = Number(prediction.b);

      if (
        !matchId ||
        Number.isNaN(predictedHomeScore) ||
        !Number.isInteger(predictedHomeScore) ||
        Number.isNaN(predictedAwayScore) ||
        !Number.isInteger(predictedAwayScore) ||
        predictedHomeScore < 0 ||
        predictedAwayScore < 0
      ) {
        continue;
      }

      // Reject predictions for matches past their deadline
      const matchDeadline = matchDeadlineMap.get(matchId);
      if (matchDeadline && new Date(matchDeadline).getTime() <= nowMs) {
        skippedPastDeadline++;
        continue;
      }

      await docClient.send(
        new PutCommand({
          TableName: tables.predictions,
          Item: {
            predictionId: `${tournamentId}#${userId}#${matchId}`,
            tournamentId,
            userId,
            matchId,
            predictedHomeScore,
            predictedAwayScore,
            submittedAt: now,
            updatedAt: now,
          },
        })
      );
    }

    const snapshot = await getSnapshot(tournamentId, userId);

    // Log successful prediction save
    logActivityServer({
      userId,
      activityType: 'PREDICTIONS_SAVED',
      metadata: {
        tournamentId,
        predictionsCount: predictionEntries.length,
        skippedPastDeadline,
        points: snapshot.points,
      },
    });

    return NextResponse.json(snapshot);
  } catch (error: unknown) {
    console.error('Error saving predictions:', error);

    if (parsedUserId) {
      logActivityServer({
        userId: parsedUserId,
        activityType: 'PREDICTIONS_SAVE_FAILED',
        metadata: {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });
    }

    return NextResponse.json({ error: 'No se pudieron guardar pronosticos' }, { status: 500 });
  }
}
