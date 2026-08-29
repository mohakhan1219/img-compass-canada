import { describe, expect, it } from "vitest";
import { createDemoState, createEmptyState } from "../src/data/seed";
import { migrateToCurrent } from "../src/data/migrate";
import { institutionsForProvince, FAKE_INSTITUTION_NAMES, INSTITUTIONS } from "../src/reference/institutions";
import { programsForFilters, REFERENCE_PROGRAMS } from "../src/reference/programs";
import { JURISDICTIONS } from "../src/reference/provinces";
import { overallCompleteness, profileSections } from "../src/domain/profile-completeness";
import { computeJourneySnapshot, deriveNextActions } from "../src/domain/journey";
import { saveReferenceProgram, addApplication, updateProgram, setMatchOutcome, setRankOrder } from "../src/data/repositories/carms-repository";
import { setTargetProvinces, updateRequirement } from "../src/data/repositories/requirements-repository";
import { explainReadiness, computeReadiness, COMPASS_INDICATOR_DISCLAIMER } from "../src/lib/readiness";
import { hashPassword, verifyPassword } from "../src/server/password";
import { emptyProfile } from "../src/data/seed";

describe("reference catalog honesty", () => {
  it("lists participating R-1 institutions without invented names", () => {
    expect(institutionsForProvince("ON")).toHaveLength(7);
    expect(institutionsForProvince("AB")).toHaveLength(2);
    expect(institutionsForProvince("BC")).toHaveLength(2);
    expect(institutionsForProvince("MB")).toHaveLength(1);
    expect(institutionsForProvince("SK")).toHaveLength(1);
    expect(institutionsForProvince("QC")).toHaveLength(4);
    expect(institutionsForProvince("NL")).toHaveLength(1);
    expect(institutionsForProvince("NS").map((i) => i.id)).toEqual(["dalhousie"]);
    expect(institutionsForProvince("NB").map((i) => i.id)).toEqual(["dalhousie"]);
    expect(institutionsForProvince("PE").map((i) => i.id)).toEqual(["dalhousie"]);
    expect(institutionsForProvince("YT")).toHaveLength(0);
    const blob = JSON.stringify(INSTITUTIONS);
    for (const fake of FAKE_INSTITUTION_NAMES) {
      expect(blob).not.toContain(fake);
    }
  });

  it("filters programs by province then institution", () => {
    const on = programsForFilters({ provinceCode: "ON" });
    expect(on.every((p) => p.provinceCode === "ON")).toBe(true);
    const uoft = programsForFilters({ provinceCode: "ON", institutionId: "utoronto" });
    expect(uoft.length).toBeGreaterThan(0);
    expect(uoft.every((p) => p.institutionId === "utoronto")).toBe(true);
    expect(REFERENCE_PROGRAMS.every((p) => p.sourceStatus === "needs_review")).toBe(true);
  });

  it("geographic dropdown includes territories even without R-1 rows", () => {
    expect(JURISDICTIONS.some((j) => j.code === "YT" && !j.hasR1Institutions)).toBe(true);
  });
});

describe("profile completeness", () => {
  it("does not call a sparse profile complete", () => {
    const sparse = { ...emptyProfile(), displayName: "A" };
    const overall = overallCompleteness(sparse);
    expect(overall.filled).toBeLessThan(overall.total);
    expect(profileSections(sparse).find((s) => s.id === "personal")?.complete).toBe(false);
  });
});

describe("journey and readiness", () => {
  it("derives next actions from recorded state", () => {
    const actions = deriveNextActions(createDemoState(), Date.parse("2026-08-20T00:00:00Z"));
    expect(actions.length).toBeGreaterThan(0);
  });

  it("explains compass indicators", () => {
    const r = computeReadiness({
      recentAccuracy: 70,
      questionsLast14Days: 80,
      overdueReviews: 0,
      unusedQuestions: 10,
      catalogSize: 200,
      sessionsLast14Days: 5,
    });
    const lines = explainReadiness(r);
    expect(lines.join(" ")).toContain(COMPASS_INDICATOR_DISCLAIMER);
    expect(r.score).not.toBeNull();
  });
});

describe("program to match flow", () => {
  it("saves a reference program, applies, interviews, ranks, and matches", () => {
    let state = createEmptyState();
    state = saveReferenceProgram(state, "utoronto-family-medicine");
    expect(state.programs).toHaveLength(1);
    const id = state.programs[0].id;
    state = addApplication(state, id);
    expect(state.programs[0].applicationStatus).toBe("in_progress");
    state = updateProgram(state, id, { invitationStatus: "invited", interviewed: true });
    expect(computeJourneySnapshot(state).status.interviews).not.toBe("not_started");
    state = setRankOrder(state, [id]);
    expect(state.programs[0].rankPosition).toBe(1);
    state = setMatchOutcome(state, {
      status: "matched",
      programId: id,
      recordedAt: "2027-03-02T17:00:00.000Z",
      notes: "",
      nextCycleNotes: "",
    });
    expect(computeJourneySnapshot(state).status.match).toBe("complete");
    expect(computeJourneySnapshot(state).status.residency).toBe("in_progress");
  });

  it("does not let users rewrite official applicability", () => {
    const state = setTargetProvinces(createEmptyState(), ["ON"]);
    const before = state.requirements[0].applicability;
    const next = updateRequirement(state, state.requirements[0].id, { userStatus: "complete" });
    expect(next.requirements[0].applicability).toBe(before);
  });
});

describe("auth hashing and isolation", () => {
  it("never stores plaintext passwords", async () => {
    const hash = await hashPassword("correct horse");
    expect(hash).not.toContain("correct horse");
    expect(await verifyPassword("correct horse", hash)).toBe(true);
    expect(await verifyPassword("wrong", hash)).toBe(false);
  });

  it("does not copy demo progress into empty accounts", () => {
    const empty = createEmptyState();
    expect(empty.profile.displayName).toBe("");
    expect(empty.sessions).toHaveLength(0);
    expect(empty.programs).toHaveLength(0);
    const migrated = migrateToCurrent({ version: 3, profile: { displayName: "Pat" } }, "empty");
    expect(migrated.profile.displayName).toBe("Pat");
    expect(migrated.sessions).toHaveLength(0);
  });
});
