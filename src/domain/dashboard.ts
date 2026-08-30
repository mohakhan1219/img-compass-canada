import { MATCH_CYCLES } from "@/reference/match-cycles";
import { institutionById } from "@/reference/institutions";
import { computeCarmsPipeline } from "@/domain/carms";
import {
  computeJourneySnapshot,
  issuesForStage,
  isVerificationHold,
  type NextAction,
} from "@/domain/journey";
import { computeLanguageReadiness } from "@/domain/language";
import { computeNacReadiness } from "@/domain/nac";
import { overallCompleteness } from "@/domain/profile-completeness";
import { JOURNEY_STAGES, type JourneyStageId } from "@/domain/stages";
import type { AppState, StageStatus } from "@/domain/types";

/** Dashboard journey path (residency stays on My Journey). */
export const DASHBOARD_PATH = [
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
] as const satisfies readonly JourneyStageId[];

const PATH_LABEL: Record<(typeof DASHBOARD_PATH)[number], string> = {
  profile: "Profile",
  credentials: "Credentials",
  mccqe1: "MCCQE",
  nac: "NAC",
  language: "Language",
  provincial: "Provinces",
  programs: "Programs",
  carms: "CaRMS",
  applications: "Applications",
  interviews: "Interviews",
  ranking: "Ranking",
  match: "Match",
};

export type PathTone = "complete" | "current" | "upcoming" | "verify" | "blocked";

export const JOURNEY_PHASES = [
  { id: "foundation", label: "Foundation", ids: ["profile", "credentials"] },
  { id: "prepare", label: "Prepare", ids: ["mccqe1", "nac", "language"] },
  { id: "explore", label: "Explore", ids: ["provincial", "programs"] },
  { id: "apply", label: "Apply", ids: ["carms", "applications", "interviews"] },
  { id: "match", label: "Match", ids: ["ranking", "match"] },
] as const;

export type PathStep = {
  id: JourneyStageId;
  label: string;
  href: string;
  tone: PathTone;
  statusLabel: string;
};

function firstOpenOnPath(status: Record<JourneyStageId, StageStatus>): JourneyStageId | undefined {
  return DASHBOARD_PATH.find((id) => status[id] !== "complete");
}

function toneFor(status: StageStatus, isLead: boolean, id: JourneyStageId): PathTone {
  if (status === "complete") return "complete";
  if (status === "needs_verification") return "verify";
  if (status === "blocked") return id === "ranking" ? "blocked" : "verify";
  if (isLead || status === "in_progress" || status === "waiting") return "current";
  return "upcoming";
}

const STATUS_LABEL: Record<StageStatus, string> = {
  complete: "Completed",
  in_progress: "In progress",
  waiting: "Waiting",
  blocked: "Hold",
  not_started: "Upcoming",
  needs_verification: "Verify",
};

export function dashboardPathStatuses(state: AppState): PathStep[] {
  const journey = computeJourneySnapshot(state);
  const lead = firstOpenOnPath(journey.status);
  return DASHBOARD_PATH.map((id) => {
    const def = JOURNEY_STAGES.find((s) => s.id === id)!;
    const status = journey.status[id];
    const issues = issuesForStage(journey.flags.issues, id);
    const verifyOnly =
      (status === "blocked" || status === "needs_verification") &&
      issues.length > 0 &&
      issues.every((x) => isVerificationHold(x.kind));
    const tone = toneFor(status, lead === id, id);
    const statusLabel = verifyOnly || tone === "verify" ? "Verify" : STATUS_LABEL[status];
    return { id, label: PATH_LABEL[id], href: def.href, tone, statusLabel };
  });
}

function greetingName(displayName: string): string {
  const stripped = displayName.replace(/^Dr\.\s+/i, "").trim();
  return stripped.split(/\s+/)[0] || "there";
}

export function welcomeContext(
  state: AppState,
): { greetingName: string; message: string; cta: { label: string; href: string } } {
  const journey = computeJourneySnapshot(state);
  const leadId = firstOpenOnPath(journey.status);
  const lead = JOURNEY_STAGES.find((s) => s.id === leadId);
  const priorities = deriveDashboardPriorities(state);
  const next = priorities[0];
  const currentLabel = lead?.label ?? journey.flags.currentLabel;
  const message = next
    ? `${currentLabel} is in focus. Next: ${next.title}.`
    : journey.flags.next;
  return {
    greetingName: greetingName(state.profile.displayName),
    message,
    cta: {
      label: "Continue preparation",
      href: next?.href ?? lead?.href ?? "/journey",
    },
  };
}

export function dashboardCompletion(state: AppState): { completed: number; total: number; percent: number } {
  const steps = dashboardPathStatuses(state);
  const completed = steps.filter((s) => s.tone === "complete").length;
  const total = steps.length;
  return { completed, total, percent: total ? Math.round((completed / total) * 100) : 0 };
}

export function deriveDashboardPriorities(state: AppState, nowMs = Date.now()): NextAction[] {
  const snap = computeJourneySnapshot(state, nowMs);
  const out: NextAction[] = [];
  const profile = overallCompleteness(state.profile);
  if (profile.filled < profile.total) {
    out.push({
      href: "/profile",
      title: "Complete profile information",
      detail: `${profile.label}. Missing sections change which later steps apply.`,
    });
  }

  const sessionHold = state.sessions.some((s) => s.safety === "needs_confirmation");
  if (state.mccqeExam?.scheduledDate || state.mccqeExam?.status === "in_progress" || sessionHold) {
    const days = state.mccqeExam?.scheduledDate
      ? Math.ceil((Date.parse(state.mccqeExam.scheduledDate) - nowMs) / 86_400_000)
      : null;
    const dateBit =
      days != null && Number.isFinite(days)
        ? days >= 0
          ? `MCCQE1 is ${days} day${days === 1 ? "" : "s"} away on the date you recorded.`
          : "The recorded MCCQE date has passed — update the tracker if needed."
        : "Keep logging focused study against official MCC resources only.";
    out.push({
      href: "/mccqe1",
      title: "Continue MCCQE preparation",
      detail: sessionHold ? `${dateBit} A study session is waiting for a time-cap confirmation.` : dateBit,
    });
  }

  if (snap.status.provincial === "blocked" || snap.status.provincial === "needs_verification") {
    out.push({
      href: "/provincial",
      title: "Review eligibility requirements",
      detail: "Confirm each provincial item with the college or CaRMS — this tracker is not a ruling.",
    });
  }

  if (state.nacExam?.status !== "complete" && state.profile.nacExamStatus !== "complete") {
    out.push({
      href: "/nac",
      title: "Prepare for NAC",
      detail: "Practice stations are logged here. Confirm exam logistics on physiciansapply.ca.",
    });
  }

  const saved = state.programs.filter((p) => p.saved !== false).length;
  if (saved < 5) {
    out.push({
      href: "/programs",
      title: "Research and save programs",
      detail:
        saved === 0
          ? "Open Program Explorer and save faculties you intend to verify on CaRMS."
          : `${saved} saved. Add research notes before ranking season.`,
    });
  }

  if (state.programs.some((p) => p.applicationStatus === "in_progress" || p.applicationStatus === "submitted")) {
    out.push({
      href: "/applications",
      title: "Review application files",
      detail: "Statuses here are personal tracking, not CaRMS submissions.",
    });
  }

  return out.slice(0, 3);
}

export type ReadinessCard = {
  id: string;
  label: string;
  status: string;
  detail: string;
  href: string;
  tone: PathTone;
  progress: number;
};

export function readinessCards(state: AppState, nowMs = Date.now()): ReadinessCard[] {
  const mccDays = state.mccqeExam?.scheduledDate
    ? Math.ceil((Date.parse(state.mccqeExam.scheduledDate) - nowMs) / 86_400_000)
    : null;
  const mccStatus =
    state.mccqeExam?.status === "complete"
      ? "Complete"
      : state.mccqeExam?.scheduledDate
        ? `Scheduled${mccDays != null && mccDays >= 0 ? ` · ${mccDays}d` : ""}`
        : state.mccqeExam?.status === "in_progress"
          ? "In progress"
          : "Not scheduled";
  const endedSessions = state.sessions.filter((s) => s.endedAt).length;
  const mccTone: PathTone =
    state.mccqeExam?.status === "complete"
      ? "complete"
      : state.sessions.some((s) => s.safety === "needs_confirmation")
        ? "verify"
        : state.mccqeExam?.status === "in_progress"
          ? "current"
          : "upcoming";
  const mccProgress =
    state.mccqeExam?.status === "complete" ? 100 : Math.min(90, 20 + endedSessions * 18);

  const nac = computeNacReadiness(state.nacStations, state.nacAttempts);
  const nacTone: PathTone =
    state.nacExam?.status === "complete" ? "complete" : nac.attempts > 0 || state.nacExam?.status === "in_progress" ? "current" : "upcoming";
  const nacStatus =
    state.nacExam?.status === "complete"
      ? "Complete"
      : state.nacExam?.scheduledDate
        ? `Scheduled · ${state.nacExam.scheduledDate.slice(0, 10)}`
        : nac.attempts > 0
          ? `${nac.attempts} practice attempt${nac.attempts === 1 ? "" : "s"}`
          : "Not started";

  const lang = computeLanguageReadiness(state.languagePlans, state.languageAttempts);
  const langTone: PathTone =
    lang.band === "needs_verification" ? "verify" : lang.band === "on_track" || lang.band === "not_applicable" ? "complete" : "current";
  const langProgress =
    lang.band === "on_track" || lang.band === "not_applicable" ? 100 : lang.band === "building" ? 55 : lang.band === "needs_verification" ? 40 : 25;
  const saved = state.programs.filter((p) => p.saved !== false);
  const pipeline = computeCarmsPipeline(state.programs, state.matchOutcome);
  const nacProgress =
    state.nacExam?.status === "complete" ? 100 : Math.min(90, nac.attempts * 18);
  const appProgress = pipeline.programs ? Math.round((pipeline.submitted / pipeline.programs) * 100) : 0;

  return [
    {
      id: "mccqe",
      label: "MCCQE",
      status: mccStatus,
      detail: `${endedSessions} study session${endedSessions === 1 ? "" : "s"} logged`,
      href: "/mccqe1",
      tone: mccTone,
      progress: mccProgress,
    },
    {
      id: "nac",
      label: "NAC",
      status: nacStatus,
      detail: nac.label,
      href: "/nac",
      tone: nacTone,
      progress: nacProgress,
    },
    {
      id: "language",
      label: "Language",
      status: lang.label,
      detail: "Confirm acceptance with each program",
      href: "/language",
      tone: langTone,
      progress: langProgress,
    },
    {
      id: "programs",
      label: "Program research",
      status: `${saved.length} saved`,
      detail: "Explorer uses CaRMS directory names",
      href: "/programs",
      tone: saved.length > 0 ? "current" : "upcoming",
      progress: Math.min(100, saved.length * 25),
    },
    {
      id: "applications",
      label: "Applications",
      status: `${pipeline.submitted} submitted · ${pipeline.interviewed} interviewed`,
      detail: `${pipeline.programs} files in tracker`,
      href: "/applications",
      tone: pipeline.submitted > 0 || pipeline.programs > 0 ? "current" : "upcoming",
      progress: appProgress,
    },
  ];
}

export type Milestone = { label: string; date: string; href: string; relative: string };

export function relativeTiming(iso: string, nowMs = Date.now()): string {
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return "";
  const days = Math.round((t - nowMs) / 86_400_000);
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days > 1 && days < 14) return `In ${days} days`;
  if (days >= 14 && days < 60) return `In ${Math.round(days / 7)} weeks`;
  if (days >= 60) return `In ${Math.round(days / 30)} months`;
  if (days === -1) return "Yesterday";
  return `${Math.abs(days)} days ago`;
}

export function upcomingMilestones(state: AppState, nowMs = Date.now()): Milestone[] {
  const items: Array<Omit<Milestone, "relative">> = [];
  if (state.mccqeExam?.scheduledDate) {
    items.push({
      label: "MCCQE (personal date)",
      date: state.mccqeExam.scheduledDate,
      href: "/mccqe1",
    });
  }
  if (state.nacExam?.scheduledDate) {
    items.push({ label: "NAC (personal date)", date: state.nacExam.scheduledDate, href: "/nac" });
  }
  for (const plan of state.languagePlans) {
    if (plan.testDate) {
      items.push({ label: `${plan.examKind.replaceAll("_", " ")} (personal)`, date: plan.testDate, href: "/language" });
    }
  }
  for (const p of state.programs) {
    if (p.interviewAt) items.push({ label: `Interview · ${p.name}`, date: p.interviewAt, href: "/interviews" });
    if (p.deadline) items.push({ label: `Deadline · ${p.name}`, date: p.deadline, href: "/applications" });
  }
  const cycle = MATCH_CYCLES.find((c) => c.id === state.profile.targetMatchCycleId);
  if (cycle) {
    for (const ev of cycle.events) {
      if (Date.parse(ev.occursOn) >= nowMs) {
        items.push({ label: ev.label, date: ev.occursOn, href: "/carms" });
      }
    }
  }
  return items
    .filter((m) => Number.isFinite(Date.parse(m.date)))
    .sort((a, b) => Date.parse(a.date) - Date.parse(b.date))
    .slice(0, 5)
    .map((m) => ({ ...m, relative: relativeTiming(m.date, nowMs) }));
}

export function programSnapshot(state: AppState) {
  return state.programs
    .filter((p) => p.saved !== false)
    .map((p) => ({
      id: p.id,
      name: p.name,
      institution: institutionById(p.institutionId)?.name ?? p.name,
      specialty: p.specialty,
      provinceCode: p.provinceCode,
      applicationStatus: p.applicationStatus,
    }));
}
