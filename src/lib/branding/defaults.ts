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
    backgrounds: {
      ...brandAssets.backgrounds,
      main: '',
      rankingCard: '',
    },
    cardBackgrounds: brandAssets.cardBackgrounds,
    header: '',
  },
  sponsors: brandAssets.sponsors,
  meta: {
    appTitle: 'Quiniela Mundialista - USA 2026',
    appDescription: 'Plataforma de Quinielas Copa Mundial 2026',
  },
  seo: {
    title: 'Quiniela Mundialista - USA 2026',
    description: 'Plataforma de Quinielas Copa Mundial 2026. Participa, predice resultados y gana premios.',
    keywords: 'quiniela, mundial, futbol, predicciones, premios',
  },
  content: {
    pageTitle: 'Quiniela Mundialista',
    pageDescription: 'La plataforma oficial de quinielas para el Mundial 2026',
  },
  support: {
    email: '',
    whatsapp: '',
    message: '',
  },
  legal: {
    terms: '',
    privacy: '',
    howToPlay: '',
    prizes: '',
    rules: '',
    supportInfo: '',
  },
  features: {
    printedCodesEnabled: false,
  },
  updatedAt: new Date(0).toISOString(),
});
