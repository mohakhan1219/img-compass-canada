export type SourceStatus = "current" | "superseded" | "needs_review";

export type OfficialSource = {
  id: string;
  name: string;
  authority: string;
  url: string;
  category: "exam" | "credentials" | "match" | "regulator" | "pgme" | "assessment";
  jurisdictionCode: string | null;
  lastVerifiedDate: string;
  sourceStatus: SourceStatus;
};

export const OFFICIAL_SOURCES: OfficialSource[] = [
  {
    id: "mcc",
    name: "Medical Council of Canada",
    authority: "MCC",
    url: "https://mcc.ca/",
    category: "exam",
    jurisdictionCode: null,
    lastVerifiedDate: "2026-08-28",
    sourceStatus: "current",
  },
  {
    id: "physiciansapply",
    name: "physiciansapply.ca",
    authority: "MCC",
    url: "https://physiciansapply.ca/",
    category: "credentials",
    jurisdictionCode: null,
    lastVerifiedDate: "2026-08-28",
    sourceStatus: "current",
  },
  {
    id: "mccqe1",
    name: "MCCQE Part I",
    authority: "MCC",
    url: "https://mcc.ca/examinations/mccqe-part-i/",
    category: "exam",
    jurisdictionCode: null,
    lastVerifiedDate: "2026-08-28",
    sourceStatus: "current",
  },
  {
    id: "nac",
    name: "NAC Examination",
    authority: "MCC",
    url: "https://mcc.ca/examinations/nac-examination/",
    category: "exam",
    jurisdictionCode: null,
    lastVerifiedDate: "2026-08-28",
    sourceStatus: "current",
  },
  {
    id: "carms",
    name: "CaRMS",
    authority: "CaRMS",
    url: "https://www.carms.ca/",
    category: "match",
    jurisdictionCode: null,
    lastVerifiedDate: "2026-08-28",
    sourceStatus: "current",
  },
  {
    id: "carms-r1-timeline",
    name: "R-1 first iteration applicant timeline",
    authority: "CaRMS",
    url: "https://www.carms.ca/match/r-1-main-residency-match/applicant/r-1-match-timeline/",
    category: "match",
    jurisdictionCode: null,
    lastVerifiedDate: "2026-08-28",
    sourceStatus: "current",
  },
  {
    id: "carms-r1-second",
    name: "R-1 second iteration applicant timeline",
    authority: "CaRMS",
    url: "https://www.carms.ca/match/r-1-main-residency-match/applicant/r-1-second-iteration-timeline/",
    category: "match",
    jurisdictionCode: null,
    lastVerifiedDate: "2026-08-28",
    sourceStatus: "current",
  },
  {
    id: "cpso",
    name: "College of Physicians and Surgeons of Ontario",
    authority: "CPSO",
    url: "https://www.cpso.on.ca/",
    category: "regulator",
    jurisdictionCode: "ON",
    lastVerifiedDate: "2026-08-28",
    sourceStatus: "current",
  },
  {
    id: "cpsa",
    name: "College of Physicians & Surgeons of Alberta",
    authority: "CPSA",
    url: "https://www.cpsa.ca/",
    category: "regulator",
    jurisdictionCode: "AB",
    lastVerifiedDate: "2026-08-28",
    sourceStatus: "current",
  },
  {
    id: "cpsbc",
    name: "College of Physicians and Surgeons of British Columbia",
    authority: "CPSBC",
    url: "https://www.cpsbc.ca/",
    category: "regulator",
    jurisdictionCode: "BC",
    lastVerifiedDate: "2026-08-28",
    sourceStatus: "current",
  },
  {
    id: "cpsm",
    name: "College of Physicians and Surgeons of Manitoba",
    authority: "CPSM",
    url: "https://www.cpsm.mb.ca/",
    category: "regulator",
    jurisdictionCode: "MB",
    lastVerifiedDate: "2026-08-28",
    sourceStatus: "current",
  },
  {
    id: "cpss",
    name: "College of Physicians and Surgeons of Saskatchewan",
    authority: "CPSS",
    url: "https://www.cps.sk.ca/",
    category: "regulator",
    jurisdictionCode: "SK",
    lastVerifiedDate: "2026-08-28",
    sourceStatus: "current",
  },
  {
    id: "cmq",
    name: "Collège des médecins du Québec",
    authority: "CMQ",
    url: "https://www.cmq.org/",
    category: "regulator",
    jurisdictionCode: "QC",
    lastVerifiedDate: "2026-08-28",
    sourceStatus: "current",
  },
  {
    id: "cpsnl",
    name: "College of Physicians and Surgeons of Newfoundland and Labrador",
    authority: "CPSNL",
    url: "https://www.cpsnl.ca/",
    category: "regulator",
    jurisdictionCode: "NL",
    lastVerifiedDate: "2026-08-28",
    sourceStatus: "current",
  },
  {
    id: "cpsns",
    name: "College of Physicians and Surgeons of Nova Scotia",
    authority: "CPSNS",
    url: "https://www.cpsns.ns.ca/",
    category: "regulator",
    jurisdictionCode: "NS",
    lastVerifiedDate: "2026-08-28",
    sourceStatus: "current",
  },
  {
    id: "cpsnb",
    name: "College of Physicians and Surgeons of New Brunswick",
    authority: "CPSNB",
    url: "https://www.cpsnb.org/",
    category: "regulator",
    jurisdictionCode: "NB",
    lastVerifiedDate: "2026-08-28",
    sourceStatus: "current",
  },
  {
    id: "cpspei",
    name: "College of Physicians and Surgeons of Prince Edward Island",
    authority: "CPSPEI",
    url: "https://cpspei.ca/",
    category: "regulator",
    jurisdictionCode: "PE",
    lastVerifiedDate: "2026-08-28",
    sourceStatus: "current",
  },
];

export function sourceById(id: string): OfficialSource | undefined {
  return OFFICIAL_SOURCES.find((s) => s.id === id);
}

export function sourcesForJurisdiction(code: string): OfficialSource[] {
  return OFFICIAL_SOURCES.filter((s) => s.jurisdictionCode === code || s.jurisdictionCode === null);
}
