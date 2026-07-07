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
    <div className="flex justify-between items-center mb-2 rounded-xl px-4 py-2.5 backdrop-blur-sm" style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}>
      {showBackButton ? (
        <button
          onClick={() => router.push(backTo)}
          className="text-xs font-bold flex items-center hover:underline uppercase tracking-widest text-white/90 hover:text-white transition"
        >
          ← {backTo === '/dashboard' ? 'Inicio' : 'Volver'}
        </button>
      ) : (
        <div />
      )}
      <h2 className="font-black text-lg uppercase italic text-white break-words min-w-0" style={{ overflowWrap: 'anywhere' }}>{title}</h2>
    </div>
  );
}
