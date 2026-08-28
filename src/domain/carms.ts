import type { ApplicationStatus, CarmsProgram, MatchOutcome } from "./types";

const APP_RANK: Record<ApplicationStatus, number> = {
  not_started: 0,
  in_progress: 1,
  submitted: 2,
  withdrawn: 0,
};

export function applicationStageRank(status: ApplicationStatus): number {
  return APP_RANK[status];
}

export function submittedPrograms(programs: CarmsProgram[]): CarmsProgram[] {
  return programs.filter((p) => p.applicationStatus === "submitted");
}

export function invitedPrograms(programs: CarmsProgram[]): CarmsProgram[] {
  return programs.filter((p) => p.invitationStatus === "invited");
}

export function rankedPrograms(programs: CarmsProgram[]): CarmsProgram[] {
  return programs
    .filter((p) => p.rankIncluded && p.rankPosition !== null)
    .sort((a, b) => (a.rankPosition ?? 99) - (b.rankPosition ?? 99));
}

export function rankingConflicts(programs: CarmsProgram[]): string[] {
  const included = rankedPrograms(programs);
  const positions = included.map((p) => p.rankPosition);
  const dup = positions.filter((n, i) => n !== null && positions.indexOf(n) !== i);
  if (dup.length) return ["Duplicate rank positions — each included programme needs a unique order."];
  return [];
}

export function documentsComplete(program: CarmsProgram): boolean {
  const checklistDone = program.documents.every((d) => d.status === "complete" || d.status === "not_required");
  return (
    checklistDone &&
    (program.cvStatus === "complete" || program.cvStatus === "not_required") &&
    (program.letterStatus === "complete" || program.letterStatus === "not_required") &&
    (program.referencesStatus === "complete" || program.referencesStatus === "not_required")
  );
}

export function applicationTrackProgress(program: CarmsProgram): { done: number; total: number } {
  const items = [
    program.cvStatus === "complete" || program.cvStatus === "not_required",
    program.letterStatus === "complete" || program.letterStatus === "not_required",
    program.referencesStatus === "complete" || program.referencesStatus === "not_required",
    program.applicationStatus === "submitted",
  ];
  return { done: items.filter(Boolean).length, total: items.length };
}

export type PipelineStep = { id: string; label: string; done: boolean };

export function programPipelineSteps(program: CarmsProgram): PipelineStep[] {
  return [
    { id: "saved", label: "Saved", done: true },
    { id: "documents", label: "Documents", done: documentsComplete(program) },
    { id: "submitted", label: "Submitted", done: program.applicationStatus === "submitted" },
    { id: "invited", label: "Invited", done: program.invitationStatus === "invited" },
    { id: "interviewed", label: "Interviewed", done: program.interviewed },
    { id: "ranked", label: "Ranked", done: Boolean(program.rankIncluded && program.rankPosition !== null) },
  ];
}

export function approachingDeadlines(programs: CarmsProgram[], nowMs = Date.now(), withinDays = 90): CarmsProgram[] {
  return programs.filter((p) => {
    const t = Date.parse(p.deadline);
    if (!Number.isFinite(t)) return false;
    const days = (t - nowMs) / 86_400_000;
    return days >= 0 && days <= withinDays;
  });
}

export type CarmsPipeline = {
  programs: number;
  submitted: number;
  invited: number;
  interviewed: number;
  ranked: number;
  nextHint: string;
};

export function computeCarmsPipeline(programs: CarmsProgram[], match: MatchOutcome | null): CarmsPipeline {
  const submitted = submittedPrograms(programs).length;
  const invited = invitedPrograms(programs).length;
  const interviewed = programs.filter((p) => p.interviewed).length;
  const ranked = rankedPrograms(programs).length;
  let nextHint = "Add a programme to the tracker.";
  if (programs.length && submitted === 0) nextHint = "Finish a document checklist and mark an application submitted.";
  else if (submitted && invited === 0) nextHint = "Log interview invitations when they arrive.";
  else if (invited && interviewed === 0) nextHint = "Record interviews after they happen.";
  else if (interviewed && ranked === 0) nextHint = "Build a private rank-order list.";
  else if (ranked && (!match || match.status === "awaiting")) nextHint = "Record match day when results are public.";
  else if (match?.status === "matched") nextHint = "Match recorded.";
  else if (match?.status === "unmatched") nextHint = "Unmatched recorded — review leftover options.";

  return { programs: programs.length, submitted, invited, interviewed, ranked, nextHint };
}
