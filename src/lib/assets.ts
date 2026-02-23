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
  };
}

export const brandAssets: BrandAssets = {
  logos: {
    main: '/assets/LOGO LARGE 96x96.svg',
    large: '/assets/LOGO LARGE 96x96.svg',
    small: '/assets/LOGO LARGE 96x96.svg',
  },
  banners: {
    sponsor: '/assets/BANNER SPONSOR 600X60.svg',
  },
  backgrounds: {
    dashboard: '/assets/DASHBOARD 1920X1080.svg',
    userCard: '/assets/CARD USER 400x150.svg',
  },
  social: {
    google: '/assets/G 24X24.svg',
    facebook: '/assets/F 24X24.svg',
  },
  cardBackgrounds: {
    blue: '/assets/CARD BG N5/CARD BG AZUL 400X120.svg',
    emerald: '/assets/CARD BG N5/CARD BG CELESTE 400X120.svg',
    orange: '/assets/CARD BG N5/CARD BG ROJO 400X120.svg',
  },
  sponsors: {
    master: ['/assets/MASTER LOGO 200X80.svg'],
    gold: [
      '/assets/LOGO GOLD 1 120X60.svg',
      '/assets/LOGO GOLD 2 120X60.svg',
    ],
    silver: [
      '/assets/LOGO SILVER 1 80X40.svg',
      '/assets/LOGO SILVER 2 80X40.svg',
      '/assets/LOGO SILVER 3 80X40.svg',
    ],
  },
};
