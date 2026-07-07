/**
 * Shared deadline computation module.
 *
 * Used by both the API (server-side enforcement) and the client (countdown + lock state)
 * to ensure a single source of truth for deadline calculations.
 *
 * Guatemala timezone (America/Guatemala) is always UTC-6 with no DST.
 */

export type PredictionDeadlineRule = 'per-match' | 'media-noche';

/**
 * Resolves a rule string to a valid PredictionDeadlineRule.
 * Falls back to 'per-match' for absent, null, or unrecognized values.
 */
export function resolveRule(rule?: string): PredictionDeadlineRule {
  if (rule === 'media-noche') return 'media-noche';
  return 'per-match';
}

/** Guatemala is always UTC-6 (no DST) — offset in milliseconds. */
const GUATEMALA_OFFSET_MS = 6 * 60 * 60 * 1000;

/**
 * Computes the media-noche deadline: 00:00:00 America/Guatemala on the
 * calendar date of kickoffAt interpreted in Guatemala timezone.
 *
 * Returns an ISO 8601 string in UTC (midnight Guatemala = 06:00:00Z on that date).
 * Returns null if kickoffAt is empty or invalid.
 */
export function computeMediaNocheDeadline(kickoffAt: string): string | null {
  if (!kickoffAt || kickoffAt.trim().length === 0) return null;

  const kickoffMs = Date.parse(kickoffAt);
  if (isNaN(kickoffMs)) return null;

  // Convert UTC to Guatemala local time by subtracting 6 hours
  const guatemalaMs = kickoffMs - GUATEMALA_OFFSET_MS;
  const guatemalaDate = new Date(guatemalaMs);

  // Get the calendar date in Guatemala
  const year = guatemalaDate.getUTCFullYear();
  const month = guatemalaDate.getUTCMonth(); // 0-indexed
  const day = guatemalaDate.getUTCDate();

  // Midnight Guatemala on that date = that date at 00:00:00 Guatemala
  // Convert back to UTC by adding 6 hours
  const midnightGuatemalaUtc = Date.UTC(year, month, day, 0, 0, 0, 0) + GUATEMALA_OFFSET_MS;

  return new Date(midnightGuatemalaUtc).toISOString();
}

/**
 * Computes the effective deadline for a single match given the tournament's rule.
 * Returns an ISO string representing the deadline, or null if no deadline can be computed.
 *
 * Strategy dispatch:
 * - "media-noche": calls computeMediaNocheDeadline(match.kickoffAt) if kickoffAt exists,
 *   else falls back to closesAt || null
 * - "per-match": returns match.closesAt || match.kickoffAt || null
 */
export function computeMatchDeadline(
  match: { kickoffAt?: string; closesAt?: string },
  rule: PredictionDeadlineRule
): string | null {
  if (rule === 'media-noche') {
    if (match.kickoffAt && match.kickoffAt.trim().length > 0) {
      return computeMediaNocheDeadline(match.kickoffAt);
    }
    return match.closesAt || null;
  }

  // "per-match" rule
  return match.closesAt || match.kickoffAt || null;
}

/**
 * Determines if a match is past its deadline given the rule and current time.
 * If deadline is null, returns false (no deadline = not locked).
 * Returns true if (now || new Date()) >= new Date(deadline).
 */
export function isMatchPastDeadline(
  match: { kickoffAt?: string; closesAt?: string },
  rule: PredictionDeadlineRule,
  now?: Date
): boolean {
  const deadline = computeMatchDeadline(match, rule);
  if (deadline === null) return false;

  const deadlineMs = Date.parse(deadline);
  if (isNaN(deadlineMs)) return false;

  const currentMs = (now || new Date()).getTime();
  return currentMs >= deadlineMs;
}

/**
 * Extended computeJornadaDeadline that factors in the global rule.
 *
 * For "media-noche": finds the earliest kickoffAt among matches, computes
 * midnight Guatemala for that date, returns it.
 *
 * For "per-match": finds the earliest closesAt or kickoffAt among matches
 * (same as existing computeJornadaDeadline logic in countdown.ts).
 *
 * Returns null if no valid timestamps.
 */
export function computeJornadaDeadlineWithRule(
  matches: Array<{ kickoffAt?: string; closesAt?: string }>,
  rule: PredictionDeadlineRule
): string | null {
  if (rule === 'media-noche') {
    const kickoffValues = matches
      .map((m) => m.kickoffAt)
      .filter((v): v is string => v != null && v.trim().length > 0);

    if (kickoffValues.length === 0) return null;

    const earliestKickoff = kickoffValues.reduce((earliest, current) =>
      current < earliest ? current : earliest
    );

    return computeMediaNocheDeadline(earliestKickoff);
  }

  // "per-match" — existing behavior: earliest closesAt, fallback to earliest kickoffAt
  const closesAtValues = matches
    .map((m) => m.closesAt)
    .filter((v): v is string => v != null && v.trim().length > 0);

  if (closesAtValues.length > 0) {
    return closesAtValues.reduce((earliest, current) =>
      current < earliest ? current : earliest
    );
  }

  const kickoffAtValues = matches
    .map((m) => m.kickoffAt)
    .filter((v): v is string => v != null && v.trim().length > 0);

  if (kickoffAtValues.length > 0) {
    return kickoffAtValues.reduce((earliest, current) =>
      current < earliest ? current : earliest
    );
  }

  return null;
}
