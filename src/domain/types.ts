export const APP_STATE_VERSION = 3 as const;

export type AuthMode = "anonymous" | "demo" | "account";

export type Catalog = {
  id: string;
  name: string;
  kind: "qbank" | "cases" | "user";
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

export type PreferredLanguage = "en" | "fr" | "both" | "";
export type MedicalDegree = "mbbs" | "md" | "equivalent" | "other" | "";
export type InternshipStatus = "not_started" | "in_progress" | "completed" | "";
export type YesNoInProgress = "yes" | "no" | "in_progress" | "";
export type YesNo = "yes" | "no" | "";
export type Relocate = "yes" | "no" | "maybe" | "";
export type CanadaLegalStatus = "citizen" | "pr" | "other" | "prefer_not" | "";
export type CareerGoal = "carms" | "pra" | "specialist" | "exploring" | "";
export type MilestoneStatus =
  | "not_started"
  | "in_progress"
  | "complete"
  | "waiting"
  | "needs_verification"
  | "";

export type ImgProfile = {
  displayName: string;
  timezone: string;
  notes: string;
  countryOfResidence: string;
  preferredLanguage: PreferredLanguage;
  medicalSchoolCountry: string;
  medicalSchoolId: string;
  medicalSchoolOther: string;
  graduationYear: string;
  medicalDegree: MedicalDegree;
  internshipStatus: InternshipStatus;
  internshipDuration: string;
  graduationStatus: string;
  postgraduateTraining: YesNoInProgress;
  postgraduateSpecialty: string;
  postgraduateCountry: string;
  postgraduateDuration: string;
  independentPractice: YesNo;
  yearsOfPractice: string;
  canadaStatus: CanadaLegalStatus;
  careerGoal: CareerGoal;
  targetMatchCycleId: string;
  specialtyInterestIds: string[];
  relocateAnywhere: Relocate;
  physiciansapplyStatus: MilestoneStatus;
  credentialVerificationStatus: MilestoneStatus;
  mccqeStatus: MilestoneStatus;
  nacExamStatus: MilestoneStatus;
  languageEvidenceStatus: MilestoneStatus;
  onboardingComplete: boolean;
  /** Legacy exam-window text kept for migration. */
  targetExamWindow: string;
};

export type StageStatus =
  | "not_started"
  | "in_progress"
  | "blocked"
  | "complete"
  | "waiting"
  | "needs_verification";

export type NacStationCategory =
  | "history_taking"
  | "physical_examination"
  | "communication_counselling"
  | "differential_diagnosis"
  | "custom";

export type NacStation = {
  id: string;
  title: string;
  category: NacStationCategory;
  clinicalArea: string;
  suggestedMinutes: number;
  prompt: string;
  disclaimer: string;
  userCreated: boolean;
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

export type LanguageExamKind = string;

export type LanguageApplicability = "required" | "not_required" | "unknown" | "needs_verification";

export type LanguageSkill = "reading" | "writing" | "listening" | "speaking";

export type LanguagePlan = {
  examKind: LanguageExamKind;
  applicability: LanguageApplicability;
  testDate: string;
  resultDate: string;
  targetOverall: string;
  componentScores: string;
  expiryDate: string;
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

export type InterviewKind = "behavioral" | "ethical" | "clinical" | "communication" | "program_fit" | "custom";

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
  targetDate: string;
  fictional: boolean;
};

export type DocumentItemStatus = "not_started" | "in_progress" | "complete" | "not_required";

export type ChecklistItem = {
  id: string;
  label: string;
  status: DocumentItemStatus;
};

export type ApplicationStatus = "not_started" | "in_progress" | "submitted" | "withdrawn";

export type InvitationStatus = "none" | "invited" | "declined" | "waitlisted";

export type EligibilityPlanningStatus =
  | "unknown"
  | "needs_verification"
  | "planning_eligible"
  | "planning_ineligible";

export type CarmsProgram = {
  id: string;
  referenceProgramId: string;
  institutionId: string;
  name: string;
  specialty: string;
  provinceCode: string;
  officialUrl: string;
  carmsUrl: string;
  lastVerifiedDate: string;
  sourceStatus: "current" | "superseded" | "needs_review";
  eligibilityStatus: EligibilityPlanningStatus;
  cvStatus: DocumentItemStatus;
  letterStatus: DocumentItemStatus;
  referencesStatus: DocumentItemStatus;
  documents: ChecklistItem[];
  applicationStatus: ApplicationStatus;
  invitationStatus: InvitationStatus;
  invitationDate: string;
  interviewAt: string;
  interviewTimezone: string;
  interviewMode: "virtual" | "in_person" | "";
  interviewLocation: string;
  rsvpStatus: string;
  prepStatus: MilestoneStatus;
  reflection: string;
  interviewed: boolean;
  rankIncluded: boolean;
  rankOverride: boolean;
  rankPosition: number | null;
  rankWhy: string;
  rankPros: string;
  rankConcerns: string;
  interviewImpression: string;
  locationPreference: string;
  specialtyPreference: string;
  deadline: string;
  notes: string;
  saved: boolean;
  fictional: boolean;
};

export type MatchOutcomeStatus = "awaiting" | "matched" | "unmatched";

export type MatchOutcome = {
  status: MatchOutcomeStatus;
  programId: string | null;
  recordedAt: string;
  notes: string;
  nextCycleNotes: string;
};

export type CredentialRecord = {
  id: string;
  kind: string;
  status: MilestoneStatus;
  notes: string;
  targetDate: string;
};

export type ExamRecord = {
  status: MilestoneStatus;
  scheduledDate: string;
  attempt: string;
  result: string;
  notes: string;
};

export type OnboardingTask = {
  id: string;
  label: string;
  status: DocumentItemStatus;
  notes: string;
};

export type AppState = {
  version: typeof APP_STATE_VERSION;
  demoSignedIn: boolean;
  authMode: AuthMode;
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
  credentials: CredentialRecord[];
  mccqeExam: ExamRecord;
  nacExam: ExamRecord;
  carmsPhase: string;
  onboardingTasks: OnboardingTask[];
  residencyStartDate: string;
};

export const STORAGE_KEY = "img-compass-canada.v1";
export const AUTH_STORAGE_KEY = "img-compass-canada.auth.v2";
