export const APP_STATE_VERSION = 2 as const;

export type Catalog = {
  id: string;
  name: string;
  kind: "qbank" | "cases";
  totalQuestions: number;
  disclaimer: string;
};

export type StudySession = {
  id: string;
  startedAt: string;
  endedAt: string | null;
  timezone: string;
  notes: string;
  catalogId: string;
  attempted: number;
  correct: number;
  incorrect: number;
  omitted: number;
  rawMinutes: number | null;
  creditedMinutes: number | null;
  safety: "ok" | "warning" | "needs_confirmation" | "open";
  confirmedOverCap: boolean;
};

export type ReviewCard = {
  id: string;
  topic: string;
  firstSeenAt: string;
  completedIntervals: number[];
  notes: string;
};

export type ImgProfile = {
  displayName: string;
  graduationYear: string;
  medicalSchoolCountry: string;
  targetExamWindow: string;
  timezone: string;
  notes: string;
};

export type StageStatus = "not_started" | "in_progress" | "blocked" | "complete";

export type NacStationCategory =
  | "history_taking"
  | "physical_examination"
  | "communication_counselling"
  | "differential_diagnosis";

export type NacStation = {
  id: string;
  title: string;
  category: NacStationCategory;
  suggestedMinutes: number;
  prompt: string;
  disclaimer: string;
};

export type NacAttempt = {
  id: string;
  stationId: string;
  startedAt: string;
  endedAt: string;
  durationSeconds: number;
  score: number;
  weakTags: string[];
  notes: string;
  kind: "station" | "mock_station";
  mockId: string | null;
};

export type NacMock = {
  id: string;
  startedAt: string;
  endedAt: string;
  stationIds: string[];
  notes: string;
};

export type LanguageExamKind = "oet_medicine" | "ielts_academic" | "celpip";

export type LanguageApplicability = "required" | "not_required" | "unknown" | "needs_verification";

export type LanguageSkill = "reading" | "writing" | "listening" | "speaking";

export type LanguagePlan = {
  examKind: LanguageExamKind;
  applicability: LanguageApplicability;
  testDate: string;
  targetOverall: string;
  notes: string;
};

export type LanguageAttempt = {
  id: string;
  examKind: LanguageExamKind;
  skill: LanguageSkill;
  score: string;
  attemptedAt: string;
  notes: string;
};

export type InterviewKind = "behavioral" | "ethical" | "clinical";

export type InterviewPrompt = {
  id: string;
  kind: InterviewKind;
  prompt: string;
  disclaimer: string;
};

export type InterviewPractice = {
  id: string;
  promptId: string;
  practicedAt: string;
  notes: string;
  performanceTags: string[];
  improvementAreas: string;
};

export type RequirementApplicability =
  | "required"
  | "not_required"
  | "applicable"
  | "not_applicable"
  | "unknown"
  | "needs_verification";

export type RequirementUserStatus =
  | "not_started"
  | "in_progress"
  | "complete"
  | "not_applicable"
  | "blocked";

export type PathwayRequirement = {
  id: string;
  provinceCode: string;
  category: string;
  name: string;
  applicability: RequirementApplicability;
  userStatus: RequirementUserStatus;
  authority: string;
  sourceUrl: string;
  effectiveDate: string;
  lastVerifiedDate: string;
  version: string;
  notes: string;
  blocker: boolean;
  fictional: true;
};

export type DocumentItemStatus = "not_started" | "in_progress" | "complete" | "not_required";

export type ChecklistItem = {
  id: string;
  label: string;
  status: DocumentItemStatus;
};

export type ApplicationStatus =
  | "not_started"
  | "in_progress"
  | "submitted"
  | "withdrawn";

export type InvitationStatus = "none" | "invited" | "declined" | "waitlisted";

export type EligibilityPlanningStatus =
  | "unknown"
  | "needs_verification"
  | "planning_eligible"
  | "planning_ineligible";

export type CarmsProgram = {
  id: string;
  name: string;
  specialty: string;
  provinceCode: string;
  eligibilityStatus: EligibilityPlanningStatus;
  cvStatus: DocumentItemStatus;
  letterStatus: DocumentItemStatus;
  referencesStatus: DocumentItemStatus;
  documents: ChecklistItem[];
  applicationStatus: ApplicationStatus;
  invitationStatus: InvitationStatus;
  interviewed: boolean;
  rankIncluded: boolean;
  rankPosition: number | null;
  deadline: string;
  notes: string;
  fictional: true;
};

export type MatchOutcomeStatus = "awaiting" | "matched" | "unmatched";

export type MatchOutcome = {
  status: MatchOutcomeStatus;
  programId: string | null;
  recordedAt: string;
  notes: string;
};

export type AppState = {
  version: typeof APP_STATE_VERSION;
  demoSignedIn: boolean;
  profile: ImgProfile;
  catalogs: Catalog[];
  sessions: StudySession[];
  reviews: ReviewCard[];
  nacStations: NacStation[];
  nacAttempts: NacAttempt[];
  nacMocks: NacMock[];
  languagePlans: LanguagePlan[];
  languageAttempts: LanguageAttempt[];
  interviewBank: InterviewPrompt[];
  interviewSessions: InterviewPractice[];
  targetProvinceCodes: string[];
  requirements: PathwayRequirement[];
  programs: CarmsProgram[];
  matchOutcome: MatchOutcome | null;
};

export const STORAGE_KEY = "img-compass-canada.v1";
