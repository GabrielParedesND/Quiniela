import { matches, defaultPredictions } from './mock';

const PREDICTIONS_KEY = 'quiniela_predictions';

type Predictions = Record<number, { a: string; b: string }>;

function toStringPredictions(
  source: Record<number, { a: number | string; b: number | string }>
): Predictions {
  const result: Predictions = {};
  for (const [id, pred] of Object.entries(source)) {
    result[Number(id)] = { a: String(pred.a), b: String(pred.b) };
  }
  return result;
}

export function loadPredictions(): Predictions {
  if (typeof window === 'undefined') return {};

  const stored = localStorage.getItem(PREDICTIONS_KEY);
  if (stored) {
    try {
      return JSON.parse(stored) as Predictions;
    } catch {
      localStorage.removeItem(PREDICTIONS_KEY);
    }
  }

  const initial = toStringPredictions(defaultPredictions);
  localStorage.setItem(PREDICTIONS_KEY, JSON.stringify(initial));
  return initial;
}

export function savePredictions(predictions: Predictions): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PREDICTIONS_KEY, JSON.stringify(predictions));
}

export function computePoints(predictions: Predictions): number {
  let total = 0;
  const playedMatches = matches.filter((m) => m.status === 'played');

  for (const match of playedMatches) {
    const pred = predictions[match.id];
    if (!pred || pred.a === '' || pred.b === '') continue;

    const pA = parseInt(pred.a);
    const pB = parseInt(pred.b);
    if (isNaN(pA) || isNaN(pB)) continue;

    if (pA === match.scoreA && pB === match.scoreB) {
      total += 5;
    } else if (
      (pA > pB && match.scoreA! > match.scoreB!) ||
      (pB > pA && match.scoreB! > match.scoreA!) ||
      (pA === pB && match.scoreA === match.scoreB)
    ) {
      total += 3;
    }
  }

  return total;
}

export function computePointsByJornada(predictions: Predictions): number[] {
  const jornadas = [1, 2, 3];
  return jornadas.map((jornada) => {
    let pts = 0;
    const jornadaMatches = matches.filter(
      (m) => m.jornada === jornada && m.status === 'played'
    );

    for (const match of jornadaMatches) {
      const pred = predictions[match.id];
      if (!pred || pred.a === '' || pred.b === '') continue;

      const pA = parseInt(pred.a);
      const pB = parseInt(pred.b);
      if (isNaN(pA) || isNaN(pB)) continue;

      if (pA === match.scoreA && pB === match.scoreB) {
        pts += 5;
      } else if (
        (pA > pB && match.scoreA! > match.scoreB!) ||
        (pB > pA && match.scoreB! > match.scoreA!) ||
        (pA === pB && match.scoreA === match.scoreB)
      ) {
        pts += 3;
      }
    }

    return pts;
  });
}
