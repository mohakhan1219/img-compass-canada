import type { PathwayRequirement, RequirementApplicability } from "./types";

export const CANADIAN_PROVINCES: { code: string; name: string }[] = [
  { code: "AB", name: "Alberta" },
  { code: "BC", name: "British Columbia" },
  { code: "MB", name: "Manitoba" },
  { code: "NB", name: "New Brunswick" },
  { code: "NL", name: "Newfoundland and Labrador" },
  { code: "NS", name: "Nova Scotia" },
  { code: "NT", name: "Northwest Territories" },
  { code: "NU", name: "Nunavut" },
  { code: "ON", name: "Ontario" },
  { code: "PE", name: "Prince Edward Island" },
  { code: "QC", name: "Quebec" },
  { code: "SK", name: "Saskatchewan" },
  { code: "YT", name: "Yukon" },
];

export const REQUIREMENT_APPLICABILITY: { id: RequirementApplicability; label: string }[] = [
  { id: "required", label: "Required" },
  { id: "not_required", label: "Not required" },
  { id: "applicable", label: "Applicable" },
  { id: "not_applicable", label: "Not applicable" },
  { id: "unknown", label: "Unknown" },
  { id: "needs_verification", label: "Needs verification" },
];

export const FICTIONAL_REQUIREMENT_BANNER =
  "Provincial rows are sample planning data for this portfolio demo. Confirm every requirement with the relevant college or ministry.";

export const STALE_VERIFICATION_DAYS = 180;

export function requirementsForTargets(requirements: PathwayRequirement[], targetCodes: string[]): PathwayRequirement[] {
  const set = new Set(targetCodes);
  return requirements.filter((r) => set.has(r.provinceCode));
}

export function isStaleVerification(lastVerifiedDate: string, nowMs: number): boolean {
  const t = Date.parse(lastVerifiedDate);
  if (!Number.isFinite(t)) return true;
  return nowMs - t > STALE_VERIFICATION_DAYS * 86400_000;
}

export function provincialBlockers(requirements: PathwayRequirement[], targetCodes: string[]): PathwayRequirement[] {
  return requirementsForTargets(requirements, targetCodes).filter(
    (r) => r.blocker && r.userStatus !== "complete" && r.userStatus !== "not_applicable",
  );
}

export function needsVerification(requirements: PathwayRequirement[], targetCodes: string[], nowMs = Date.now()): PathwayRequirement[] {
  return requirementsForTargets(requirements, targetCodes).filter(
    (r) =>
      r.applicability === "unknown" ||
      r.applicability === "needs_verification" ||
      isStaleVerification(r.lastVerifiedDate, nowMs),
  );
}

export function incompleteRequired(requirements: PathwayRequirement[], targetCodes: string[]): PathwayRequirement[] {
  return requirementsForTargets(requirements, targetCodes).filter(
    (r) =>
      (r.applicability === "required" || r.applicability === "applicable") &&
      r.userStatus !== "complete" &&
      r.userStatus !== "not_applicable",
  );
}

export type ProvincialSnapshot = {
  blockers: PathwayRequirement[];
  verify: PathwayRequirement[];
  incomplete: PathwayRequirement[];
  completed: number;
  totalTarget: number;
};

export function computeProvincialSnapshot(
  requirements: PathwayRequirement[],
  targetCodes: string[],
  nowMs = Date.now(),
): ProvincialSnapshot {
  const rows = requirementsForTargets(requirements, targetCodes);
  return {
    blockers: provincialBlockers(requirements, targetCodes),
    verify: needsVerification(requirements, targetCodes, nowMs),
    incomplete: incompleteRequired(requirements, targetCodes),
    completed: rows.filter((r) => r.userStatus === "complete").length,
    totalTarget: rows.length,
  };
}
