'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUserId, isAuthenticated } from '@/lib/auth/cognito';
import { useUser } from '@/contexts/UserContext';
import { isProfileComplete } from '@/lib/db/users';
import {
  fetchQuinielaSnapshot,
  Match,
  saveUserPredictions,
  Team,
} from '@/lib/db/quiniela';
import AppShell from '@/components/AppShell';
import LoadingContent from '@/components/LoadingContent';
import PageHeader from '@/components/PageHeader';
import TabSelector from '@/components/TabSelector';
import MatchCard from '@/components/MatchCard';
import KickTransition from '@/components/KickTransition';
import { IS_DEMO_MODE } from '@/lib/demo-mode';
import { DEMO_LOCKED_JORNADAS } from '@/lib/mock';
import { useTournament } from '@/contexts/TournamentContext';
import TournamentSelector from '@/components/TournamentSelector';

export default function PredictionsPage() {
  const router = useRouter();
  const { user, loading } = useUser();
  const { selectedTournamentId: tournamentId } = useTournament();
  const [activeJornada, setActiveJornada] = useState<number | null>(null);
  const [jornadaTransitionDirection, setJornadaTransitionDirection] = useState<'left' | 'right'>('left');
  const [predictions, setPredictions] = useState<Record<string, { a: string; b: string }>>({});
  const [matches, setMatches] = useState<Match[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [initialized, setInitialized] = useState(false);
  const [showKick, setShowKick] = useState(false);
  const [snapshotLoading, setSnapshotLoading] = useState(true);
  const [snapshotError, setSnapshotError] = useState('');

  const normalizeScoreInput = (value: string): string | null => {
    if (value === '') return '';
    if (!/^\d+$/.test(value)) return null;
    return value;
  };

  useEffect(() => {
    const checkAccess = async () => {
      if (loading) return;

      const authenticated = await isAuthenticated();
      if (!authenticated) {
        router.push('/');
        return;
      }

      if (!user) return;
      
      if (!isProfileComplete(user)) {
        router.push('/onboarding');
        return;
      }

      try {
        setSnapshotLoading(true);
        setSnapshotError('');
        const userId = await getUserId();
        const snapshot = await fetchQuinielaSnapshot(userId, tournamentId);
        setPredictions(snapshot.userPredictions);
        setMatches(snapshot.matches);
        setTeams(snapshot.teams);

        // Auto-select the nearest future jornada (first jornada with matches whose kickoff is today or later)
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];
        const allJornadas = Array.from(new Set(snapshot.matches.map((m: Match) => m.jornada))).sort((a, b) => a - b);
        const futureJornada = allJornadas.find((j) =>
          snapshot.matches.some((m: Match) => m.jornada === j && m.kickoffAt && m.kickoffAt.substring(0, 10) >= todayStr)
        );
        setActiveJornada(futureJornada ?? allJornadas[allJornadas.length - 1] ?? 1);

        setInitialized(true);
      } catch (error) {
        console.error('Error loading predictions snapshot:', error);
        setSnapshotError('No se pudo cargar la información de predicciones');
      } finally {
        setSnapshotLoading(false);
      }
    };

    checkAccess();
  }, [user, loading, router, tournamentId]);

  const handlePredictionChange = (matchId: string, team: 'a' | 'b', value: string) => {
    const normalizedValue = normalizeScoreInput(value);
    if (normalizedValue === null) return;

    setPredictions((prev) => {
      const existing = prev[matchId] || { a: '', b: '' };
      const updated = {
        ...prev,
        [matchId]: { ...existing, [team]: normalizedValue },
      };
      return updated;
    });
  };

  const handleSave = async () => {
    const userId = await getUserId();
    if (!userId) return;
    await saveUserPredictions(userId, predictions, tournamentId);
    setShowKick(true);
  };

  const handleJornadaChange = (jornada: number) => {
    if (jornada === effectiveJornada) return;
    setJornadaTransitionDirection(jornada > effectiveJornada ? 'left' : 'right');
    setActiveJornada(jornada);
  };

  if (loading || !user) {
    return (
      <AppShell>
        <LoadingContent />
      </AppShell>
    );
  }

  if (snapshotError) {
    return (
      <AppShell>
        <section className="fade-in space-y-4">
          <PageHeader title="Ingresar Marcadores" showBackButton />
          <div className="rounded-2xl border p-6" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
            <div className="flex flex-col items-center justify-center text-center">
              <span className="text-3xl mb-2">⚽</span>
              <p className="text-xs font-black uppercase tracking-wider" style={{ color: 'var(--color-text)' }}>Proximamente...</p>
              <p className="text-[10px] mt-1" style={{ color: 'var(--color-muted)' }}>Los marcadores estaran disponibles pronto.</p>
            </div>
          </div>
        </section>
      </AppShell>
    );
  }

  if (snapshotLoading || !initialized) {
    return (
      <AppShell>
        <section className="fade-in space-y-4">
          <PageHeader title="Ingresar Marcadores" showBackButton />

          {/* Tab selector skeleton */}
          <div className="flex gap-2 py-1">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-9 rounded-xl skeleton" style={{ width: `${85 + i * 5}px` }} />
            ))}
          </div>

          {/* Match cards skeleton */}
          <div className="space-y-4 mt-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="rounded-2xl border overflow-hidden" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                <div className="h-7 px-3 flex items-center justify-between border-b" style={{ backgroundColor: 'var(--color-surface2)', borderColor: 'var(--color-border)' }}>
                  <div className="h-2.5 w-24 rounded skeleton" />
                  <div className="h-2.5 w-12 rounded skeleton" />
                </div>
                <div className="p-4 flex items-center justify-between">
                  <div className="w-1/3 flex flex-col items-center gap-2">
                    <div className="w-10 h-7 rounded-sm skeleton" />
                    <div className="h-2.5 w-16 rounded skeleton" />
                  </div>
                  <div className="w-1/3 flex items-center justify-center gap-2">
                    <div className="w-9 h-9 rounded-lg skeleton" />
                    <div className="w-2 h-4 rounded skeleton" />
                    <div className="w-9 h-9 rounded-lg skeleton" />
                  </div>
                  <div className="w-1/3 flex flex-col items-center gap-2">
                    <div className="w-10 h-7 rounded-sm skeleton" />
                    <div className="h-2.5 w-16 rounded skeleton" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Save button skeleton */}
          <div className="mt-2 flex justify-center">
            <div className="h-12 w-56 rounded-full skeleton" />
          </div>
        </section>
      </AppShell>
    );
  }

  const effectiveJornada = activeJornada ?? 1;
  const jornadaMatches = matches.filter((m) => m.jornada === effectiveJornada);
  const jornadas = Array.from(new Set(matches.map((match) => match.jornada))).sort((a, b) => a - b);
  const tabs = jornadas.map((j) => ({ value: j, label: `Jornada ${j}` }));
  const jornadaCerrada =
    (IS_DEMO_MODE && DEMO_LOCKED_JORNADAS.includes(effectiveJornada)) ||
    (!IS_DEMO_MODE &&
      jornadaMatches.length > 0 &&
      jornadaMatches.every((match) => match.status === 'played'));

  return (
    <>
      <KickTransition active={showKick} onComplete={() => router.push('/results')} />
      <AppShell>
        <section className="fade-in space-y-4">
          <PageHeader title="Ingresar Marcadores" showBackButton />

          <TournamentSelector />

          {tabs.length > 0 && (
            <TabSelector tabs={tabs} activeTab={effectiveJornada} onTabChange={handleJornadaChange} />
          )}

          {matches.length === 0 ? (
            <div className="rounded-2xl border p-6 mt-4" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <span className="text-3xl mb-2">⚽</span>
                <p className="text-xs font-black uppercase tracking-wider" style={{ color: 'var(--color-text)' }}>Proximamente...</p>
                <p className="text-[10px] mt-1" style={{ color: 'var(--color-muted)' }}>Los partidos para pronosticar estaran disponibles pronto.</p>
              </div>
            </div>
          ) : jornadaMatches.length === 0 ? (
            <div className="rounded-2xl border p-6 mt-4" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <span className="text-2xl mb-2">📋</span>
                <p className="text-[10px] font-bold" style={{ color: 'var(--color-muted)' }}>No hay partidos en esta jornada.</p>
              </div>
            </div>
          ) : (
          <div
            key={effectiveJornada}
            className={`space-y-4 mt-4 jornada-flip-container ${
              jornadaTransitionDirection === 'left' ? 'jornada-flip-left' : 'jornada-flip-right'
            }`}
          >
            {jornadaMatches.map((m) => {
              const teamA = teams.find((t) => t.id === m.teamAId);
              const teamB = teams.find((t) => t.id === m.teamBId);
              if (!teamA || !teamB) return null;
              const pred = predictions[m.id] || { a: '', b: '' };
              const isLocked =
                (IS_DEMO_MODE && DEMO_LOCKED_JORNADAS.includes(m.jornada)) ||
                (!IS_DEMO_MODE && m.status === 'played');

              return (
                <MatchCard
                  key={m.id}
                  teamA={teamA}
                  teamB={teamB}
                  jornada={m.jornada}
                  dateLabel={m.dateLabel}
                  isLocked={isLocked}
                  predictionA={pred.a}
                  predictionB={pred.b}
                  isSpecial={m.isSpecial}
                  multiplier={m.multiplier}
                  onPredictionChange={(team, value) => handlePredictionChange(m.id, team, value)}
                />
              );
            })}
          </div>
          )}

          {matches.length > 0 && (
          <div className="mt-6 flex justify-center">
            <button
              onClick={handleSave}
              disabled={jornadaCerrada}
              className="font-black py-4 px-10 rounded-full shadow-lg transition border-2 uppercase tracking-widest text-xs hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
              style={{
                backgroundColor: jornadaCerrada ? 'var(--color-muted)' : 'var(--color-primary)',
                color: 'var(--color-primaryText)',
                borderColor: 'var(--color-border)',
              }}
            >
              {jornadaCerrada ? 'JORNADA CERRADA' : 'GUARDAR PRONÓSTICOS'}
            </button>
          </div>
          )}
        </section>
      </AppShell>
    </>
  );
}
