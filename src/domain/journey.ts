import { computeNacReadiness } from "./nac";
import { computeLanguageReadiness, languageNeedsVerification } from "./language";
import { computeProvincialSnapshot, isStaleVerification } from "./requirements";
import { computeCarmsPipeline, rankingConflicts } from "./carms";
import { overallCompleteness } from "./profile-completeness";
import { formatIssueHeadline, isVerificationHold, type JourneyIssue } from "./blockers";
import type { AppState, StageStatus } from "./types";
import { JOURNEY_STAGES, type JourneyStageId } from "./stages";

export type JourneyFlags = {
  next: string;
  issues: JourneyIssue[];
  currentLabel: string;
  attention: string;
};

export type JourneySnapshot = {
  status: Record<JourneyStageId, StageStatus>;
  flags: JourneyFlags;
  completedCount: number;
};

function profileStatus(state: AppState): StageStatus {
  if (!state.profile.onboardingComplete && !state.profile.displayName.trim()) return "not_started";
  const c = overallCompleteness(state.profile);
  if (c.filled === c.total) return "complete";
  if (state.profile.displayName.trim()) return "in_progress";
  return "not_started";
}

function credentialsStatus(state: AppState): StageStatus {
  const rows = state.credentials ?? [];
  if (!rows.length) return "not_started";
  if (rows.some((c) => c.status === "needs_verification")) return "needs_verification";
  if (rows.filter((c) => c.status === "complete").length >= 3) return "complete";
  if (rows.some((c) => c.status && c.status !== "not_started")) return "in_progress";
  return "not_started";
}

function mccqe1Status(state: AppState): StageStatus {
  if (state.sessions.some((s) => s.safety === "needs_confirmation")) return "blocked";
  if (state.mccqeExam?.status === "complete") return "complete";
  if (state.mccqeExam?.status === "waiting") return "waiting";
  if (state.mccqeExam?.status === "in_progress" || state.sessions.some((s) => s.endedAt)) return "in_progress";
  return "not_started";
}

function nacStatus(state: AppState): StageStatus {
  if (state.nacExam?.status === "complete") return "complete";
  if (state.nacExam?.status === "waiting") return "waiting";
  if (state.nacExam?.status === "in_progress" || state.nacAttempts.length) return "in_progress";
  return "not_started";
}

function languageStatus(state: AppState): StageStatus {
  const r = computeLanguageReadiness(state.languagePlans, state.languageAttempts);
  if (r.band === "needs_verification") return "needs_verification";
  if (r.band === "not_applicable" || r.band === "on_track") return "complete";
  if (r.band === "building" || r.band === "insufficient_evidence") return "in_progress";
  return "not_started";
}

function provincialStatus(state: AppState): StageStatus {
  if (state.targetProvinceCodes.length === 0) return "not_started";
  const snap = computeProvincialSnapshot(state.requirements, state.targetProvinceCodes);
  if (snap.blockers.length) return "blocked";
  if (snap.verify.length) return "needs_verification";
  if (snap.incomplete.length === 0 && snap.totalTarget > 0) return "complete";
  return "in_progress";
}

function programsStatus(state: AppState): StageStatus {
  const saved = state.programs.filter((p) => p.saved !== false);
  if (saved.length === 0) return "not_started";
  return "in_progress";
}

function carmsStatus(state: AppState): StageStatus {
  if (!state.profile.targetMatchCycleId) return "not_started";
  if (state.carmsPhase && state.carmsPhase !== "registration") return "in_progress";
  if (state.programs.length === 0) return "not_started";
  return "in_progress";
}

function applicationsStatus(state: AppState): StageStatus {
  const apps = state.programs.filter((p) => p.applicationStatus !== "not_started" || p.saved);
  if (state.programs.length === 0) return "not_started";
  if (state.programs.every((p) => p.applicationStatus === "submitted" || p.applicationStatus === "withdrawn")) {
    return "complete";
  }
  if (state.programs.some((p) => p.applicationStatus !== "not_started")) return "in_progress";
  return apps.length ? "in_progress" : "not_started";
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

function residencyStatus(state: AppState): StageStatus {
  if (state.matchOutcome?.status !== "matched") return "not_started";
  const tasks = state.onboardingTasks ?? [];
  if (tasks.length && tasks.every((t) => t.status === "complete" || t.status === "not_required")) return "complete";
  return "in_progress";
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
        "This is not a failed exam. Confirm with the programme or regulator whether a given test applies.",
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
      fictional: false,
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
      fictional: row.fictional,
      requirementId: row.id,
    });
  }

  for (const row of provincial.incomplete) {
    if (provincial.verify.some((v) => v.id === row.id)) continue;
    issues.push({
      kind: "incomplete_requirement",
      stage: "provincial",
      title: `${row.provinceCode}: ${row.name}`,
      detail: "Personal tracking status is not complete. This is not a legal finding.",
      fictional: row.fictional,
      requirementId: row.id,
    });
  }

  for (const row of provincial.blockers) {
    if (issues.some((i) => i.requirementId === row.id && i.kind === "incomplete_requirement")) continue;
    issues.push({
      kind: "administrative_blocker",
      stage: "provincial",
      title: `${row.provinceCode}: ${row.name}`,
      detail: "Flagged as a personal pathway blocker in the tracker.",
      fictional: row.fictional,
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
    credentials: credentialsStatus(state),
    mccqe1: mccqe1Status(state),
    nac: nacStatus(state),
    language: languageStatus(state),
    provincial: provincialStatus(state),
    programs: programsStatus(state),
    carms: carmsStatus(state),
    applications: applicationsStatus(state),
    interviews: interviewsStatus(state),
    ranking: rankingStatus(state),
    match: matchStatus(state),
    residency: residencyStatus(state),
  };

  const issues = collectJourneyIssues(state, nowMs);
  const pipeline = computeCarmsPipeline(state.programs, state.matchOutcome);
  const firstOpen = JOURNEY_STAGES.find((s) => status[s.id] !== "complete");
  const blocking = firstOpen && (status[firstOpen.id] === "blocked" || status[firstOpen.id] === "needs_verification");
  const holds = issues.filter((i) => i.stage === firstOpen?.id && isVerificationHold(i.kind));
  const next = firstOpen
    ? blocking && holds.length && holds.length === issues.filter((i) => i.stage === firstOpen.id).length
      ? `Confirm official sources on ${firstOpen.label} before treating that stage as complete.`
      : blocking
        ? `Review holds on ${firstOpen.label}.`
        : `Next: ${firstOpen.label}. ${pipeline.nextHint}`
    : "Tracked stages look complete — still confirm official sources.";

  const currentLabel = firstOpen?.label ?? "Journey complete";
  const attention =
    issues.find((i) => i.kind === "administrative_blocker")?.title ??
    issues.find((i) => isVerificationHold(i.kind))?.title ??
    "No personal attention items recorded.";

  const completedCount = JOURNEY_STAGES.filter((s) => status[s.id] === "complete").length;
  return {
    status,
    flags: { next, issues, currentLabel, attention },
    completedCount,
  };
}

export function issuesForStage(issues: JourneyIssue[], stage: string): JourneyIssue[] {
  return issues.filter((i) => i.stage === stage);
}

export type NextAction = { href: string; title: string; detail: string };

export function deriveNextActions(state: AppState, nowMs = Date.now()): NextAction[] {
  const snap = computeJourneySnapshot(state, nowMs);
  const actions: NextAction[] = [];
  if (!state.profile.onboardingComplete) {
    actions.push({ href: "/onboarding", title: "Finish onboarding", detail: "Build a personalized path from your profile." });
  }
  if (state.sessions.some((s) => s.safety === "needs_confirmation")) {
    actions.push({ href: "/mccqe1", title: "Confirm a study session over the time cap", detail: "Logging hold — not an MCC result." });
  }
  if (state.mccqeExam?.scheduledDate) {
    const days = Math.ceil((Date.parse(state.mccqeExam.scheduledDate) - nowMs) / 86400_000);
    if (days >= 0 && days <= 60) {
      actions.push({ href: "/mccqe1", title: `MCCQE — ${days} day${days === 1 ? "" : "s"}`, detail: "Personal exam date you recorded." });
    }
  }
  if (state.nacExam?.status !== "complete" && state.profile.nacExamStatus !== "complete") {
    actions.push({ href: "/nac", title: "NAC not completed", detail: "Update exam status or practise stations." });
  }
  if (snap.status.provincial === "needs_verification" || snap.status.provincial === "blocked") {
    actions.push({
      href: "/provincial",
      title: `${state.targetProvinceCodes.length || 0} selected province(s) need verification`,
      detail: "Confirm each requirement with the official authority.",
    });
  }
  if (state.programs.filter((p) => p.saved).length === 0) {
    actions.push({ href: "/programs", title: "Save programs to research", detail: "Program Explorer uses real faculties, not invented names." });
  }
  if (state.matchOutcome?.status === "unmatched") {
    actions.push({ href: "/match", title: "Plan second iteration or next cycle", detail: "Unmatched is not a dead end in this tracker." });
  }
  if (state.matchOutcome?.status === "matched") {
    actions.push({ href: "/residency", title: "Start residency onboarding tasks", detail: "Track licensing and relocation yourself." });
  }
  return actions.slice(0, 5);
}

export { formatIssueHeadline, isVerificationHold };
