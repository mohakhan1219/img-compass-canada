import { APP_STATE_VERSION, type AppState } from "@/domain/types";
import { createDemoState } from "./seed";

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

/** Merge Checkpoint 1 blobs and incomplete saves into AppState v2. */
export function migrateToCurrent(raw: unknown): AppState {
  const base = createDemoState();
  if (!isObject(raw)) return base;

  const version = raw.version;
  const profile = isObject(raw.profile) ? { ...base.profile, ...raw.profile } : base.profile;

  return {
    ...base,
    version: APP_STATE_VERSION,
    demoSignedIn: Boolean(raw.demoSignedIn),
    profile: {
      displayName: String(profile.displayName ?? base.profile.displayName),
      graduationYear: String(profile.graduationYear ?? ""),
      medicalSchoolCountry: String(profile.medicalSchoolCountry ?? ""),
      targetExamWindow: String(profile.targetExamWindow ?? ""),
      timezone: String(profile.timezone ?? "America/Toronto"),
      notes: String(profile.notes ?? ""),
    },
    catalogs: Array.isArray(raw.catalogs) && raw.catalogs.length ? (raw.catalogs as AppState["catalogs"]) : base.catalogs,
    sessions: Array.isArray(raw.sessions) ? (raw.sessions as AppState["sessions"]) : base.sessions,
    reviews: Array.isArray(raw.reviews) ? (raw.reviews as AppState["reviews"]) : base.reviews,
    nacStations:
      Array.isArray(raw.nacStations) && raw.nacStations.length
        ? (raw.nacStations as AppState["nacStations"])
        : base.nacStations,
    nacAttempts: Array.isArray(raw.nacAttempts) ? (raw.nacAttempts as AppState["nacAttempts"]) : version === 2 ? [] : base.nacAttempts,
    nacMocks: Array.isArray(raw.nacMocks) ? (raw.nacMocks as AppState["nacMocks"]) : version === 2 ? [] : base.nacMocks,
    languagePlans:
      Array.isArray(raw.languagePlans) && raw.languagePlans.length
        ? (raw.languagePlans as AppState["languagePlans"])
        : base.languagePlans,
    languageAttempts: Array.isArray(raw.languageAttempts)
      ? (raw.languageAttempts as AppState["languageAttempts"])
      : version === 2
        ? []
        : base.languageAttempts,
    interviewBank:
      Array.isArray(raw.interviewBank) && raw.interviewBank.length
        ? (raw.interviewBank as AppState["interviewBank"])
        : base.interviewBank,
    interviewSessions: Array.isArray(raw.interviewSessions)
      ? (raw.interviewSessions as AppState["interviewSessions"])
      : version === 2
        ? []
        : base.interviewSessions,
    targetProvinceCodes: Array.isArray(raw.targetProvinceCodes)
      ? (raw.targetProvinceCodes as string[])
      : base.targetProvinceCodes,
    requirements:
      Array.isArray(raw.requirements) && raw.requirements.length
        ? (raw.requirements as AppState["requirements"])
        : base.requirements,
    programs: Array.isArray(raw.programs) && raw.programs.length ? (raw.programs as AppState["programs"]) : base.programs,
    matchOutcome: isObject(raw.matchOutcome) ? (raw.matchOutcome as AppState["matchOutcome"]) : base.matchOutcome,
  };
}
