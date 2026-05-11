'use client';

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { IS_DEMO_MODE } from '@/lib/demo-mode';

export interface TournamentInfo {
  tournamentId: string;
  name: string;
  code: string;
  status: string;
  logoUrl?: string;
  startsAt: string;
  endsAt: string;
}

interface TournamentContextValue {
  tournaments: TournamentInfo[];
  selectedTournament: TournamentInfo | null;
  selectedTournamentId: string | null;
  loading: boolean;
  selectTournament: (tournamentId: string) => void;
  refreshTournaments: () => Promise<void>;
}

const TournamentContext = createContext<TournamentContextValue | undefined>(undefined);
const STORAGE_KEY = 'quiniela-selected-tournament';

export function TournamentProvider({ children }: { children: React.ReactNode }) {
  const [tournaments, setTournaments] = useState<TournamentInfo[]>([]);
  const [selectedTournamentId, setSelectedTournamentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchTournaments = useCallback(async () => {
    try {
      setLoading(true);

      // In demo mode, use a single mock tournament
      if (IS_DEMO_MODE) {
        const mockTournament: TournamentInfo = {
          tournamentId: 'demo-tournament',
          name: 'Mundial 2026 (Demo)',
          code: 'WC2026',
          status: 'active',
          startsAt: '2026-06-11',
          endsAt: '2026-07-19',
        };
        setTournaments([mockTournament]);
        setSelectedTournamentId('demo-tournament');
        return;
      }

      const res = await fetch('/api/tournaments');
      const data = await res.json();
      const list: TournamentInfo[] = data.tournaments || [];
      setTournaments(list);

      // Restore selection or pick first
      const stored = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
      const valid = stored && list.some((t) => t.tournamentId === stored);
      if (valid) {
        setSelectedTournamentId(stored);
      } else if (list.length > 0) {
        setSelectedTournamentId(list[0].tournamentId);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTournaments(); }, [fetchTournaments]);

  const selectTournament = useCallback((id: string) => {
    setSelectedTournamentId(id);
    if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY, id);
  }, []);

  const selectedTournament = useMemo(
    () => tournaments.find((t) => t.tournamentId === selectedTournamentId) || null,
    [tournaments, selectedTournamentId]
  );

  const value = useMemo(() => ({
    tournaments,
    selectedTournament,
    selectedTournamentId,
    loading,
    selectTournament,
    refreshTournaments: fetchTournaments,
  }), [tournaments, selectedTournament, selectedTournamentId, loading, selectTournament, fetchTournaments]);

  return <TournamentContext.Provider value={value}>{children}</TournamentContext.Provider>;
}

export const useTournament = (): TournamentContextValue => {
  const ctx = useContext(TournamentContext);
  if (!ctx) throw new Error('useTournament must be used within TournamentProvider');
  return ctx;
};
