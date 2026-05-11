'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUserId, isAuthenticated } from '@/lib/auth/cognito';
import { useUser } from '@/contexts/UserContext';
import { isProfileComplete } from '@/lib/db/users';
import AppShell from '@/components/AppShell';
import LoadingContent from '@/components/LoadingContent';
import PageHeader from '@/components/PageHeader';
import ResultCard from '@/components/ResultCard';
import RankingTable from '@/components/RankingTable';
import {
  fetchQuinielaSnapshot,
  getPhase,
  Match,
  RankingUser,
  Team,
} from '@/lib/db/quiniela';
import TabSelector from '@/components/TabSelector';
import { useBranding } from '@/contexts/BrandingContext';
import { useTournament } from '@/contexts/TournamentContext';
import TournamentSelector from '@/components/TournamentSelector';

export default function ResultsPage() {
  const router = useRouter();
  const { user, loading } = useUser();
  const { config } = useBranding();
  const { selectedTournamentId: tournamentId } = useTournament();
  const [points, setPoints] = useState(0);
  const [pointsByJornada, setPointsByJornada] = useState([0, 0, 0]);
  const [predictions, setPredictions] = useState<Record<string, { a: string; b: string }>>({});
  const [matches, setMatches] = useState<Match[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [rankingUsers, setRankingUsers] = useState<RankingUser[]>([]);
  const [initialized, setInitialized] = useState(false);
  const [snapshotLoading, setSnapshotLoading] = useState(true);
  const [snapshotError, setSnapshotError] = useState('');
  const [selectedJornada, setSelectedJornada] = useState<number>(0);
  const [streak, setStreak] = useState<{ current: number; threshold: number; multiplier: number; active: boolean } | null>(null);

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
        setPoints(snapshot.points);
        setPointsByJornada(snapshot.pointsByJornada);
        setTeams(snapshot.teams);
        setMatches(snapshot.matches);
        setRankingUsers(snapshot.rankingUsers);
        if (snapshot.streak) setStreak(snapshot.streak);
        setInitialized(true);
      } catch (error) {
        console.error('Error loading results snapshot:', error);
        setSnapshotError('No se pudo cargar la información de resultados');
      } finally {
        setSnapshotLoading(false);
      }
    };

    checkAccess();
  }, [user, loading, router, tournamentId]);

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
          <PageHeader title="Mi Rendimiento" showBackButton backTo="/dashboard" />
          <div className="rounded-2xl border p-6" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
            <div className="flex flex-col items-center justify-center text-center">
              <span className="text-3xl mb-2">📊</span>
              <p className="text-xs font-black uppercase tracking-wider" style={{ color: 'var(--color-text)' }}>Proximamente...</p>
              <p className="text-[10px] mt-1" style={{ color: 'var(--color-muted)' }}>Tus resultados se mostraran cuando haya jornadas jugadas.</p>
            </div>
          </div>
        </section>
      </AppShell>
    );
  }

  if (snapshotLoading || !initialized) {
    return (
      <AppShell>
        <section className="fade-in space-y-6 pb-10">
          <PageHeader title="Mi Rendimiento" showBackButton backTo="/dashboard" />

          {/* Chart skeleton */}
          <div className="p-6 rounded-3xl border shadow-sm" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
            <div className="h-3 w-28 rounded skeleton mb-6" />
            <div className="flex items-end h-36 gap-2 pb-1">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1" style={{ minWidth: '36px' }}>
                  <div className="h-2.5 w-6 rounded skeleton" />
                  <div className="w-full rounded-lg skeleton" style={{ height: '96px' }} />
                  <div className="h-2 w-6 rounded skeleton" />
                </div>
              ))}
            </div>
          </div>

          {/* Tab selector skeleton */}
          <div className="flex gap-2 py-1">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-9 rounded-xl skeleton" style={{ width: `${80 + Math.random() * 20}px` }} />
            ))}
          </div>

          {/* Result cards skeleton */}
          <div className="rounded-3xl border shadow-sm overflow-hidden p-2 space-y-2" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="rounded-2xl border p-4" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-7 rounded-sm skeleton" />
                    <div className="h-3 w-14 rounded skeleton" />
                  </div>
                  <div className="w-16 h-7 rounded-lg skeleton" />
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-14 rounded skeleton" />
                    <div className="w-10 h-7 rounded-sm skeleton" />
                  </div>
                </div>
                <div className="h-2.5 w-28 rounded skeleton mt-3" />
              </div>
            ))}
          </div>

          {/* Ranking card skeleton */}
          <div className="rounded-3xl p-6 border" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
            <div className="h-4 w-36 rounded skeleton mb-3 ml-auto" />
            <div className="h-10 w-40 rounded-full skeleton ml-auto" />
          </div>
        </section>
      </AppShell>
    );
  }

  const playedMatches = matches.filter((m) => m.status === 'played');
  const phase = getPhase(points);
  const fullName = `${user.nombres} ${user.apellidos}`;
  const allUsers = [...rankingUsers, { name: `${fullName} (Tú)`, pts: points, phase }].sort(
    (a, b) => b.pts - a.pts
  );
  const position = allUsers.findIndex((u) => u.name.includes('(Tú)')) + 1;

  const getPhaseBg = () => {
    if (phase === 'Cita con la Historia') return 'var(--color-accent)';
    if (phase === 'Duelo de Gigantes') return 'var(--color-danger)';
    if (phase === 'Zona de Campeones') return 'var(--color-primary)';
    return 'var(--color-muted)';
  };

  return (
    <AppShell>
      <section className="fade-in space-y-6 pb-10">
        <PageHeader title="Mi Rendimiento" showBackButton backTo="/dashboard" />

        <TournamentSelector />

        <div className="p-6 rounded-3xl border shadow-sm" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-6" style={{ color: 'var(--color-muted)' }}>
            Puntos por Jornada
          </h3>
          {pointsByJornada.length === 0 || pointsByJornada.every(p => p === 0) ? (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <span className="text-2xl mb-2">📊</span>
              <p className="text-[10px] font-bold" style={{ color: 'var(--color-muted)' }}>Tus puntos apareceran aqui conforme avancen las jornadas.</p>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-2 px-2">
              <div className="flex items-end h-36 gap-2 pb-1" style={{ minWidth: pointsByJornada.length > 6 ? `${pointsByJornada.length * 44}px` : undefined }}>
                {pointsByJornada.map((p, i) => {
                  const maxPoints = Math.max(...pointsByJornada, 1);
                  const height = Math.max((p / maxPoints) * 100, 8);
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1" style={{ minWidth: '36px' }}>
                      <span className="text-[10px] font-black" style={{ color: 'var(--color-primary)' }}>
                        {p}
                      </span>
                      <div className="w-full rounded-lg relative" style={{ backgroundColor: 'var(--color-border)', height: '96px' }}>
                        <div
                          className="bar-grow rounded-lg w-full absolute bottom-0 transition-all duration-1000"
                          style={{ height: `${height}%`, backgroundColor: 'var(--color-primary)' }}
                        />
                      </div>
                      <span className="text-[8px] font-bold uppercase text-center leading-tight truncate w-full" style={{ color: 'var(--color-muted)' }}>
                        J{i + 1}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Streak indicator */}
        {streak && (
          <div
            className="p-5 rounded-2xl relative overflow-hidden"
            style={{
              background: streak.active
                ? 'linear-gradient(135deg, var(--color-accent), var(--color-primary))'
                : 'var(--color-surface)',
              border: streak.active ? 'none' : '1px solid var(--color-border)',
              color: streak.active ? 'white' : 'var(--color-text)',
            }}
          >
            {streak.active && (
              <div className="absolute inset-0 opacity-10" style={{ background: 'repeating-linear-gradient(45deg, transparent, transparent 10px, white 10px, white 12px)' }} />
            )}
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ opacity: 0.7 }}>
                  Racha de participación
                </p>
                <p className="text-lg font-black mt-1 tracking-tight">
                  {streak.current} jornada{streak.current !== 1 ? 's' : ''} consecutiva{streak.current !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="text-right">
                {streak.active ? (
                  <div>
                    <p className="text-2xl font-black pulse-glow">x{streak.multiplier}</p>
                    <p className="text-[9px] font-bold uppercase tracking-widest mt-0.5" style={{ opacity: 0.7 }}>Multiplicador activo</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-lg font-black" style={{ color: 'var(--color-muted)' }}>{streak.threshold - streak.current}</p>
                    <p className="text-[9px] font-bold uppercase" style={{ color: 'var(--color-muted)' }}>para x{streak.multiplier}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] px-2" style={{ color: 'var(--color-muted)' }}>
            Detalle de Resultados
          </h3>

          {playedMatches.length === 0 ? (
            <div className="rounded-3xl border shadow-sm overflow-hidden p-2" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <span className="text-2xl mb-2">📋</span>
                <p className="text-[10px] font-bold" style={{ color: 'var(--color-muted)' }}>Aun no hay jornadas jugadas. Los resultados apareceran aqui.</p>
              </div>
            </div>
          ) : (
          <>
          {/* Jornada tabs */}
          {(() => {
            const jornadas = [...new Set(playedMatches.map((m) => m.jornada))].sort((a, b) => a - b);
            const activeJornada = selectedJornada || jornadas[0] || 1;
            const filteredMatches = playedMatches.filter((m) => m.jornada === activeJornada);
            const tabs = jornadas.map((j) => ({ value: j, label: `Jornada ${j}` }));

            return (
              <>
                <TabSelector tabs={tabs} activeTab={activeJornada} onTabChange={setSelectedJornada} />

                <div className="rounded-3xl border shadow-sm overflow-hidden p-2 space-y-2" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                  {filteredMatches.length === 0 ? (
                    <p className="text-center text-xs py-6 font-bold" style={{ color: 'var(--color-muted)' }}>
                      Sin resultados en esta jornada
                    </p>
                  ) : (
                    filteredMatches.map((m) => {
                      const teamA = teams.find((t) => t.id === m.teamAId);
                      const teamB = teams.find((t) => t.id === m.teamBId);
                      if (!teamA || !teamB) return null;
                      const pred = predictions[m.id] || { a: '-', b: '-' };
                      let basePts = 0;
                      let desc = 'Sin puntos';
                      const pA = parseInt(pred.a as string);
                      const pB = parseInt(pred.b as string);

                      if (pA === m.scoreA && pB === m.scoreB) {
                        basePts = 5;
                        desc = 'Marcador exacto (+5)';
                      } else if (
                        (pA > pB && m.scoreA! > m.scoreB!) ||
                        (pB > pA && m.scoreB! > m.scoreA!) ||
                        (pA === pB && m.scoreA === m.scoreB)
                      ) {
                        basePts = 3;
                        desc = 'Resultado acertado (+3)';
                      } else if (pred.a !== '-') {
                        desc = 'No acertado (0)';
                      }

                      // Apply special match multiplier
                      const mult = (m.isSpecial && m.multiplier && m.multiplier > 1) ? m.multiplier : 1;
                      const pts = basePts * mult;
                      if (mult > 1 && basePts > 0) {
                        desc = `${desc} x${mult}`;
                      }

                      return (
                        <ResultCard
                          key={m.id}
                          teamA={teamA}
                          teamB={teamB}
                          officialScoreA={m.scoreA!}
                          officialScoreB={m.scoreB!}
                          predictionA={String(pred.a)}
                          predictionB={String(pred.b)}
                          points={pts}
                          description={desc}
                          isSpecial={m.isSpecial}
                          multiplier={m.multiplier}
                        />
                      );
                    })
                  )}
                </div>
              </>
            );
          })()}
          </>
          )}
        </div>

        <div className="space-y-3">
          <div className="rounded-3xl p-6 text-white shadow-xl relative overflow-hidden mb-2" style={{ backgroundColor: 'var(--color-primary)' }}>
            <div 
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage: config.assets.backgrounds.rankingCard
                  ? `url('${config.assets.backgrounds.rankingCard}')`
                  : `url('${config.assets.cardBackgrounds.blue}')`,
                backgroundSize: 'cover',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'left top',
              }}
            />
            
            <div className="relative z-10 flex justify-end">
              <div className="text-right">
                <div>
                  <span
                    className="px-3 py-1 text-[10px] font-black rounded-full uppercase italic text-white"
                    style={{ backgroundColor: getPhaseBg() }}
                  >
                    {phase}
                  </span>
                  <h4 className="text-3xl font-black mt-2 tracking-tighter">Posición #{position}</h4>
                </div>
              </div>
            </div>
          </div>
          <RankingTable users={allUsers} />
        </div>
      </section>
    </AppShell>
  );
}
