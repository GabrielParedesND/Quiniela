import type { Match } from '@/lib/db/quiniela';

export { computeJornadaDeadlineWithRule } from '@/lib/deadline';

export interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  expired: boolean;
}

/**
 * Computes the prediction deadline for a jornada.
 * Returns the earliest closesAt among matches in the jornada.
 * Falls back to earliest kickoffAt if no closesAt is available.
 * Returns null if no timestamps are available.
 */
export function computeJornadaDeadline(matches: Match[]): string | null {
  const closesAtValues = matches
    .map((m) => m.closesAt)
    .filter((v): v is string => v != null && v.length > 0);

  if (closesAtValues.length > 0) {
    return closesAtValues.reduce((earliest, current) =>
      current < earliest ? current : earliest
    );
  }

  const kickoffAtValues = matches
    .map((m) => m.kickoffAt)
    .filter((v): v is string => v != null && v.length > 0);

  if (kickoffAtValues.length > 0) {
    return kickoffAtValues.reduce((earliest, current) =>
      current < earliest ? current : earliest
    );
  }

  return null;
}

/**
 * Computes the time remaining from now until the given deadline.
 * Returns an object with days, hours, minutes, seconds, and expired flag.
 * Handles invalid/unparseable timestamps defensively (treats as expired).
 */
export function computeTimeRemaining(deadline: string): TimeRemaining {
  const expired: TimeRemaining = { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };

  const deadlineMs = Date.parse(deadline);
  if (isNaN(deadlineMs)) {
    return expired;
  }

  const diffMs = deadlineMs - Date.now();
  if (diffMs <= 0) {
    return expired;
  }

  const totalSeconds = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { days, hours, minutes, seconds, expired: false };
}

/**
 * Returns true when total remaining time is less than 1 hour and not expired.
 */
export function isUrgent(remaining: TimeRemaining): boolean {
  if (remaining.expired) {
    return false;
  }
  const totalSeconds =
    remaining.days * 86400 +
    remaining.hours * 3600 +
    remaining.minutes * 60 +
    remaining.seconds;
  return totalSeconds > 0 && totalSeconds < 3600;
}
