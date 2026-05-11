'use client';

import { useEffect, useRef } from 'react';

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

  useEffect(() => {
    if (activeRef.current) {
      activeRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [activeTab]);

  return (
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
  );
}
