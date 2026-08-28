/** Session duration safety for study logging. Durations are in minutes. */

export const SESSION_WARN_MINUTES = 180;
export const SESSION_CAP_MINUTES = 240;

export type SessionSafetyState =
  | { kind: "ok"; creditedMinutes: number; rawMinutes: number }
  | {
      kind: "needs_confirmation";
      creditedMinutes: number;
      rawMinutes: number;
      reason: "over_cap" | "stale_overnight";
    }
  | { kind: "warning"; creditedMinutes: number; rawMinutes: number };

export function minutesBetween(startedAtIso: string, endedAtIso: string): number {
  const start = Date.parse(startedAtIso);
  const end = Date.parse(endedAtIso);
  if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) return 0;
  return Math.round((end - start) / 60_000);
}

export function evaluateSessionSafety(rawMinutes: number, opts?: { staleOvernight?: boolean }): SessionSafetyState {
  const stale = Boolean(opts?.staleOvernight);
  if (stale || rawMinutes > SESSION_CAP_MINUTES) {
    return {
      kind: "needs_confirmation",
      rawMinutes,
      creditedMinutes: Math.min(rawMinutes, SESSION_CAP_MINUTES),
      reason: stale ? "stale_overnight" : "over_cap",
    };
  }
  if (rawMinutes >= SESSION_WARN_MINUTES) {
    return { kind: "warning", rawMinutes, creditedMinutes: rawMinutes };
  }
  return { kind: "ok", rawMinutes, creditedMinutes: rawMinutes };
}

export function isLikelyOvernight(startedAtIso: string, endedAtIso: string, timezone: string): boolean {
  try {
    const fmt = new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    const startDay = fmt.format(new Date(startedAtIso));
    const endDay = fmt.format(new Date(endedAtIso));
    return startDay !== endDay;
  } catch {
    return false;
  }
}
