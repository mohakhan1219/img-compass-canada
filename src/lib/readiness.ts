/**
 * Evidence-based readiness: never a vibes score.
 * Combines recent accuracy, volume, review hygiene, and unused catalog remaining.
 */

export type ReadinessInputs = {
  recentAccuracy: number | null;
  questionsLast14Days: number;
  overdueReviews: number;
  unusedQuestions: number;
  catalogSize: number;
  sessionsLast14Days: number;
};

export type ReadinessResult = {
  band: "insufficient_evidence" | "building" | "on_track" | "exam_window";
  label: string;
  rationale: string[];
  score: number | null;
};

export const COMPASS_INDICATOR_DISCLAIMER =
  "This is a personal planning indicator, not an MCC/NAC score or prediction of examination or match performance.";

export function explainReadiness(result: ReadinessResult): string[] {
  const lines = [...result.rationale];
  if (result.score !== null) {
    lines.push(
      `Compass indicator ${result.score}/100 is computed from recent logged accuracy, volume, review hygiene, and unused tracker items.`,
    );
  }
  lines.push(COMPASS_INDICATOR_DISCLAIMER);
  return lines;
}

export function computeReadiness(input: ReadinessInputs): ReadinessResult {
  const rationale: string[] = [];
  if (input.questionsLast14Days < 40 || input.sessionsLast14Days < 3 || input.recentAccuracy === null) {
    rationale.push("Too little recent logged work to estimate readiness.");
    return {
      band: "insufficient_evidence",
      label: "Insufficient evidence",
      rationale,
      score: null,
    };
  }

  let score = 40;
  score += Math.min(30, (input.recentAccuracy / 100) * 30);
  score += Math.min(15, (input.questionsLast14Days / 200) * 15);
  if (input.overdueReviews === 0) score += 10;
  else {
    score -= Math.min(15, input.overdueReviews * 2);
    rationale.push(`${input.overdueReviews} overdue interval review(s).`);
  }
  const unusedRatio = input.catalogSize === 0 ? 0 : input.unusedQuestions / input.catalogSize;
  if (unusedRatio > 0.4) {
    score -= 8;
    rationale.push("A large unused share of the catalog remains.");
  }
  score = Math.max(0, Math.min(100, Math.round(score)));

  rationale.push(`Recent graded accuracy ${input.recentAccuracy}%.`);
  rationale.push(`${input.questionsLast14Days} questions logged in 14 days across ${input.sessionsLast14Days} sessions.`);

  if (score >= 75 && input.overdueReviews === 0) {
    return { band: "exam_window", label: "Exam-window evidence", rationale, score };
  }
  if (score >= 55) {
    return { band: "on_track", label: "On track", rationale, score };
  }
  return { band: "building", label: "Building evidence", rationale, score };
}
