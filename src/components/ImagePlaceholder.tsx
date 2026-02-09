'use client';

import { useEffect, useState, useRef } from 'react';

interface ImagePlaceholderProps {
  width: number;
  height: number;
  label: string;
  className?: string;
  tooltipPosition?: 'auto' | 'left' | 'right' | 'top' | 'bottom';
}

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

function calculateAspectRatio(width: number, height: number): string {
  const divisor = gcd(width, height);
  return `${width / divisor}:${height / divisor}`;
}

export default function ImagePlaceholder({ width, height, label, className = '', tooltipPosition = 'auto' }: ImagePlaceholderProps) {
  const aspectRatio = calculateAspectRatio(width, height);
  const isSmall = width < 50 || height < 35;
  const [position, setPosition] = useState<'top' | 'bottom' | 'left' | 'right'>('top');
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (tooltipPosition !== 'auto') {
      setPosition(tooltipPosition as any);
      return;
    }
    
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      // Si está muy arriba, mostrar abajo
      if (rect.top < 80) {
        setPosition('bottom');
      } else {
        setPosition('top');
      }
    }
  }, [tooltipPosition]);
  
  const getTooltipClasses = () => {
    switch(position) {
      case 'left':
        return 'right-full mr-2 top-1/2 transform -translate-y-1/2';
      case 'right':
        return 'left-full ml-2 top-1/2 transform -translate-y-1/2';
      case 'bottom':
        return 'top-full mt-1 left-1/2 transform -translate-x-1/2';
      default: // top
        return 'bottom-full mb-1 left-1/2 transform -translate-x-1/2';
    }
  };
  
  const getArrowStyles = () => {
    const base = {
      position: 'absolute' as const,
      width: 0,
      height: 0,
    };
    
    switch(position) {
      case 'left':
        return {
          ...base,
          left: '100%',
          top: '50%',
          transform: 'translateY(-50%)',
          borderTop: '4px solid transparent',
          borderBottom: '4px solid transparent',
          borderLeft: '4px solid var(--color-primary)',
        };
      case 'right':
        return {
          ...base,
          right: '100%',
          top: '50%',
          transform: 'translateY(-50%)',
          borderTop: '4px solid transparent',
          borderBottom: '4px solid transparent',
          borderRight: '4px solid var(--color-primary)',
        };
      case 'bottom':
        return {
          ...base,
          bottom: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          borderLeft: '4px solid transparent',
          borderRight: '4px solid transparent',
          borderBottom: '4px solid var(--color-primary)',
        };
      default: // top
        return {
          ...base,
          top: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          borderLeft: '4px solid transparent',
          borderRight: '4px solid transparent',
          borderTop: '4px solid var(--color-primary)',
        };
    }
  };
  
  return (
    <div
      ref={containerRef}
      className={`flex items-center justify-center border-2 border-dashed rounded ${className} relative`}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        borderColor: 'var(--color-warning)',
        backgroundColor: 'var(--color-surface2)',
      }}
    >
      {/* Tooltip always visible */}
      <div 
        className={`absolute px-2 py-1 rounded shadow-xl whitespace-nowrap pointer-events-none z-[9999] ${getTooltipClasses()}`}
        style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-primaryText)' }}
      >
        {/* Arrow */}
        <div style={getArrowStyles()} />
        <p className="text-[9px] font-black uppercase leading-tight">{label}</p>
        <p className="text-[8px] font-bold leading-tight">{width}x{height}px</p>
        <p className="text-[8px] font-bold leading-tight">Ratio: {aspectRatio}</p>
      </div>
      
      {/* Content */}
      {isSmall ? (
        <div className="text-center">
          <p className="text-[10px] font-black" style={{ color: 'var(--color-warning)' }}>IMG</p>
        </div>
      ) : (
        <div className="text-center px-1">
          <p className="text-[10px] font-black uppercase truncate" style={{ color: 'var(--color-warning)' }}>
            {label}
          </p>
          <p className="text-[8px] font-bold" style={{ color: 'var(--color-muted)' }}>
            {width}x{height}
          </p>
        </div>
      )}
    </div>
  );
}
