import type { SourceStatus } from "./official-sources";

export type Institution = {
  id: string;
  name: string;
  provinceCode: string;
  /** Maritime campuses share Dalhousie PGME. */
  servesProvinceCodes: string[];
  pgmeUrl: string;
  lastVerifiedDate: string;
  sourceStatus: SourceStatus;
};

export const INSTITUTIONS: Institution[] = [
  {
    id: "uottawa",
    name: "University of Ottawa",
    provinceCode: "ON",
    servesProvinceCodes: ["ON"],
    pgmeUrl: "https://www.uottawa.ca/faculty-medicine/postgraduate-medical-education",
    lastVerifiedDate: "2026-08-28",
    sourceStatus: "current",
  },
  {
    id: "queens",
    name: "Queen's University",
    provinceCode: "ON",
    servesProvinceCodes: ["ON"],
    pgmeUrl: "https://meds.queensu.ca/academics/postgraduate",
    lastVerifiedDate: "2026-08-28",
    sourceStatus: "current",
  },
  {
    id: "nosm",
    name: "NOSM University",
    provinceCode: "ON",
    servesProvinceCodes: ["ON"],
    pgmeUrl: "https://www.nosm.ca/education/pgme/",
    lastVerifiedDate: "2026-08-28",
    sourceStatus: "current",
  },
  {
    id: "utoronto",
    name: "University of Toronto",
    provinceCode: "ON",
    servesProvinceCodes: ["ON"],
    pgmeUrl: "https://pgme.utoronto.ca/",
    lastVerifiedDate: "2026-08-28",
    sourceStatus: "current",
  },
  {
    id: "tmu",
    name: "Toronto Metropolitan University",
    provinceCode: "ON",
    servesProvinceCodes: ["ON"],
    pgmeUrl: "https://www.torontomu.ca/school-of-medicine/",
    lastVerifiedDate: "2026-08-28",
    sourceStatus: "current",
  },
  {
    id: "mcmaster",
    name: "McMaster University",
    provinceCode: "ON",
    servesProvinceCodes: ["ON"],
    pgmeUrl: "https://pgme.mcmaster.ca/",
    lastVerifiedDate: "2026-08-28",
    sourceStatus: "current",
  },
  {
    id: "western",
    name: "Western University",
    provinceCode: "ON",
    servesProvinceCodes: ["ON"],
    pgmeUrl: "https://www.schulich.uwo.ca/medicine/postgraduate/",
    lastVerifiedDate: "2026-08-28",
    sourceStatus: "current",
  },
  {
    id: "ualberta",
    name: "University of Alberta",
    provinceCode: "AB",
    servesProvinceCodes: ["AB"],
    pgmeUrl: "https://www.ualberta.ca/medicine/programs/residency.html",
    lastVerifiedDate: "2026-08-28",
    sourceStatus: "current",
  },
  {
    id: "ucalgary",
    name: "University of Calgary",
    provinceCode: "AB",
    servesProvinceCodes: ["AB"],
    pgmeUrl: "https://cumming.ucalgary.ca/pgme",
    lastVerifiedDate: "2026-08-28",
    sourceStatus: "current",
  },
  {
    id: "ubc",
    name: "University of British Columbia",
    provinceCode: "BC",
    servesProvinceCodes: ["BC"],
    pgmeUrl: "https://postgrad.med.ubc.ca/",
    lastVerifiedDate: "2026-08-28",
    sourceStatus: "current",
  },
  {
    id: "sfu",
    name: "Simon Fraser University",
    provinceCode: "BC",
    servesProvinceCodes: ["BC"],
    pgmeUrl: "https://www.sfu.ca/medicine.html",
    lastVerifiedDate: "2026-08-28",
    sourceStatus: "current",
  },
  {
    id: "umanitoba",
    name: "University of Manitoba",
    provinceCode: "MB",
    servesProvinceCodes: ["MB"],
    pgmeUrl: "https://umanitoba.ca/medicine/postgraduate-medical-education",
    lastVerifiedDate: "2026-08-28",
    sourceStatus: "current",
  },
  {
    id: "usask",
    name: "University of Saskatchewan",
    provinceCode: "SK",
    servesProvinceCodes: ["SK"],
    pgmeUrl: "https://medicine.usask.ca/pgme/",
    lastVerifiedDate: "2026-08-28",
    sourceStatus: "current",
  },
  {
    id: "ulaval",
    name: "Université Laval",
    provinceCode: "QC",
    servesProvinceCodes: ["QC"],
    pgmeUrl: "https://www.fmed.ulaval.ca/etudes/etudes-medicales-postdoctorales",
    lastVerifiedDate: "2026-08-28",
    sourceStatus: "current",
  },
  {
    id: "usherbrooke",
    name: "Université de Sherbrooke",
    provinceCode: "QC",
    servesProvinceCodes: ["QC"],
    pgmeUrl: "https://www.usherbrooke.ca/medecine/etudes/etudes-medicales-postdoctorales",
    lastVerifiedDate: "2026-08-28",
    sourceStatus: "current",
  },
  {
    id: "umontreal",
    name: "Université de Montréal",
    provinceCode: "QC",
    servesProvinceCodes: ["QC"],
    pgmeUrl: "https://medecine.umontreal.ca/etudes/etudes-medicales-postdoctorales/",
    lastVerifiedDate: "2026-08-28",
    sourceStatus: "current",
  },
  {
    id: "mcgill",
    name: "McGill University",
    provinceCode: "QC",
    servesProvinceCodes: ["QC"],
    pgmeUrl: "https://www.mcgill.ca/pgme/",
    lastVerifiedDate: "2026-08-28",
    sourceStatus: "current",
  },
  {
    id: "memorial",
    name: "Memorial University of Newfoundland",
    provinceCode: "NL",
    servesProvinceCodes: ["NL"],
    pgmeUrl: "https://www.mun.ca/medicine/pgme/",
    lastVerifiedDate: "2026-08-28",
    sourceStatus: "current",
  },
  {
    id: "dalhousie",
    name: "Dalhousie University",
    provinceCode: "NS",
    servesProvinceCodes: ["NS", "NB", "PE"],
    pgmeUrl: "https://medicine.dal.ca/departments/core-units/pgme.html",
    lastVerifiedDate: "2026-08-28",
    sourceStatus: "current",
  },
];

export function institutionsForProvince(provinceCode: string): Institution[] {
  return INSTITUTIONS.filter(
    (i) => i.provinceCode === provinceCode || i.servesProvinceCodes.includes(provinceCode),
  );
}

export function institutionById(id: string): Institution | undefined {
  return INSTITUTIONS.find((i) => i.id === id);
}

export const FAKE_INSTITUTION_NAMES = ["Northlake", "Harbour", "Prairie"];
