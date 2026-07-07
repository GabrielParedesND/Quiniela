'use client';

import { useEffect, useState, useCallback } from 'react';

/**
 * Ad Space container with automatic carousel rotation.
 * Responsive: same rotating banners on mobile and desktop.
 */

const AD_SCRIPT_ENABLED = process.env.NEXT_PUBLIC_AD_SCRIPT_ENABLED === 'true';

const ADS = [
  { id: 'sponsor1', imageUrl: '/assets/ADS/BANNER/banner-1.png', redirectUrl: 'https://www.nuestrodiario.com', label: 'Sponsor 1' },
  { id: 'sponsor2', imageUrl: '/assets/ADS/BANNER/banner-2.png', redirectUrl: 'https://www.nuestrodiario.com', label: 'Sponsor 2' },
  { id: 'sponsor3', imageUrl: '/assets/ADS/BANNER/banner-3.png', redirectUrl: 'https://www.nuestrodiario.com', label: 'Sponsor 3' },
];

const ROTATION_INTERVAL = 5000;

export default function AdSpace() {
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
      <div id="ad-container-main" className="w-full my-2">
        <div className="max-w-4xl mx-auto min-h-[60px]" />
      </div>
    );
  }

  return (
    <div id="ad-container-main" className="w-full my-2">
      <div className="max-w-4xl mx-auto px-4 sm:px-8">
        <div className="relative rounded-2xl overflow-hidden shadow-lg max-h-[60px] sm:max-h-[90px]">
          {/* First image sets the aspect ratio */}
          <img
            src={ADS[0].imageUrl}
            alt=""
            aria-hidden="true"
            className="w-full h-auto invisible"
          />

          {/* Rotating ads layered on top */}
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
                className="absolute inset-0 transition-opacity duration-500"
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
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
              {ADS.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className="w-2 h-2 rounded-full transition-all duration-300"
                  style={{
                    backgroundColor: index === currentIndex ? '#fff' : 'rgba(255,255,255,0.4)',
                    transform: index === currentIndex ? 'scale(1.3)' : 'scale(1)',
                  }}
                  aria-label={`Anuncio ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
