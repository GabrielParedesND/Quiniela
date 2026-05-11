'use client';

import { useEffect, useState } from 'react';

interface SponsorCarouselProps {
  sponsors: string[];
  tier: 'master' | 'gold' | 'silver';
  autoPlayInterval?: number;
}

export default function SponsorCarousel({ 
  sponsors, 
  tier,
  autoPlayInterval = 3000 
}: SponsorCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Configuration based on tier
  const config = {
    master: {
      itemsPerView: 1,
      height: 'h-20',
      maxHeight: 'max-h-16',
      maxWidth: 'max-w-[200px]',
    },
    gold: {
      itemsPerView: 2,
      height: 'h-12',
      maxHeight: 'max-h-10',
      maxWidth: 'max-w-full',
    },
    silver: {
      itemsPerView: 3,
      height: 'h-8',
      maxHeight: 'max-h-6',
      maxWidth: 'max-w-full',
    },
  }[tier];

  const itemsPerView = config.itemsPerView;
  const totalPages = Math.ceil(sponsors.length / itemsPerView);
  const shouldAutoPlay = totalPages > 1;

  // Auto-play carousel
  useEffect(() => {
    if (!shouldAutoPlay) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % totalPages);
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [shouldAutoPlay, totalPages, autoPlayInterval]);

  // Get visible sponsors for current page
  const startIndex = currentIndex * itemsPerView;
  const visibleSponsors = sponsors.slice(startIndex, startIndex + itemsPerView);

  // Fill empty slots if needed
  while (visibleSponsors.length < itemsPerView && tier !== 'master') {
    visibleSponsors.push('');
  }

  return (
    <div className="relative">
      {/* Sponsors grid */}
      <div className={`grid ${
        tier === 'master' ? 'grid-cols-1' : 
        tier === 'gold' ? 'grid-cols-2' : 
        'grid-cols-3'
      } ${tier === 'silver' ? 'gap-2' : 'gap-3'}`}>
        {visibleSponsors.map((logo, index) => (
          <div
            key={`${currentIndex}-${index}`}
            className={`
              ${tier === 'master' ? 'flex flex-col items-center justify-center space-y-3' : ''}
              ${tier !== 'master' ? 'group border rounded-lg transition-all duration-300' : ''}
              ${tier === 'gold' ? 'p-4 hover:shadow-md cursor-pointer rounded-xl' : ''}
              ${tier === 'silver' ? 'p-3 cursor-pointer' : ''}
              animate-fadeIn
            `}
            style={tier !== 'master' ? { 
              backgroundColor: 'var(--color-surface2)', 
              borderColor: 'var(--color-border)' 
            } : undefined}
          >
            {tier === 'master' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-wider" style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-primaryText)' }}>
                <span className="w-1 h-1 rounded-full animate-pulse" style={{ backgroundColor: 'var(--color-primaryText)' }} />
                Patrocinador Master
              </span>
            )}
            <div className={`${config.height} flex items-center justify-center w-full`}>
              {logo ? (
                <img 
                  src={logo} 
                  alt={`Patrocinador ${tier}`}
                  className={`${config.maxHeight} ${config.maxWidth} object-contain transition-all duration-300`}
                />
              ) : (
                <div className="w-full h-full" />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination dots */}
      {shouldAutoPlay && (
        <div className="flex justify-center gap-1.5 mt-3">
          {Array.from({ length: totalPages }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className="transition-all duration-300"
              aria-label={`Ir a página ${index + 1}`}
            >
              <div
                className={`rounded-full transition-all duration-300 ${
                  index === currentIndex 
                    ? 'w-6 h-1.5' 
                    : 'w-1.5 h-1.5 opacity-40 hover:opacity-70'
                }`}
                style={{ backgroundColor: 'var(--color-primary)' }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
