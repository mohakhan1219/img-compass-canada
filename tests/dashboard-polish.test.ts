import { describe, expect, it } from "vitest";
import { createDemoState } from "../src/data/seed";
import {
  DASHBOARD_PATH,
  dashboardPathStatuses,
  deriveDashboardPriorities,
  readinessCards,
  upcomingMilestones,
  welcomeContext,
} from "../src/domain/dashboard";
import { compassMessage } from "../src/lib/motivation";
import { PORTFOLIO_SYNTHETIC_DISCLOSURE } from "../src/lib/eligibility";

const NOW = Date.parse("2026-08-30T12:00:00Z");

describe("dashboard command center", () => {
  it("uses the 12-step residency path without inventing extra stages", () => {
    expect(DASHBOARD_PATH).toEqual([
      "profile",
      "credentials",
      "mccqe1",
      "nac",
      "language",
      "provincial",
      "programs",
      "carms",
      "applications",
      "interviews",
      "ranking",
      "match",
    ]);
  });

  it("welcomes Alex and derives three priorities from demo state", () => {
    const state = createDemoState();
    const welcome = welcomeContext(state);
    expect(welcome.greetingName).toBe("Alex");
    const priorities = deriveDashboardPriorities(state, NOW);
    expect(priorities).toHaveLength(3);
    expect(priorities.map((p) => p.title)).toEqual([
      "Continue MCCQE preparation",
      "Review eligibility requirements",
      "Prepare for NAC",
    ]);
  });

  it("marks completed, current, and attention steps from recorded statuses", () => {
    const steps = dashboardPathStatuses(createDemoState());
    expect(steps.find((s) => s.id === "profile")?.tone).toBe("complete");
    expect(steps.find((s) => s.id === "credentials")?.tone).toBe("current");
    expect(steps.find((s) => s.id === "mccqe1")?.tone).toBe("attention");
    expect(steps.find((s) => s.id === "provincial")?.tone).toBe("attention");
    expect(steps.find((s) => s.id === "match")?.tone).toBe("upcoming");
  });

  it("builds readiness and milestones from existing records", () => {
    const state = createDemoState();
    const cards = readinessCards(state, NOW);
    expect(cards.map((c) => c.label)).toEqual(["MCCQE", "NAC", "Language", "Program research", "Applications"]);
    expect(cards.find((c) => c.id === "programs")?.status).toContain("3");
    const miles = upcomingMilestones(state, NOW);
    expect(miles.some((m) => m.label.includes("MCCQE"))).toBe(true);
    expect(miles.some((m) => m.href === "/carms")).toBe(true);
  });
});

describe("daily compass", () => {
  it("rotates deterministically by UTC date", () => {
    const a = compassMessage("mccqe1", new Date("2026-08-30T08:00:00Z"));
    const b = compassMessage("mccqe1", new Date("2026-08-30T22:00:00Z"));
    expect(a).toBe(b);
    expect(a.length).toBeGreaterThan(20);
    const nextDay = compassMessage("mccqe1", new Date("2026-08-31T08:00:00Z"));
    expect(nextDay).not.toBe(a);
  });
});

describe("portfolio disclosure", () => {
  it("states that all learner activity in the demo is synthetic", () => {
    expect(PORTFOLIO_SYNTHETIC_DISCLOSURE).toBe(
      "All learner activity shown in this portfolio demo is synthetic.",
    );
    expect(PORTFOLIO_SYNTHETIC_DISCLOSURE.toLowerCase()).not.toContain("no learner");
  });
});
