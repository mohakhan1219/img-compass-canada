import { describe, expect, it } from "vitest";
import { computeNacReadiness, clampNacScore } from "../src/domain/nac";
import { computeLanguageReadiness } from "../src/domain/language";
import {
  computeProvincialSnapshot,
  isStaleVerification,
  provincialBlockers,
} from "../src/domain/requirements";
import { computeCarmsPipeline, rankingConflicts, submittedPrograms, applicationTrackProgress } from "../src/domain/carms";
import { computeJourneySnapshot } from "../src/domain/journey";
import { createDemoState } from "../src/data/seed";
import { migrateToCurrent } from "../src/data/migrate";
import { logNacAttempt } from "../src/data/repositories/nac-repository";
import { updateLanguagePlan } from "../src/data/repositories/language-repository";
import { setTargetProvinces, updateRequirement } from "../src/data/repositories/requirements-repository";
import { setMatchOutcome, updateProgram } from "../src/data/repositories/carms-repository";
import type { PathwayRequirement } from "../src/domain/types";

describe("NAC scoring", () => {
  it("clamps scores", () => {
    expect(clampNacScore(12)).toBe(10);
    expect(clampNacScore(-1)).toBe(0);
  });

  it("needs three attempts for a band", () => {
    const r = computeNacReadiness(createDemoState().nacStations, []);
    expect(r.band).toBe("insufficient_evidence");
  });

  it("uses logged attempts only", () => {
    const base = createDemoState();
    const r = computeNacReadiness(base.nacStations, base.nacAttempts);
    expect(r.attempts).toBe(3);
    expect(r.band).toBe("building");
    expect(r.topWeakTags).toContain("time management");
  });
});

describe("language applicability", () => {
  it("does not treat unknown as required", () => {
    const state = createDemoState();
    const r = computeLanguageReadiness(state.languagePlans, state.languageAttempts);
    expect(r.band).toBe("needs_verification");
  });

  it("not_required is complete-not-applicable, not a national rule", () => {
    let state = createDemoState();
    for (const p of state.languagePlans) {
      state = updateLanguagePlan(state, p.examKind, { applicability: "not_required" });
    }
    const r = computeLanguageReadiness(state.languagePlans, []);
    expect(r.band).toBe("not_applicable");
  });
});

describe("requirement versioning and provincial blockers", () => {
  it("flags stale last-verified dates", () => {
    expect(isStaleVerification("2025-01-01", Date.parse("2026-08-20"))).toBe(true);
    expect(isStaleVerification("2026-07-01", Date.parse("2026-08-20"))).toBe(false);
  });

  it("blockers only apply to target provinces", () => {
    const state = setTargetProvinces(createDemoState(), ["BC"]);
    expect(provincialBlockers(state.requirements, state.targetProvinceCodes)).toHaveLength(0);
    const on = setTargetProvinces(state, ["ON"]);
    expect(provincialBlockers(on.requirements, on.targetProvinceCodes).length).toBeGreaterThan(0);
  });

  it("keeps personal tracking updates without rewriting official applicability", () => {
    const state = updateRequirement(createDemoState(), "bc-language", {
      userStatus: "complete",
    });
    const row = state.requirements.find((r) => r.id === "bc-language") as PathwayRequirement;
    expect(row.userStatus).toBe("complete");
    expect(row.applicability).toBe("needs_verification");
    expect(row.fictional).toBe(false);
  });
});

describe("CaRMS progression", () => {
  it("counts submitted applications", () => {
    const state = createDemoState();
    expect(submittedPrograms(state.programs)).toHaveLength(1);
    const next = updateProgram(state, "track-utoronto-family-medicine", { applicationStatus: "submitted" });
    expect(submittedPrograms(next.programs)).toHaveLength(2);
  });

  it("detects duplicate ranks", () => {
    const state = updateProgram(createDemoState(), "track-utoronto-family-medicine", {
      rankIncluded: true,
      rankPosition: 1,
    });
    expect(rankingConflicts(state.programs).length).toBeGreaterThan(0);
  });

  it("match recording completes match stage", () => {
    const state = setMatchOutcome(createDemoState(), {
      status: "matched",
      programId: "track-ubc-internal-medicine",
      recordedAt: "2026-03-10T12:00:00.000Z",
      notes: "",
      nextCycleNotes: "",
    });
    expect(computeJourneySnapshot(state).status.match).toBe("complete");
    const pipe = computeCarmsPipeline(state.programs, state.matchOutcome);
    expect(pipe.nextHint.toLowerCase()).toContain("match");
  });

  it("counts application track progress", () => {
    const harbour = createDemoState().programs.find((p) => p.id === "track-ubc-internal-medicine")!;
    expect(applicationTrackProgress(harbour).done).toBe(4);
  });
});

describe("journey derivation", () => {
  it("surfaces MCCQE1 duration confirmation as blocked", () => {
    const snap = computeJourneySnapshot(createDemoState());
    expect(snap.status.mccqe1).toBe("blocked");
    expect(snap.flags.issues.some((i) => i.kind === "administrative_blocker" && i.stage === "mccqe1")).toBe(true);
  });

  it("marks profile complete from display name", () => {
    expect(computeJourneySnapshot(createDemoState()).status.profile).toBe("complete");
  });
});

describe("migration and repositories", () => {
  it("upgrades v1 blobs without dropping study logs", () => {
    const migrated = migrateToCurrent({
      version: 1,
      demoSignedIn: true,
      profile: { displayName: "Dr. Test" },
      sessions: [{ id: "x", endedAt: "2026-08-01T00:00:00.000Z" }],
      reviews: [],
    });
    expect(migrated.version).toBe(3);
    expect(migrated.profile.displayName).toBe("Dr. Test");
    expect(migrated.sessions).toHaveLength(1);
    expect(migrated.nacStations.length).toBeGreaterThan(0);
    expect(migrated.requirements.every((r) => r.fictional === false)).toBe(true);
  });

  it("appends NAC attempts immutably", () => {
    const state = createDemoState();
    const next = logNacAttempt(state, {
      stationId: "nac-dx-chest",
      startedAt: "2026-08-20T10:00:00.000Z",
      endedAt: "2026-08-20T10:06:00.000Z",
      durationSeconds: 360,
      score: 8,
      weakTags: ["synthesis"],
      notes: "",
    });
    expect(next.nacAttempts).toHaveLength(state.nacAttempts.length + 1);
    expect(state.nacAttempts).toHaveLength(3);
  });
});

describe("provincial snapshot", () => {
  it("lists verification and incomplete required rows", () => {
    const state = createDemoState();
    const snap = computeProvincialSnapshot(state.requirements, ["ON", "BC"], Date.parse("2026-08-20"));
    expect(snap.verify.length).toBeGreaterThan(0);
    expect(snap.blockers.length).toBeGreaterThan(0);
    expect(snap.incomplete.length).toBeGreaterThan(0);
  });
});

