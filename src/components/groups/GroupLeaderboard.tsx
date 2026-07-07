'use client';

import { useEffect, useState } from 'react';
import { authFetch } from '@/lib/api-client';
import { IS_DEMO_MODE } from '@/lib/demo-mode';

interface LeaderboardEntry {
  position: number;
  userId: string;
  displayName: string;
  avatarUrl?: string;
  totalPoints: number;
  correctPredictions: number;
  totalPredictions: number;
}

interface GroupLeaderboardProps {
  groupId: string;
  currentUserId: string | null;
  tournamentId?: string | null;
}

export default function GroupLeaderboard({ groupId, currentUserId, tournamentId }: GroupLeaderboardProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const limit = 20;

  useEffect(() => {
    fetchLeaderboard(0);
  }, [groupId, tournamentId]);

  const fetchLeaderboard = async (currentOffset: number) => {
    try {
      setLoading(true);

      // Demo mode: return empty leaderboard
      if (IS_DEMO_MODE) {
        setEntries([]);
        setHasMore(false);
        setLoading(false);
        return;
      }

      if (!tournamentId) {
        setEntries([]);
        setHasMore(false);
        setLoading(false);
        return;
      }

      const res = await authFetch(`/api/groups/${groupId}/leaderboard?limit=${limit}&offset=${currentOffset}&tournamentId=${tournamentId}`);
      if (!res.ok) throw new Error('Error al cargar leaderboard');
      const data = await res.json();
      if (currentOffset === 0) {
        setEntries(data.data);
      } else {
        setEntries((prev) => [...prev, ...data.data]);
      }
      setHasMore(data.pagination.hasMore);
      setOffset(currentOffset + limit);
    } catch (err: any) {
      setError(err.message || 'Error al cargar leaderboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading && entries.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm" style={{ color: 'var(--color-muted)' }}>Cargando leaderboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-xl text-sm" style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: 'var(--color-danger)' }}>
        {error}
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
          El leaderboard aún no tiene datos.
        </p>
        <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>
          Se actualizará cuando se procesen resultados.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {entries.map((entry) => {
        const isCurrentUser = entry.userId === currentUserId;
        return (
          <div
            key={entry.userId}
            className="flex items-center gap-3 p-3 rounded-xl transition"
            style={{
              backgroundColor: isCurrentUser ? 'rgba(99,102,241,0.08)' : 'var(--color-surface)',
              border: isCurrentUser ? '2px solid rgba(99,102,241,0.3)' : '1px solid var(--color-border)',
            }}
          >
            {/* Position */}
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-black"
              style={{
                backgroundColor: entry.position <= 3 ? 'var(--color-primary)' : 'var(--color-surface2)',
                color: entry.position <= 3 ? '#fff' : 'var(--color-text)',
              }}
            >
              {entry.position}
            </div>

            {/* Avatar */}
            <div
              className="w-8 h-8 rounded-full overflow-hidden shrink-0 flex items-center justify-center"
              style={{ backgroundColor: 'var(--color-surface2)' }}
            >
              <img
                src={entry.avatarUrl || '/assets/PROFILE/unknown-football-shirt-svgrepo-com.svg'}
                alt=""
                className="w-full h-full object-contain p-0.5"
              />
            </div>

            {/* Name */}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold truncate" style={{ color: 'var(--color-text)' }}>
                {entry.displayName}
                {isCurrentUser && <span className="ml-1 text-[10px] font-normal" style={{ color: 'var(--color-primary)' }}>(tú)</span>}
              </p>
            </div>

            {/* Points */}
            <div className="text-right shrink-0">
              <span className="text-sm font-black" style={{ color: 'var(--color-text)' }}>
                {entry.totalPoints}
              </span>
              <span className="text-[10px] ml-0.5" style={{ color: 'var(--color-muted)' }}>pts</span>
            </div>
          </div>
        );
      })}

      {/* Load more */}
      {hasMore && (
        <button
          onClick={() => fetchLeaderboard(offset)}
          disabled={loading}
          className="w-full py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition hover:opacity-80"
          style={{ color: 'var(--color-primary)', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
        >
          {loading ? 'Cargando...' : 'Cargar más'}
        </button>
      )}
    </div>
  );
}
