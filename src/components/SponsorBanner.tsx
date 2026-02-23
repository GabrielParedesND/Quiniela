import { brandAssets } from '@/lib/assets';

export default function SponsorBanner() {
  return (
    <div className="w-full bg-white border-b border-slate-200">
      <div className="max-w-4xl mx-auto h-16 flex items-center justify-center p-2">
        <img 
          src={brandAssets.banners.sponsor} 
          alt="Patrocinador" 
          className="h-full w-auto object-contain"
        />
      </div>
    </div>
  );
}
