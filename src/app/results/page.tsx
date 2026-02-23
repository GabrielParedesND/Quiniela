'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth/cognito';
import { useUser } from '@/contexts/UserContext';
import { isProfileComplete } from '@/lib/db/users';
import AppShell from '@/components/AppShell';
import LoadingContent from '@/components/LoadingContent';
import PageHeader from '@/components/PageHeader';
import ResultCard from '@/components/ResultCard';
import RankingTable from '@/components/RankingTable';
import { matches, teams, rankingUsers, getPhase } from '@/lib/mock';
import { brandAssets } from '@/lib/assets';
import { loadPredictions, computePoints, computePointsByJornada } from '@/lib/demo';

export default function ResultsPage() {
  const router = useRouter();
  const { user, loading } = useUser();
  const [points, setPoints] = useState(0);
  const [pointsByJornada, setPointsByJornada] = useState([0, 0, 0]);
  const [predictions, setPredictions] = useState<Record<number, { a: string; b: string }>>({});
  const [initialized, setInitialized] = useState(false);

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

      const stored = loadPredictions();
      setPredictions(stored);
      setPoints(computePoints(stored));
      setPointsByJornada(computePointsByJornada(stored));
      setInitialized(true);
    };

    checkAccess();
  }, [user, loading, router]);

  if (loading || !user || !initialized) {
    return (
      <AppShell>
        <LoadingContent />
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

        <div className="p-6 rounded-3xl border shadow-sm" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-6" style={{ color: 'var(--color-muted)' }}>
            Puntos por Jornada
          </h3>
          <div className="flex items-end justify-center h-32 space-x-8 px-4">
            {pointsByJornada.map((p, i) => {
              const height = Math.max((p / 25) * 100, 5);
              return (
                <div key={i} className="w-12 rounded-t-lg relative flex flex-col justify-end h-full" style={{ backgroundColor: 'var(--color-surface2)' }}>
                  <div
                    className="bar-grow rounded-t-lg w-full transition-all duration-1000"
                    style={{ height: `${height}%`, backgroundColor: 'var(--color-primary)' }}
                  ></div>
                  <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-black" style={{ color: 'var(--color-primary)' }}>
                    {p}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="flex justify-center space-x-8 mt-4 text-[9px] font-bold uppercase" style={{ color: 'var(--color-muted)' }}>
            <span className="w-12 text-center">Jornada 1</span>
            <span className="w-12 text-center">Jornada 2</span>
            <span className="w-12 text-center">Jornada 3</span>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] px-2" style={{ color: 'var(--color-muted)' }}>
            Detalle de Resultados
          </h3>
          <div className="rounded-3xl border shadow-sm overflow-hidden p-2 space-y-2" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
            {playedMatches.map((m) => {
              const teamA = teams.find((t) => t.id === m.teamAId)!;
              const teamB = teams.find((t) => t.id === m.teamBId)!;
              const pred = predictions[m.id] || { a: '-', b: '-' };
              let pts = 0;
              let desc = 'Sin puntos';
              const pA = parseInt(pred.a as string);
              const pB = parseInt(pred.b as string);

              if (pA === m.scoreA && pB === m.scoreB) {
                pts = 5;
                desc = 'Marcador exacto (+5)';
              } else if (
                (pA > pB && m.scoreA! > m.scoreB!) ||
                (pB > pA && m.scoreB! > m.scoreA!) ||
                (pA === pB && m.scoreA === m.scoreB)
              ) {
                pts = 3;
                desc = 'Resultado acertado (+3)';
              } else if (pred.a !== '-') {
                desc = 'No acertado (0)';
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
                />
              );
            })}
          </div>
        </div>

        <div className="space-y-3">
          <div className="rounded-3xl p-6 text-white shadow-xl relative overflow-hidden mb-2" style={{ backgroundColor: 'var(--color-primary)' }}>
            <div 
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage: `url('${brandAssets.cardBackgrounds.blue}')`,
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
