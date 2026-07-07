import { resolveBrandAssetUrl } from '@/lib/branding/assets';

export interface BrandAssets {
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
  sponsors: {
    master: string[];
    gold: string[];
    silver: string[];
    logos: string[];
  };
}

export const brandAssets: BrandAssets = {
  logos: {
    main: resolveBrandAssetUrl('/assets/LOGO LARGE 96x96.svg'),
    large: resolveBrandAssetUrl('/assets/LOGO LARGE 96x96.svg'),
    small: resolveBrandAssetUrl('/assets/LOGO LARGE 96x96.svg'),
  },
  banners: {
    sponsor: resolveBrandAssetUrl('/assets/BANNER SPONSOR 600X60.svg'),
  },
  backgrounds: {
    dashboard: resolveBrandAssetUrl('/assets/DASHBOARD 1920X1080.png'),
    userCard: resolveBrandAssetUrl('/assets/CARD USER 400x150.png'),
  },
  social: {
    google: resolveBrandAssetUrl('/assets/G 24X24.svg'),
    facebook: resolveBrandAssetUrl('/assets/F 24X24.svg'),
  },
  cardBackgrounds: {
    blue: resolveBrandAssetUrl('/assets/CARD BG N5/CARD BG AZUL 400X120.svg'),
    emerald: resolveBrandAssetUrl('/assets/CARD BG N5/CARD BG CELESTE 400X120.svg'),
    orange: resolveBrandAssetUrl('/assets/CARD BG N5/CARD BG ROJO 400X120.svg'),
  },
  sponsors: {
    master: [resolveBrandAssetUrl('/assets/MASTER LOGO 200X80.svg')],
    gold: [
      resolveBrandAssetUrl('/assets/LOGO GOLD 1 120X60.svg'),
      resolveBrandAssetUrl('/assets/LOGO GOLD 2 120X60.svg'),
    ],
    silver: [
      resolveBrandAssetUrl('/assets/LOGO SILVER 1 80X40.svg'),
      resolveBrandAssetUrl('/assets/LOGO SILVER 2 80X40.svg'),
      resolveBrandAssetUrl('/assets/LOGO SILVER 3 80X40.svg'),
    ],
    logos: [],
  },
};

export const PROFILE_AVATAR_OPTIONS = [
  resolveBrandAssetUrl('/assets/PROFILE/band-blue-white-red-football-shirt-svgrepo-com.svg'),
  resolveBrandAssetUrl('/assets/PROFILE/band-gold-maroon-football-shirt-svgrepo-com.svg'),
  resolveBrandAssetUrl('/assets/PROFILE/band-red-white-football-shirt-svgrepo-com.svg'),
  resolveBrandAssetUrl('/assets/PROFILE/band-white-black-football-shirt-svgrepo-com.svg'),
  resolveBrandAssetUrl('/assets/PROFILE/band-white-navy-skyblue-football-shirt-svgrepo-com.svg'),
  resolveBrandAssetUrl('/assets/PROFILE/band-white-red-blue-football-shirt-svgrepo-com.svg'),
  resolveBrandAssetUrl('/assets/PROFILE/band-white-red-football-shirt-svgrepo-com.svg'),
  resolveBrandAssetUrl('/assets/PROFILE/chevron-blue-white-football-shirt-svgrepo-com.svg'),
  resolveBrandAssetUrl('/assets/PROFILE/chevron-navy-white-football-shirt-svgrepo-com.svg'),
  resolveBrandAssetUrl('/assets/PROFILE/chevron-red-white-football-shirt-svgrepo-com.svg'),
  resolveBrandAssetUrl('/assets/PROFILE/chevron-skyblue-maroon-football-shirt-svgrepo-com.svg'),
  resolveBrandAssetUrl('/assets/PROFILE/chevron-white-red-football-shirt-svgrepo-com.svg'),
  resolveBrandAssetUrl('/assets/PROFILE/chevron-yellow-blue-football-shirt-svgrepo-com.svg'),
  resolveBrandAssetUrl('/assets/PROFILE/diagonal-white-red-football-shirt-svgrepo-com.svg'),
  resolveBrandAssetUrl('/assets/PROFILE/halves-black-red-football-shirt-svgrepo-com.svg'),
  resolveBrandAssetUrl('/assets/PROFILE/halves-black-yellow-football-shirt-svgrepo-com.svg'),
  resolveBrandAssetUrl('/assets/PROFILE/halves-blue-navy-football-shirt-svgrepo-com.svg'),
  resolveBrandAssetUrl('/assets/PROFILE/halves-red-blue-football-shirt-svgrepo-com.svg'),
  resolveBrandAssetUrl('/assets/PROFILE/halves-red-navy-football-shirt-svgrepo-com.svg'),
  resolveBrandAssetUrl('/assets/PROFILE/halves-red-white-football-shirt-svgrepo-com.svg'),
  resolveBrandAssetUrl('/assets/PROFILE/halves-white-black-football-shirt-svgrepo-com.svg'),
  resolveBrandAssetUrl('/assets/PROFILE/halves-white-blue-football-shirt-svgrepo-com.svg'),
  resolveBrandAssetUrl('/assets/PROFILE/hoops-black-lime-football-shirt-svgrepo-com.svg'),
  resolveBrandAssetUrl('/assets/PROFILE/hoops-black-red-football-shirt-svgrepo-com.svg'),
  resolveBrandAssetUrl('/assets/PROFILE/hoops-blue-navy-football-shirt-svgrepo-com.svg'),
  resolveBrandAssetUrl('/assets/PROFILE/hoops-blue-white-football-shirt-svgrepo-com.svg'),
  resolveBrandAssetUrl('/assets/PROFILE/hoops-green-white-football-shirt-svgrepo-com.svg'),
  resolveBrandAssetUrl('/assets/PROFILE/hoops-red-white-football-shirt-svgrepo-com.svg'),
  resolveBrandAssetUrl('/assets/PROFILE/plain-black-football-shirt-svgrepo-com.svg'),
  resolveBrandAssetUrl('/assets/PROFILE/plain-blue-football-shirt-svgrepo-com.svg'),
  resolveBrandAssetUrl('/assets/PROFILE/plain-gold-football-shirt-svgrepo-com.svg'),
  resolveBrandAssetUrl('/assets/PROFILE/plain-green-football-shirt-svgrepo-com.svg'),
  resolveBrandAssetUrl('/assets/PROFILE/plain-lime-football-shirt-svgrepo-com.svg'),
  resolveBrandAssetUrl('/assets/PROFILE/plain-maroon-football-shirt-svgrepo-com.svg'),
  resolveBrandAssetUrl('/assets/PROFILE/plain-navy-football-shirt-svgrepo-com.svg'),
  resolveBrandAssetUrl('/assets/PROFILE/plain-orange-football-shirt-svgrepo-com.svg'),
  resolveBrandAssetUrl('/assets/PROFILE/plain-pink-football-shirt-svgrepo-com.svg'),
  resolveBrandAssetUrl('/assets/PROFILE/plain-purple-football-shirt-svgrepo-com.svg'),
  resolveBrandAssetUrl('/assets/PROFILE/sleeves-blue-navy-football-shirt-svgrepo-com.svg'),
  resolveBrandAssetUrl('/assets/PROFILE/sleeves-blue-white-football-shirt-svgrepo-com.svg'),
  resolveBrandAssetUrl('/assets/PROFILE/sleeves-gold-black-football-shirt-svgrepo-com.svg'),
  resolveBrandAssetUrl('/assets/PROFILE/sleeves-green-white-football-shirt-svgrepo-com.svg'),
  resolveBrandAssetUrl('/assets/PROFILE/sleeves-maroon-navy-football-shirt-svgrepo-com.svg'),
  resolveBrandAssetUrl('/assets/PROFILE/sleeves-maroon-skyblue-football-shirt-svgrepo-com.svg'),
  resolveBrandAssetUrl('/assets/PROFILE/sleeves-navy-maroon-football-shirt-svgrepo-com.svg'),
  resolveBrandAssetUrl('/assets/PROFILE/sleeves-navy-orange-football-shirt-svgrepo-com.svg'),
  resolveBrandAssetUrl('/assets/PROFILE/sleeves-navy-white-football-shirt-svgrepo-com.svg'),
  resolveBrandAssetUrl('/assets/PROFILE/sleeves-orange-white-football-shirt-svgrepo-com.svg'),
  resolveBrandAssetUrl('/assets/PROFILE/sleeves-purple-black-football-shirt-svgrepo-com.svg'),
  resolveBrandAssetUrl('/assets/PROFILE/sleeves-red-navy-football-shirt-svgrepo-com.svg'),
  resolveBrandAssetUrl('/assets/PROFILE/sleeves-red-white-football-shirt-svgrepo-com.svg'),
  resolveBrandAssetUrl('/assets/PROFILE/sleeves-white-black-football-shirt-svgrepo-com.svg'),
  resolveBrandAssetUrl('/assets/PROFILE/sleeves-white-blue-football-shirt-svgrepo-com.svg'),
  resolveBrandAssetUrl('/assets/PROFILE/sleeves-white-green-football-shirt-svgrepo-com.svg'),
  resolveBrandAssetUrl('/assets/PROFILE/sleeves-white-lime-football-shirt-svgrepo-com.svg'),
  resolveBrandAssetUrl('/assets/PROFILE/sleeves-white-navy-football-shirt-svgrepo-com.svg'),
  resolveBrandAssetUrl('/assets/PROFILE/sleeves-white-red-football-shirt-svgrepo-com.svg'),
  resolveBrandAssetUrl('/assets/PROFILE/sleeves-white-skyblue-football-shirt-svgrepo-com.svg'),
  resolveBrandAssetUrl('/assets/PROFILE/sleeves-yellow-black-football-shirt-svgrepo-com.svg'),
  resolveBrandAssetUrl('/assets/PROFILE/sleeves-yellow-blue-football-shirt-svgrepo-com.svg'),
  resolveBrandAssetUrl('/assets/PROFILE/sleeves-yellow-navy-football-shirt-svgrepo-com.svg'),
  resolveBrandAssetUrl('/assets/PROFILE/stripes-blue-black-football-shirt-svgrepo-com.svg'),
  resolveBrandAssetUrl('/assets/PROFILE/stripes-gold-black-football-shirt-svgrepo-com.svg'),
  resolveBrandAssetUrl('/assets/PROFILE/stripes-gold-maroon-football-shirt-svgrepo-com.svg'),
  resolveBrandAssetUrl('/assets/PROFILE/stripes-green-black-football-shirt-svgrepo-com.svg'),
  resolveBrandAssetUrl('/assets/PROFILE/stripes-maroon-navy-football-shirt-svgrepo-com.svg'),
  resolveBrandAssetUrl('/assets/PROFILE/stripes-red-black-football-shirt-svgrepo-com.svg'),
  resolveBrandAssetUrl('/assets/PROFILE/stripes-red-blue-football-shirt-svgrepo-com.svg'),
  resolveBrandAssetUrl('/assets/PROFILE/stripes-red-navy-football-shirt-svgrepo-com.svg'),
  resolveBrandAssetUrl('/assets/PROFILE/stripes-white-black-football-shirt-svgrepo-com.svg'),
  resolveBrandAssetUrl('/assets/PROFILE/stripes-white-blue-football-shirt-svgrepo-com.svg'),
  resolveBrandAssetUrl('/assets/PROFILE/stripes-white-green-football-shirt-svgrepo-com.svg'),
  resolveBrandAssetUrl('/assets/PROFILE/stripes-white-navy-football-shirt-svgrepo-com.svg'),
  resolveBrandAssetUrl('/assets/PROFILE/stripes-white-purple-football-shirt-svgrepo-com.svg'),
  resolveBrandAssetUrl('/assets/PROFILE/stripes-white-red-football-shirt-svgrepo-com.svg'),
  resolveBrandAssetUrl('/assets/PROFILE/stripes-white-skyblue-football-shirt-svgrepo-com.svg'),
  resolveBrandAssetUrl('/assets/PROFILE/stripes-yellow-black-football-shirt-svgrepo-com.svg'),
  resolveBrandAssetUrl('/assets/PROFILE/stripes-yellow-blue-football-shirt-svgrepo-com.svg'),
  resolveBrandAssetUrl('/assets/PROFILE/stripes-yellow-green-football-shirt-svgrepo-com.svg'),
  resolveBrandAssetUrl('/assets/PROFILE/stripes-yellow-red-football-shirt-svgrepo-com.svg'),
  resolveBrandAssetUrl('/assets/PROFILE/thirds-red-white-football-shirt-svgrepo-com.svg'),
  resolveBrandAssetUrl('/assets/PROFILE/unknown-football-shirt-svgrepo-com.svg'),
  resolveBrandAssetUrl('/assets/PROFILE/vertical-black-red-football-shirt-svgrepo-com.svg'),
  resolveBrandAssetUrl('/assets/PROFILE/vertical-blue-yellow-football-shirt-svgrepo-com.svg'),
  resolveBrandAssetUrl('/assets/PROFILE/vertical-maroon-blue-football-shirt-svgrepo-com.svg'),
  resolveBrandAssetUrl('/assets/PROFILE/vertical-navy-red-football-shirt-svgrepo-com.svg'),
  resolveBrandAssetUrl('/assets/PROFILE/vertical-navy-white-football-shirt-svgrepo-com.svg'),
  resolveBrandAssetUrl('/assets/PROFILE/vertical-orange-black-football-shirt-svgrepo-com.svg'),
  resolveBrandAssetUrl('/assets/PROFILE/vertical-red-black-football-shirt-svgrepo-com.svg'),
  resolveBrandAssetUrl('/assets/PROFILE/vertical-white-black-football-shirt-svgrepo-com.svg'),
  resolveBrandAssetUrl('/assets/PROFILE/vertical-yellow-black-football-shirt-svgrepo-com.svg'),
] as const;

export const isProfileAvatarOption = (value: string): boolean =>
  PROFILE_AVATAR_OPTIONS.includes(value as (typeof PROFILE_AVATAR_OPTIONS)[number]);

export const getRandomProfileAvatar = (): string =>
  PROFILE_AVATAR_OPTIONS[Math.floor(Math.random() * PROFILE_AVATAR_OPTIONS.length)];
