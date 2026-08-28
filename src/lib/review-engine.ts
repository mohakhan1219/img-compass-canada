/** Interval review: first pass, then 1 / 7 / 21 day follow-ups. */

export const REVIEW_INTERVALS_DAYS = [1, 7, 21] as const;

export type ReviewItem = {
  id: string;
  topic: string;
  firstSeenAt: string;
  completedIntervals: number[];
};

export type ReviewDue = ReviewItem & {
  nextIntervalDays: number | null;
  dueAt: string | null;
  overdue: boolean;
};

export function nextReview(item: ReviewItem, nowIso: string): ReviewDue {
  const done = new Set(item.completedIntervals);
  const next = REVIEW_INTERVALS_DAYS.find((d) => !done.has(d)) ?? null;
  if (next === null) {
    return { ...item, nextIntervalDays: null, dueAt: null, overdue: false };
  }
  const due = new Date(Date.parse(item.firstSeenAt) + next * 24 * 60 * 60 * 1000);
  const dueAt = due.toISOString();
  return {
    ...item,
    nextIntervalDays: next,
    dueAt,
    overdue: Date.parse(nowIso) >= due.getTime(),
  };
}

export function sortDue(items: ReviewDue[]): ReviewDue[] {
  return [...items].sort((a, b) => {
    if (a.overdue !== b.overdue) return a.overdue ? -1 : 1;
    if (!a.dueAt) return 1;
    if (!b.dueAt) return -1;
    return a.dueAt.localeCompare(b.dueAt);
  });
}
