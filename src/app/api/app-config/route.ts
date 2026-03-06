import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { getDefaultBrandingConfig, DEFAULT_TOURNAMENT_ID } from '@/lib/branding/defaults';
import { normalizeBrandingAssets, normalizeBrandingSponsorUrls } from '@/lib/branding/assets';
import { AppBrandingConfig, BrandingAssets, BrandingMeta, BrandingSponsors } from '@/lib/branding/types';
import { Theme } from '@/lib/theme/types';

const client = new DynamoDBClient({
  region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
});

const docClient = DynamoDBDocumentClient.from(client, {
  marshallOptions: { removeUndefinedValues: true },
});

const getOptionalEnv = (key: string): string | undefined => process.env[key] || undefined;

const asObject = (value: unknown): Record<string, unknown> | null => {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : null;
};

const buildConfig = (raw: Record<string, unknown>, tournamentId: string): AppBrandingConfig => {
  const defaults = getDefaultBrandingConfig();

  const theme = (asObject(raw.theme) as Theme | null) || defaults.theme;
  const assets = (asObject(raw.assets) as BrandingAssets | null) || defaults.assets;
  const sponsors = (asObject(raw.sponsors) as BrandingSponsors | null) || defaults.sponsors;
  const meta = (asObject(raw.meta) as BrandingMeta | null) || defaults.meta;

  // Backward compatibility with legacy BrandingConfig fields.
  const legacyPrimary = typeof raw.primaryColor === 'string' ? raw.primaryColor : undefined;
  const legacyAccent = typeof raw.accentColor === 'string' ? raw.accentColor : undefined;
  const legacyLogo = typeof raw.logoUrl === 'string' ? raw.logoUrl : undefined;
  const legacyIcon = typeof raw.iconUrl === 'string' ? raw.iconUrl : undefined;

  const normalizedTheme: Theme = {
    ...theme,
    colors: {
      ...theme.colors,
      components: {
        ...theme.colors.components,
        buttons: {
          ...theme.colors.components.buttons,
          background: legacyPrimary || theme.colors.components.buttons.background,
        },
        navbar: {
          ...theme.colors.components.navbar,
          accent: legacyAccent || theme.colors.components.navbar.accent,
        },
      },
      accents: {
        ...theme.colors.accents,
        primary: legacyPrimary || theme.colors.accents.primary,
        secondary: legacyAccent || theme.colors.accents.secondary,
      },
    },
  };

  const normalizedAssets: BrandingAssets = normalizeBrandingAssets({
    ...assets,
    logos: {
      ...assets.logos,
      main: legacyLogo || assets.logos.main,
      large: legacyLogo || assets.logos.large,
      small: legacyIcon || assets.logos.small,
    },
  });

  const normalizedSponsors: BrandingSponsors = {
    master: normalizeBrandingSponsorUrls(sponsors.master),
    gold: normalizeBrandingSponsorUrls(sponsors.gold),
    silver: normalizeBrandingSponsorUrls(sponsors.silver),
  };

  return {
    tournamentId,
    brandingId:
      typeof raw.brandingId === 'string' && raw.brandingId
        ? raw.brandingId
        : `${tournamentId}#default`,
    theme: normalizedTheme,
    assets: normalizedAssets,
    sponsors: normalizedSponsors,
    meta,
    updatedAt:
      typeof raw.updatedAt === 'string' && raw.updatedAt ? raw.updatedAt : defaults.updatedAt,
  };
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tournamentId = searchParams.get('tournamentId') || DEFAULT_TOURNAMENT_ID;
    const brandingTable = getOptionalEnv('DYNAMO_BRANDING_CONFIG_TABLE');

    if (!brandingTable) {
      return NextResponse.json(getDefaultBrandingConfig());
    }

    const response = await docClient.send(
      new QueryCommand({
        TableName: brandingTable,
        IndexName: 'byTournament',
        KeyConditionExpression: 'tournamentId = :tournamentId',
        ExpressionAttributeValues: {
          ':tournamentId': tournamentId,
        },
        Limit: 1,
      })
    );

    const raw = response.Items?.[0];
    if (!raw) {
      return NextResponse.json(getDefaultBrandingConfig());
    }

    return NextResponse.json(buildConfig(raw as Record<string, unknown>, tournamentId));
  } catch (error: unknown) {
    console.error('Error loading app config:', error);
    return NextResponse.json(getDefaultBrandingConfig());
  }
}
