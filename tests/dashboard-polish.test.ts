import { describe, expect, it } from "vitest";
import { createDemoState } from "../src/data/seed";
import {
  DASHBOARD_PATH,
  dashboardCompletion,
  dashboardPathStatuses,
  deriveDashboardPriorities,
  readinessCards,
  pathwayProgressSeries,
  upcomingMilestones,
  welcomeContext,
} from "../src/domain/dashboard";
import { COMPASS_MESSAGES, compassMessage, compassQuotedText } from "../src/lib/motivation";
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
    expect(welcome.cta.label).toBe("Continue preparation");
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
    expect(steps.find((s) => s.id === "mccqe1")?.tone).toBe("verify");
    expect(steps.find((s) => s.id === "provincial")?.tone).toBe("verify");
    expect(steps.find((s) => s.id === "match")?.tone).toBe("upcoming");
  });

  it("builds readiness and milestones from existing records", () => {
    const state = createDemoState();
    const cards = readinessCards(state, NOW);
    expect(cards.map((c) => c.label)).toEqual(["MCCQE", "NAC", "Language", "Program research", "Applications"]);
    expect(cards.find((c) => c.id === "programs")?.status).toContain("3");
    const done = dashboardCompletion(state);
    expect(done.total).toBe(12);
    expect(done.percent).toBe(Math.round((done.completed / 12) * 100));
    const miles = upcomingMilestones(state, NOW);
    expect(miles.some((m) => m.label.includes("MCCQE"))).toBe(true);
    expect(miles.some((m) => m.href === "/carms")).toBe(true);
  });

  it("derives pathway graph values from tracker records without invented mock percents", () => {
    const state = createDemoState();
    const series = pathwayProgressSeries(state);
    const done = dashboardCompletion(state);
    expect(series.map((s) => s.id)).toEqual([...DASHBOARD_PATH]);
    expect(done.completed).toBe(3);
    expect(done.percent).toBe(25);

    const byId = Object.fromEntries(series.map((s) => [s.id, s]));
    expect(byId.profile.percent).toBe(100);
    expect(byId.credentials.percent).toBe(0);
    expect(byId.credentials.basis).toMatch(/0 of 7/);
    expect(byId.mccqe1.percent).toBeNull();
    expect(byId.mccqe1.statusLabel).toBe("Verify");
    expect(byId.nac.percent).toBe(38);
    expect(byId.language.percent).toBeNull();
    expect(byId.programs.percent).toBeNull();
    expect(byId.carms.percent).toBeNull();
    expect(byId.applications.percent).toBe(33);
    expect(byId.interviews.percent).toBe(100);
    expect(byId.ranking.percent).toBe(100);
    expect(byId.match.percent).toBe(0);
    expect(series.every((s) => ![60, 40, 50, 35, 30, 15, 10, 5].includes(s.percent ?? -1))).toBe(true);
  });
});

describe("daily compass", () => {
  it("rotates deterministically by UTC date", () => {
    const a = compassMessage("mccqe1", new Date("2026-08-30T08:00:00Z"));
    const b = compassMessage("mccqe1", new Date("2026-08-30T22:00:00Z"));
    expect(a).toBe(b);
    expect(a.length).toBeGreaterThan(20);
    expect(COMPASS_MESSAGES.length).toBeGreaterThan(12);
    expect(COMPASS_MESSAGES.every((m) => m.emoji && m.text)).toBe(true);
    expect(COMPASS_MESSAGES.every((m) => !m.text.includes("🇨🇦"))).toBe(true);
    expect(COMPASS_MESSAGES.every((m) => ["🩺", "📚", "🎯", "✨", "🧭", "⚕️"].includes(m.emoji))).toBe(true);
    expect(compassQuotedText(a).startsWith("“")).toBe(true);
    expect(compassQuotedText(a).endsWith("”")).toBe(true);
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
