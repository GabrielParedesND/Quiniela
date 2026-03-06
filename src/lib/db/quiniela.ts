import { computePoints, computePointsByJornada, loadPredictions, savePredictions } from '@/lib/demo';
import { IS_DEMO_MODE } from '@/lib/demo-mode';
import { computeTeamStandings, getPhase as getMockPhase, matches, rankingUsers, teams } from '@/lib/mock';

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

export interface TeamStanding {
  teamId: number;
  pts: number;
}

export type Phase =
  | 'Cita con la Historia'
  | 'Duelo de Gigantes'
  | 'Zona de Campeones'
  | 'Camino a la Gloria';

export interface RankingUser {
  name: string;
  pts: number;
  phase: Phase;
}

export interface QuinielaSnapshot {
  teams: Team[];
  matches: Match[];
  standingsByGroup: Record<string, TeamStanding[]>;
  rankingUsers: RankingUser[];
  userPredictions: Record<number, { a: string; b: string }>;
  points: number;
  pointsByJornada: number[];
}

export function getPhase(pts: number): Phase {
  if (IS_DEMO_MODE) {
    return getMockPhase(pts);
  }
  if (pts >= 30) return 'Cita con la Historia';
  if (pts >= 20) return 'Duelo de Gigantes';
  if (pts >= 10) return 'Zona de Campeones';
  return 'Camino a la Gloria';
}

export const fetchQuinielaSnapshot = async (userId?: string | null): Promise<QuinielaSnapshot> => {
  if (IS_DEMO_MODE) {
    const predictions = loadPredictions();
    return {
      teams,
      matches,
      standingsByGroup: computeTeamStandings(),
      rankingUsers,
      userPredictions: predictions,
      points: computePoints(predictions),
      pointsByJornada: computePointsByJornada(predictions),
    };
  }

  const query = userId ? `?userId=${encodeURIComponent(userId)}` : '';
  const response = await fetch(`/api/quiniela${query}`);

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Error al obtener datos de quiniela');
  }

  return response.json();
};

export const saveUserPredictions = async (
  userId: string,
  predictions: Record<number, { a: string; b: string }>
): Promise<QuinielaSnapshot> => {
  if (IS_DEMO_MODE) {
    savePredictions(predictions);
    return fetchQuinielaSnapshot(userId);
  }

  const response = await fetch('/api/quiniela', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, predictions }),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Error al guardar pronosticos');
  }

  return response.json();
};
