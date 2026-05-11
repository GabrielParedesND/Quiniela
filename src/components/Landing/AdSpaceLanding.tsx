'use client';

import { useEffect, useState, useCallback } from 'react';

/**
 * Landing page ad space — positioned between Activations and Testimonials.
 * 
 * Container id="ad-container-landing" for Google Ad Manager targeting.
 * Shows rotating lateral ad creatives with crossfade.
 * When AD_SCRIPT_ENABLED=true, renders only the empty container.
 */

const AD_SCRIPT_ENABLED = process.env.NEXT_PUBLIC_AD_SCRIPT_ENABLED === 'true';

const ADS = [
  { id: 'sponsor1', imageUrl: '/assets/ADS/BANNER/BANNER SPONSOR 1.svg', redirectUrl: 'https://www.nuestrodiario.com', label: 'Sponsor 1' },
  { id: 'sponsor2', imageUrl: '/assets/ADS/BANNER/BANNER SPONSOR 2.svg', redirectUrl: 'https://www.nuestrodiario.com', label: 'Sponsor 2' },
  { id: 'sponsor3', imageUrl: '/assets/ADS/BANNER/BANNER SPONSOR 3.svg', redirectUrl: 'https://www.nuestrodiario.com', label: 'Sponsor 3' },
];

const MOBILE_AD = {
  imageUrl: '/assets/ADS/BANNER/BANNER ANUNCIO 320X50.svg',
  redirectUrl: 'https://www.nuestrodiario.com',
  label: 'Anuncio mobile',
};

const ROTATION_INTERVAL = 5000;

export default function AdSpaceLanding() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const handleVisibility = useCallback(() => {
    setIsVisible(document.visibilityState === 'visible');
  }, []);

  useEffect(() => {
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [handleVisibility]);

  useEffect(() => {
    if (!isVisible || AD_SCRIPT_ENABLED || ADS.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % ADS.length);
    }, ROTATION_INTERVAL);
    return () => clearInterval(timer);
  }, [isVisible]);

  if (AD_SCRIPT_ENABLED) {
    return (
      <section id="ad-container-landing" className="w-full py-8">
        <div className="max-w-6xl mx-auto px-4 min-h-[250px]" />
      </section>
    );
  }

  return (
    <section id="ad-container-landing" className="w-full py-8" style={{ backgroundColor: '#f8fafc' }}>
      <div className="max-w-6xl mx-auto px-4">
        {/* Mobile: single static banner 320×50 */}
        <div className="sm:hidden rounded-xl overflow-hidden" style={{ height: '50px', maxWidth: '320px', margin: '0 auto' }}>
          {MOBILE_AD.redirectUrl ? (
            <a href={MOBILE_AD.redirectUrl} target="_blank" rel="noopener noreferrer" className="block w-full h-full">
              <img src={MOBILE_AD.imageUrl} alt={MOBILE_AD.label} className="w-full h-full object-cover" />
            </a>
          ) : (
            <img src={MOBILE_AD.imageUrl} alt={MOBILE_AD.label} className="w-full h-full object-cover" />
          )}
        </div>

        {/* Desktop: rotating sponsors 728×90 */}
        <div className="relative rounded-2xl overflow-hidden shadow-lg hidden sm:block" style={{ height: '90px', maxWidth: '728px', margin: '0 auto' }}>
          {ADS.map((ad, index) => {
            const isCurrent = index === currentIndex;
            const content = (
              <img
                src={ad.imageUrl}
                alt={ad.label}
                className="w-full h-full object-cover"
                loading={isCurrent ? 'eager' : 'lazy'}
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            );

            return (
              <div
                key={ad.id}
                className="absolute inset-0 transition-opacity duration-300"
                style={{
                  opacity: isCurrent ? 1 : 0,
                  pointerEvents: isCurrent ? 'auto' : 'none',
                }}
              >
                {ad.redirectUrl ? (
                  <a
                    href={ad.redirectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full h-full"
                    aria-label={ad.label}
                  >
                    {content}
                  </a>
                ) : (
                  content
                )}
              </div>
            );
          })}

          {/* Dots indicator */}
          {ADS.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
              {ADS.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className="w-2 h-2 rounded-full transition-all duration-300"
                  style={{
                    backgroundColor: index === currentIndex ? '#fff' : 'rgba(255,255,255,0.4)',
                    transform: index === currentIndex ? 'scale(1.3)' : 'scale(1)',
                    boxShadow: index === currentIndex ? '0 0 4px rgba(0,0,0,0.3)' : 'none',
                  }}
                  aria-label={`Anuncio ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
