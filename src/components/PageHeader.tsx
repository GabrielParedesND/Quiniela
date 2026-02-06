'use client';

import { useRouter } from 'next/navigation';

interface PageHeaderProps {
  title: string;
  showBackButton?: boolean;
  backTo?: string;
}

export default function PageHeader({ title, showBackButton = false, backTo = '/dashboard' }: PageHeaderProps) {
  const router = useRouter();

  return (
    <div className="flex justify-between items-center mb-2">
      {showBackButton ? (
        <button
          onClick={() => router.push(backTo)}
          className="text-xs font-bold flex items-center hover:underline uppercase tracking-widest"
          style={{ color: 'var(--color-primary)' }}
        >
          ← {backTo === '/dashboard' ? 'Inicio' : 'Volver'}
        </button>
      ) : (
        <div />
      )}
      <h2 className="font-black text-lg uppercase italic" style={{ color: 'var(--color-text)' }}>{title}</h2>
    </div>
  );
}
