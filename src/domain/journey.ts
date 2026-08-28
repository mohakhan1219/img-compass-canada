import { computeNacReadiness } from "./nac";
import { computeLanguageReadiness, languageNeedsVerification } from "./language";
import { computeProvincialSnapshot, isStaleVerification } from "./requirements";
import { computeCarmsPipeline, rankingConflicts } from "./carms";
import {
  formatIssueHeadline,
  isVerificationHold,
  type JourneyIssue,
} from "./blockers";
import type { AppState, StageStatus } from "./types";
import { JOURNEY_STAGES, type JourneyStageId } from "./stages";

export type JourneyFlags = {
  next: string;
  issues: JourneyIssue[];
};

export type JourneySnapshot = {
  status: Record<JourneyStageId, StageStatus>;
  flags: JourneyFlags;
};

function profileStatus(state: AppState): StageStatus {
  return state.profile.displayName.trim() ? "complete" : "not_started";
}

function mccqe1Status(state: AppState): StageStatus {
  if (state.sessions.some((s) => s.safety === "needs_confirmation")) return "blocked";
  if (state.sessions.some((s) => s.endedAt)) return "in_progress";
  return "not_started";
}

function nacStatus(state: AppState): StageStatus {
  const r = computeNacReadiness(state.nacStations, state.nacAttempts);
  if (r.band === "on_track") return "complete";
  if (state.nacAttempts.length) return "in_progress";
  return "not_started";
}

function languageStatus(state: AppState): StageStatus {
  const r = computeLanguageReadiness(state.languagePlans, state.languageAttempts);
  if (r.band === "needs_verification") return "blocked";
  if (r.band === "not_applicable" || r.band === "on_track") return "complete";
  if (r.band === "building" || r.band === "insufficient_evidence") return "in_progress";
  return "not_started";
}

function provincialStatus(state: AppState): StageStatus {
  if (state.targetProvinceCodes.length === 0) return "not_started";
  const snap = computeProvincialSnapshot(state.requirements, state.targetProvinceCodes);
  if (snap.blockers.length) return "blocked";
  if (snap.verify.length) return "blocked";
  if (snap.incomplete.length === 0 && snap.totalTarget > 0) return "complete";
  return "in_progress";
}

function carmsStatus(state: AppState): StageStatus {
  if (state.programs.length === 0) return "not_started";
  return "in_progress";
}

function applicationsStatus(state: AppState): StageStatus {
  if (state.programs.length === 0) return "not_started";
  if (state.programs.every((p) => p.applicationStatus === "submitted" || p.applicationStatus === "withdrawn")) {
    return "complete";
  }
  if (state.programs.some((p) => p.applicationStatus !== "not_started")) return "in_progress";
  return "not_started";
}

function interviewsStatus(state: AppState): StageStatus {
  const invited = state.programs.some((p) => p.invitationStatus === "invited" || p.interviewed);
  if (state.interviewSessions.length === 0 && !invited) return "not_started";
  if (invited && state.programs.filter((p) => p.invitationStatus === "invited").every((p) => p.interviewed)) {
    return "complete";
  }
  return "in_progress";
}

function rankingStatus(state: AppState): StageStatus {
  if (rankingConflicts(state.programs).length) return "blocked";
  const included = state.programs.filter((p) => p.rankIncluded);
  if (included.length === 0) return "not_started";
  if (included.every((p) => p.rankPosition !== null)) return "complete";
  return "in_progress";
}

function matchStatus(state: AppState): StageStatus {
  if (!state.matchOutcome || state.matchOutcome.status === "awaiting") return "not_started";
  return "complete";
}

export function collectJourneyIssues(state: AppState, nowMs = Date.now()): JourneyIssue[] {
  const issues: JourneyIssue[] = [];
  const provincial = computeProvincialSnapshot(state.requirements, state.targetProvinceCodes, nowMs);
  const nac = computeNacReadiness(state.nacStations, state.nacAttempts);

  if (state.sessions.some((s) => s.safety === "needs_confirmation")) {
    issues.push({
      kind: "administrative_blocker",
      stage: "mccqe1",
      title: "Study session duration needs confirmation.",
      detail: "This is a logging hold (4-hour credit cap), not an exam result.",
      fictional: false,
    });
  }

  if (languageNeedsVerification(state.languagePlans)) {
    issues.push({
      kind: "requirement_uncertain",
      stage: "language",
      title: "Language exam applicability is Unknown or Needs verification.",
      detail:
        "This is not a failed exam. Confirm with the programme or regulator whether OET, IELTS, or CELPIP applies.",
      fictional: false,
    });
  }

  const lang = computeLanguageReadiness(state.languagePlans, state.languageAttempts);
  if (lang.band === "insufficient_evidence" || lang.band === "building") {
    issues.push({
      kind: "performance_gap",
      stage: "language",
      title: "Language scores are still building.",
      detail: lang.rationale.join(" "),
      fictional: false,
    });
  }

  if (nac.band === "building" && nac.meanScore !== null && nac.meanScore < 6) {
    issues.push({
      kind: "performance_gap",
      stage: "nac",
      title: "NAC practice scores are still a gap relative to your own target.",
      detail: "Based only on self-scored stations — not an official NAC result.",
      fictional: true,
    });
  }

  for (const row of provincial.verify) {
    const stale = isStaleVerification(row.lastVerifiedDate, nowMs);
    const uncertain = row.applicability === "unknown" || row.applicability === "needs_verification";
    issues.push({
      kind: stale && !uncertain ? "expired_or_stale_verification" : "requirement_uncertain",
      stage: "provincial",
      title: `${row.provinceCode}: ${row.name}`,
      detail: `Authority: ${row.authority}. Last verified ${row.lastVerifiedDate || "—"}. Version ${row.version}.`,
      fictional: true,
      requirementId: row.id,
    });
  }

  for (const row of provincial.incomplete) {
    if (provincial.verify.some((v) => v.id === row.id)) continue;
    issues.push({
      kind: "incomplete_requirement",
      stage: "provincial",
      title: `${row.provinceCode}: ${row.name}`,
      detail: "User status is not complete. This row is planning data, not a legal finding.",
      fictional: true,
      requirementId: row.id,
    });
  }

  for (const row of provincial.blockers) {
    if (issues.some((i) => i.requirementId === row.id && i.kind === "incomplete_requirement")) continue;
    issues.push({
      kind: "administrative_blocker",
      stage: "provincial",
      title: `${row.provinceCode}: ${row.name}`,
      detail: "Flagged as a pathway blocker in the tracker.",
      fictional: true,
      requirementId: row.id,
    });
  }

  for (const c of rankingConflicts(state.programs)) {
    issues.push({
      kind: "administrative_blocker",
      stage: "ranking",
      title: c,
      detail: "Fix duplicate rank positions in the private list.",
      fictional: false,
    });
  }

  return issues;
}

export function computeJourneySnapshot(state: AppState, nowMs = Date.now()): JourneySnapshot {
  const status: Record<JourneyStageId, StageStatus> = {
    profile: profileStatus(state),
    mccqe1: mccqe1Status(state),
    nac: nacStatus(state),
    language: languageStatus(state),
    provincial: provincialStatus(state),
    carms: carmsStatus(state),
    applications: applicationsStatus(state),
    interviews: interviewsStatus(state),
    ranking: rankingStatus(state),
    match: matchStatus(state),
  };

  const issues = collectJourneyIssues(state, nowMs);
  const pipeline = computeCarmsPipeline(state.programs, state.matchOutcome);
  const firstOpen = JOURNEY_STAGES.find((s) => status[s.id] !== "complete");
  const blocking = firstOpen && status[firstOpen.id] === "blocked";
  const holds = issues.filter((i) => i.stage === firstOpen?.id && isVerificationHold(i.kind));
  const next = firstOpen
    ? blocking && holds.length && holds.length === issues.filter((i) => i.stage === firstOpen.id).length
      ? `Confirm sources on ${firstOpen.label} before treating that stage as complete.`
      : blocking
        ? `Review holds on ${firstOpen.label}.`
        : `Next: ${firstOpen.label}. ${pipeline.nextHint}`
    : "Tracked stages look complete — still confirm official sources.";

  return { status, flags: { next, issues } };
}

export function issuesForStage(issues: JourneyIssue[], stage: string): JourneyIssue[] {
  return issues.filter((i) => i.stage === stage);
}

export { formatIssueHeadline, isVerificationHold };
