'use client';

interface NavigationCardProps {
  icon: string;
  title: string;
  description: string;
  onClick: () => void;
  color?: 'blue' | 'emerald' | 'orange';
}

export default function NavigationCard({ 
  icon, 
  title, 
  description, 
  onClick, 
  color = 'blue' 
}: NavigationCardProps) {
  return (
    <div
      onClick={onClick}
      className="p-5 rounded-2xl border flex items-center justify-between cursor-pointer transition group shadow-sm hover:shadow-md"
      style={{ 
        backgroundColor: 'var(--color-surface)', 
        borderColor: 'var(--color-border)'
      }}
    >
      <div className="flex items-center space-x-4">
        <div 
          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition"
          style={{ 
            backgroundColor: 'var(--color-surface2)', 
            color: 'var(--color-primary)'
          }}
        >
          {icon}
        </div>
        <div>
          <h3 className="font-bold uppercase text-sm tracking-tight" style={{ color: 'var(--color-text)' }}>
            {title}
          </h3>
          <p className="text-xs" style={{ color: 'var(--color-muted)' }}>{description}</p>
        </div>
      </div>
      <span className="text-xl group-hover:translate-x-1 transition" style={{ color: 'var(--color-muted)' }}>→</span>
    </div>
  );
}
