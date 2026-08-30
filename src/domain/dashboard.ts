import { MATCH_CYCLES } from "@/reference/match-cycles";
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
export const DASHBOARD_PATH: JourneyStageId[] = [
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
];

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

export type PathTone = "complete" | "current" | "upcoming" | "attention";

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

function toneFor(status: StageStatus, isLead: boolean): PathTone {
  if (status === "blocked" || status === "needs_verification") return "attention";
  if (status === "complete") return "complete";
  if (isLead || status === "in_progress" || status === "waiting") return "current";
  return "upcoming";
}

const STATUS_LABEL: Record<StageStatus, string> = {
  complete: "Completed",
  in_progress: "Current",
  waiting: "Waiting",
  blocked: "Needs attention",
  not_started: "Upcoming",
  needs_verification: "Needs attention",
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
    const tone = toneFor(status, lead === id);
    const statusLabel = verifyOnly ? "Verify" : STATUS_LABEL[status];
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
  const examFocus = leadId === "mccqe1" || leadId === "nac" || leadId === "language";
  return {
    greetingName: greetingName(state.profile.displayName),
    message: next ? `${journey.flags.next}` : journey.flags.next,
    cta: {
      label: examFocus || next?.href.startsWith("/mccqe") || next?.href === "/nac" ? "Continue preparation" : "View next step",
      href: next?.href ?? lead?.href ?? "/journey",
    },
  };
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
  const mccTone: PathTone =
    state.mccqeExam?.status === "complete"
      ? "complete"
      : state.sessions.some((s) => s.safety === "needs_confirmation") || (mccDays != null && mccDays <= 60 && mccDays >= 0)
        ? "attention"
        : state.mccqeExam?.status === "in_progress"
          ? "current"
          : "upcoming";

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
    lang.band === "needs_verification" ? "attention" : lang.band === "on_track" || lang.band === "not_applicable" ? "complete" : "current";

  const saved = state.programs.filter((p) => p.saved !== false);
  const pipeline = computeCarmsPipeline(state.programs, state.matchOutcome);

  return [
    {
      id: "mccqe",
      label: "MCCQE",
      status: mccStatus,
      detail: `${state.sessions.filter((s) => s.endedAt).length} study session${state.sessions.filter((s) => s.endedAt).length === 1 ? "" : "s"} logged`,
      href: "/mccqe1",
      tone: mccTone,
    },
    {
      id: "nac",
      label: "NAC",
      status: nacStatus,
      detail: nac.label,
      href: "/nac",
      tone: nacTone,
    },
    {
      id: "language",
      label: "Language",
      status: lang.label,
      detail: "Confirm acceptance with each program",
      href: "/language",
      tone: langTone,
    },
    {
      id: "programs",
      label: "Program research",
      status: `${saved.length} saved`,
      detail: "Explorer uses CaRMS directory names",
      href: "/programs",
      tone: saved.length > 0 ? "current" : "upcoming",
    },
    {
      id: "applications",
      label: "Applications",
      status: `${pipeline.submitted} submitted · ${pipeline.interviewed} interviewed`,
      detail: `${pipeline.programs} files in tracker`,
      href: "/applications",
      tone: pipeline.submitted > 0 || pipeline.programs > 0 ? "current" : "upcoming",
    },
  ];
}

export type Milestone = { label: string; date: string; href: string };

export function upcomingMilestones(state: AppState, nowMs = Date.now()): Milestone[] {
  const items: Milestone[] = [];
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
    .slice(0, 5);
}

export function programSnapshot(state: AppState) {
  return state.programs
    .filter((p) => p.saved !== false)
    .map((p) => ({
      id: p.id,
      name: p.name,
      specialty: p.specialty,
      provinceCode: p.provinceCode,
      applicationStatus: p.applicationStatus,
    }));
}
