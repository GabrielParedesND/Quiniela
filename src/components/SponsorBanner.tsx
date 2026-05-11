'use client';

import { useBranding } from '@/contexts/BrandingContext';

export default function SponsorBanner() {
  const { config } = useBranding();

  // Use header image from CMS if available, otherwise use default sponsor banner
  const bannerImage = config.assets?.header || config.assets.banners.sponsor;

  return (
    <div className="w-full bg-white border-b border-slate-200">
      <div className="max-w-4xl mx-auto h-16 flex items-center justify-center p-2">
        <img 
          src={bannerImage}
          alt="Patrocinador" 
          className="h-full w-auto object-contain"
        />
      </div>
    </div>
  );
}
