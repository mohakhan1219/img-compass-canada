import { APP_STATE_VERSION, type AppState, type CarmsProgram, type ImgProfile, type NacStation } from "@/domain/types";
import { createDemoState, createEmptyState, emptyExam, mergeReferenceRequirements, trackingFromReference } from "./seed";

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

const FAKE_PROGRAM_MAP: Record<string, string> = {
  "prog-northlake-fm": "utoronto-family-medicine",
  "prog-harbour-im": "ubc-internal-medicine",
  "prog-prairie-peds": "ualberta-pediatrics",
};

function asString(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : fallback;
}

function migrateProfile(raw: Record<string, unknown> | undefined, base: ImgProfile): ImgProfile {
  const p = raw && isObject(raw) ? raw : {};
  return {
    ...base,
    displayName: asString(p.displayName, base.displayName),
    timezone: asString(p.timezone, base.timezone || "America/Toronto"),
    notes: asString(p.notes, base.notes),
    countryOfResidence: asString(p.countryOfResidence, base.countryOfResidence),
    preferredLanguage: (asString(p.preferredLanguage, base.preferredLanguage) || "") as ImgProfile["preferredLanguage"],
    medicalSchoolCountry: asString(p.medicalSchoolCountry, base.medicalSchoolCountry),
    medicalSchoolId: asString(p.medicalSchoolId, base.medicalSchoolId),
    medicalSchoolOther: asString(p.medicalSchoolOther),
    graduationYear: asString(p.graduationYear, base.graduationYear),
    medicalDegree: (asString(p.medicalDegree, base.medicalDegree) || "") as ImgProfile["medicalDegree"],
    internshipStatus: (asString(p.internshipStatus, base.internshipStatus) || "") as ImgProfile["internshipStatus"],
    internshipDuration: asString(p.internshipDuration, base.internshipDuration),
    graduationStatus: asString(p.graduationStatus, base.graduationStatus),
    postgraduateTraining: (asString(p.postgraduateTraining, base.postgraduateTraining) ||
      "") as ImgProfile["postgraduateTraining"],
    postgraduateSpecialty: asString(p.postgraduateSpecialty),
    postgraduateCountry: asString(p.postgraduateCountry),
    postgraduateDuration: asString(p.postgraduateDuration),
    independentPractice: (asString(p.independentPractice) || "") as ImgProfile["independentPractice"],
    yearsOfPractice: asString(p.yearsOfPractice),
    canadaStatus: (asString(p.canadaStatus, base.canadaStatus) || "") as ImgProfile["canadaStatus"],
    careerGoal: (asString(p.careerGoal, base.careerGoal) || "") as ImgProfile["careerGoal"],
    targetMatchCycleId: asString(p.targetMatchCycleId, base.targetMatchCycleId || "r1-2027-first"),
    specialtyInterestIds: Array.isArray(p.specialtyInterestIds)
      ? (p.specialtyInterestIds as string[])
      : base.specialtyInterestIds,
    relocateAnywhere: (asString(p.relocateAnywhere, base.relocateAnywhere) || "") as ImgProfile["relocateAnywhere"],
    physiciansapplyStatus: (asString(p.physiciansapplyStatus, base.physiciansapplyStatus) ||
      "") as ImgProfile["physiciansapplyStatus"],
    credentialVerificationStatus: (asString(p.credentialVerificationStatus, base.credentialVerificationStatus) ||
      "") as ImgProfile["credentialVerificationStatus"],
    mccqeStatus: (asString(p.mccqeStatus, base.mccqeStatus) || "") as ImgProfile["mccqeStatus"],
    nacExamStatus: (asString(p.nacExamStatus, base.nacExamStatus) || "") as ImgProfile["nacExamStatus"],
    languageEvidenceStatus: (asString(p.languageEvidenceStatus, base.languageEvidenceStatus) ||
      "") as ImgProfile["languageEvidenceStatus"],
    onboardingComplete: Boolean(p.onboardingComplete ?? base.onboardingComplete),
    targetExamWindow: asString(p.targetExamWindow, base.targetExamWindow),
  };
}

function migrateStations(raw: unknown, fallback: NacStation[]): NacStation[] {
  if (!Array.isArray(raw) || raw.length === 0) return fallback;
  return (raw as NacStation[]).map((s) => ({
    ...s,
    clinicalArea: s.clinicalArea ?? "",
    userCreated: Boolean(s.userCreated),
  }));
}

function migratePrograms(raw: unknown, fallback: CarmsProgram[]): CarmsProgram[] {
  if (!Array.isArray(raw)) return fallback;
  if (raw.length === 0) return [];
  return (raw as Record<string, unknown>[]).map((p) => {
    const oldId = asString(p.id);
    const mapped = FAKE_PROGRAM_MAP[oldId];
    if (mapped) {
      return trackingFromReference(mapped, {
        id: `track-${mapped}`,
        applicationStatus: (asString(p.applicationStatus, "not_started") as CarmsProgram["applicationStatus"]) ?? "not_started",
        invitationStatus: (asString(p.invitationStatus, "none") as CarmsProgram["invitationStatus"]) ?? "none",
        interviewed: Boolean(p.interviewed),
        rankIncluded: Boolean(p.rankIncluded),
        rankPosition: typeof p.rankPosition === "number" ? p.rankPosition : null,
        cvStatus: (asString(p.cvStatus, "not_started") as CarmsProgram["cvStatus"]) ?? "not_started",
        letterStatus: (asString(p.letterStatus) as CarmsProgram["letterStatus"]) ?? "not_started",
        referencesStatus: (asString(p.referencesStatus) as CarmsProgram["referencesStatus"]) ?? "not_started",
        notes: asString(p.notes),
        deadline: asString(p.deadline, "2026-11-26"),
      });
    }
    if (asString(p.referenceProgramId)) {
      return trackingFromReference(asString(p.referenceProgramId), p as Partial<CarmsProgram>);
    }
    return trackingFromReference("utoronto-family-medicine", {
      ...p,
      id: oldId || "track-legacy",
      name: asString(p.name, "Saved program"),
    } as Partial<CarmsProgram>);
  });
}

/**
 * Merge stored blobs into AppState v3.
 * `mode`:
 *  - demo: fill missing arrays from the Alex seed
 *  - empty: never copy Alex's personal progress into a real account
 */
export function migrateToCurrent(raw: unknown, mode: "demo" | "empty" = "demo"): AppState {
  const base = mode === "empty" ? createEmptyState() : createDemoState();
  if (!isObject(raw)) return base;

  const version = raw.version;
  const profile = migrateProfile(isObject(raw.profile) ? raw.profile : undefined, base.profile);
  const targetProvinceCodes = Array.isArray(raw.targetProvinceCodes)
    ? (raw.targetProvinceCodes as string[])
    : base.targetProvinceCodes;

  const programs = migratePrograms(raw.programs, base.programs);
  const userReq = Array.isArray(raw.requirements) ? (raw.requirements as AppState["requirements"]) : base.requirements;

  return {
    ...base,
    version: APP_STATE_VERSION,
    demoSignedIn: Boolean(raw.demoSignedIn),
    authMode: raw.authMode === "account" || raw.authMode === "demo" || raw.authMode === "anonymous" ? raw.authMode : base.authMode,
    profile,
    catalogs: Array.isArray(raw.catalogs) && raw.catalogs.length ? (raw.catalogs as AppState["catalogs"]) : base.catalogs,
    sessions: Array.isArray(raw.sessions) ? (raw.sessions as AppState["sessions"]) : mode === "empty" && version ? [] : base.sessions,
    reviews: Array.isArray(raw.reviews) ? (raw.reviews as AppState["reviews"]) : mode === "empty" && version ? [] : base.reviews,
    nacStations: migrateStations(raw.nacStations, base.nacStations),
    nacAttempts: Array.isArray(raw.nacAttempts)
      ? (raw.nacAttempts as AppState["nacAttempts"])
      : version === 2 || version === 3
        ? (raw.nacAttempts as AppState["nacAttempts"]) ?? []
        : base.nacAttempts,
    nacMocks: Array.isArray(raw.nacMocks) ? (raw.nacMocks as AppState["nacMocks"]) : version === 2 || version === 3 ? [] : base.nacMocks,
    languagePlans:
      Array.isArray(raw.languagePlans) && raw.languagePlans.length
        ? (raw.languagePlans as AppState["languagePlans"]).map((p) => ({
            ...p,
            resultDate: p.resultDate ?? "",
            componentScores: p.componentScores ?? "",
            expiryDate: p.expiryDate ?? "",
          }))
        : base.languagePlans,
    languageAttempts: Array.isArray(raw.languageAttempts)
      ? (raw.languageAttempts as AppState["languageAttempts"])
      : version === 2 || version === 3
        ? []
        : base.languageAttempts,
    interviewBank:
      Array.isArray(raw.interviewBank) && raw.interviewBank.length
        ? (raw.interviewBank as AppState["interviewBank"])
        : base.interviewBank,
    interviewSessions: Array.isArray(raw.interviewSessions)
      ? (raw.interviewSessions as AppState["interviewSessions"])
      : version === 2 || version === 3
        ? (raw.interviewSessions as AppState["interviewSessions"]) ?? []
        : base.interviewSessions,
    targetProvinceCodes,
    requirements: mergeReferenceRequirements(userReq),
    programs,
    matchOutcome: isObject(raw.matchOutcome)
      ? {
          status: (["awaiting", "matched", "unmatched"].includes(asString(raw.matchOutcome.status))
            ? asString(raw.matchOutcome.status)
            : "awaiting") as "awaiting" | "matched" | "unmatched",
          programId: raw.matchOutcome.programId ? asString(raw.matchOutcome.programId) : null,
          recordedAt: asString(raw.matchOutcome.recordedAt),
          notes: asString(raw.matchOutcome.notes),
          nextCycleNotes: asString(raw.matchOutcome.nextCycleNotes),
        }
      : base.matchOutcome,
    credentials: Array.isArray(raw.credentials) && raw.credentials.length ? (raw.credentials as AppState["credentials"]) : base.credentials,
    mccqeExam: isObject(raw.mccqeExam) ? { ...emptyExam(), ...(raw.mccqeExam as object) } : base.mccqeExam,
    nacExam: isObject(raw.nacExam) ? { ...emptyExam(), ...(raw.nacExam as object) } : base.nacExam,
    carmsPhase: asString(raw.carmsPhase, base.carmsPhase),
    onboardingTasks:
      Array.isArray(raw.onboardingTasks) && raw.onboardingTasks.length
        ? (raw.onboardingTasks as AppState["onboardingTasks"])
        : base.onboardingTasks,
    residencyStartDate: asString(raw.residencyStartDate),
  };
}
