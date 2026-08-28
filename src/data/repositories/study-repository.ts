import { accountQuestions } from "@/lib/question-accounting";
import { computeReadiness } from "@/lib/readiness";
import { nextReview, sortDue } from "@/lib/review-engine";
import {
  evaluateSessionSafety,
  isLikelyOvernight,
  minutesBetween,
  SESSION_CAP_MINUTES,
} from "@/lib/session-safety";
import { createId } from "@/domain/ids";
import type { AppState, StudySession } from "@/domain/types";

export function startSession(state: AppState, catalogId: string): AppState {
  const open = state.sessions.find((s) => !s.endedAt);
  if (open) return state;
  const session: StudySession = {
    id: createId("ses"),
    startedAt: new Date().toISOString(),
    endedAt: null,
    timezone: state.profile.timezone || "America/Toronto",
    notes: "",
    catalogId,
    attempted: 0,
    correct: 0,
    incorrect: 0,
    omitted: 0,
    rawMinutes: null,
    creditedMinutes: null,
    safety: "open",
    confirmedOverCap: false,
  };
  return { ...state, sessions: [session, ...state.sessions] };
}

export function endSession(
  state: AppState,
  payload: {
    sessionId: string;
    attempted: number;
    correct: number;
    incorrect: number;
    omitted: number;
    notes: string;
    confirmOverCap?: boolean;
  },
): { state: AppState; error?: string } {
  const accounting = accountQuestions([
    {
      catalogId: "tmp",
      attempted: payload.attempted,
      correct: payload.correct,
      incorrect: payload.incorrect,
      omitted: payload.omitted,
    },
  ]);
  if (!accounting.valid) return { state, error: accounting.error };

  const sessions = state.sessions.map((s) => {
    if (s.id !== payload.sessionId) return s;
    const endedAt = new Date().toISOString();
    const raw = minutesBetween(s.startedAt, endedAt);
    const overnight = isLikelyOvernight(s.startedAt, endedAt, s.timezone);
    const safety = evaluateSessionSafety(raw, { staleOvernight: overnight });
    const confirmed = Boolean(payload.confirmOverCap);
    const credited =
      safety.kind === "needs_confirmation" && !confirmed ? Math.min(raw, SESSION_CAP_MINUTES) : raw;
    return {
      ...s,
      endedAt,
      notes: payload.notes,
      attempted: payload.attempted,
      correct: payload.correct,
      incorrect: payload.incorrect,
      omitted: payload.omitted,
      rawMinutes: raw,
      creditedMinutes: credited,
      safety: (safety.kind === "needs_confirmation" && !confirmed
        ? "needs_confirmation"
        : safety.kind === "warning"
          ? "warning"
          : "ok") as StudySession["safety"],
      confirmedOverCap: confirmed,
    };
  });
  return { state: { ...state, sessions } };
}

export function confirmSessionCap(state: AppState, sessionId: string): AppState {
  const sessions = state.sessions.map((s) => {
    if (s.id !== sessionId || s.rawMinutes === null) return s;
    return { ...s, creditedMinutes: s.rawMinutes, confirmedOverCap: true, safety: "ok" as const };
  });
  return { ...state, sessions };
}

export function updateEndedSession(
  state: AppState,
  sessionId: string,
  patch: Partial<Pick<StudySession, "startedAt" | "endedAt" | "notes" | "attempted" | "correct" | "incorrect" | "omitted">>,
): { state: AppState; error?: string } {
  const current = state.sessions.find((s) => s.id === sessionId);
  if (!current || !current.endedAt) return { state, error: "Session not found or still open." };

  const nextSession = { ...current, ...patch };
  if (!nextSession.endedAt) return { state, error: "Ended time required." };
  const accounting = accountQuestions([
    {
      catalogId: nextSession.catalogId,
      attempted: nextSession.attempted,
      correct: nextSession.correct,
      incorrect: nextSession.incorrect,
      omitted: nextSession.omitted,
    },
  ]);
  if (!accounting.valid) return { state, error: accounting.error };

  const raw = minutesBetween(nextSession.startedAt, nextSession.endedAt);
  const overnight = isLikelyOvernight(nextSession.startedAt, nextSession.endedAt, nextSession.timezone);
  const safety = evaluateSessionSafety(raw, { staleOvernight: overnight });
  const credited =
    safety.kind === "needs_confirmation" && !nextSession.confirmedOverCap
      ? Math.min(raw, SESSION_CAP_MINUTES)
      : raw;

  const sessions = state.sessions.map((s) =>
    s.id === sessionId
      ? {
          ...nextSession,
          rawMinutes: raw,
          creditedMinutes: credited,
          safety:
            safety.kind === "needs_confirmation" && !nextSession.confirmedOverCap
              ? ("needs_confirmation" as const)
              : safety.kind === "warning"
                ? ("warning" as const)
                : ("ok" as const),
        }
      : s,
  );
  return { state: { ...state, sessions } };
}

export function addReview(state: AppState, topic: string): AppState {
  return {
    ...state,
    reviews: [
      {
        id: createId("rev"),
        topic,
        firstSeenAt: new Date().toISOString(),
        completedIntervals: [],
        notes: "",
      },
      ...state.reviews,
    ],
  };
}

export function completeReviewInterval(state: AppState, reviewId: string, interval: number): AppState {
  const reviews = state.reviews.map((r) =>
    r.id === reviewId && !r.completedIntervals.includes(interval)
      ? { ...r, completedIntervals: [...r.completedIntervals, interval].sort((a, b) => a - b) }
      : r,
  );
  return { ...state, reviews };
}

export function catalogUsage(state: AppState, catalogId: string) {
  const catalog = state.catalogs.find((c) => c.id === catalogId);
  const used = state.sessions
    .filter((s) => s.catalogId === catalogId && s.endedAt)
    .reduce((n, s) => n + s.attempted, 0);
  const size = catalog?.totalQuestions ?? 0;
  return { used, size, remaining: Math.max(0, size - used) };
}

export function mccqe1Insights(state: AppState, nowMs = Date.now()) {
  const ended = state.sessions.filter((s) => s.endedAt);
  const last14 = ended.filter((s) => Date.parse(s.endedAt!) >= nowMs - 14 * 86400_000);
  const accounting = accountQuestions(
    last14.map((s) => ({
      catalogId: s.catalogId,
      attempted: s.attempted,
      correct: s.correct,
      incorrect: s.incorrect,
      omitted: s.omitted,
    })),
  );
  const due = sortDue(state.reviews.map((r) => nextReview(r, new Date().toISOString())));
  const overdue = due.filter((d) => d.overdue).length;
  const unused = state.catalogs.reduce((n, c) => n + catalogUsage(state, c.id).remaining, 0);
  const catalogSize = state.catalogs.reduce((n, c) => n + c.totalQuestions, 0);
  const creditedMinutes = ended.reduce((n, s) => n + (s.creditedMinutes ?? 0), 0);
  const readiness = computeReadiness({
    recentAccuracy: accounting.accuracy,
    questionsLast14Days: accounting.attempted,
    overdueReviews: overdue,
    unusedQuestions: unused,
    catalogSize,
    sessionsLast14Days: last14.length,
  });
  return { accounting, due, overdue, readiness, creditedMinutes, last14Count: last14.length };
}
