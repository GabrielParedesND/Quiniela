import defaultTheme from '@/data/themes/default.json';
import { brandAssets } from '@/lib/assets';
import { AppBrandingConfig } from '@/lib/branding/types';

export const DEFAULT_TOURNAMENT_ID = 'world-cup-2026-demo';

export const getDefaultBrandingConfig = (): AppBrandingConfig => ({
  tournamentId: DEFAULT_TOURNAMENT_ID,
  brandingId: `${DEFAULT_TOURNAMENT_ID}#default`,
  theme: defaultTheme,
  assets: {
    logos: brandAssets.logos,
    banners: brandAssets.banners,
    social: brandAssets.social,
    backgrounds: brandAssets.backgrounds,
    cardBackgrounds: brandAssets.cardBackgrounds,
  },
  sponsors: brandAssets.sponsors,
  meta: {
    appTitle: 'Quiniela Mundialista - USA 2026',
    appDescription: 'Plataforma de Quinielas Copa Mundial 2026',
  },
  updatedAt: new Date(0).toISOString(),
});
