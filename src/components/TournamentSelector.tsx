'use client';

import { useTournament } from '@/contexts/TournamentContext';

export default function TournamentSelector() {
  const { tournaments, selectedTournamentId, selectTournament, loading } = useTournament();

  if (loading || tournaments.length <= 1) return null;

  return (
    <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
      {tournaments.map((t) => {
        const isActive = t.tournamentId === selectedTournamentId;
        return (
          <button
            key={t.tournamentId}
            onClick={() => selectTournament(t.tournamentId)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0"
            style={{
              backgroundColor: isActive ? 'var(--color-primary)' : 'var(--color-surface)',
              color: isActive ? 'var(--color-primaryText)' : 'var(--color-text)',
              border: isActive ? 'none' : '1px solid var(--color-border)',
              boxShadow: isActive ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
            }}
          >
            {t.logoUrl && <img src={t.logoUrl} alt="" className="w-5 h-5 rounded-sm" />}
            <span>{t.name}</span>
          </button>
        );
      })}
    </div>
  );
}
