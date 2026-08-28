import { describe, expect, it } from "vitest";
import { collectJourneyIssues, computeJourneySnapshot, isVerificationHold } from "../src/domain/journey";
import { createDemoState } from "../src/data/seed";
import { MemoryStateRepository } from "../src/data/memory-state-repository";
import { setDemoSignedIn } from "../src/data/repositories/profile-repository";

describe("blocker classification", () => {
  it("treats language unknown as requirement_uncertain, not a performance failure", () => {
    const issues = collectJourneyIssues(createDemoState());
    const lang = issues.filter((i) => i.stage === "language");
    expect(lang.some((i) => i.kind === "requirement_uncertain")).toBe(true);
    expect(isVerificationHold("requirement_uncertain")).toBe(true);
    expect(isVerificationHold("administrative_blocker")).toBe(false);
  });

  it("labels fictional provincial issues", () => {
    const issues = collectJourneyIssues(createDemoState(), Date.parse("2026-08-20T00:00:00Z"));
    const prov = issues.filter((i) => i.stage === "provincial");
    expect(prov.length).toBeGreaterThan(0);
    expect(prov.every((i) => i.fictional)).toBe(true);
  });

  it("keeps MCCQE1 duration confirmation as administrative", () => {
    const snap = computeJourneySnapshot(createDemoState());
    expect(snap.status.mccqe1).toBe("blocked");
    expect(snap.flags.issues.some((i) => i.kind === "administrative_blocker" && i.stage === "mccqe1")).toBe(true);
  });
});

describe("memory repository", () => {
  it("round-trips state without touching localStorage", async () => {
    const repo = new MemoryStateRepository();
    const state = setDemoSignedIn(createDemoState(), true);
    await repo.save("demo", state);
    const loaded = await repo.get("demo");
    expect(loaded?.profile.displayName).toBe("Dr. Alex Morgan");
    expect(await repo.ping()).toBe(true);
  });
});
