'use client';

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
  return (
    <div
      className="rounded-2xl shadow-sm p-1 border"
      style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
    >
      <div className="flex overflow-x-auto items-center space-x-6 px-4 py-3 hide-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => onTabChange(tab.value)}
            className="tab-btn px-4 py-2 text-[10px] font-black uppercase tracking-widest min-w-[100px] text-center relative transition"
            style={{ color: tab.value === activeTab ? 'var(--color-text)' : 'var(--color-muted)' }}
          >
            {tab.label}
            {tab.value === activeTab && (
              <span
                className="absolute bottom-[-6px] left-1/2 transform -translate-x-1/2 w-2 h-2 rounded-full"
                style={{ backgroundColor: 'var(--color-accent)' }}
              ></span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
