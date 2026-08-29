import type { RequirementApplicability } from "@/domain/types";
import type { SourceStatus } from "./official-sources";

export type ReferenceRequirement = {
  id: string;
  provinceCode: string;
  category: string;
  name: string;
  applicability: RequirementApplicability;
  authority: string;
  sourceUrl: string;
  effectiveDate: string;
  lastVerifiedDate: string;
  version: string;
  notes: string;
  sourceStatus: SourceStatus;
};

const VERIFIED = "2026-08-28";

function r(
  partial: Omit<ReferenceRequirement, "effectiveDate" | "lastVerifiedDate" | "version" | "sourceStatus"> & {
    sourceStatus?: SourceStatus;
  },
): ReferenceRequirement {
  return {
    effectiveDate: "2026-01-01",
    lastVerifiedDate: VERIFIED,
    version: "2026.ref",
    sourceStatus: partial.sourceStatus ?? "needs_review",
    ...partial,
  };
}

/**
 * High-level planning notes with official landing pages.
 * Not converted into 2027 eligibility determinations.
 */
export const REFERENCE_REQUIREMENTS: ReferenceRequirement[] = [
  r({
    id: "on-legal-status",
    provinceCode: "ON",
    category: "Citizenship / legal status",
    name: "Confirm citizenship or legal status accepted by programs",
    applicability: "needs_verification",
    authority: "CaRMS / CPSO",
    sourceUrl: "https://www.carms.ca/match/r-1-main-residency-match/",
    notes: "CaRMS publishes proof-of-status options. Confirm with each Ontario program description when 2027 listings open.",
  }),
  r({
    id: "on-exams",
    provinceCode: "ON",
    category: "Exams",
    name: "MCC examinations typically referenced by IMG applicants",
    applicability: "needs_verification",
    authority: "MCC",
    sourceUrl: "https://mcc.ca/examinations/",
    notes: "Track MCCQE Part I and NAC against current program and provincial statements. Do not treat this row as a legal finding.",
  }),
  r({
    id: "on-language",
    provinceCode: "ON",
    category: "Language",
    name: "Language evidence if required by program or college",
    applicability: "needs_verification",
    authority: "CPSO",
    sourceUrl: "https://www.cpso.on.ca/",
    notes: "Language rules vary by registration class and program. Confirm on the college and CaRMS pages.",
  }),
  r({
    id: "on-img-route",
    provinceCode: "ON",
    category: "IMG pathway",
    name: "Ontario IMG residency application route",
    applicability: "applicable",
    authority: "CaRMS / University PGME",
    sourceUrl: "https://www.carms.ca/match/r-1-main-residency-match/",
    notes: "Ontario has multiple faculties. Confirm IMG stream availability per institution when 2027 descriptions are published.",
    sourceStatus: "current",
  }),
  r({
    id: "on-return",
    provinceCode: "ON",
    category: "Return of service",
    name: "Return-of-service obligations (if any)",
    applicability: "needs_verification",
    authority: "Ontario Ministry of Health",
    sourceUrl: "https://www.ontario.ca/page/ministry-health",
    notes: "Some funded positions carry return-of-service. Confirm on the current program description — do not assume.",
  }),
  r({
    id: "ab-legal",
    provinceCode: "AB",
    category: "Citizenship / legal status",
    name: "Confirm legal status accepted by Alberta programs",
    applicability: "needs_verification",
    authority: "CPSA / CaRMS",
    sourceUrl: "https://www.cpsa.ca/",
    notes: "Confirm with CPSA registration pages and 2027 CaRMS descriptions.",
  }),
  r({
    id: "ab-exams",
    provinceCode: "AB",
    category: "Exams",
    name: "MCC examination requirements referenced for IMG applicants",
    applicability: "needs_verification",
    authority: "MCC",
    sourceUrl: "https://mcc.ca/examinations/",
    notes: "Verify MCCQE and NAC expectations on current Alberta PGME and CaRMS pages.",
  }),
  r({
    id: "ab-apg",
    provinceCode: "AB",
    category: "Provincial assessment",
    name: "Practice-ready / alternative assessment (if exploring PRA)",
    applicability: "needs_verification",
    authority: "CPSA",
    sourceUrl: "https://www.cpsa.ca/",
    notes: "Alberta practice-ready routes are separate from CaRMS R-1. Confirm on CPSA before treating as a plan.",
  }),
  r({
    id: "bc-legal",
    provinceCode: "BC",
    category: "Citizenship / legal status",
    name: "Confirm legal status accepted by BC programs",
    applicability: "needs_verification",
    authority: "CPSBC / CaRMS",
    sourceUrl: "https://www.cpsbc.ca/",
    notes: "Confirm on CPSBC and CaRMS. Compass does not determine eligibility.",
  }),
  r({
    id: "bc-exams",
    provinceCode: "BC",
    category: "Exams",
    name: "MCC examinations typically referenced by IMG applicants",
    applicability: "needs_verification",
    authority: "MCC",
    sourceUrl: "https://mcc.ca/examinations/",
    notes: "Confirm MCCQE Part I and NAC against 2027 BC program descriptions.",
  }),
  r({
    id: "bc-language",
    provinceCode: "BC",
    category: "Language",
    name: "Language evidence if required",
    applicability: "needs_verification",
    authority: "CPSBC",
    sourceUrl: "https://www.cpsbc.ca/",
    notes: "Do not assume a specific test is accepted until the college or program says so.",
  }),
  r({
    id: "mb-pgme",
    provinceCode: "MB",
    category: "IMG pathway",
    name: "Manitoba R-1 via University of Manitoba PGME",
    applicability: "applicable",
    authority: "University of Manitoba PGME",
    sourceUrl: "https://umanitoba.ca/medicine/postgraduate-medical-education",
    notes: "Single R-1 faculty in this catalog. Confirm IMG streams on CaRMS when descriptions are posted.",
    sourceStatus: "current",
  }),
  r({
    id: "sk-pgme",
    provinceCode: "SK",
    category: "IMG pathway",
    name: "Saskatchewan R-1 via University of Saskatchewan PGME",
    applicability: "applicable",
    authority: "University of Saskatchewan PGME",
    sourceUrl: "https://medicine.usask.ca/pgme/",
    notes: "Confirm IMG eligibility and return-of-service on current official pages.",
    sourceStatus: "current",
  }),
  r({
    id: "qc-lang",
    provinceCode: "QC",
    category: "Language",
    name: "French language expectations for Quebec practice/training",
    applicability: "needs_verification",
    authority: "CMQ",
    sourceUrl: "https://www.cmq.org/",
    notes: "Quebec registration often involves French. Confirm current CMQ and faculty requirements — Compass does not certify language sufficiency.",
  }),
  r({
    id: "qc-pgme",
    provinceCode: "QC",
    category: "IMG pathway",
    name: "Quebec faculties participating in CaRMS R-1",
    applicability: "applicable",
    authority: "CaRMS",
    sourceUrl: "https://www.carms.ca/match/r-1-main-residency-match/",
    notes: "Laval, Sherbrooke, Montréal, and McGill are listed as participating faculties. Confirm streams individually.",
    sourceStatus: "current",
  }),
  r({
    id: "nl-pgme",
    provinceCode: "NL",
    category: "IMG pathway",
    name: "Newfoundland and Labrador R-1 via Memorial University",
    applicability: "applicable",
    authority: "Memorial University PGME",
    sourceUrl: "https://www.mun.ca/medicine/pgme/",
    notes: "Confirm IMG and return-of-service notes on Memorial PGME and CaRMS.",
    sourceStatus: "current",
  }),
  r({
    id: "maritimes-dal",
    provinceCode: "NS",
    category: "IMG pathway",
    name: "Maritimes R-1 via Dalhousie University (NS / NB / PE)",
    applicability: "applicable",
    authority: "Dalhousie PGME",
    sourceUrl: "https://medicine.dal.ca/departments/core-units/pgme.html",
    notes: "Dalhousie is the participating CaRMS R-1 institution for Nova Scotia, New Brunswick, and Prince Edward Island in this catalog. Confirm campus and stream details officially.",
    sourceStatus: "current",
  }),
];

export function referenceRequirementsForProvinces(codes: string[]): ReferenceRequirement[] {
  const set = new Set(codes);
  return REFERENCE_REQUIREMENTS.filter((r) => {
    if (set.has(r.provinceCode)) return true;
    if (r.provinceCode === "NS" && (set.has("NB") || set.has("PE"))) return true;
    return false;
  });
}
