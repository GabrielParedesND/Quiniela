'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface TabSelectorProps<T extends string | number> {
  tabs: { value: T; label: string }[];
  activeTab: T;
  onTabChange: (tab: T) => void;
}

export default function TabSelector<T extends string | number>({
  tabs,
  activeTab,
  onTabChange,
}: TabSelectorProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  const checkOverflow = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    setShowLeftArrow(el.scrollLeft > 4);
    setShowRightArrow(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  useEffect(() => {
    checkOverflow();
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('scroll', checkOverflow, { passive: true });
    window.addEventListener('resize', checkOverflow);
    return () => {
      el.removeEventListener('scroll', checkOverflow);
      window.removeEventListener('resize', checkOverflow);
    };
  }, [checkOverflow, tabs]);

  useEffect(() => {
    if (activeRef.current) {
      activeRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [activeTab]);

  const scroll = (direction: 'left' | 'right') => {
    const el = containerRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.6;
    el.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  // Enable mouse wheel horizontal scroll
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handleWheel = (e: WheelEvent) => {
      if (el.scrollWidth <= el.clientWidth) return;
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        el.scrollBy({ left: e.deltaY, behavior: 'auto' });
      }
    };
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, []);

  return (
    <div className="relative">
      {/* Left arrow */}
      {showLeftArrow && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 flex items-center justify-center rounded-full shadow-md transition-opacity"
          style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
          aria-label="Scroll izquierda"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--color-text)' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      {/* Scrollable tabs */}
      <div ref={containerRef} className="overflow-x-auto hide-scrollbar -mx-1 px-1">
        <div className="flex gap-2 py-1" style={{ width: 'max-content' }}>
          {tabs.map((tab) => {
            const isActive = tab.value === activeTab;
            return (
              <button
                key={tab.value}
                ref={isActive ? activeRef : undefined}
                onClick={() => onTabChange(tab.value)}
                className="whitespace-nowrap px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all duration-200"
                style={{
                  backgroundColor: isActive ? 'var(--color-primary)' : 'var(--color-surface)',
                  color: isActive ? 'var(--color-primaryText)' : 'var(--color-muted)',
                  border: isActive ? 'none' : '1px solid var(--color-border)',
                  boxShadow: isActive ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Right arrow */}
      {showRightArrow && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 flex items-center justify-center rounded-full shadow-md transition-opacity"
          style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
          aria-label="Scroll derecha"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--color-text)' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}
    </div>
  );
}
