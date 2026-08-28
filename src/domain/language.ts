import type { LanguageApplicability, LanguageAttempt, LanguageExamKind, LanguagePlan } from "./types";

export const LANGUAGE_EXAMS: { id: LanguageExamKind; label: string }[] = [
  { id: "oet_medicine", label: "OET Medicine" },
  { id: "ielts_academic", label: "IELTS Academic" },
  { id: "celpip", label: "CELPIP" },
];

export const LANGUAGE_APPLICABILITY: { id: LanguageApplicability; label: string }[] = [
  { id: "required", label: "Required" },
  { id: "not_required", label: "Not required" },
  { id: "unknown", label: "Unknown" },
  { id: "needs_verification", label: "Needs verification" },
];

export function languageNeedsVerification(plans: LanguagePlan[]): boolean {
  return plans.some((p) => p.applicability === "unknown" || p.applicability === "needs_verification");
}

export function languageMarkedRequired(plans: LanguagePlan[]): boolean {
  return plans.some((p) => p.applicability === "required");
}

export type LanguageReadiness = {
  band: "not_applicable" | "needs_verification" | "insufficient_evidence" | "building" | "on_track";
  label: string;
  rationale: string[];
};

export function computeLanguageReadiness(plans: LanguagePlan[], attempts: LanguageAttempt[]): LanguageReadiness {
  const rationale: string[] = [];
  if (languageNeedsVerification(plans)) {
    rationale.push("One or more exams are Unknown or Needs verification — confirm with the programme or regulator.");
    return { band: "needs_verification", label: "Needs verification", rationale };
  }

  if (!languageMarkedRequired(plans)) {
    rationale.push("No language exam is marked Required in this plan. That is a user classification, not a national rule.");
    return { band: "not_applicable", label: "Not marked required", rationale };
  }

  const requiredKinds = new Set(plans.filter((p) => p.applicability === "required").map((p) => p.examKind));
  const relevant = attempts.filter((a) => requiredKinds.has(a.examKind));
  if (relevant.length < 4) {
    rationale.push("Log practice across reading, writing, listening, and speaking before estimating readiness.");
    return { band: "insufficient_evidence", label: "Insufficient evidence", rationale };
  }

  const skills = new Set(relevant.map((a) => a.skill));
  rationale.push(`${relevant.length} practice attempts on exams marked Required.`);
  if (skills.size >= 4) {
    return { band: "on_track", label: "On track", rationale };
  }
  rationale.push("Not all four skills have been practised yet.");
  return { band: "building", label: "Building evidence", rationale };
}
