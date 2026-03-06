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
    dashboard: string;
    userCard: string;
  };
  cardBackgrounds: {
    blue: string;
    emerald: string;
    orange: string;
  };
}

export interface BrandingSponsors {
  master: string[];
  gold: string[];
  silver: string[];
}

export interface BrandingMeta {
  appTitle: string;
  appDescription: string;
}

export interface AppBrandingConfig {
  tournamentId: string;
  brandingId: string;
  theme: Theme;
  assets: BrandingAssets;
  sponsors: BrandingSponsors;
  meta: BrandingMeta;
  updatedAt: string;
}
