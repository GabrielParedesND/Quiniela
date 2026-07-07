import { PredictionDeadlineRule } from '@/lib/deadline';
import { computePoints, computePointsByJornada, loadPredictions, savePredictions } from '@/lib/demo';
import { IS_DEMO_MODE } from '@/lib/demo-mode';
import { computeTeamStandings, getPhase as getMockPhase, matches, rankingUsers, teams } from '@/lib/mock';

export interface Team {
  id: string;
  name: string;
  short: string;
  flagUrl: string;
  group: string;
}

export interface Match {
  id: string;
  jornada: number;
  dateLabel: string;
  kickoffAt?: string;
  closesAt?: string;
  apiRound?: string;
  teamAId: string;
  teamBId: string;
  status: 'played' | 'upcoming';
  scoreA?: number;
  scoreB?: number;
  isSpecial?: boolean;
  multiplier?: number;
}

export interface TeamStanding {
  teamId: string;
  teamName: string;
  teamLogo: string;
  group: string;
  rank: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalsDiff: number;
  pts: number;
  form: string | null;
  description: string | null;
}

export type Phase =
  | 'Cita con la Historia'
  | 'Duelo de Gigantes'
  | 'Zona de Campeones'
  | 'Camino a la Gloria';

export interface RankingUser {
  name: string;
  pts: number;
  exacts?: number;
  phase: Phase;
}

export interface QuinielaSnapshot {
  teams: Team[];
  matches: Match[];
  standingsByGroup: Record<string, TeamStanding[]>;
  rankingUsers: RankingUser[];
  userPredictions: Record<string, { a: string; b: string }>;
  points: number;
  pointsByJornada: number[];
  userPosition?: number;
  totalParticipants?: number;
  streak?: {
    current: number;
    threshold: number;
    multiplier: number;
    active: boolean;
  };
  predictionDeadlineRule: PredictionDeadlineRule;
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

const EMPTY_SNAPSHOT: QuinielaSnapshot = {
  teams: [],
  matches: [],
  standingsByGroup: {},
  rankingUsers: [],
  userPredictions: {},
  points: 0,
  pointsByJornada: [],
  predictionDeadlineRule: 'per-match',
};

export const fetchQuinielaSnapshot = async (userId?: string | null, tournamentId?: string | null): Promise<QuinielaSnapshot> => {
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
      predictionDeadlineRule: 'per-match',
    };
  }

  try {
    const params = new URLSearchParams();
    if (userId) params.set('userId', userId);
    if (tournamentId) params.set('tournamentId', tournamentId);
    const query = params.toString() ? `?${params.toString()}` : '';
    const response = await fetch(`/api/quiniela${query}`);

    if (!response.ok) {
      console.warn('[fetchQuinielaSnapshot] API responded with status', response.status);
      return EMPTY_SNAPSHOT;
    }

    return response.json();
  } catch (err) {
    console.warn('[fetchQuinielaSnapshot] Network error:', (err as Error).message);
    return EMPTY_SNAPSHOT;
  }
};

export const saveUserPredictions = async (
  userId: string,
  predictions: Record<string, { a: string; b: string }>,
  tournamentId?: string | null
): Promise<QuinielaSnapshot> => {
  if (IS_DEMO_MODE) {
    savePredictions(predictions);
    return fetchQuinielaSnapshot(userId, tournamentId);
  }

  const response = await fetch('/api/quiniela', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, predictions, tournamentId }),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Error al guardar pronosticos');
  }

  return response.json();
};
