'use client';

import ImagePlaceholder from './ImagePlaceholder';

interface Sponsor {
  name: string;
  logo?: string;
  tier?: 'master' | 'gold' | 'silver';
  url?: string;
}

interface PromoBannerProps {
  sponsors?: Sponsor[];
}

export default function PromoBanner({ 
  sponsors = [
    { name: 'Sponsor Master', tier: 'master' },
    { name: 'Sponsor Gold 1', tier: 'gold' },
    { name: 'Sponsor Gold 2', tier: 'gold' },
    { name: 'Sponsor Silver 1', tier: 'silver' },
    { name: 'Sponsor Silver 2', tier: 'silver' },
  ]
}: PromoBannerProps) {
  const masterSponsors = sponsors.filter(s => s.tier === 'master');
  const goldSponsors = sponsors.filter(s => s.tier === 'gold');
  const silverSponsors = sponsors.filter(s => s.tier === 'silver');

  return (
    <div className="w-full">
      <div className="text-center mb-4 relative">
        <p className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: 'var(--color-muted)' }}>
          Patrocinadores Oficiales
        </p>
        <div className="absolute -top-2 right-0 px-2 py-1 rounded text-[8px] font-black" style={{ backgroundColor: 'var(--color-warning)', color: 'var(--color-primaryText)' }} title="Sponsor Section\nMaster: 200x80px (5:2)\nGold: 120x60px (2:1)\nSilver: 80x40px (2:1)">
          SPONSOR AREA
        </div>
      </div>

      <div className="rounded-2xl border shadow-sm overflow-hidden" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
        {masterSponsors.length > 0 && (
          <div className="border-b" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface2)' }}>
            <div className="p-6">
              {masterSponsors.map((sponsor, index) => (
                <div key={index} className="flex flex-col items-center justify-center space-y-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-wider" style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-primaryText)' }}>
                    <span className="w-1 h-1 rounded-full animate-pulse" style={{ backgroundColor: 'var(--color-primaryText)' }} />
                    Patrocinador Master
                  </span>
                  <div className="w-full h-20 flex items-center justify-center">
                    <ImagePlaceholder width={200} height={80} label="MASTER LOGO" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="p-4">
          {goldSponsors.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-px flex-1" style={{ background: `linear-gradient(to right, transparent, var(--color-border), transparent)` }} />
                <span className="text-[8px] font-black uppercase tracking-wider px-2" style={{ color: 'var(--color-muted)' }}>Gold</span>
                <div className="h-px flex-1" style={{ background: `linear-gradient(to right, transparent, var(--color-border), transparent)` }} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                {goldSponsors.map((sponsor, index) => (
                  <div 
                    key={index}
                    className="group relative border rounded-xl p-4 transition-all duration-300 hover:shadow-md cursor-pointer"
                    style={{ backgroundColor: 'var(--color-surface2)', borderColor: 'var(--color-border)' }}
                  >
                    <div className="h-12 flex items-center justify-center">
                      <ImagePlaceholder width={120} height={60} label="GOLD" className="mx-auto" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {silverSponsors.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="h-px flex-1" style={{ background: `linear-gradient(to right, transparent, var(--color-border), transparent)` }} />
                <span className="text-[8px] font-black uppercase tracking-wider px-2" style={{ color: 'var(--color-muted)' }}>Silver</span>
                <div className="h-px flex-1" style={{ background: `linear-gradient(to right, transparent, var(--color-border), transparent)` }} />
              </div>
              <div className="grid grid-cols-3 gap-2">
                {silverSponsors.map((sponsor, index) => (
                  <div 
                    key={index}
                    className="group border rounded-lg p-3 transition-all duration-300 cursor-pointer"
                    style={{ backgroundColor: 'var(--color-surface2)', borderColor: 'var(--color-border)' }}
                  >
                    <div className="h-8 flex items-center justify-center">
                      <ImagePlaceholder width={80} height={40} label="SILVER" className="mx-auto" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
