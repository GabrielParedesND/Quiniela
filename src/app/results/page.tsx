'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import AppShell from '@/components/AppShell';
import LoadingContent from '@/components/LoadingContent';
import PageHeader from '@/components/PageHeader';
import ResultCard from '@/components/ResultCard';
import RankingTable from '@/components/RankingTable';
import { matches, teams, mockUserPredictions, rankingUsers } from '@/lib/mock';

export default function ResultsPage() {
  const router = useRouter();
  const { user, loading } = useUser();
  const [points, setPoints] = useState(0);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push('/');
      return;
    }

    // Calcular puntos
    let totalPoints = 0;
    const playedMatches = matches.filter((m) => m.status === 'played');
    playedMatches.forEach((m) => {
      const pred = mockUserPredictions[m.id];
      if (!pred) return;
      const pA = parseInt(pred.a as string);
      const pB = parseInt(pred.b as string);
      if (pA === m.scoreA && pB === m.scoreB) totalPoints += 5;
      else if (
        (pA > pB && m.scoreA! > m.scoreB!) ||
        (pB > pA && m.scoreB! > m.scoreA!) ||
        (pA === pB && m.scoreA === m.scoreB)
      )
        totalPoints += 3;
    });
    setPoints(totalPoints);
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <AppShell>
        <LoadingContent />
      </AppShell>
    );
  }

  const playedMatches = matches.filter((m) => m.status === 'played');
  const category = points >= 12 ? 'Champion' : points < 5 ? 'Aguador' : 'Estándar';
  const fullName = `${user.nombres} ${user.apellidos}`;
  const allUsers = [...rankingUsers, { name: `${fullName} (Tú)`, pts: points, category }].sort(
    (a, b) => b.pts - a.pts
  );
  const position = allUsers.findIndex((u) => u.name.includes('(Tú)')) + 1;

  const getCategoryBg = () => {
    if (category === 'Champion') return 'var(--color-accent)';
    if (category === 'Aguador') return 'var(--color-danger)';
    return 'var(--color-primary)';
  };

  return (
    <AppShell>
      <section className="fade-in space-y-6 pb-10 relative">
        {/* Background pattern indicator */}
        <div 
          className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none z-0"
          title="Results Background Pattern\n1920x1080px\nAspect Ratio: 16:9"
        >
          <div className="text-center">
            <p className="text-6xl font-black" style={{ color: 'var(--color-warning)' }}>RESULTS BG</p>
            <p className="text-3xl font-bold mt-2" style={{ color: 'var(--color-muted)' }}>1920x1080 (16:9)</p>
          </div>
        </div>

        <div className="relative z-10">
          <PageHeader title="Mi Rendimiento" showBackButton backTo="/dashboard" />
        </div>

        <div className="p-6 rounded-3xl border shadow-sm relative z-10" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-6" style={{ color: 'var(--color-muted)' }}>
            Puntos por Jornada
          </h3>
          <div className="flex items-end justify-center h-32 space-x-8 px-4">
            {[points, 0, 0].map((p, i) => {
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

        <div className="space-y-3 relative z-10">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] px-2" style={{ color: 'var(--color-muted)' }}>
            Detalle de Resultados
          </h3>
          <div className="rounded-3xl border shadow-sm p-2 space-y-2 overflow-visible" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
            {playedMatches.map((m) => {
              const teamA = teams.find((t) => t.id === m.teamAId)!;
              const teamB = teams.find((t) => t.id === m.teamBId)!;
              const pred = mockUserPredictions[m.id] || { a: '-', b: '-' };
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
                  predictionA={pred.a}
                  predictionB={pred.b}
                  points={pts}
                  description={desc}
                />
              );
            })}
          </div>
        </div>

        <div className="space-y-3 relative z-10">
          <div className="rounded-3xl p-6 text-white shadow-xl relative overflow-hidden mb-2" style={{ backgroundColor: 'var(--color-primary)' }} title="Card Background\n400x120px\nAspect Ratio: 10:3">
            {/* Background indicator */}
            <div className="absolute top-2 right-2 px-2 py-1 rounded text-[8px] font-black" style={{ backgroundColor: 'var(--color-warning)', color: 'var(--color-primaryText)' }}>
              CARD BG: 400x120 (10:3)
            </div>
            <h3 className="text-[10px] font-black opacity-50 uppercase tracking-[0.2em] mb-4">
              Tu Estatus Global
            </h3>
            <div className="flex justify-between items-end">
              <div>
                <span
                  className="px-3 py-1 text-[10px] font-black rounded-full uppercase italic text-white"
                  style={{ backgroundColor: getCategoryBg() }}
                >
                  {category}
                </span>
                <h4 className="text-3xl font-black mt-2 tracking-tighter">Posición #{position}</h4>
              </div>
            </div>
          </div>
          <RankingTable users={allUsers} />
        </div>
      </section>
    </AppShell>
  );
}
