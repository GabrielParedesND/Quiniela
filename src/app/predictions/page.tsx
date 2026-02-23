'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth/cognito';
import { useUser } from '@/contexts/UserContext';
import { isProfileComplete } from '@/lib/db/users';
import AppShell from '@/components/AppShell';
import LoadingContent from '@/components/LoadingContent';
import PageHeader from '@/components/PageHeader';
import TabSelector from '@/components/TabSelector';
import MatchCard from '@/components/MatchCard';
import KickTransition from '@/components/KickTransition';
import { matches, teams } from '@/lib/mock';
import { loadPredictions, savePredictions } from '@/lib/demo';

export default function PredictionsPage() {
  const router = useRouter();
  const { user, loading } = useUser();
  const [activeJornada, setActiveJornada] = useState(1);
  const [predictions, setPredictions] = useState<Record<number, { a: string; b: string }>>({});
  const [initialized, setInitialized] = useState(false);
  const [showKick, setShowKick] = useState(false);

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

      setPredictions(loadPredictions());
      setInitialized(true);
    };

    checkAccess();
  }, [user, loading, router]);

  const handlePredictionChange = (matchId: number, team: 'a' | 'b', value: string) => {
    setPredictions((prev) => {
      const existing = prev[matchId] || { a: '', b: '' };
      const updated = {
        ...prev,
        [matchId]: { ...existing, [team]: value },
      };
      savePredictions(updated);
      return updated;
    });
  };

  const handleSave = () => {
    savePredictions(predictions);
    setShowKick(true);
  };

  if (loading || !user || !initialized) {
    return (
      <AppShell>
        <LoadingContent />
      </AppShell>
    );
  }

  const jornadaMatches = matches.filter((m) => m.jornada === activeJornada);
  const tabs = [1, 2, 3].map((j) => ({ value: j, label: `Jornada ${j}` }));

  return (
    <>
      <KickTransition active={showKick} onComplete={() => router.push('/results')} />
      <AppShell>
        <section className="fade-in space-y-4">
          <PageHeader title="Ingresar Marcadores" showBackButton />

          <TabSelector tabs={tabs} activeTab={activeJornada} onTabChange={setActiveJornada} />

          <div className="space-y-4 mt-4">
            {jornadaMatches.map((m) => {
              const teamA = teams.find((t) => t.id === m.teamAId)!;
              const teamB = teams.find((t) => t.id === m.teamBId)!;
              const pred = predictions[m.id] || { a: '', b: '' };
              const isLocked = m.jornada === 1;

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

          {activeJornada !== 1 && (
            <div className="mt-6 flex justify-center">
              <button
                onClick={handleSave}
                className="font-black py-4 px-10 rounded-full shadow-lg transition border-2 uppercase tracking-widest text-xs hover:opacity-90"
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
    </>
  );
}
