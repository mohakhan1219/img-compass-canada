import { describe, expect, it } from "vitest";
import { accountQuestions } from "../src/lib/question-accounting";
import { computeReadiness } from "../src/lib/readiness";
import { nextReview } from "../src/lib/review-engine";
import { evaluateSessionSafety, minutesBetween } from "../src/lib/session-safety";

describe("question accounting", () => {
  it("rejects mismatched parts", () => {
    const r = accountQuestions([{ catalogId: "a", attempted: 10, correct: 4, incorrect: 4, omitted: 1 }]);
    expect(r.valid).toBe(false);
  });

  it("computes accuracy on graded items only", () => {
    const r = accountQuestions([{ catalogId: "a", attempted: 10, correct: 6, incorrect: 3, omitted: 1 }]);
    expect(r.valid).toBe(true);
    expect(r.accuracy).toBe(66.7);
  });
});

describe("session safety", () => {
  it("caps credit until confirmation", () => {
    const r = evaluateSessionSafety(300);
    expect(r.kind).toBe("needs_confirmation");
    expect(r.creditedMinutes).toBe(240);
  });

  it("warns at 3 hours", () => {
    const r = evaluateSessionSafety(190);
    expect(r.kind).toBe("warning");
    expect(r.creditedMinutes).toBe(190);
  });

  it("computes duration", () => {
    expect(minutesBetween("2026-08-01T12:00:00.000Z", "2026-08-01T14:30:00.000Z")).toBe(150);
  });
});

describe("review engine", () => {
  it("marks 1-day interval overdue", () => {
    const due = nextReview(
      { id: "1", topic: "x", firstSeenAt: "2026-08-01T00:00:00.000Z", completedIntervals: [] },
      "2026-08-03T00:00:00.000Z",
    );
    expect(due.nextIntervalDays).toBe(1);
    expect(due.overdue).toBe(true);
  });
});

describe("readiness", () => {
  it("refuses to score without evidence", () => {
    const r = computeReadiness({
      recentAccuracy: null,
      questionsLast14Days: 10,
      overdueReviews: 0,
      unusedQuestions: 100,
      catalogSize: 200,
      sessionsLast14Days: 1,
    });
    expect(r.band).toBe("insufficient_evidence");
    expect(r.score).toBeNull();
  });
});
