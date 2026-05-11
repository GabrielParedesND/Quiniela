'use client';

import { Match, Team } from '@/lib/db/quiniela';

interface KnockoutBracketProps {
  matches: Match[];
  teams: Team[];
}

const KNOCKOUT_PHASES = [
  { key: 'Round of 16', label: 'Octavos de Final', emoji: '🏟️' },
  { key: 'Quarter-finals', label: 'Cuartos de Final', emoji: '⚡' },
  { key: 'Semi-finals', label: 'Semifinales', emoji: '🔥' },
  { key: '3rd Place Final', label: 'Tercer Lugar', emoji: '🥉' },
  { key: 'Final', label: 'Final', emoji: '🏆' },
];

function isKnockoutRound(apiRound: string): boolean {
  return KNOCKOUT_PHASES.some((p) => apiRound.includes(p.key));
}

function getPhaseForRound(apiRound: string): typeof KNOCKOUT_PHASES[number] | null {
  return KNOCKOUT_PHASES.find((p) => apiRound.includes(p.key)) || null;
}

export function hasKnockoutMatches(matches: Match[]): boolean {
  return matches.some((m) => m.apiRound && isKnockoutRound(m.apiRound));
}

export default function KnockoutBracket({ matches, teams }: KnockoutBracketProps) {
  const knockoutMatches = matches.filter((m) => m.apiRound && isKnockoutRound(m.apiRound));
  if (knockoutMatches.length === 0) return null;

  // Group by phase
  const phaseMap = new Map<string, Match[]>();
  for (const m of knockoutMatches) {
    const phase = getPhaseForRound(m.apiRound || '');
    if (!phase) continue;
    const existing = phaseMap.get(phase.key) || [];
    existing.push(m);
    phaseMap.set(phase.key, existing);
  }

  const getTeam = (id: string) => teams.find((t) => t.id === id);

  return (
    <div className="space-y-6">
      {KNOCKOUT_PHASES.map((phase) => {
        const phaseMatches = phaseMap.get(phase.key);
        if (!phaseMatches || phaseMatches.length === 0) return null;

        // Sort by kickoff
        const sorted = [...phaseMatches].sort((a, b) => (a.kickoffAt || '').localeCompare(b.kickoffAt || ''));

        return (
          <div key={phase.key}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">{phase.emoji}</span>
              <h3 className="text-sm font-black uppercase tracking-wider" style={{ color: 'var(--color-text)' }}>
                {phase.label}
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--color-surface2)', color: 'var(--color-muted)' }}>
                {sorted.length} {sorted.length === 1 ? 'partido' : 'partidos'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {sorted.map((m) => {
                const teamA = getTeam(m.teamAId);
                const teamB = getTeam(m.teamBId);
                const isPlayed = m.status === 'played';

                return (
                  <div
                    key={m.id}
                    className="rounded-xl border overflow-hidden"
                    style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
                  >
                    {/* Date header */}
                    <div
                      className="px-3 py-1.5 flex items-center justify-between border-b"
                      style={{ backgroundColor: 'var(--color-surface2)', borderColor: 'var(--color-border)' }}
                    >
                      <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--color-muted)' }}>
                        {m.dateLabel}
                      </span>
                      {isPlayed && (
                        <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded" style={{ backgroundColor: 'var(--color-success)', color: '#fff' }}>
                          Final
                        </span>
                      )}
                    </div>

                    {/* Teams */}
                    <div className="p-3 space-y-1.5">
                      {/* Home */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          {teamA?.flagUrl && <img src={teamA.flagUrl} alt="" className="w-5 h-4 object-contain shrink-0" />}
                          <span className="text-xs font-bold truncate" style={{ color: 'var(--color-text)' }}>
                            {teamA?.name || m.teamAId}
                          </span>
                        </div>
                        <span
                          className="text-sm font-black tabular-nums ml-2"
                          style={{ color: isPlayed && m.scoreA != null && m.scoreB != null && m.scoreA > m.scoreB ? 'var(--color-primary)' : 'var(--color-text)' }}
                        >
                          {m.scoreA ?? '-'}
                        </span>
                      </div>
                      {/* Away */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          {teamB?.flagUrl && <img src={teamB.flagUrl} alt="" className="w-5 h-4 object-contain shrink-0" />}
                          <span className="text-xs font-bold truncate" style={{ color: 'var(--color-text)' }}>
                            {teamB?.name || m.teamBId}
                          </span>
                        </div>
                        <span
                          className="text-sm font-black tabular-nums ml-2"
                          style={{ color: isPlayed && m.scoreB != null && m.scoreA != null && m.scoreB > m.scoreA ? 'var(--color-primary)' : 'var(--color-text)' }}
                        >
                          {m.scoreB ?? '-'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
