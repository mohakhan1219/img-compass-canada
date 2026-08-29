import { INSTITUTIONS, type Institution } from "./institutions";
import { SPECIALTIES } from "./specialties";
import type { SourceStatus } from "./official-sources";

export type ReferenceProgram = {
  id: string;
  institutionId: string;
  provinceCode: string;
  specialtyId: string;
  streamName: string;
  matchCycleId: string;
  officialUrl: string;
  carmsUrl: string;
  imgNotes: string;
  lastVerifiedDate: string;
  sourceStatus: SourceStatus;
};

/**
 * Institution × specialty research rows for Program Explorer.
 * These are not 2027 CaRMS program descriptions. Descriptions are expected
 * on carms.ca from 9 September 2026; until confirmed, rows stay needs_review.
 */
const RESEARCH_SPECIALTY_IDS = ["family-medicine", "internal-medicine", "pediatrics", "psychiatry"];

function row(inst: Institution, specialtyId: string): ReferenceProgram {
  const spec = SPECIALTIES.find((s) => s.id === specialtyId)!;
  return {
    id: `${inst.id}-${specialtyId}`,
    institutionId: inst.id,
    provinceCode: inst.provinceCode,
    specialtyId,
    streamName: `R-1 ${spec.name} — research record`,
    matchCycleId: "r1-2027-first",
    officialUrl: inst.pgmeUrl,
    carmsUrl: "https://www.carms.ca/match/r-1-main-residency-match/",
    imgNotes:
      "Confirm current streams, IMG eligibility, and 2027 descriptions on CaRMS and the faculty PGME site. This row is a navigation placeholder, not a copied program description.",
    lastVerifiedDate: "2026-08-28",
    sourceStatus: "needs_review",
  };
}

export const REFERENCE_PROGRAMS: ReferenceProgram[] = INSTITUTIONS.flatMap((inst) =>
  RESEARCH_SPECIALTY_IDS.map((s) => row(inst, s)),
);

export function programsForFilters(filters: {
  provinceCode?: string;
  institutionId?: string;
  specialtyId?: string;
  matchCycleId?: string;
}): ReferenceProgram[] {
  return REFERENCE_PROGRAMS.filter((p) => {
    if (filters.provinceCode && p.provinceCode !== filters.provinceCode) {
      const inst = INSTITUTIONS.find((i) => i.id === p.institutionId);
      if (!inst?.servesProvinceCodes.includes(filters.provinceCode)) return false;
    }
    if (filters.institutionId && p.institutionId !== filters.institutionId) return false;
    if (filters.specialtyId && p.specialtyId !== filters.specialtyId) return false;
    if (filters.matchCycleId && p.matchCycleId !== filters.matchCycleId) return false;
    return true;
  });
}

export function referenceProgramById(id: string): ReferenceProgram | undefined {
  return REFERENCE_PROGRAMS.find((p) => p.id === id);
}
