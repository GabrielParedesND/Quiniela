import { NextRequest, NextResponse } from 'next/server';
import { Resource } from 'sst';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
} from '@aws-sdk/lib-dynamodb';
import { getPhase, QuinielaSnapshot, TeamStanding } from '@/lib/db/quiniela';

const DEFAULT_TOURNAMENT_ID = 'world-cup-2026-demo';

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
});

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

const computeStandings = (
  teams: Array<{ id: number; group: 'A' | 'B' | 'C' | 'D' }>,
  matches: Array<{
    teamAId: number;
    teamBId: number;
    status: 'played' | 'upcoming';
    scoreA?: number;
    scoreB?: number;
  }>
): Record<string, TeamStanding[]> => {
  const pointsByTeam: Record<number, number> = {};
  for (const team of teams) pointsByTeam[team.id] = 0;

  for (const match of matches) {
    if (match.status !== 'played' || match.scoreA == null || match.scoreB == null) continue;
    if (match.scoreA > match.scoreB) pointsByTeam[match.teamAId] += 3;
    else if (match.scoreB > match.scoreA) pointsByTeam[match.teamBId] += 3;
    else {
      pointsByTeam[match.teamAId] += 1;
      pointsByTeam[match.teamBId] += 1;
    }
  }

  const result: Record<string, TeamStanding[]> = {};
  for (const group of ['A', 'B', 'C', 'D'] as const) {
    result[group] = teams
      .filter((team) => team.group === group)
      .map((team) => ({ teamId: team.id, pts: pointsByTeam[team.id] || 0 }))
      .sort((a, b) => b.pts - a.pts);
  }
  return result;
};

const getSnapshot = async (userId?: string): Promise<QuinielaSnapshot> => {
  const tables = getTables();

  const teamsResponse = await docClient.send(
    new QueryCommand({
      TableName: tables.teams,
      IndexName: 'byTournamentAndGroup',
      KeyConditionExpression: 'tournamentId = :tournamentId',
      ExpressionAttributeValues: { ':tournamentId': DEFAULT_TOURNAMENT_ID },
    })
  );

  const matchesResponse = await docClient.send(
    new QueryCommand({
      TableName: tables.matches,
      IndexName: 'byTournamentAndKickoff',
      KeyConditionExpression: 'tournamentId = :tournamentId',
      ExpressionAttributeValues: { ':tournamentId': DEFAULT_TOURNAMENT_ID },
    })
  );

  const rankingResponse = await docClient.send(
    new QueryCommand({
      TableName: tables.scoreAggregate,
      IndexName: 'byTournamentAndPoints',
      KeyConditionExpression: 'tournamentId = :tournamentId',
      ExpressionAttributeValues: { ':tournamentId': DEFAULT_TOURNAMENT_ID },
      ScanIndexForward: false,
      Limit: 20,
    })
  );

  const rawTeams = (teamsResponse.Items || []).map((item) => ({
    id: Number(item.teamId),
    name: String(item.name),
    short: String(item.code),
    flagUrl: String(item.flagUrl),
    group: item.groupCode as 'A' | 'B' | 'C' | 'D',
  }));

  const rawMatches = (matchesResponse.Items || [])
    .map((item) => ({
      id: Number(item.matchId),
      jornada: Number(item.roundNumber),
      dateLabel: String(item.dateLabel),
      teamAId: Number(item.homeTeamId),
      teamBId: Number(item.awayTeamId),
      status: item.status as 'played' | 'upcoming',
      scoreA: item.officialHomeScore != null ? Number(item.officialHomeScore) : undefined,
      scoreB: item.officialAwayScore != null ? Number(item.officialAwayScore) : undefined,
    }))
    .sort((a, b) => a.id - b.id);

  let userPredictions: Record<number, { a: string; b: string }> = {};
  if (userId) {
    const predictionsResponse = await docClient.send(
      new QueryCommand({
        TableName: tables.predictions,
        IndexName: 'byTournamentAndUser',
        KeyConditionExpression: 'tournamentId = :tournamentId AND userId = :userId',
        ExpressionAttributeValues: {
          ':tournamentId': DEFAULT_TOURNAMENT_ID,
          ':userId': userId,
        },
      })
    );

    userPredictions = (predictionsResponse.Items || []).reduce<Record<number, { a: string; b: string }>>(
      (acc, prediction) => {
        const matchId = Number(prediction.matchId);
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

  const pointsByJornada = [1, 2, 3].map((jornada) => {
    const playedInRound = rawMatches.filter((match) => match.jornada === jornada && match.status === 'played');
    return playedInRound.reduce((total, match) => {
      const prediction = userPredictions[match.id];
      if (!prediction) return total;
      const predictedA = Number(prediction.a);
      const predictedB = Number(prediction.b);
      if (Number.isNaN(predictedA) || Number.isNaN(predictedB)) return total;
      return total + sumPointsForMatch(predictedA, predictedB, match.scoreA, match.scoreB);
    }, 0);
  });

  const rankingUsers = (rankingResponse.Items || []).map((item) => {
    const points = Number(item.points || 0);
    return {
      name: String(item.displayName || 'Usuario'),
      pts: points,
      phase: getPhase(points),
    };
  });

  return {
    teams: rawTeams,
    matches: rawMatches,
    standingsByGroup: computeStandings(rawTeams, rawMatches),
    rankingUsers,
    userPredictions,
    points: pointsByJornada.reduce((total, value) => total + value, 0),
    pointsByJornada,
  };
};

const getUserDisplayName = async (userId: string): Promise<string> => {
  const userResponse = await docClient.send(
    new GetCommand({
      TableName: Resource.UsersTable.name,
      Key: { userId },
    })
  );

  const user = userResponse.Item as
    | {
        nombres?: string;
        apellidos?: string;
        email?: string;
      }
    | undefined;

  const fullName = `${user?.nombres || ''} ${user?.apellidos || ''}`.trim();
  if (fullName) return fullName;
  if (user?.email) return user.email;
  return 'Usuario';
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || undefined;
    const snapshot = await getSnapshot(userId);

    return NextResponse.json(snapshot);
  } catch (error: unknown) {
    console.error('Error loading quiniela data:', error);
    return NextResponse.json({ error: 'No se pudo cargar la quiniela' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const tables = getTables();
    const { userId, predictions } = (await request.json()) as {
      userId?: string;
      predictions?: Record<number, { a: string; b: string }>;
    };

    if (!userId) {
      return NextResponse.json({ error: 'userId requerido' }, { status: 400 });
    }
    if (!predictions || typeof predictions !== 'object') {
      return NextResponse.json({ error: 'predictions requerido' }, { status: 400 });
    }

    const now = new Date().toISOString();
    const predictionEntries = Object.entries(predictions);

    for (const [matchIdValue, prediction] of predictionEntries) {
      const matchId = Number(matchIdValue);
      const predictedHomeScore = Number(prediction.a);
      const predictedAwayScore = Number(prediction.b);

      if (
        Number.isNaN(matchId) ||
        !Number.isInteger(matchId) ||
        Number.isNaN(predictedHomeScore) ||
        !Number.isInteger(predictedHomeScore) ||
        Number.isNaN(predictedAwayScore) ||
        !Number.isInteger(predictedAwayScore) ||
        predictedHomeScore < 0 ||
        predictedAwayScore < 0
      ) {
        continue;
      }

      await docClient.send(
        new PutCommand({
          TableName: tables.predictions,
          Item: {
            predictionId: `${DEFAULT_TOURNAMENT_ID}#${userId}#${matchId}`,
            tournamentId: DEFAULT_TOURNAMENT_ID,
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

    const snapshot = await getSnapshot(userId);
    const displayName = await getUserDisplayName(userId);

    await docClient.send(
      new PutCommand({
        TableName: tables.scoreAggregate,
        Item: {
          id: `${DEFAULT_TOURNAMENT_ID}#global#${userId}`,
          tournamentId: DEFAULT_TOURNAMENT_ID,
          scope: 'global',
          refId: userId,
          displayName,
          points: snapshot.points,
          updatedAt: now,
        },
      })
    );

    const refreshedSnapshot = await getSnapshot(userId);
    return NextResponse.json(refreshedSnapshot);
  } catch (error: unknown) {
    console.error('Error saving predictions:', error);
    return NextResponse.json({ error: 'No se pudieron guardar pronosticos' }, { status: 500 });
  }
}
