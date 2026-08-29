export type LanguageExamCatalogEntry = {
  id: string;
  name: string;
  authority: string;
  officialUrl: string;
  skills: string[];
  notes: string;
};

export const LANGUAGE_EXAM_CATALOG: LanguageExamCatalogEntry[] = [
  {
    id: "oet_medicine",
    name: "OET Medicine",
    authority: "Cambridge Boxhill Language Assessment",
    officialUrl: "https://oet.com/test/test-professions/medicine",
    skills: ["listening", "reading", "writing", "speaking"],
    notes: "Confirm whether a given province or program currently accepts OET.",
  },
  {
    id: "ielts_academic",
    name: "IELTS Academic",
    authority: "IELTS partners",
    officialUrl: "https://ielts.org/take-a-test/test-types/ielts-academic-test",
    skills: ["listening", "reading", "writing", "speaking"],
    notes: "Confirm accepted modules and score validity with the official authority.",
  },
  {
    id: "celpip",
    name: "CELPIP",
    authority: "Paragon Testing",
    officialUrl: "https://www.celpip.ca/",
    skills: ["listening", "reading", "writing", "speaking"],
    notes: "Often used for immigration; program/college acceptance must be verified.",
  },
  {
    id: "tef",
    name: "TEF Canada",
    authority: "CCI Paris Île-de-France",
    officialUrl: "https://www.lefrancaisdesaffaires.fr/en/tests-diplomas/test-for-evaluating-french-tef/",
    skills: ["listening", "reading", "writing", "speaking"],
    notes: "Relevant when French evidence is required. Confirm with CMQ or the program.",
  },
  {
    id: "tcf",
    name: "TCF Canada",
    authority: "France Éducation international",
    officialUrl: "https://www.france-education-international.fr/en/test/tcf-canada",
    skills: ["listening", "reading", "writing", "speaking"],
    notes: "Confirm current acceptance with the receiving authority.",
  },
];

export type CredentialKind =
  | "physiciansapply_account"
  | "identity_verification"
  | "medical_degree"
  | "transcript"
  | "source_verification"
  | "internship"
  | "postgraduate_training";

export const CREDENTIAL_CATALOG: { id: CredentialKind; name: string; officialUrl: string }[] = [
  {
    id: "physiciansapply_account",
    name: "physiciansapply.ca account",
    officialUrl: "https://physiciansapply.ca/",
  },
  {
    id: "identity_verification",
    name: "Identity / identity verification milestone",
    officialUrl: "https://physiciansapply.ca/",
  },
  {
    id: "medical_degree",
    name: "Medical degree credential",
    officialUrl: "https://mcc.ca/",
  },
  {
    id: "transcript",
    name: "Medical school transcript",
    officialUrl: "https://physiciansapply.ca/",
  },
  {
    id: "source_verification",
    name: "Source verification",
    officialUrl: "https://physiciansapply.ca/",
  },
  {
    id: "internship",
    name: "Internship credential",
    officialUrl: "https://mcc.ca/",
  },
  {
    id: "postgraduate_training",
    name: "Postgraduate training credential",
    officialUrl: "https://mcc.ca/",
  },
];

export type PathwayNote = {
  provinceCode: string;
  overview: string;
  imgNotes: string;
  citizenshipNotes: string;
  examNotes: string;
  nacNotes: string;
  languageNotes: string;
  returnOfServiceNotes: string;
  additionalAssessmentNotes: string;
  programWarning: string;
};

export const PATHWAY_NOTES: PathwayNote[] = [
  {
    provinceCode: "ON",
    overview: "Ontario has seven CaRMS R-1 participating faculties in this catalog. Confirm IMG streams on CaRMS and each PGME office.",
    imgNotes: "IMG routes differ by faculty and stream. Compass lists institutions for research — not eligibility.",
    citizenshipNotes: "CaRMS documents proof-of-citizenship/legal-status options. Confirm what each program will accept.",
    examNotes: "MCCQE Part I is commonly referenced for IMG applicants. Confirm current statements on MCC and program pages.",
    nacNotes: "NAC is commonly referenced for IMG applicants to Canadian residency. Confirm whether a given 2027 program still requires it.",
    languageNotes: "CPSO and individual programs may set language expectations. Needs verification per route.",
    returnOfServiceNotes: "Some Ontario positions historically involved return of service. Confirm on the current description.",
    additionalAssessmentNotes: "Practice-ready assessment, if relevant, is a separate provincial process from CaRMS R-1.",
    programWarning: "2027 program descriptions were not copied into Compass. Open CaRMS when they are published (targeted 9 September 2026).",
  },
  {
    provinceCode: "AB",
    overview: "Alberta R-1 faculties in this catalog: University of Alberta and University of Calgary.",
    imgNotes: "Confirm IMG and competitive streams on CaRMS. CPSA registration is a separate later step.",
    citizenshipNotes: "Confirm legal status requirements with CaRMS and CPSA.",
    examNotes: "Verify MCCQE Part I against current Alberta program and college statements.",
    nacNotes: "Confirm NAC expectations on official 2027 pages.",
    languageNotes: "Needs verification with CPSA and the program.",
    returnOfServiceNotes: "Confirm any return-of-service on the current program description.",
    additionalAssessmentNotes: "Alberta practice-ready assessment is not the same as the CaRMS R-1 match.",
    programWarning: "Do not treat this overview as a 2027 program catalog.",
  },
  {
    provinceCode: "BC",
    overview: "British Columbia R-1 faculties in this catalog: UBC and Simon Fraser University.",
    imgNotes: "SFU medicine is newer — confirm which CaRMS streams exist for the cycle you are targeting.",
    citizenshipNotes: "Confirm with CaRMS and CPSBC.",
    examNotes: "Confirm MCCQE Part I on MCC and program pages.",
    nacNotes: "Confirm NAC on official sources before planning applications.",
    languageNotes: "CPSBC language rules must be verified; Compass does not certify sufficiency.",
    returnOfServiceNotes: "Confirm on current descriptions.",
    additionalAssessmentNotes: "Practice-ready routes, if any, are separate from R-1.",
    programWarning: "Link out to PGME and CaRMS rather than relying on this summary.",
  },
  {
    provinceCode: "MB",
    overview: "Manitoba R-1 in this catalog is University of Manitoba.",
    imgNotes: "Confirm IMG stream availability annually on CaRMS.",
    citizenshipNotes: "Confirm with CaRMS and CPSM.",
    examNotes: "MCC examinations — verify current program language.",
    nacNotes: "Needs verification per cycle.",
    languageNotes: "Needs verification.",
    returnOfServiceNotes: "Confirm on current descriptions.",
    additionalAssessmentNotes: "Provincial assessment, if exploring PRA, is separate.",
    programWarning: "No fabricated additional Manitoba universities are listed.",
  },
  {
    provinceCode: "SK",
    overview: "Saskatchewan R-1 in this catalog is University of Saskatchewan.",
    imgNotes: "Confirm IMG and return-of-service details on PGME and CaRMS.",
    citizenshipNotes: "Confirm with CaRMS and CPSS.",
    examNotes: "Verify MCCQE / NAC on official pages.",
    nacNotes: "Needs verification.",
    languageNotes: "Needs verification.",
    returnOfServiceNotes: "Saskatchewan positions may involve return of service — confirm officially.",
    additionalAssessmentNotes: "PRA, if relevant, is a separate pathway.",
    programWarning: "Single-faculty province in the R-1 catalog.",
  },
  {
    provinceCode: "QC",
    overview: "Quebec R-1 faculties in this catalog: Laval, Sherbrooke, Montréal, and McGill.",
    imgNotes: "French-language training and CMQ rules often apply. Confirm before planning.",
    citizenshipNotes: "Confirm with CaRMS and CMQ.",
    examNotes: "Confirm MCC exams against Quebec program statements.",
    nacNotes: "Needs verification per program.",
    languageNotes: "French evidence is frequently relevant. Confirm with CMQ — Compass will not declare you eligible.",
    returnOfServiceNotes: "Confirm on current descriptions.",
    additionalAssessmentNotes: "Quebec assessment routes are distinct from English-Canada PRA programs.",
    programWarning: "Do not assume English-only training is available at every faculty.",
  },
  {
    provinceCode: "NL",
    overview: "Newfoundland and Labrador R-1 in this catalog is Memorial University of Newfoundland.",
    imgNotes: "Confirm IMG streams and location of training on Memorial PGME.",
    citizenshipNotes: "Confirm with CaRMS and CPSNL.",
    examNotes: "Verify MCC examinations officially.",
    nacNotes: "Needs verification.",
    languageNotes: "Needs verification.",
    returnOfServiceNotes: "Confirm on current descriptions.",
    additionalAssessmentNotes: "PRA, if any, is separate.",
    programWarning: "Single-faculty province in the R-1 catalog.",
  },
  {
    provinceCode: "NS",
    overview: "Nova Scotia, New Brunswick, and Prince Edward Island are served by Dalhousie University PGME in this CaRMS R-1 catalog.",
    imgNotes: "Campus (NS/NB/PE) and stream must be confirmed on Dalhousie and CaRMS pages.",
    citizenshipNotes: "Confirm with CaRMS and the relevant maritime college.",
    examNotes: "Verify MCC examinations officially.",
    nacNotes: "Needs verification.",
    languageNotes: "Needs verification.",
    returnOfServiceNotes: "Confirm on current descriptions.",
    additionalAssessmentNotes: "PRA, if exploring, is separate from R-1.",
    programWarning: "There is no separate empty card for NB or PE without Dalhousie — they share this institution.",
  },
];

export function pathwayNotesFor(code: string): PathwayNote | undefined {
  if (code === "NB" || code === "PE") return PATHWAY_NOTES.find((n) => n.provinceCode === "NS");
  return PATHWAY_NOTES.find((n) => n.provinceCode === code);
}
