'use client';

interface EmptyStateProps {
  icon?: string;
  title?: string;
  message?: string;
}

export default function EmptyState({
  icon = '⏳',
  title = 'Proximamente...',
  message = 'Esta informacion estara disponible pronto.',
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
      <span className="text-4xl mb-3">{icon}</span>
      <p className="text-sm font-black uppercase tracking-wider mb-1" style={{ color: 'var(--color-text)' }}>
        {title}
      </p>
      <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
        {message}
      </p>
    </div>
  );
}
