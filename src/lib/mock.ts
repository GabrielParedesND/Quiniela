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

export interface RankingUser {
  name: string;
  pts: number;
  category: 'Champion' | 'Estándar' | 'Aguador';
}

export interface TeamStanding {
  teamId: number;
  pts: number;
}

export const teams: Team[] = [
  { id: 1, name: 'Brasil', short: 'BRA', flagUrl: 'https://flagcdn.com/w160/br.png', group: 'A' },
  { id: 2, name: 'Alemania', short: 'GER', flagUrl: 'https://flagcdn.com/w160/de.png', group: 'A' },
  { id: 3, name: 'Argentina', short: 'ARG', flagUrl: 'https://flagcdn.com/w160/ar.png', group: 'B' },
  { id: 4, name: 'Francia', short: 'FRA', flagUrl: 'https://flagcdn.com/w160/fr.png', group: 'B' },
  { id: 5, name: 'España', short: 'ESP', flagUrl: 'https://flagcdn.com/w160/es.png', group: 'C' },
  { id: 6, name: 'Japón', short: 'JPN', flagUrl: 'https://flagcdn.com/w160/jp.png', group: 'A' },
  { id: 7, name: 'Marruecos', short: 'MAR', flagUrl: 'https://flagcdn.com/w160/ma.png', group: 'D' },
  { id: 8, name: 'USA', short: 'USA', flagUrl: 'https://flagcdn.com/w160/us.png', group: 'A' },
];

export const matches: Match[] = [
  { id: 101, jornada: 1, dateLabel: '12 Jun', teamAId: 8, teamBId: 2, scoreA: 1, scoreB: 1, status: 'played' },
  { id: 102, jornada: 1, dateLabel: '12 Jun', teamAId: 1, teamBId: 6, scoreA: 3, scoreB: 0, status: 'played' },
  { id: 103, jornada: 1, dateLabel: '13 Jun', teamAId: 3, teamBId: 4, scoreA: 2, scoreB: 2, status: 'played' },
  { id: 201, jornada: 2, dateLabel: '18 Jun', teamAId: 8, teamBId: 5, status: 'upcoming' },
  { id: 202, jornada: 2, dateLabel: '19 Jun', teamAId: 2, teamBId: 7, status: 'upcoming' },
  { id: 203, jornada: 2, dateLabel: '19 Jun', teamAId: 4, teamBId: 1, status: 'upcoming' },
  { id: 301, jornada: 3, dateLabel: '24 Jun', teamAId: 3, teamBId: 2, status: 'upcoming' },
  { id: 302, jornada: 3, dateLabel: '24 Jun', teamAId: 6, teamBId: 8, status: 'upcoming' },
];

export const mockUserPredictions: Record<number, UserPrediction> = {
  101: { a: 1, b: 1 }, // Exacto (+5)
  102: { a: 2, b: 0 }, // Acertado (+3)
  103: { a: 0, b: 0 }, // Fallado (0)
};

export const rankingUsers: RankingUser[] = [
  { name: 'Andrés Silva', pts: 22, category: 'Champion' },
  { name: 'Karla Romero', pts: 18, category: 'Champion' },
  { name: 'Mario Bros', pts: 15, category: 'Champion' },
  { name: 'Elena Gilbert', pts: 11, category: 'Estándar' },
  { name: 'Sofía Luna', pts: 4, category: 'Aguador' },
];

export const teamStandingsByGroup: Record<string, TeamStanding[]> = {
  A: [
    { teamId: 1, pts: 3 },
    { teamId: 8, pts: 1 },
    { teamId: 2, pts: 1 },
    { teamId: 6, pts: 0 },
  ],
  B: [
    { teamId: 3, pts: 1 },
    { teamId: 4, pts: 1 },
  ],
  C: [
    { teamId: 5, pts: 0 },
  ],
  D: [
    { teamId: 7, pts: 0 },
  ],
};
