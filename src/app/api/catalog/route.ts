import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { BrandingAssets, BrandingMeta, BrandingSponsors, BrandingSEO, BrandingContent, BrandingSupport, BrandingLegal } from '@/lib/branding/types';
import { normalizeBrandingAssets, normalizeBrandingSponsorUrls, resolveBrandAssetUrl } from '@/lib/branding/assets';
import { Theme } from '@/lib/theme/types';

const client = new DynamoDBClient({
  region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
});

const docClient = DynamoDBDocumentClient.from(client, {
  marshallOptions: { removeUndefinedValues: true },
});

const getRequiredEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required env var: ${key}`);
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
  scoreAggregate: getRequiredEnv('DYNAMO_SCORE_AGGREGATE_TABLE'),
  brandingConfig: getOptionalEnv('DYNAMO_BRANDING_CONFIG_TABLE'),
});

type CatalogPayload = {
  tournament: {
    tournamentId?: string;
    code: string;
    name: string;
    status?: string;
    startAt?: string;
    endAt?: string;
  };
  rounds: Array<{
    number: number;
    opensAt?: string;
    closesAt?: string;
    status?: string;
  }>;
  teams: Array<{
    teamId: string;
    code: string;
    name: string;
    groupCode: string;
    flagUrl: string;
  }>;
  matches: Array<{
    matchId: string;
    roundNumber: number;
    homeTeamId: string;
    awayTeamId: string;
    kickoffAt: string;
    dateLabel?: string;
    status?: 'played' | 'upcoming';
    officialHomeScore?: number;
    officialAwayScore?: number;
    scoreSource?: string;
  }>;
  brandingConfig?: {
    brandingId?: string;
    themeName?: string;
    logoUrl?: string;
    iconUrl?: string;
    primaryColor?: string;
    accentColor?: string;
    theme?: Theme;
    assets?: BrandingAssets;
    sponsors?: BrandingSponsors;
    meta?: BrandingMeta;
    seo?: BrandingSEO;
    content?: BrandingContent;
    support?: BrandingSupport;
    legal?: BrandingLegal;
  };
};

const isValidCatalogPayload = (payload: unknown): payload is CatalogPayload => {
  if (!payload || typeof payload !== 'object') return false;
  const candidate = payload as Partial<CatalogPayload>;
  if (!candidate.tournament || !candidate.rounds || !candidate.teams || !candidate.matches) return false;
  if (!Array.isArray(candidate.rounds) || !Array.isArray(candidate.teams) || !Array.isArray(candidate.matches))
    return false;
  return true;
};

export async function GET(request: NextRequest) {
  try {
    const tables = getTables();
    const { searchParams } = new URL(request.url);
    const tournamentIdParam = searchParams.get('tournamentId');
    let tournamentId = tournamentIdParam || '';

    // If no tournamentId provided, resolve from active project
    if (!tournamentId) {
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
          tournamentId = scanResponse.Items?.[0]?.tournamentId ? String(scanResponse.Items[0].tournamentId) : '';
        } catch { /* ignore */ }
      }
      // Fallback: first tournament in table
      if (!tournamentId) {
        const scanResponse = await docClient.send(
          new ScanCommand({ TableName: tables.tournaments, Limit: 1 })
        );
        tournamentId = scanResponse.Items?.[0]?.tournamentId ? String(scanResponse.Items[0].tournamentId) : '';
      }
    }

    if (!tournamentId) {
      return NextResponse.json({ error: 'No se encontró un torneo configurado' }, { status: 404 });
    }

    // Use Scan for teams because API-Football imports may not have groupCode,
    // and the byTournamentAndGroup GSI requires groupCode as range key
    const [tournamentResponse, roundsResponse, teamsResponse, matchesResponse, brandingResponse] =
      await Promise.all([
        docClient.send(
          new GetCommand({
            TableName: tables.tournaments,
            Key: { tournamentId },
          })
        ),
        docClient.send(
          new QueryCommand({
            TableName: tables.rounds,
            IndexName: 'byTournamentAndNumber',
            KeyConditionExpression: 'tournamentId = :tournamentId',
            ExpressionAttributeValues: { ':tournamentId': tournamentId },
          })
        ),
        docClient.send(
          new ScanCommand({
            TableName: tables.teams,
            FilterExpression: 'tournamentId = :tournamentId',
            ExpressionAttributeValues: { ':tournamentId': tournamentId },
          })
        ),
        docClient.send(
          new QueryCommand({
            TableName: tables.matches,
            IndexName: 'byTournamentAndKickoff',
            KeyConditionExpression: 'tournamentId = :tournamentId',
            ExpressionAttributeValues: { ':tournamentId': tournamentId },
          })
        ),
        tables.brandingConfig
          ? docClient.send(
              new QueryCommand({
                TableName: tables.brandingConfig,
                IndexName: 'byTournament',
                KeyConditionExpression: 'tournamentId = :tournamentId',
                ExpressionAttributeValues: { ':tournamentId': tournamentId },
                Limit: 1,
              })
            )
          : Promise.resolve({ Items: [] }),
      ]);

    return NextResponse.json({
      tournament: tournamentResponse.Item || null,
      rounds: roundsResponse.Items || [],
      teams: teamsResponse.Items || [],
      matches: matchesResponse.Items || [],
      brandingConfig: brandingResponse.Items?.[0] || null,
    });
  } catch (error: unknown) {
    console.error('Error loading catalog:', error);
    return NextResponse.json({ error: 'No se pudo cargar el catalogo' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const tables = getTables();
    const payload = await request.json();

    if (!isValidCatalogPayload(payload)) {
      return NextResponse.json({ error: 'Payload de catalogo invalido' }, { status: 400 });
    }

    const now = new Date().toISOString();
    const tournamentId = payload.tournament.tournamentId || payload.tournament.code;

    await docClient.send(
      new PutCommand({
        TableName: tables.tournaments,
        Item: {
          tournamentId,
          code: payload.tournament.code,
          name: payload.tournament.name,
          status: payload.tournament.status || 'active',
          startAt: payload.tournament.startAt,
          endAt: payload.tournament.endAt,
          createdAt: now,
          updatedAt: now,
        },
      })
    );

    for (const round of payload.rounds) {
      await docClient.send(
        new PutCommand({
          TableName: tables.rounds,
          Item: {
            roundId: `${tournamentId}#R${round.number}`,
            tournamentId,
            number: round.number,
            opensAt: round.opensAt,
            closesAt: round.closesAt,
            status: round.status || 'open',
            createdAt: now,
            updatedAt: now,
          },
        })
      );
    }

    for (const team of payload.teams) {
      await docClient.send(
        new PutCommand({
          TableName: tables.teams,
          Item: {
            teamId: team.teamId,
            tournamentId,
            code: team.code,
            name: team.name,
            groupCode: team.groupCode,
            flagUrl: team.flagUrl,
            createdAt: now,
            updatedAt: now,
          },
        })
      );
    }

    for (const match of payload.matches) {
      await docClient.send(
        new PutCommand({
          TableName: tables.matches,
          Item: {
            matchId: match.matchId,
            tournamentId,
            roundNumber: match.roundNumber,
            homeTeamId: match.homeTeamId,
            awayTeamId: match.awayTeamId,
            kickoffAt: match.kickoffAt,
            dateLabel: match.dateLabel,
            status: match.status || 'upcoming',
            officialHomeScore: match.officialHomeScore,
            officialAwayScore: match.officialAwayScore,
            scoreSource: match.scoreSource || 'manual',
            updatedAt: now,
          },
        })
      );
    }

    if (tables.brandingConfig && payload.brandingConfig) {
      const normalizedAssets = payload.brandingConfig.assets
        ? normalizeBrandingAssets(payload.brandingConfig.assets)
        : undefined;

      const normalizedSponsors = payload.brandingConfig.sponsors
        ? {
            master: normalizeBrandingSponsorUrls(payload.brandingConfig.sponsors.master),
            gold: normalizeBrandingSponsorUrls(payload.brandingConfig.sponsors.gold),
            silver: normalizeBrandingSponsorUrls(payload.brandingConfig.sponsors.silver),
          }
        : undefined;

      await docClient.send(
        new PutCommand({
          TableName: tables.brandingConfig,
          Item: {
            brandingId: payload.brandingConfig.brandingId || `${tournamentId}#default`,
            tournamentId,
            themeName: payload.brandingConfig.themeName || 'default',
            logoUrl: payload.brandingConfig.logoUrl ? resolveBrandAssetUrl(payload.brandingConfig.logoUrl) : undefined,
            iconUrl: payload.brandingConfig.iconUrl ? resolveBrandAssetUrl(payload.brandingConfig.iconUrl) : undefined,
            primaryColor: payload.brandingConfig.primaryColor,
            accentColor: payload.brandingConfig.accentColor,
            theme: payload.brandingConfig.theme,
            assets: normalizedAssets,
            sponsors: normalizedSponsors,
            meta: payload.brandingConfig.meta,
            updatedAt: now,
          },
        })
      );
    }

    const scoreSeedId = `${tournamentId}#global#seed-admin`;
    await docClient.send(
      new PutCommand({
        TableName: tables.scoreAggregate,
        Item: {
          id: scoreSeedId,
          tournamentId,
          scope: 'global',
          refId: 'seed-admin',
          displayName: 'Inicial',
          points: 0,
          updatedAt: now,
        },
      })
    );

    return NextResponse.json({ success: true, tournamentId });
  } catch (error: unknown) {
    console.error('Error saving catalog:', error);
    return NextResponse.json({ error: 'No se pudo guardar el catalogo' }, { status: 500 });
  }
}
