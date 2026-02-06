'use client';

interface UserCardProps {
  fullName: string;
  avatarUrl: string;
  points: number;
  onViewResults?: () => void;
}

export default function UserCard({ fullName, avatarUrl, points, onViewResults }: UserCardProps) {
  return (
    <div className="rounded-3xl border shadow-sm overflow-hidden" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
      <div className="p-6 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-full border-2 overflow-hidden flex items-center justify-center shadow-inner" style={{ backgroundColor: 'var(--color-surface2)', borderColor: 'var(--color-primary)' }}>
            <img src={avatarUrl} className="w-full h-full object-cover" alt="Avatar" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase mb-1 tracking-widest" style={{ color: 'var(--color-muted)' }}>
              Participante Oficial
            </p>
            <h2 className="text-2xl font-black" style={{ color: 'var(--color-text)' }}>{fullName}</h2>
          </div>
        </div>
        <div className="text-right">
          <span className="block text-[10px] font-bold uppercase tracking-tighter" style={{ color: 'var(--color-muted)' }}>
            Puntos Totales
          </span>
          <span className="font-black text-4xl leading-none" style={{ color: 'var(--color-primary)' }}>{points}</span>
        </div>
      </div>
      {onViewResults && (
        <div className="px-6 pb-6">
          <button
            onClick={onViewResults}
            className="w-full py-3 border rounded-xl font-bold text-xs uppercase tracking-widest transition flex items-center justify-center space-x-2 hover:opacity-90"
            style={{ 
              backgroundColor: 'var(--color-surface2)', 
              borderColor: 'var(--color-border)',
              color: 'var(--color-primary)'
            }}
          >
            <span>Ver mis resultados y ranking</span>
            <span className="text-lg">📊</span>
          </button>
        </div>
      )}
    </div>
  );
}
