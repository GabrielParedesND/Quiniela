import { Theme } from '@/lib/theme/types';

export interface BrandingAssets {
  logos: {
    main: string;
    large: string;
    small: string;
  };
  banners: {
    sponsor: string;
  };
  social: {
    google: string;
    facebook: string;
  };
  backgrounds: {
    main: string; // Background image for the app
    dashboard: string;
    userCard: string;
    rankingCard: string;
  };
  cardBackgrounds: {
    blue: string;
    emerald: string;
    orange: string;
  };
  header?: string; // Header image
}

export interface BrandingSponsors {
  master: string[];
  gold: string[];
  silver: string[];
  logos: string[]; // Unified sponsor logos
}

export interface BrandingMeta {
  appTitle: string;
  appDescription: string;
}

export interface BrandingSEO {
  title: string;
  description: string;
  keywords: string;
}

export interface BrandingContent {
  pageTitle: string;
  pageDescription: string;
}

export interface BrandingSupport {
  email: string;
  whatsapp: string;
  message: string;
}

export interface BrandingLegal {
  terms: string;
  privacy: string;
  howToPlay: string;
  prizes: string;
  rules: string;
  supportInfo: string;
}

export interface BrandingFeatures {
  printedCodesEnabled: boolean;
}

export interface AppBrandingConfig {
  tournamentId: string;
  brandingId: string;
  theme: Theme;
  assets: BrandingAssets;
  sponsors: BrandingSponsors;
  meta: BrandingMeta;
  seo: BrandingSEO;
  content: BrandingContent;
  support: BrandingSupport;
  legal: BrandingLegal;
  features: BrandingFeatures;
  updatedAt: string;
}
