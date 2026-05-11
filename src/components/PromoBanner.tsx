'use client';

import { useEffect, useState, useCallback } from 'react';
import { useBranding } from '@/contexts/BrandingContext';

/**
 * Unified sponsor carousel with smooth lateral sliding.
 * - Uses `config.sponsors.logos` only
 * - Responsive: 2 items on mobile, 3 on desktop
 * - 1-3 logos (or 1-2 on mobile): centered, no pagination
 * - More logos than visible: slides one item at a time with smooth transition
 */

const AUTO_INTERVAL = 4000;

export default function PromoBanner() {
  const { config } = useBranding();
  const allLogos = config.sponsors?.logos || [];
  const total = allLogos.length;

  // Responsive: detect mobile vs desktop
  const [itemsVisible, setItemsVisible] = useState(3);
  const [itemWidth, setItemWidth] = useState(120);

  const updateLayout = useCallback(() => {
    if (typeof window === 'undefined') return;
    const w = window.innerWidth;
    if (w < 640) {
      // Mobile: 2 items, smaller width
      setItemsVisible(2);
      setItemWidth(Math.min(140, (w - 64) / 2)); // 64px for padding+gaps
    } else {
      // Desktop/tablet: 3 items, gold-size (120×60)
      setItemsVisible(3);
      setItemWidth(120);
    }
  }, []);

  useEffect(() => {
    updateLayout();
    window.addEventListener('resize', updateLayout);
    return () => window.removeEventListener('resize', updateLayout);
  }, [updateLayout]);

  const [startIndex, setStartIndex] = useState(0);
  const shouldPaginate = total > itemsVisible;

  useEffect(() => {
    if (!shouldPaginate) return;
    const timer = setInterval(() => {
      setStartIndex((prev) => (prev + 1) % total);
    }, AUTO_INTERVAL);
    return () => clearInterval(timer);
  }, [shouldPaginate, total]);

  if (total === 0) return null;

  const containerWidth = itemsVisible * (itemWidth + 16); // 16px gap
  const slotWidth = itemWidth + 16;

  // For non-paginating, just center them
  if (!shouldPaginate) {
    return (
      <div className="w-full py-2">
        <div className="text-center mb-2">
          <p className="text-[9px] font-black uppercase tracking-[0.3em]" style={{ color: 'var(--color-muted)' }}>
            Patrocinadores Oficiales
          </p>
        </div>
        <div className="flex items-center justify-center gap-4 px-4 min-h-[60px]">
          {allLogos.map((logo, index) => (
            <div key={index} className="flex items-center justify-center" style={{ width: itemWidth, height: '60px' }}>
              <img src={logo} alt="Patrocinador" className="max-w-full max-h-full object-contain" loading="lazy" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Sliding carousel: triple the array for seamless loop
  const extendedLogos = [...allLogos, ...allLogos, ...allLogos];
  const offset = (startIndex + total) * slotWidth;

  return (
    <div className="w-full py-2">
      <div className="text-center mb-2">
        <p className="text-[9px] font-black uppercase tracking-[0.3em]" style={{ color: 'var(--color-muted)' }}>
          Patrocinadores Oficiales
        </p>
      </div>

      <div className="flex justify-center px-4">
        <div className="overflow-hidden" style={{ width: containerWidth }}>
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${offset}px)` }}
          >
            {extendedLogos.map((logo, index) => (
              <div
                key={index}
                className="flex items-center justify-center shrink-0"
                style={{ width: slotWidth, height: '60px' }}
              >
                <img
                  src={logo}
                  alt="Patrocinador"
                  className="object-contain"
                  style={{ maxWidth: itemWidth, maxHeight: '55px' }}
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
