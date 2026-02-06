'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import AppShell from '@/components/AppShell';
import LoadingContent from '@/components/LoadingContent';
import PageHeader from '@/components/PageHeader';
import TabSelector from '@/components/TabSelector';
import MatchCard from '@/components/MatchCard';
import { matches, teams, mockUserPredictions } from '@/lib/mock';

export default function PredictionsPage() {
  const router = useRouter();
  const { user, loading } = useUser();
  const [activeJornada, setActiveJornada] = useState(1);
  const [predictions, setPredictions] = useState<Record<number, { a: string; b: string }>>(
    mockUserPredictions as any
  );

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push('/');
    }
  }, [user, loading, router]);

  const handlePredictionChange = (matchId: number, team: 'a' | 'b', value: string) => {
    setPredictions((prev) => ({
      ...prev,
      [matchId]: {
        ...prev[matchId],
        [team]: value,
      },
    }));
  };

  const handleSave = () => {
    alert('Pronósticos guardados (mock)');
    router.push('/dashboard');
  };

  if (loading || !user) {
    return (
      <AppShell>
        <LoadingContent />
      </AppShell>
    );
  }

  const jornadaMatches = matches.filter((m) => m.jornada === activeJornada);
  const isJornada1 = activeJornada === 1;
  const tabs = [1, 2, 3].map((j) => ({ value: j, label: `Jornada ${j}` }));

  return (
    <AppShell>
      <section className="fade-in space-y-4">
        <PageHeader title="Ingresar Marcadores" showBackButton />

        <TabSelector tabs={tabs} activeTab={activeJornada} onTabChange={setActiveJornada} />

        <div className="space-y-4 pb-24 mt-4">
          {jornadaMatches.map((m) => {
            const teamA = teams.find((t) => t.id === m.teamAId)!;
            const teamB = teams.find((t) => t.id === m.teamBId)!;
            const pred = predictions[m.id] || { a: '', b: '' };
            const isLocked = !isJornada1;

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
                onPredictionChange={(team, value) => handlePredictionChange(m.id, team, value)}
              />
            );
          })}
        </div>

        {isJornada1 && (
          <div className="fixed bottom-6 left-0 right-0 px-4 flex justify-center z-50">
            <button
              onClick={handleSave}
              className="font-black py-4 px-10 rounded-full shadow-2xl transition border-2 uppercase tracking-widest text-xs hover:opacity-90"
              style={{
                backgroundColor: 'var(--color-primary)',
                color: 'var(--color-primaryText)',
                borderColor: 'var(--color-border)',
              }}
            >
              GUARDAR PRONÓSTICOS
            </button>
          </div>
        )}
      </section>
    </AppShell>
  );
}
