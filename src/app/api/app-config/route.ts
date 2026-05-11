import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { getDefaultBrandingConfig, DEFAULT_TOURNAMENT_ID } from '@/lib/branding/defaults';
import { normalizeBrandingAssets, normalizeBrandingSponsorUrls } from '@/lib/branding/assets';
import { AppBrandingConfig, BrandingAssets, BrandingMeta, BrandingSponsors, BrandingSEO, BrandingContent, BrandingSupport, BrandingLegal } from '@/lib/branding/types';
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

  // Extract CMS fields
  const primaryColor = typeof raw.primaryColor === 'string' ? raw.primaryColor : undefined;
  const secondaryColor = typeof raw.secondaryColor === 'string' ? raw.secondaryColor : undefined;
  const logoUrl = typeof raw.logoUrl === 'string' ? raw.logoUrl : undefined;
  const headerImageUrl = typeof raw.headerImageUrl === 'string' ? raw.headerImageUrl : undefined;
  const backgroundImageUrl = typeof raw.backgroundImageUrl === 'string' ? raw.backgroundImageUrl : undefined;
  const userCardImageUrl = typeof raw.userCardImageUrl === 'string' ? raw.userCardImageUrl : undefined;
  const rankingCardImageUrl = typeof raw.rankingCardImageUrl === 'string' ? raw.rankingCardImageUrl : undefined;
  
  // Sponsor arrays from CMS
  const sponsorMasterUrls = Array.isArray(raw.sponsorMasterImageUrls) ? raw.sponsorMasterImageUrls as string[] : [];
  const sponsorGoldUrls = Array.isArray(raw.sponsorGoldImageUrls) ? raw.sponsorGoldImageUrls as string[] : [];
  const sponsorSilverUrls = Array.isArray(raw.sponsorSilverImageUrls) ? raw.sponsorSilverImageUrls as string[] : [];

  // SEO fields from CMS
  const seoTitle = typeof raw.seoTitle === 'string' ? raw.seoTitle : defaults.seo.title;
  const seoDescription = typeof raw.seoDescription === 'string' ? raw.seoDescription : defaults.seo.description;
  const seoKeywords = typeof raw.seoKeywords === 'string' ? raw.seoKeywords : defaults.seo.keywords;

  // Content fields from CMS
  const pageTitle = typeof raw.pageTitle === 'string' ? raw.pageTitle : defaults.content.pageTitle;
  const pageDescription = typeof raw.pageDescription === 'string' ? raw.pageDescription : defaults.content.pageDescription;

  // Support fields from CMS
  const supportEmail = typeof raw.supportEmail === 'string' ? raw.supportEmail : defaults.support.email;
  const supportWhatsapp = typeof raw.supportWhatsapp === 'string' ? raw.supportWhatsapp : defaults.support.whatsapp;
  const supportMessage = typeof raw.supportMessage === 'string' ? raw.supportMessage : defaults.support.message;

  // Legal content fields from CMS
  const termsAndConditions = typeof raw.termsAndConditions === 'string' ? raw.termsAndConditions : defaults.legal.terms;
  const privacyPolicy = typeof raw.privacyPolicy === 'string' ? raw.privacyPolicy : defaults.legal.privacy;
  const howToPlay = typeof raw.howToPlay === 'string' ? raw.howToPlay : defaults.legal.howToPlay;
  const prizesInfo = typeof raw.prizesInfo === 'string' ? raw.prizesInfo : defaults.legal.prizes;
  const rulesInfo = typeof raw.rulesInfo === 'string' ? raw.rulesInfo : defaults.legal.rules;
  const supportInfo = typeof raw.supportInfo === 'string' ? raw.supportInfo : defaults.legal.supportInfo;

  // Build theme with CMS colors
  const normalizedTheme: Theme = {
    ...theme,
    colors: {
      ...theme.colors,
      components: {
        ...theme.colors.components,
        buttons: {
          ...theme.colors.components.buttons,
          background: primaryColor || theme.colors.components.buttons.background,
        },
        navbar: {
          ...theme.colors.components.navbar,
          accent: secondaryColor || theme.colors.components.navbar.accent,
        },
      },
      accents: {
        ...theme.colors.accents,
        primary: primaryColor || theme.colors.accents.primary,
        secondary: secondaryColor || theme.colors.accents.secondary,
      },
    },
  };

  // Build assets with CMS URLs
  const normalizedAssets: BrandingAssets = normalizeBrandingAssets({
    ...assets,
    logos: {
      ...assets.logos,
      main: logoUrl || assets.logos.main,
      large: logoUrl || assets.logos.large,
      small: logoUrl || assets.logos.small,
    },
    backgrounds: {
      ...assets.backgrounds,
      main: backgroundImageUrl || assets.backgrounds.main || '',
      dashboard: backgroundImageUrl || assets.backgrounds.main || assets.backgrounds.dashboard,
      userCard: userCardImageUrl || assets.backgrounds.userCard,
      rankingCard: rankingCardImageUrl || assets.backgrounds.rankingCard || '',
    },
    header: headerImageUrl,
  });

  // Build sponsors with CMS arrays
  const normalizedSponsors: BrandingSponsors = {
    master: sponsorMasterUrls.length > 0 ? normalizeBrandingSponsorUrls(sponsorMasterUrls) : normalizeBrandingSponsorUrls(sponsors.master),
    gold: sponsorGoldUrls.length > 0 ? normalizeBrandingSponsorUrls(sponsorGoldUrls) : normalizeBrandingSponsorUrls(sponsors.gold),
    silver: sponsorSilverUrls.length > 0 ? normalizeBrandingSponsorUrls(sponsorSilverUrls) : normalizeBrandingSponsorUrls(sponsors.silver),
    logos: Array.isArray(raw.sponsorLogos) ? normalizeBrandingSponsorUrls(raw.sponsorLogos as string[]) : [],
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
    seo: {
      title: seoTitle,
      description: seoDescription,
      keywords: seoKeywords,
    },
    content: {
      pageTitle,
      pageDescription,
    },
    support: {
      email: supportEmail,
      whatsapp: supportWhatsapp,
      message: supportMessage,
    },
    legal: {
      terms: termsAndConditions,
      privacy: privacyPolicy,
      howToPlay,
      prizes: prizesInfo,
      rules: rulesInfo,
      supportInfo,
    },
    updatedAt:
      typeof raw.updatedAt === 'string' && raw.updatedAt ? raw.updatedAt : defaults.updatedAt,
    features: {
      printedCodesEnabled: raw.printedCodesEnabled === true || raw.printedCodesEnabled === 'true',
    },
  };
};

/**
 * Check if a project is currently within its validity period.
 */
function isWithinValidityPeriod(item: Record<string, unknown>): boolean {
  const now = new Date();
  const validFrom = typeof item.validFrom === 'string' ? new Date(item.validFrom) : null;
  const validTo = typeof item.validTo === 'string' ? new Date(item.validTo) : null;

  if (validFrom && now < validFrom) return false;
  if (validTo && now > validTo) return false;
  return true;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tournamentIdParam = searchParams.get('tournamentId');
    // Preview mode: skip active/date validation (used by CMS iframe)
    const isPreview = searchParams.get('preview') === '1';
    const brandingTable = getOptionalEnv('DYNAMO_BRANDING_CONFIG_TABLE');

    console.log('[app-config] brandingTable =', brandingTable || 'NOT SET');

    if (!brandingTable) {
      return NextResponse.json(getDefaultBrandingConfig());
    }

    let raw: Record<string, unknown> | undefined;
    let resolvedTournamentId = tournamentIdParam || '';

    // If a specific tournamentId was requested, query by it
    if (tournamentIdParam) {
      const response = await docClient.send(
        new QueryCommand({
          TableName: brandingTable,
          IndexName: 'byTournament',
          KeyConditionExpression: 'tournamentId = :tournamentId',
          ExpressionAttributeValues: {
            ':tournamentId': tournamentIdParam,
          },
          Limit: 1,
        })
      );
      const item = response.Items?.[0] as Record<string, unknown> | undefined;

      // For preview mode, return the project regardless of status/dates
      // For normal mode, only return if active and within validity period
      if (item) {
        if (isPreview) {
          raw = item;
        } else if (item.status === 'active' && isWithinValidityPeriod(item)) {
          raw = item;
        }
      }
    }

    // Fallback: scan for the active project within its validity period
    if (!raw) {
      const { ScanCommand } = await import('@aws-sdk/lib-dynamodb');
      const scanResponse = await docClient.send(
        new ScanCommand({
          TableName: brandingTable,
          FilterExpression: '#s = :active',
          ExpressionAttributeNames: { '#s': 'status' },
          ExpressionAttributeValues: { ':active': 'active' },
          Limit: 10,
        })
      );
      const items = (scanResponse.Items || []) as Record<string, unknown>[];

      // Find the first active project that is within its validity period
      raw = items.find(item => isWithinValidityPeriod(item));

      console.log('[app-config] Active project scan:', raw ? `found brandingId=${raw.brandingId}, logoUrl=${raw.logoUrl}` : 'NOT FOUND');
    }

    if (!raw) {
      return NextResponse.json(getDefaultBrandingConfig());
    }

    // Resolve tournamentId: from the project directly, or via project→tournament link
    if (raw.tournamentId) {
      resolvedTournamentId = String(raw.tournamentId);
    } else if (raw.brandingId) {
      // Look for a tournament whose projectId matches this project
      try {
        const tournamentsTable = process.env.DYNAMO_TOURNAMENTS_TABLE;
        if (tournamentsTable) {
          const { ScanCommand: SC } = await import('@aws-sdk/lib-dynamodb');
          const tourScan = await docClient.send(
            new SC({
              TableName: tournamentsTable,
              FilterExpression: 'projectId = :projectId',
              ExpressionAttributeValues: { ':projectId': String(raw.brandingId) },
              Limit: 1,
            })
          );
          if (tourScan.Items?.[0]?.tournamentId) {
            resolvedTournamentId = String(tourScan.Items[0].tournamentId);
          }
        }
      } catch { /* ignore */ }
    }
    return NextResponse.json(buildConfig(raw, resolvedTournamentId || DEFAULT_TOURNAMENT_ID));
  } catch (error: unknown) {
    // Only log unexpected errors (not ResourceNotFoundException which is expected when table is empty)
    const isResourceNotFound = error && typeof error === 'object' && 'name' in error && error.name === 'ResourceNotFoundException';
    if (!isResourceNotFound) {
      console.error('Error loading app config:', error);
    }
    return NextResponse.json(getDefaultBrandingConfig());
  }
}
