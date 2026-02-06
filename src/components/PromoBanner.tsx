'use client';

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
      {/* Header */}
      <div className="text-center mb-4">
        <p className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: 'var(--color-muted)' }}>
          Patrocinadores Oficiales
        </p>
      </div>

      {/* Sponsors Grid */}
      <div className="rounded-2xl border shadow-sm overflow-hidden" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
        {/* Master Sponsor */}
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
                    {sponsor.logo ? (
                      <img 
                        src={sponsor.logo} 
                        alt={sponsor.name}
                        className="max-h-16 max-w-[200px] object-contain grayscale hover:grayscale-0 transition-all duration-300"
                      />
                    ) : (
                      <div className="text-center">
                        <p className="text-2xl font-black tracking-tight" style={{ color: 'var(--color-text)' }}>{sponsor.name}</p>
                        <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>Logo del patrocinador</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Gold & Silver Sponsors */}
        <div className="p-4">
          {/* Gold Sponsors */}
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
                      {sponsor.logo ? (
                        <img 
                          src={sponsor.logo} 
                          alt={sponsor.name}
                          className="max-h-10 max-w-full object-contain grayscale group-hover:grayscale-0 transition-all duration-300"
                        />
                      ) : (
                        <p className="text-sm font-bold transition-colors text-center" style={{ color: 'var(--color-text)' }}>
                          {sponsor.name}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Silver Sponsors */}
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
                      {sponsor.logo ? (
                        <img 
                          src={sponsor.logo} 
                          alt={sponsor.name}
                          className="max-h-6 max-w-full object-contain grayscale group-hover:grayscale-0 transition-all duration-300"
                        />
                      ) : (
                        <p className="text-[10px] font-bold transition-colors text-center" style={{ color: 'var(--color-muted)' }}>
                          {sponsor.name}
                        </p>
                      )}
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
