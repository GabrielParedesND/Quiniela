'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUserId, isAuthenticated } from '@/lib/auth/cognito';
import { useUser } from '@/contexts/UserContext';
import { isProfileComplete } from '@/lib/db/users';
import { fetchQuinielaSnapshot, Match, Team, TeamStanding } from '@/lib/db/quiniela';
import AppShell from '@/components/AppShell';
import LoadingContent from '@/components/LoadingContent';
import PageHeader from '@/components/PageHeader';
import TabSelector from '@/components/TabSelector';
import { useTournament } from '@/contexts/TournamentContext';
import TournamentSelector from '@/components/TournamentSelector';
import KnockoutBracket, { hasKnockoutMatches } from '@/components/KnockoutBracket';

export default function TeamsPage() {
  const router = useRouter();
  const { user, loading } = useUser();
  const { selectedTournamentId: tournamentId } = useTournament();
  const [activeGroup, setActiveGroup] = useState<string>('');
  const [groupTransitionDirection, setGroupTransitionDirection] = useState<'left' | 'right'>('left');
  const [teams, setTeams] = useState<Team[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [standingsByGroup, setStandingsByGroup] = useState<Record<string, TeamStanding[]>>({});
  const [teamsLoading, setTeamsLoading] = useState(true);
  const [teamsError, setTeamsError] = useState('');
  const [viewMode, setViewMode] = useState<'groups' | 'knockout'>('groups');

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
        const snapshot = await fetchQuinielaSnapshot(userId, tournamentId);
        setTeams(snapshot.teams);
        setMatches(snapshot.matches);
        setStandingsByGroup(snapshot.standingsByGroup);
        // Debug: log apiRound values
        const roundValues = [...new Set(snapshot.matches.map((m: Match) => m.apiRound).filter(Boolean))];
        console.log('[teams] apiRound values found:', roundValues);
        console.log('[teams] hasKnockout:', roundValues.some(r => ['Round of 16', 'Quarter-finals', 'Semi-finals', 'Final', '3rd Place Final'].some(k => r?.includes(k))));
        // Set initial active group to first available group
        const groups = Object.keys(snapshot.standingsByGroup).sort();
        const nonEmpty = groups.filter((g) => g !== '');
        if (nonEmpty.length > 0 && !activeGroup) {
          setActiveGroup(nonEmpty[0]);
        } else if (groups.length > 0 && !activeGroup) {
          setActiveGroup(groups[0]);
        }
      } catch (error) {
        console.error('Error loading teams snapshot:', error);
        setTeamsError('No se pudo cargar la información de equipos');
      } finally {
        setTeamsLoading(false);
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

  if (teamsError) {
    return (
      <AppShell>
        <section className="fade-in space-y-4">
          <PageHeader title="Ranking de Equipos" showBackButton />
          <div className="rounded-2xl border p-6" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
            <div className="flex flex-col items-center justify-center text-center">
              <span className="text-3xl mb-2">📈</span>
              <p className="text-xs font-black uppercase tracking-wider" style={{ color: 'var(--color-text)' }}>Proximamente...</p>
              <p className="text-[10px] mt-1" style={{ color: 'var(--color-muted)' }}>Las posiciones de equipos estaran disponibles pronto.</p>
            </div>
          </div>
        </section>
      </AppShell>
    );
  }

  if (teamsLoading) {
    return (
      <AppShell>
        <section className="fade-in space-y-4">
          <PageHeader title="Ranking de Equipos" showBackButton />

          {/* Tab selector skeleton */}
          <div className="flex gap-2 py-1">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-9 rounded-xl skeleton" style={{ width: `${75 + i * 5}px` }} />
            ))}
          </div>

          {/* Table skeleton */}
          <div className="shadow-sm rounded-3xl border overflow-hidden" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
            <div className="p-4 border-b" style={{ backgroundColor: 'var(--color-surface2)', borderColor: 'var(--color-border)' }}>
              <div className="h-3 w-24 rounded skeleton" />
            </div>
            <div className="p-3 space-y-2">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="flex items-center gap-3 px-2 py-3 rounded-xl">
                  <div className="w-5 h-5 rounded skeleton" />
                  <div className="w-6 h-4 rounded-sm skeleton" />
                  <div className="h-3.5 flex-1 max-w-32 rounded skeleton" />
                  <div className="w-8 h-5 rounded skeleton ml-auto" />
                </div>
              ))}
            </div>
          </div>
        </section>
      </AppShell>
    );
  }

  const standings = standingsByGroup[activeGroup] || [];
  const groupKeys = Object.keys(standingsByGroup).sort();
  // Filter out empty group keys and build tabs
  const nonEmptyGroups = groupKeys.filter((g) => g !== '');
  const hasGroups = nonEmptyGroups.length > 0;
  const tabs = hasGroups
    ? nonEmptyGroups.map((g) => ({ value: g, label: `Grupo ${g}` }))
    : [{ value: '', label: 'Todos los equipos' }];

  const handleGroupChange = (group: string) => {
    if (group === activeGroup) return;
    const validKeys = hasGroups ? nonEmptyGroups : [''];
    const currentIndex = validKeys.indexOf(activeGroup);
    const nextIndex = validKeys.indexOf(group);
    setGroupTransitionDirection(nextIndex > currentIndex ? 'left' : 'right');
    setActiveGroup(group);
  };

  return (
    <AppShell>
      <section className="fade-in space-y-4">
        <PageHeader title="Ranking de Equipos" showBackButton />

        <TournamentSelector />

        {/* View mode toggle - only show if there are knockout matches */}
        {hasKnockoutMatches(matches) && (
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('groups')}
              className="px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all"
              style={{
                backgroundColor: viewMode === 'groups' ? 'var(--color-primary)' : 'var(--color-surface)',
                color: viewMode === 'groups' ? 'var(--color-primaryText)' : 'var(--color-muted)',
                border: viewMode === 'groups' ? 'none' : '1px solid var(--color-border)',
              }}
            >
              Fase de Grupos
            </button>
            <button
              onClick={() => setViewMode('knockout')}
              className="px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all"
              style={{
                backgroundColor: viewMode === 'knockout' ? 'var(--color-primary)' : 'var(--color-surface)',
                color: viewMode === 'knockout' ? 'var(--color-primaryText)' : 'var(--color-muted)',
                border: viewMode === 'knockout' ? 'none' : '1px solid var(--color-border)',
              }}
            >
              Eliminatorias
            </button>
          </div>
        )}

        {viewMode === 'knockout' ? (
          <KnockoutBracket matches={matches} teams={teams} />
        ) : (
        <>
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
              {activeGroup ? `Grupo ${activeGroup}` : 'Todos los equipos'}
            </h3>
          </div>
          {teamsError ? (
            <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
              <span className="text-3xl mb-2">📈</span>
              <p className="text-xs font-black uppercase tracking-wider" style={{ color: 'var(--color-text)' }}>Proximamente...</p>
              <p className="text-[10px] mt-1" style={{ color: 'var(--color-muted)' }}>Las posiciones de equipos estaran disponibles pronto.</p>
            </div>
          ) : standings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
              <span className="text-3xl mb-2">📈</span>
              <p className="text-xs font-black uppercase tracking-wider" style={{ color: 'var(--color-text)' }}>Proximamente...</p>
              <p className="text-[10px] mt-1" style={{ color: 'var(--color-muted)' }}>Las posiciones de este grupo se actualizaran cuando inicien los partidos.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b" style={{ borderColor: 'var(--color-border)' }}>
                    <th className="px-3 py-2 text-left text-[8px] font-black uppercase tracking-widest" style={{ color: 'var(--color-muted)' }}>#</th>
                    <th className="px-3 py-2 text-left text-[8px] font-black uppercase tracking-widest" style={{ color: 'var(--color-muted)' }}>Equipo</th>
                    <th className="px-3 py-2 text-center text-[8px] font-black uppercase tracking-widest" style={{ color: 'var(--color-muted)' }}>PJ</th>
                    <th className="px-3 py-2 text-center text-[8px] font-black uppercase tracking-widest" style={{ color: 'var(--color-muted)' }}>PG</th>
                    <th className="px-3 py-2 text-center text-[8px] font-black uppercase tracking-widest" style={{ color: 'var(--color-muted)' }}>PE</th>
                    <th className="px-3 py-2 text-center text-[8px] font-black uppercase tracking-widest" style={{ color: 'var(--color-muted)' }}>PP</th>
                    <th className="px-3 py-2 text-center text-[8px] font-black uppercase tracking-widest" style={{ color: 'var(--color-muted)' }}>DG</th>
                    <th className="px-3 py-2 text-center text-[8px] font-black uppercase tracking-widest" style={{ color: 'var(--color-primary)' }}>PTS</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-xs" style={{ borderColor: 'var(--color-border)' }}>
                  {standings.map((standing) => {
                    const team = teams.find((t) => t.id === standing.teamId);
                    const logo = standing.teamLogo || team?.flagUrl;
                    const name = standing.teamName || team?.name || '—';

                    return (
                      <tr key={standing.teamId || standing.rank} className="hover:opacity-90 transition"
                        style={{
                          backgroundColor: standing.description?.toLowerCase().includes('promotion') || standing.description?.toLowerCase().includes('qualif')
                            ? 'color-mix(in srgb, var(--color-success) 10%, transparent)'
                            : undefined,
                        }}
                      >
                        <td className="px-3 py-3 font-black" style={{ color: 'var(--color-muted)' }}>{standing.rank}</td>
                        <td className="px-3 py-3">
                          <div className="flex items-center space-x-2">
                            {logo && (
                              <img
                                src={logo}
                                className="w-5 h-4 object-contain rounded shadow-xs"
                                alt={name}
                              />
                            )}
                            <span className="font-bold uppercase tracking-tight text-[10px]" style={{ color: 'var(--color-text)' }}>
                              {name}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-center" style={{ color: 'var(--color-text)' }}>{standing.played}</td>
                        <td className="px-3 py-3 text-center" style={{ color: 'var(--color-text)' }}>{standing.won}</td>
                        <td className="px-3 py-3 text-center" style={{ color: 'var(--color-text)' }}>{standing.drawn}</td>
                        <td className="px-3 py-3 text-center" style={{ color: 'var(--color-text)' }}>{standing.lost}</td>
                        <td className="px-3 py-3 text-center font-medium" style={{ color: 'var(--color-text)' }}>
                          {standing.goalsDiff > 0 ? '+' : ''}{standing.goalsDiff}
                        </td>
                        <td className="px-3 py-3 text-center font-black" style={{ color: 'var(--color-primary)' }}>
                          {standing.pts}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
        </>
        )}
      </section>
    </AppShell>
  );
}
