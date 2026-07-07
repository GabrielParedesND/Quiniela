'use client';

import { useEffect, useState, useCallback } from 'react';
import { useBranding } from '@/contexts/BrandingContext';

/**
 * Unified sponsor carousel with smooth lateral sliding.
 * Clean, professional design with minimal chrome.
 */

const AUTO_INTERVAL = 4000;

export default function PromoBanner() {
  const { config } = useBranding();
  const allLogos = config.sponsors?.logos || [];
  const total = allLogos.length;

  const [itemsVisible, setItemsVisible] = useState(3);
  const [itemWidth, setItemWidth] = useState(120);

  const updateLayout = useCallback(() => {
    if (typeof window === 'undefined') return;
    const w = window.innerWidth;
    if (w < 640) {
      setItemsVisible(2);
      // Each item takes exactly 50% of available width (container width minus padding)
      const availableWidth = w - 48; // 24px padding each side
      setItemWidth(availableWidth / 2);
    } else {
      setItemsVisible(3);
      setItemWidth(140);
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

  const containerWidth = itemsVisible * itemWidth;
  const slotWidth = itemWidth;

  if (!shouldPaginate) {
    return (
      <div 
        className="w-full rounded-2xl overflow-hidden py-5 px-4 backdrop-blur-sm"
        style={{ backgroundColor: 'rgba(255,255,255,0.55)' }}
      >
        <div className="text-center mb-4">
          <p className="text-[9px] font-black uppercase tracking-[0.25em]" style={{ color: '#1e293b' }}>
            Patrocinadores Oficiales
          </p>
        </div>
        <div className="flex items-center justify-center px-4 min-h-[60px]">
          {allLogos.map((logo, index) => (
            <div 
              key={index} 
              className="flex items-center justify-center px-2" 
              style={{ width: `${100 / itemsVisible}%`, height: '60px' }}
            >
              <img src={logo} alt="Patrocinador" className="w-full h-full object-contain opacity-90 hover:opacity-100 transition-opacity" loading="lazy" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const extendedLogos = [...allLogos, ...allLogos, ...allLogos];
  const offset = (startIndex + total) * slotWidth;

  return (
    <div 
      className="w-full rounded-2xl overflow-hidden py-5 px-4 backdrop-blur-sm"
      style={{ backgroundColor: 'rgba(255,255,255,0.55)' }}
    >
      <div className="text-center mb-4">
        <p className="text-[9px] font-black uppercase tracking-[0.25em]" style={{ color: '#1e293b' }}>
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
                className="flex items-center justify-center shrink-0 px-2"
                style={{ width: slotWidth, height: '60px' }}
              >
                <img
                  src={logo}
                  alt="Patrocinador"
                  className="w-full h-full object-contain opacity-80"
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
