export const FICTIONAL_REQUIREMENT_LABEL = "Demo data";

export type BlockerKind =
  | "requirement_uncertain"
  | "incomplete_requirement"
  | "performance_gap"
  | "expired_or_stale_verification"
  | "administrative_blocker";

export const BLOCKER_KIND_LABEL: Record<BlockerKind, string> = {
  requirement_uncertain: "Requirement uncertain",
  incomplete_requirement: "Incomplete requirement",
  performance_gap: "Performance gap",
  expired_or_stale_verification: "Stale or expired verification",
  administrative_blocker: "Administrative hold",
};

/** Uncertain/stale holds are not “you failed”. */
export function isVerificationHold(kind: BlockerKind): boolean {
  return kind === "requirement_uncertain" || kind === "expired_or_stale_verification";
}

export type JourneyIssue = {
  kind: BlockerKind;
  stage: string;
  title: string;
  detail: string;
  fictional: boolean;
  requirementId?: string;
};

export function formatIssueHeadline(issue: JourneyIssue): string {
  return issue.title;
}
