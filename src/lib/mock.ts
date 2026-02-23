export interface Team {
  id: number;
  name: string;
  short: string;
  flagUrl: string;
  group: 'A' | 'B' | 'C' | 'D';
}

export interface Match {
  id: number;
  jornada: number;
  dateLabel: string;
  teamAId: number;
  teamBId: number;
  status: 'played' | 'upcoming';
  scoreA?: number;
  scoreB?: number;
}

export interface UserPrediction {
  a: number | string;
  b: number | string;
}

export type Phase =
  | 'Cita con la Historia'
  | 'Duelo de Gigantes'
  | 'Zona de Campeones'
  | 'Camino a la Gloria';

export function getPhase(pts: number): Phase {
  if (pts >= 30) return 'Cita con la Historia';
  if (pts >= 20) return 'Duelo de Gigantes';
  if (pts >= 10) return 'Zona de Campeones';
  return 'Camino a la Gloria';
}

export interface RankingUser {
  name: string;
  pts: number;
  phase: Phase;
}

export interface TeamStanding {
  teamId: number;
  pts: number;
}

const FLAG_BASE = '/assets/BANDERAS 48X36';

export const teams: Team[] = [
  { id: 1, name: 'USA', short: 'USA', flagUrl: `${FLAG_BASE}/USA.svg`, group: 'A' },
  { id: 2, name: 'México', short: 'MEX', flagUrl: `${FLAG_BASE}/MEXICO.svg`, group: 'A' },
  { id: 3, name: 'Uruguay', short: 'URU', flagUrl: `${FLAG_BASE}/URUGUAY.svg`, group: 'A' },
  { id: 4, name: 'Mali', short: 'MLI', flagUrl: `${FLAG_BASE}/MALI.svg`, group: 'A' },

  { id: 5, name: 'Brasil', short: 'BRA', flagUrl: `${FLAG_BASE}/BRASIL.svg`, group: 'B' },
  { id: 6, name: 'Portugal', short: 'POR', flagUrl: `${FLAG_BASE}/PORTUGAL.svg`, group: 'B' },
  { id: 7, name: 'Paraguay', short: 'PAR', flagUrl: `${FLAG_BASE}/PARAGUAY.svg`, group: 'B' },
  { id: 8, name: 'Polonia', short: 'POL', flagUrl: `${FLAG_BASE}/POLONIA.svg`, group: 'B' },

  { id: 9, name: 'Canadá', short: 'CAN', flagUrl: `${FLAG_BASE}/CANADA.svg`, group: 'C' },
  { id: 10, name: 'Perú', short: 'PER', flagUrl: `${FLAG_BASE}/PERU.svg`, group: 'C' },
  { id: 11, name: 'Rumania', short: 'ROU', flagUrl: `${FLAG_BASE}/RUMANIA.svg`, group: 'C' },
  { id: 12, name: 'Reino Unido', short: 'GBR', flagUrl: `${FLAG_BASE}/REINO-UNIDO.svg`, group: 'C' },

  { id: 13, name: 'Panamá', short: 'PAN', flagUrl: `${FLAG_BASE}/PANAMA.svg`, group: 'D' },
  { id: 14, name: 'Moldavia', short: 'MDA', flagUrl: `${FLAG_BASE}/MOLDAVIA.svg`, group: 'D' },
  { id: 15, name: 'Nueva Zelanda', short: 'NZL', flagUrl: `${FLAG_BASE}/NUEVA-ZELANDA.svg`, group: 'D' },
  { id: 16, name: 'Puerto Rico', short: 'PUR', flagUrl: `${FLAG_BASE}/PUERTO-RICO.svg`, group: 'D' },
];

export const matches: Match[] = [
  // Jornada 1 — jugada (1 partido por grupo)
  { id: 101, jornada: 1, dateLabel: '11 Jun', teamAId: 1, teamBId: 4, scoreA: 3, scoreB: 0, status: 'played' },
  { id: 102, jornada: 1, dateLabel: '12 Jun', teamAId: 5, teamBId: 8, scoreA: 2, scoreB: 0, status: 'played' },
  { id: 103, jornada: 1, dateLabel: '13 Jun', teamAId: 9, teamBId: 12, scoreA: 0, scoreB: 2, status: 'played' },
  { id: 104, jornada: 1, dateLabel: '14 Jun', teamAId: 13, teamBId: 16, scoreA: 2, scoreB: 1, status: 'played' },

  // Jornada 2 — jugada
  { id: 201, jornada: 2, dateLabel: '18 Jun', teamAId: 2, teamBId: 3, scoreA: 0, scoreB: 1, status: 'played' },
  { id: 202, jornada: 2, dateLabel: '19 Jun', teamAId: 6, teamBId: 7, scoreA: 2, scoreB: 2, status: 'played' },
  { id: 203, jornada: 2, dateLabel: '20 Jun', teamAId: 10, teamBId: 11, scoreA: 1, scoreB: 0, status: 'played' },
  { id: 204, jornada: 2, dateLabel: '21 Jun', teamAId: 14, teamBId: 15, scoreA: 1, scoreB: 3, status: 'played' },

  // Jornada 3 — próxima
  { id: 301, jornada: 3, dateLabel: '24 Jun', teamAId: 1, teamBId: 2, status: 'upcoming' },
  { id: 302, jornada: 3, dateLabel: '25 Jun', teamAId: 5, teamBId: 6, status: 'upcoming' },
  { id: 303, jornada: 3, dateLabel: '26 Jun', teamAId: 9, teamBId: 10, status: 'upcoming' },
  { id: 304, jornada: 3, dateLabel: '27 Jun', teamAId: 13, teamBId: 14, status: 'upcoming' },
];

export const defaultPredictions: Record<number, UserPrediction> = {
  101: { a: 3, b: 0 },
  102: { a: 1, b: 0 },
  103: { a: 1, b: 3 },
  104: { a: 2, b: 0 },
};

export const rankingUsers: RankingUser[] = [
  { name: 'Andrés Silva', pts: 32, phase: getPhase(32) },
  { name: 'Karla Romero', pts: 26, phase: getPhase(26) },
  { name: 'Mario Bros', pts: 22, phase: getPhase(22) },
  { name: 'Elena Gilbert', pts: 18, phase: getPhase(18) },
  { name: 'Sofía Luna', pts: 14, phase: getPhase(14) },
  { name: 'Diego Torres', pts: 10, phase: getPhase(10) },
  { name: 'Ana Martínez', pts: 6, phase: getPhase(6) },
  { name: 'Carlos López', pts: 3, phase: getPhase(3) },
];

export function computeTeamStandings(): Record<string, TeamStanding[]> {
  const pts: Record<number, number> = {};
  for (const t of teams) pts[t.id] = 0;

  for (const m of matches) {
    if (m.status !== 'played' || m.scoreA == null || m.scoreB == null) continue;
    if (m.scoreA > m.scoreB) pts[m.teamAId] += 3;
    else if (m.scoreB > m.scoreA) pts[m.teamBId] += 3;
    else { pts[m.teamAId] += 1; pts[m.teamBId] += 1; }
  }

  const result: Record<string, TeamStanding[]> = {};
  for (const group of ['A', 'B', 'C', 'D'] as const) {
    result[group] = teams
      .filter((t) => t.group === group)
      .map((t) => ({ teamId: t.id, pts: pts[t.id] }))
      .sort((a, b) => b.pts - a.pts);
  }
  return result;
}
