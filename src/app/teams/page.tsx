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
import { teams, computeTeamStandings } from '@/lib/mock';

export default function TeamsPage() {
  const router = useRouter();
  const { user, loading } = useUser();
  const [activeGroup, setActiveGroup] = useState<'A' | 'B' | 'C' | 'D'>('A');

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

  const standings = computeTeamStandings()[activeGroup] || [];
  const tabs = (['A', 'B', 'C', 'D'] as const).map((g) => ({ value: g, label: `Grupo ${g}` }));

  return (
    <AppShell>
      <section className="fade-in space-y-4">
        <PageHeader title="Ranking de Equipos" showBackButton />

        <TabSelector tabs={tabs} activeTab={activeGroup} onTabChange={setActiveGroup} />

        <div className="shadow-sm rounded-3xl border overflow-hidden" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
          <div className="p-4 border-b" style={{ backgroundColor: 'var(--color-surface2)', borderColor: 'var(--color-border)' }}>
            <h3 className="font-bold uppercase text-xs tracking-widest" style={{ color: 'var(--color-text)' }}>
              Grupo {activeGroup}
            </h3>
          </div>
          <table className="min-w-full">
            <tbody className="divide-y text-xs" style={{ borderColor: 'var(--color-border)' }}>
              {standings.map((standing, i) => {
                const team = teams.find((t) => t.id === standing.teamId)!;
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
        </div>
      </section>
    </AppShell>
  );
}
