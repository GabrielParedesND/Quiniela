'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
import CountdownTimer from '@/components/CountdownTimer';
import { isMatchPastDeadline as sharedIsMatchPastDeadline, computeJornadaDeadlineWithRule, PredictionDeadlineRule } from '@/lib/deadline';
import { IS_DEMO_MODE } from '@/lib/demo-mode';
import { DEMO_LOCKED_JORNADAS } from '@/lib/mock';
import { useTournament } from '@/contexts/TournamentContext';
import TournamentSelector from '@/components/TournamentSelector';
import JornadaNotAvailable from '@/components/JornadaNotAvailable';

function PredictionsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useUser();
  const { selectedTournamentId: tournamentId } = useTournament();
  const [activeJornada, setActiveJornada] = useState<number | null>(null);
  const [jornadaTransitionDirection, setJornadaTransitionDirection] = useState<'left' | 'right'>('left');
  const [predictions, setPredictions] = useState<Record<string, { a: string; b: string }>>({});
  const [matches, setMatches] = useState<Match[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [initialized, setInitialized] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; isError?: boolean } | null>(null);
  const [snapshotLoading, setSnapshotLoading] = useState(true);
  const [snapshotError, setSnapshotError] = useState('');
  const [requestedJornadaNotFound, setRequestedJornadaNotFound] = useState(false);
  const [deadlineRule, setDeadlineRule] = useState<PredictionDeadlineRule>('per-match');
  const [saving, setSaving] = useState(false);

  const normalizeScoreInput = (value: string): string | null => {
    if (value === '') return '';
    // Only allow digits (no dashes, no negatives)
    if (!/^\d+$/.test(value)) return null;
    // Limit to 2 digits (0-99)
    if (value.length > 2) return null;
    const num = parseInt(value, 10);
    if (num < 0 || num > 99) return null;
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
        setDeadlineRule(snapshot.predictionDeadlineRule || 'per-match');

        // Auto-select the nearest future jornada (first jornada with matches whose kickoff is today or later)
        // Use Guatemala timezone for "today" to match how jornadas are assigned on the server
        const now = new Date();
        const todayStr = now.toLocaleDateString('en-CA', { timeZone: 'America/Guatemala' }); // YYYY-MM-DD in Guatemala
        const allJornadas = Array.from(new Set(snapshot.matches.map((m: Match) => m.jornada))).sort((a, b) => a - b);

        // Compare match kickoff dates in Guatemala timezone
        const getMatchDateGT = (kickoffAt: string): string => {
          return new Date(kickoffAt).toLocaleDateString('en-CA', { timeZone: 'America/Guatemala' });
        };

        const futureJornada = allJornadas.find((j) =>
          snapshot.matches.some((m: Match) => m.jornada === j && m.kickoffAt && getMatchDateGT(m.kickoffAt) >= todayStr)
        );

        // Check for jornada query parameter (deep-link from QR codes)
        const jornadaParam = searchParams.get('jornada');
        if (jornadaParam) {
          const parsed = parseInt(jornadaParam, 10);
          if (!isNaN(parsed) && parsed >= 1) {
            const jornadaExists = allJornadas.includes(parsed);
            setActiveJornada(parsed);
            if (!jornadaExists) {
              setRequestedJornadaNotFound(true);
            }
          } else {
            // Invalid param — use default auto-selection
            setActiveJornada(futureJornada ?? allJornadas[allJornadas.length - 1] ?? 1);
          }
        } else {
          // No param — use default auto-selection
          setActiveJornada(futureJornada ?? allJornadas[allJornadas.length - 1] ?? 1);
        }

        setInitialized(true);
      } catch (error) {
        console.error('Error loading predictions snapshot:', error);
        setSnapshotError('No se pudo cargar la información de predicciones');
      } finally {
        setSnapshotLoading(false);
      }
    };

    checkAccess();
  }, [user, loading, router, tournamentId, searchParams]);

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
    if (saving) return;

    const userId = await getUserId();
    if (!userId) {
      setToastMessage({ text: 'Tu sesión expiró. Vuelve a iniciar sesión.', isError: true });
      setShowToast(true);
      setTimeout(() => setShowToast(false), 4000);
      return;
    }

    // Only validate open (non-locked) matches in the jornada
    const openMatches = jornadaMatches.filter((m) => m.status !== 'played' && !isMatchPastDeadline(m));

    // Validate: all open matches must have both predictions filled
    const incompleteMatches = openMatches.filter((m) => {
      const pred = predictions[m.id];
      if (!pred) return true;
      const hasA = pred.a !== '' && pred.a !== undefined;
      const hasB = pred.b !== '' && pred.b !== undefined;
      return !hasA || !hasB;
    });

    if (incompleteMatches.length > 0) {
      setToastMessage({ text: `Completa todos los pronósticos de la jornada (${incompleteMatches.length} partido${incompleteMatches.length > 1 ? 's' : ''} sin completar).`, isError: true });
      setShowToast(true);
      setTimeout(() => setShowToast(false), 4000);
      return;
    }

    setSaving(true);
    try {
      const snapshot = await saveUserPredictions(userId, predictions, tournamentId);
      // Update local state with server-confirmed predictions
      setPredictions(snapshot.userPredictions);
      setToastMessage({ text: '¡Pronósticos guardados!' });
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (error: any) {
      console.error('Error saving predictions:', error);
      const msg = error?.message || 'No se pudieron guardar los pronósticos. Intenta de nuevo.';
      setToastMessage({ text: msg, isError: true });
      setShowToast(true);
      setTimeout(() => setShowToast(false), 5000);
    } finally {
      setSaving(false);
    }
  };

  const handleJornadaChange = (jornada: number) => {
    if (jornada === effectiveJornada) return;
    setJornadaTransitionDirection(jornada > effectiveJornada ? 'left' : 'right');
    setActiveJornada(jornada);
    setRequestedJornadaNotFound(false);
  };

  if (loading || !user || snapshotLoading || !initialized) {
    return (
      <AppShell>
        <section className="space-y-4">
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
        </section>
      </AppShell>
    );
  }

  if (snapshotError) {
    return (
      <AppShell>
        <section className="space-y-4">
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

  const effectiveJornada = activeJornada ?? 1;
  const jornadaMatches = matches.filter((m) => m.jornada === effectiveJornada);
  const deadline = computeJornadaDeadlineWithRule(jornadaMatches, deadlineRule);
  const jornadas = Array.from(new Set(matches.map((match) => match.jornada))).sort((a, b) => a - b);
  const tabs = jornadas.map((j) => ({ value: j, label: `Jornada ${j}` }));

  // A match is past deadline based on the tournament's deadline rule
  const isMatchPastDeadline = (m: Match): boolean => sharedIsMatchPastDeadline(m, deadlineRule);

  const jornadaCerrada =
    (IS_DEMO_MODE && DEMO_LOCKED_JORNADAS.includes(effectiveJornada)) ||
    (!IS_DEMO_MODE &&
      jornadaMatches.length > 0 &&
      jornadaMatches.every((match) => match.status === 'played' || isMatchPastDeadline(match)));

  return (
    <>
      {/* Toast notification */}
      {showToast && toastMessage && (
        <div
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl border animate-slide-up"
          style={{
            backgroundColor: 'var(--color-surface)',
            borderColor: toastMessage.isError ? 'var(--color-danger)' : 'var(--color-accent)',
            borderWidth: '2px',
          }}
        >
          <span className="text-2xl">{toastMessage.isError ? '⚠️' : '⚽'}</span>
          <div>
            <p className="text-xs font-black uppercase tracking-wider" style={{ color: toastMessage.isError ? 'var(--color-danger)' : 'var(--color-text)' }}>
              {toastMessage.text}
            </p>
            {!toastMessage.isError && (
              <p className="text-[10px] mt-0.5" style={{ color: 'var(--color-muted)' }}>
                Buena suerte en esta jornada
              </p>
            )}
          </div>
        </div>
      )}
      <AppShell>
        <section className="space-y-4">
          <PageHeader title="Ingresar Marcadores" showBackButton />

          <TournamentSelector />

          {tabs.length > 0 && (
            <TabSelector tabs={tabs} activeTab={effectiveJornada} onTabChange={handleJornadaChange} />
          )}

          {!(requestedJornadaNotFound && jornadaMatches.length === 0) && (
            <CountdownTimer
              deadline={deadline}
              infoMessage={!jornadaCerrada && jornadaMatches.length > 0
                ? (deadlineRule === 'media-noche'
                  ? 'Ingresa tus pronósticos antes de las 12:00 AM del día de la jornada. Después de esa hora se bloquean todos los marcadores.'
                  : 'Los pronósticos se bloquean conforme inicia cada partido. Ingresa todos antes de que comience el primer partido de la jornada.')
                : undefined}
            />
          )}

          {matches.length === 0 ? (
            <div className="rounded-2xl border p-6 mt-4" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <span className="text-3xl mb-2">⚽</span>
                <p className="text-xs font-black uppercase tracking-wider" style={{ color: 'var(--color-text)' }}>Proximamente...</p>
                <p className="text-[10px] mt-1" style={{ color: 'var(--color-muted)' }}>Los partidos para pronosticar estaran disponibles pronto.</p>
              </div>
            </div>
          ) : requestedJornadaNotFound && jornadaMatches.length === 0 ? (
            <div className="mt-4">
              <JornadaNotAvailable jornadaNumber={effectiveJornada} />
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
                (!IS_DEMO_MODE && (m.status === 'played' || isMatchPastDeadline(m)));

              return (
                <MatchCard
                  key={m.id}
                  teamA={teamA}
                  teamB={teamB}
                  jornada={m.jornada}
                  dateLabel={m.dateLabel}
                  kickoffTime={m.kickoffAt ? new Date(m.kickoffAt).toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'America/Guatemala' }) : undefined}
                  groupLabel={teamA.group || undefined}
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

          {matches.length > 0 && !(requestedJornadaNotFound && jornadaMatches.length === 0) && (
          <div className="mt-6 flex justify-center">
            <button
              onClick={handleSave}
              disabled={jornadaCerrada || saving}
              className="font-black py-4 px-10 rounded-full shadow-lg transition border-2 uppercase tracking-widest text-xs hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
              style={{
                backgroundColor: jornadaCerrada ? 'var(--color-muted)' : 'var(--color-primary)',
                color: 'var(--color-primaryText)',
                borderColor: 'var(--color-border)',
              }}
            >
              {jornadaCerrada ? 'JORNADA CERRADA' : saving ? 'GUARDANDO...' : 'GUARDAR PRONÓSTICOS'}
            </button>
          </div>
          )}
        </section>
      </AppShell>
    </>
  );
}

export default function PredictionsPage() {
  return (
    <Suspense>
      <PredictionsContent />
    </Suspense>
  );
}