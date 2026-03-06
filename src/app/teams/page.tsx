'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUserId, isAuthenticated } from '@/lib/auth/cognito';
import { useUser } from '@/contexts/UserContext';
import { isProfileComplete } from '@/lib/db/users';
import { fetchQuinielaSnapshot, Team, TeamStanding } from '@/lib/db/quiniela';
import AppShell from '@/components/AppShell';
import LoadingContent from '@/components/LoadingContent';
import PageHeader from '@/components/PageHeader';
import TabSelector from '@/components/TabSelector';

export default function TeamsPage() {
  const router = useRouter();
  const { user, loading } = useUser();
  const [activeGroup, setActiveGroup] = useState<'A' | 'B' | 'C' | 'D'>('A');
  const [groupTransitionDirection, setGroupTransitionDirection] = useState<'left' | 'right'>('left');
  const [teams, setTeams] = useState<Team[]>([]);
  const [standingsByGroup, setStandingsByGroup] = useState<Record<string, TeamStanding[]>>({});
  const [teamsLoading, setTeamsLoading] = useState(true);
  const [teamsError, setTeamsError] = useState('');

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
        setTeamsLoading(true);
        setTeamsError('');
        const userId = await getUserId();
        const snapshot = await fetchQuinielaSnapshot(userId);
        setTeams(snapshot.teams);
        setStandingsByGroup(snapshot.standingsByGroup);
      } catch (error) {
        console.error('Error loading teams snapshot:', error);
        setTeamsError('No se pudo cargar la información de equipos');
      } finally {
        setTeamsLoading(false);
      }
    };

    checkAccess();
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <AppShell>
        <LoadingContent />
      </AppShell>
    );
  }

  const handleGroupChange = (group: 'A' | 'B' | 'C' | 'D') => {
    if (group === activeGroup) return;
    const order = ['A', 'B', 'C', 'D'] as const;
    const currentIndex = order.indexOf(activeGroup);
    const nextIndex = order.indexOf(group);
    setGroupTransitionDirection(nextIndex > currentIndex ? 'left' : 'right');
    setActiveGroup(group);
  };

  const standings = standingsByGroup[activeGroup] || [];
  const tabs = (['A', 'B', 'C', 'D'] as const).map((g) => ({ value: g, label: `Grupo ${g}` }));

  return (
    <AppShell>
      <section className="fade-in space-y-4">
        <PageHeader title="Ranking de Equipos" showBackButton />

        <TabSelector tabs={tabs} activeTab={activeGroup} onTabChange={handleGroupChange} />

        <div
          key={activeGroup}
          className={`shadow-sm rounded-3xl border overflow-hidden jornada-flip-container ${
            groupTransitionDirection === 'left' ? 'jornada-flip-left' : 'jornada-flip-right'
          }`}
          style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        >
          <div className="p-4 border-b" style={{ backgroundColor: 'var(--color-surface2)', borderColor: 'var(--color-border)' }}>
            <h3 className="font-bold uppercase text-xs tracking-widest" style={{ color: 'var(--color-text)' }}>
              Grupo {activeGroup}
            </h3>
          </div>
          {teamsLoading ? (
            <div className="p-3 space-y-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="flex items-center gap-3 px-2 py-3 rounded-xl border" style={{ borderColor: 'var(--color-border)' }}>
                  <div className="w-6 h-6 rounded-md skeleton" />
                  <div className="w-6 h-4 rounded-sm skeleton" />
                  <div className="h-4 flex-1 max-w-36 rounded skeleton" />
                  <div className="w-8 h-5 rounded skeleton ml-auto" />
                </div>
              ))}
            </div>
          ) : teamsError ? (
            <div className="p-4 text-sm font-bold" style={{ color: 'var(--color-danger)' }}>
              {teamsError}
            </div>
          ) : (
            <table className="min-w-full">
              <tbody className="divide-y text-xs" style={{ borderColor: 'var(--color-border)' }}>
                {standings.map((standing, i) => {
                  const team = teams.find((t) => t.id === standing.teamId);
                  if (!team) return null;

                  return (
                    <tr key={team.id} className="hover:opacity-90 transition">
                      <td className="px-4 py-4 font-black" style={{ color: 'var(--color-muted)' }}>{i + 1}</td>
                      <td className="px-4 py-4 flex items-center space-x-3">
                        <img
                          src={team.flagUrl}
                          className="w-6 h-4 object-cover rounded shadow-xs border"
                          style={{ borderColor: 'var(--color-border)' }}
                          alt={team.short}
                        />
                        <span className="font-bold uppercase tracking-tight" style={{ color: 'var(--color-text)' }}>
                          {team.name}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center font-black" style={{ color: 'var(--color-primary)' }}>
                        {standing.pts}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </AppShell>
  );
}
