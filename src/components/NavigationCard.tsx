'use client';

import { ReactNode } from 'react';

interface NavigationCardProps {
  icon: string | ReactNode;
  title: string;
  description: string;
  onClick: () => void;
  color?: 'blue' | 'emerald' | 'orange';
  backgroundImage?: string;
  layer1?: string;
  layer2?: string;
  variant?: 'split' | 'full';
}

export default function NavigationCard({ 
  icon, 
  title, 
  description, 
  onClick, 
  color = 'blue',
  layer1 = '/assets/LAYERING/fondo-boton-capa-1.png',
  layer2 = '/assets/LAYERING/fondo-boton-capa-2.png',
  variant = 'split',
}: NavigationCardProps) {
  const accentColors: Record<string, string> = {
    blue: '#1e40af',
    emerald: '#7c3aed',
    orange: '#c2410c',
  };

  const accentColor = accentColors[color] || accentColors.blue;

  if (variant === 'full') {
    // Full-width variant: image covers entire card, text overlaid on left with gradient
    return (
      <div
        onClick={onClick}
        className="nav-card relative rounded-2xl overflow-hidden cursor-pointer transition-all group shadow-md hover:shadow-2xl hover:scale-[1.02] h-[120px] flex items-stretch"
      >
        {/* Full background layer 1 */}
        <img
          src={layer1}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        />
        <div
          className="absolute inset-0 pointer-events-none opacity-40"
          style={{ backgroundColor: accentColor }}
        />

        {/* Gradient overlay left side for text readability */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(90deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.3) 40%, transparent 70%)' }} />

        {/* Layer 2: decorative object covering full width, contained to card height, aligned right */}
        <div className="nav-card-layer2 absolute inset-0 flex items-center justify-end pointer-events-none z-[2] overflow-hidden">
          <img
            src={layer2}
            alt=""
            aria-hidden="true"
            className="h-full w-auto max-h-full object-contain"
          />
        </div>

        {/* Text content */}
        <div className="relative z-10 flex items-center w-full pl-5 pr-[40%] py-4">
          <div className="min-w-0">
            <h3 className="font-black uppercase text-sm sm:text-base tracking-tight leading-tight text-white drop-shadow-md">
              {title}
            </h3>
            <p className="text-[11px] sm:text-xs mt-1 leading-tight text-white/80">{description}</p>
          </div>
        </div>

        {/* Arrow */}
        <div className="nav-card-arrow absolute bottom-3 right-3 z-10">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center shadow-md"
            style={{ backgroundColor: accentColor }}
          >
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    );
  }

  // Default "split" variant with diagonal
  return (
    <div
      onClick={onClick}
      className="nav-card relative rounded-2xl overflow-hidden cursor-pointer transition-all group shadow-md hover:shadow-2xl hover:scale-[1.02] h-[120px] flex items-stretch"
      style={{ backgroundColor: '#ffffff' }}
    >
      {/* ===== RIGHT HALF: capa-1 image background with diagonal clip ===== */}
      <div
        className="absolute top-0 right-0 h-full w-[50%] overflow-hidden transition-all duration-500 ease-out group-hover:w-[58%]"
        style={{ clipPath: 'polygon(40px 0, 100% 0, 100% 100%, 0px 100%)' }}
      >
        <img
          src={layer1}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        />
        <div
          className="absolute inset-0 pointer-events-none opacity-50"
          style={{ backgroundColor: accentColor }}
        />
      </div>

      {/* ===== CAPA-2: decorative object, hover on desktop / always on mobile ===== */}
      <div className="nav-card-layer2 absolute top-0 right-0 h-full w-[45%] flex items-center justify-center pointer-events-none z-[2] transition-all duration-500 ease-out group-hover:w-[52%] group-hover:-translate-x-2">
        <img
          src={layer2}
          alt=""
          aria-hidden="true"
          className="h-[85%] w-auto max-w-full object-contain drop-shadow-xl"
        />
      </div>

      {/* ===== TEXT CONTENT (left white area) ===== */}
      <div className="relative z-10 flex items-center w-full pr-[45%] pl-5 py-4">
        <div className="min-w-0">
          <h3 className="font-black uppercase text-sm sm:text-base tracking-tight leading-tight" style={{ color: '#1e293b' }}>
            {title}
          </h3>
          <p className="text-[11px] sm:text-xs mt-1 leading-tight" style={{ color: '#64748b' }}>{description}</p>
        </div>
      </div>

      {/* ===== ARROW: bottom-right, same visibility as capa-2 ===== */}
      <div className="nav-card-arrow absolute bottom-3 right-3 z-10">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center shadow-md"
          style={{ backgroundColor: accentColor }}
        >
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  );
}
