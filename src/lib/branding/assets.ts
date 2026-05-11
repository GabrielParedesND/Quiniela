import { BrandingAssets } from '@/lib/branding/types';
import { IS_DEMO_MODE } from '@/lib/demo-mode';

const ABSOLUTE_URL_REGEX = /^(https?:)?\/\//i;

const trimTrailingSlashes = (value: string): string => value.replace(/\/+$/, '');

const toSafeUrlPath = (value: string): string => encodeURI(value);

export const getBrandAssetsBaseUrl = (): string => {
  // In demo mode, use local assets (no CDN)
  if (IS_DEMO_MODE) return '';
  const raw = process.env.NEXT_PUBLIC_BRAND_ASSETS_BASE_URL;
  return raw ? trimTrailingSlashes(raw.trim()) : '';
};

export const resolveBrandAssetUrl = (value: string): string => {
  if (!value) return value;
  if (ABSOLUTE_URL_REGEX.test(value) || value.startsWith('data:') || value.startsWith('blob:')) {
    return value;
  }

  const baseUrl = getBrandAssetsBaseUrl();
  if (!baseUrl) return value;

  const normalizedPath = value.startsWith('/') ? value : `/${value}`;
  return `${baseUrl}${toSafeUrlPath(normalizedPath)}`;
};

export const normalizeBrandingAssets = (assets: BrandingAssets): BrandingAssets => ({
  logos: {
    main: resolveBrandAssetUrl(assets.logos.main),
    large: resolveBrandAssetUrl(assets.logos.large),
    small: resolveBrandAssetUrl(assets.logos.small),
  },
  banners: {
    sponsor: resolveBrandAssetUrl(assets.banners.sponsor),
  },
  social: {
    google: resolveBrandAssetUrl(assets.social.google),
    facebook: resolveBrandAssetUrl(assets.social.facebook),
  },
  backgrounds: {
    main: resolveBrandAssetUrl(assets.backgrounds.main),
    dashboard: resolveBrandAssetUrl(assets.backgrounds.dashboard),
    userCard: resolveBrandAssetUrl(assets.backgrounds.userCard),
    rankingCard: resolveBrandAssetUrl(assets.backgrounds.rankingCard),
  },
  cardBackgrounds: {
    blue: resolveBrandAssetUrl(assets.cardBackgrounds.blue),
    emerald: resolveBrandAssetUrl(assets.cardBackgrounds.emerald),
    orange: resolveBrandAssetUrl(assets.cardBackgrounds.orange),
  },
  header: assets.header ? resolveBrandAssetUrl(assets.header) : undefined,
});

export const normalizeBrandingSponsorUrls = (values: string[]): string[] =>
  values.map((value) => resolveBrandAssetUrl(value));
