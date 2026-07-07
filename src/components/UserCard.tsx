'use client';

import { useEffect, useRef, useState } from 'react';
import { useBranding } from '@/contexts/BrandingContext';

interface UserCardProps {
  fullName: string;
  avatarUrl: string;
  points: number;
  onViewResults?: () => void;
}

export default function UserCard({ fullName, avatarUrl, points, onViewResults }: UserCardProps) {
  const { config } = useBranding();
  const imgRef = useRef<HTMLImageElement>(null);
  const [isDark, setIsDark] = useState(true);

  // Detect if the background image is dark or light
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = config.assets.backgrounds.userCard;
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        let totalBrightness = 0;
        const pixelCount = data.length / 4;
        for (let i = 0; i < data.length; i += 4) {
          totalBrightness += (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114);
        }
        const avgBrightness = totalBrightness / pixelCount;
        setIsDark(avgBrightness < 128);
      } catch {
        // CORS or other error, default to dark
        setIsDark(true);
      }
    };
  }, [config.assets.backgrounds.userCard]);

  const textColor = isDark ? '#ffffff' : '#1e293b';
  const mutedColor = isDark ? 'rgba(255,255,255,0.7)' : 'rgba(30,41,59,0.6)';
  const pointsColor = '#ffffff';

  return (
    <div className="rounded-2xl overflow-hidden relative shadow-md min-h-[180px] flex flex-col">
      {/* Full background image */}
      <img
        ref={imgRef}
        src={config.assets.backgrounds.userCard}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none"
      />

      {/* Content area - grows to fill */}
      <div className="relative z-10 p-6 flex items-center justify-between flex-1">
        <div className="flex items-center space-x-4">
          <div
            className="w-16 h-16 rounded-full border-2 overflow-hidden flex items-center justify-center shadow-lg"
            style={{ backgroundColor: 'rgba(255,255,255,0.15)', borderColor: pointsColor }}
          >
            <img src={avatarUrl} className="w-full h-full object-contain p-1" alt="Avatar" />
          </div>
          <div>
            <p className="text-[9px] font-bold uppercase tracking-widest" style={{ color: mutedColor }}>
              Participante Oficial
            </p>
            <h2 className="text-xl sm:text-2xl font-black leading-tight" style={{ color: textColor }}>{fullName}</h2>
          </div>
        </div>

        <div className="text-right">
          <span className="block text-[9px] font-bold uppercase tracking-wider" style={{ color: mutedColor }}>
            Puntos Totales
          </span>
          <span className="font-black text-4xl sm:text-5xl leading-none" style={{ color: pointsColor }}>{points}</span>
        </div>
      </div>

      {/* Bottom button - flush, gradient backdrop, interactive feedback */}
      {onViewResults && (
        <button
          onClick={onViewResults}
          className="relative z-10 w-full py-4 font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 cursor-pointer group active:scale-[0.98]"
          style={{
            background: isDark
              ? 'linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.8) 100%)'
              : 'linear-gradient(180deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.95) 100%)',
            color: isDark ? '#00e5ff' : 'var(--color-primary)',
          }}
        >
          <span className="group-hover:tracking-[0.2em] transition-all duration-300">Ver mis resultados y ranking</span>
          <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
          {/* Hover shimmer line */}
          <span
            className="absolute bottom-0 left-0 h-[2px] w-0 group-hover:w-full transition-all duration-500"
            style={{ backgroundColor: isDark ? '#00e5ff' : 'var(--color-primary)' }}
          />
        </button>
      )}
    </div>
  );
}
