import type {
  AppState,
  CarmsProgram,
  CredentialRecord,
  ExamRecord,
  ImgProfile,
  InterviewPrompt,
  LanguagePlan,
  NacStation,
  OnboardingTask,
  PathwayRequirement,
} from "@/domain/types";
import { APP_STATE_VERSION } from "@/domain/types";
import { CREDENTIAL_CATALOG } from "@/reference/catalogs";
import { LANGUAGE_EXAM_CATALOG } from "@/reference/catalogs";
import { REFERENCE_REQUIREMENTS } from "@/reference/pathway-requirements";
import { referenceProgramById } from "@/reference/programs";
import { institutionById } from "@/reference/institutions";
import { specialtyById } from "@/reference/specialties";

export const DEMO_CATALOGS = [
  {
    id: "compass-core-qbank",
    name: "Compass Core Qbank (personal tracker)",
    kind: "qbank" as const,
    totalQuestions: 1200,
    disclaimer:
      "Original Compass catalog for volume tracking only. This is not the MCCQE universe and is not MCC content.",
  },
  {
    id: "compass-clinical-cases",
    name: "Compass Clinical Cases (personal tracker)",
    kind: "cases" as const,
    totalQuestions: 180,
    disclaimer: "Synthetic case set for logging practice volume. Not MCC, NAC, or publisher content.",
  },
];

const DEMO_NOW = Date.parse("2026-08-20T15:00:00.000Z");
const iso = (offsetHours: number) => new Date(DEMO_NOW - offsetHours * 3600_000).toISOString();

export const PRACTICE_NAC_STATIONS: NacStation[] = [
  {
    id: "nac-hx-fatigue",
    title: "Adult with fatigue",
    category: "history_taking",
    clinicalArea: "Internal medicine",
    suggestedMinutes: 8,
    prompt:
      "Original Compass stem: a clinic visit for several weeks of tiredness. Practise a structured history. Not an official NAC station.",
    disclaimer: "Original timing practice only.",
    userCreated: false,
  },
  {
    id: "nac-hx-cough",
    title: "Persistent cough",
    category: "history_taking",
    clinicalArea: "Respiratory",
    suggestedMinutes: 8,
    prompt: "Original Compass stem: cough for six weeks.",
    disclaimer: "Original timing practice only.",
    userCreated: false,
  },
  {
    id: "nac-pe-knee",
    title: "Knee examination",
    category: "physical_examination",
    clinicalArea: "Musculoskeletal",
    suggestedMinutes: 6,
    prompt: "Original Compass: describe a focused knee exam sequence.",
    disclaimer: "Original timing practice only.",
    userCreated: false,
  },
  {
    id: "nac-pe-resp",
    title: "Respiratory examination",
    category: "physical_examination",
    clinicalArea: "Respiratory",
    suggestedMinutes: 6,
    prompt: "Original Compass: talk through inspection, percussion, auscultation.",
    disclaimer: "Original timing practice only.",
    userCreated: false,
  },
  {
    id: "nac-comm-results",
    title: "Explaining a blood-test delay",
    category: "communication_counselling",
    clinicalArea: "Communication",
    suggestedMinutes: 8,
    prompt: "Original Compass: a result is delayed. Practise clear, honest communication.",
    disclaimer: "Original timing practice only.",
    userCreated: false,
  },
  {
    id: "nac-comm-lifestyle",
    title: "Activity counselling after a sprain",
    category: "communication_counselling",
    clinicalArea: "Musculoskeletal",
    suggestedMinutes: 8,
    prompt: "Original Compass: return-to-activity counselling.",
    disclaimer: "Original timing practice only.",
    userCreated: false,
  },
  {
    id: "nac-dx-chest",
    title: "Chest pain differentials",
    category: "differential_diagnosis",
    clinicalArea: "Emergency / clinic",
    suggestedMinutes: 6,
    prompt: "Original Compass: list and justify a short differential.",
    disclaimer: "Original timing practice only.",
    userCreated: false,
  },
  {
    id: "nac-dx-abdo",
    title: "Abdominal pain differentials",
    category: "differential_diagnosis",
    clinicalArea: "Gastroenterology",
    suggestedMinutes: 6,
    prompt: "Original Compass: organise a differential by urgency.",
    disclaimer: "Original timing practice only.",
    userCreated: false,
  },
];

export const PRACTICE_INTERVIEW_BANK: InterviewPrompt[] = [
  {
    id: "int-beh-team",
    kind: "behavioral",
    prompt: "Tell me about a time you disagreed with a colleague about a care plan. How did you handle it?",
    disclaimer: "Original Compass prompt. Not from a residency programme.",
  },
  {
    id: "int-beh-fail",
    kind: "behavioral",
    prompt: "Describe a mistake you made in training and what you changed afterward.",
    disclaimer: "Original Compass prompt.",
  },
  {
    id: "int-eth-consent",
    kind: "ethical",
    prompt: "A relative asks you not to tell the patient a diagnosis. How do you approach this?",
    disclaimer: "Original Compass scenario for reflection, not legal advice.",
  },
  {
    id: "int-eth-resource",
    kind: "ethical",
    prompt: "Two patients need the last monitored bed. What principles guide you?",
    disclaimer: "Original Compass scenario. Not a real ethics-board case.",
  },
  {
    id: "int-clin-fever",
    kind: "clinical",
    prompt: "Walk through your approach to fever in a returning traveller in clinic.",
    disclaimer: "Original Compass prompt. Not a scored exam case.",
  },
  {
    id: "int-clin-sob",
    kind: "clinical",
    prompt: "A clinic patient reports new shortness of breath. How do you structure the visit?",
    disclaimer: "Original Compass prompt.",
  },
  {
    id: "int-comm-teach",
    kind: "communication",
    prompt: "How do you explain a change in management when a patient expected a different plan?",
    disclaimer: "Original Compass prompt.",
  },
  {
    id: "int-fit-why",
    kind: "program_fit",
    prompt: "Why this program, and what would you contribute in the first six months?",
    disclaimer: "Original Compass prompt. Not from a real faculty.",
  },
];

export function emptyExam(): ExamRecord {
  return { status: "", scheduledDate: "", attempt: "", result: "", notes: "" };
}

export function emptyProfile(): ImgProfile {
  return {
    displayName: "",
    timezone: "America/Toronto",
    notes: "",
    countryOfResidence: "",
    preferredLanguage: "",
    medicalSchoolCountry: "",
    medicalSchoolId: "",
    medicalSchoolOther: "",
    graduationYear: "",
    medicalDegree: "",
    internshipStatus: "",
    internshipDuration: "",
    graduationStatus: "",
    postgraduateTraining: "",
    postgraduateSpecialty: "",
    postgraduateCountry: "",
    postgraduateDuration: "",
    independentPractice: "",
    yearsOfPractice: "",
    canadaStatus: "",
    careerGoal: "",
    targetMatchCycleId: "r1-2027-first",
    specialtyInterestIds: [],
    relocateAnywhere: "",
    physiciansapplyStatus: "",
    credentialVerificationStatus: "",
    mccqeStatus: "",
    nacExamStatus: "",
    languageEvidenceStatus: "",
    onboardingComplete: false,
    targetExamWindow: "",
  };
}

export function defaultCredentials(): CredentialRecord[] {
  return CREDENTIAL_CATALOG.map((c) => ({
    id: c.id,
    kind: c.id,
    status: "" as const,
    notes: "",
    targetDate: "",
  }));
}

export function defaultLanguagePlans(): LanguagePlan[] {
  return LANGUAGE_EXAM_CATALOG.map((e) => ({
    examKind: e.id,
    applicability: "needs_verification" as const,
    testDate: "",
    resultDate: "",
    targetOverall: "",
    componentScores: "",
    expiryDate: "",
    notes: "",
  }));
}

export function mergeReferenceRequirements(
  userRows: PathwayRequirement[] | undefined,
): PathwayRequirement[] {
  const byId = new Map((userRows ?? []).map((r) => [r.id, r]));
  return REFERENCE_REQUIREMENTS.map((ref) => {
    const user = byId.get(ref.id);
    return {
      id: ref.id,
      provinceCode: ref.provinceCode,
      category: ref.category,
      name: ref.name,
      applicability: ref.applicability,
      userStatus: user?.userStatus ?? "not_started",
      authority: ref.authority,
      sourceUrl: ref.sourceUrl,
      effectiveDate: ref.effectiveDate,
      lastVerifiedDate: ref.lastVerifiedDate,
      version: ref.version,
      notes: user?.notes ?? "",
      blocker: user?.blocker ?? false,
      targetDate: user?.targetDate ?? "",
      fictional: false,
    };
  });
}

export function trackingFromReference(referenceProgramId: string, extras: Partial<CarmsProgram> = {}): CarmsProgram {
  const ref = referenceProgramById(referenceProgramId);
  const inst = ref ? institutionById(ref.institutionId) : undefined;
  const spec = ref ? specialtyById(ref.specialtyId) : undefined;
  return {
    id: extras.id ?? `track-${referenceProgramId}`,
    referenceProgramId,
    institutionId: ref?.institutionId ?? "",
    name: extras.name ?? `${inst?.name ?? "Institution"} — ${spec?.name ?? "Specialty"}`,
    specialty: spec?.name ?? extras.specialty ?? "",
    provinceCode: ref?.provinceCode ?? extras.provinceCode ?? "",
    officialUrl: ref?.officialUrl ?? "",
    carmsUrl: ref?.carmsUrl ?? "https://www.carms.ca/",
    lastVerifiedDate: ref?.lastVerifiedDate ?? "",
    sourceStatus: ref?.sourceStatus ?? "needs_review",
    eligibilityStatus: extras.eligibilityStatus ?? "needs_verification",
    cvStatus: extras.cvStatus ?? "not_started",
    letterStatus: extras.letterStatus ?? "not_started",
    referencesStatus: extras.referencesStatus ?? "not_started",
    documents: extras.documents ?? [
      { id: "doc-photo", label: "Photo (do not upload files here)", status: "not_started" },
      { id: "doc-questions", label: "Program-specific questions (tracker only)", status: "not_started" },
    ],
    applicationStatus: extras.applicationStatus ?? "not_started",
    invitationStatus: extras.invitationStatus ?? "none",
    invitationDate: extras.invitationDate ?? "",
    interviewAt: extras.interviewAt ?? "",
    interviewTimezone: extras.interviewTimezone ?? "America/Toronto",
    interviewMode: extras.interviewMode ?? "",
    interviewLocation: extras.interviewLocation ?? "",
    rsvpStatus: extras.rsvpStatus ?? "",
    prepStatus: extras.prepStatus ?? "",
    reflection: extras.reflection ?? "",
    interviewed: extras.interviewed ?? false,
    rankIncluded: extras.rankIncluded ?? false,
    rankOverride: extras.rankOverride ?? false,
    rankPosition: extras.rankPosition ?? null,
    rankWhy: extras.rankWhy ?? "",
    rankPros: extras.rankPros ?? "",
    rankConcerns: extras.rankConcerns ?? "",
    interviewImpression: extras.interviewImpression ?? "",
    locationPreference: extras.locationPreference ?? "",
    specialtyPreference: extras.specialtyPreference ?? "",
    deadline: extras.deadline ?? "2026-11-26",
    notes: extras.notes ?? "",
    saved: extras.saved ?? true,
    fictional: extras.fictional ?? false,
  };
}

export function defaultOnboardingTasks(): OnboardingTask[] {
  return [
    { id: "comm", label: "Program communication", status: "not_started", notes: "" },
    { id: "licence", label: "Licensing / registration milestone", status: "not_started", notes: "" },
    { id: "onboard", label: "Program onboarding tasks", status: "not_started", notes: "" },
    { id: "orient", label: "Orientation", status: "not_started", notes: "" },
    { id: "reloc", label: "Relocation", status: "not_started", notes: "" },
  ];
}

export function createEmptyState(): AppState {
  return {
    version: APP_STATE_VERSION,
    demoSignedIn: false,
    authMode: "anonymous",
    profile: emptyProfile(),
    catalogs: DEMO_CATALOGS,
    sessions: [],
    reviews: [],
    nacStations: PRACTICE_NAC_STATIONS,
    nacAttempts: [],
    nacMocks: [],
    languagePlans: defaultLanguagePlans(),
    languageAttempts: [],
    interviewBank: PRACTICE_INTERVIEW_BANK,
    interviewSessions: [],
    targetProvinceCodes: [],
    requirements: mergeReferenceRequirements([]),
    programs: [],
    matchOutcome: { status: "awaiting", programId: null, recordedAt: "", notes: "", nextCycleNotes: "" },
    credentials: defaultCredentials(),
    mccqeExam: emptyExam(),
    nacExam: emptyExam(),
    carmsPhase: "registration",
    onboardingTasks: defaultOnboardingTasks(),
    residencyStartDate: "",
  };
}

export const DEMO_NAC_STATIONS = PRACTICE_NAC_STATIONS;
export const DEMO_INTERVIEW_BANK = PRACTICE_INTERVIEW_BANK;

export function createDemoState(): AppState {
  const empty = createEmptyState();
  const programs: CarmsProgram[] = [
    trackingFromReference("utoronto-family-medicine", {
      id: "track-utoronto-family-medicine",
      eligibilityStatus: "needs_verification",
      cvStatus: "in_progress",
      letterStatus: "not_started",
      referencesStatus: "in_progress",
      applicationStatus: "in_progress",
      notes: "Personal tracking for University of Toronto Family Medicine research record.",
    }),
    trackingFromReference("ubc-internal-medicine", {
      id: "track-ubc-internal-medicine",
      cvStatus: "complete",
      letterStatus: "complete",
      referencesStatus: "complete",
      applicationStatus: "submitted",
      invitationStatus: "invited",
      invitationDate: "2026-12-10",
      interviewAt: "2027-01-22T15:00:00.000Z",
      interviewMode: "virtual",
      interviewLocation: "Zoom (user-entered)",
      rsvpStatus: "accepted",
      prepStatus: "in_progress",
      interviewed: true,
      rankIncluded: true,
      rankPosition: 1,
      rankWhy: "Strong fit with the training environment I observed (personal note).",
      rankPros: "Location and generalist training.",
      rankConcerns: "Competitive stream — confirm IMG criteria on CaRMS.",
      interviewImpression: "Felt prepared on communication stations.",
      notes: "Application submitted; interview completed (synthetic demo progress).",
    }),
    trackingFromReference("ualberta-pediatrics", {
      id: "track-ualberta-pediatrics",
      notes: "Early-stage paediatrics research.",
    }),
  ];

  const targetProvinceCodes = ["ON", "BC"];
  const requirements = mergeReferenceRequirements(
    [
      {
        ...REFERENCE_REQUIREMENTS.find((x) => x.id === "on-legal-status")!,
        userStatus: "not_started",
        notes: "Demo: legal-status documents still to confirm with CaRMS.",
        blocker: true,
        targetDate: "2026-10-16",
        fictional: false,
      },
      {
        ...REFERENCE_REQUIREMENTS.find((x) => x.id === "bc-language")!,
        userStatus: "in_progress",
        notes: "Demo: collecting language evidence; applicability still needs verification.",
        blocker: false,
        targetDate: "",
        fictional: false,
      },
    ],
  );

  return {
    ...empty,
    authMode: "demo",
    profile: {
      ...emptyProfile(),
      displayName: "Dr. Alex Morgan",
      timezone: "America/Toronto",
      countryOfResidence: "PK",
      preferredLanguage: "en",
      medicalSchoolCountry: "PK",
      medicalSchoolId: "dow",
      medicalSchoolOther: "",
      graduationYear: "2019",
      medicalDegree: "mbbs",
      internshipStatus: "completed",
      internshipDuration: "12 months",
      graduationStatus: "Graduated; not currently in Canadian postgraduate training",
      postgraduateTraining: "no",
      independentPractice: "yes",
      yearsOfPractice: "4",
      canadaStatus: "other",
      careerGoal: "carms",
      targetMatchCycleId: "r1-2027-first",
      specialtyInterestIds: ["family-medicine", "internal-medicine"],
      relocateAnywhere: "maybe",
      physiciansapplyStatus: "in_progress",
      credentialVerificationStatus: "in_progress",
      mccqeStatus: "in_progress",
      nacExamStatus: "not_started",
      languageEvidenceStatus: "in_progress",
      onboardingComplete: true,
      targetExamWindow: "2027 Q1",
      notes: "Planning a 2027 match cycle. Confirm provincial routes before submitting documents.",
    },
    sessions: [
      {
        id: "ses-demo-1",
        startedAt: iso(72),
        endedAt: iso(70),
        timezone: "America/Toronto",
        notes: "Mixed medicine block.",
        catalogId: "compass-core-qbank",
        attempted: 40,
        correct: 26,
        incorrect: 12,
        omitted: 2,
        rawMinutes: 120,
        creditedMinutes: 120,
        safety: "ok",
        confirmedOverCap: false,
      },
      {
        id: "ses-demo-2",
        startedAt: iso(30),
        endedAt: iso(27.5),
        timezone: "America/Toronto",
        notes: "Longer block to illustrate the 3-hour warning.",
        catalogId: "compass-core-qbank",
        attempted: 55,
        correct: 33,
        incorrect: 20,
        omitted: 2,
        rawMinutes: 150,
        creditedMinutes: 150,
        safety: "ok",
        confirmedOverCap: false,
      },
      {
        id: "ses-demo-3",
        startedAt: iso(8),
        endedAt: iso(3.5),
        timezone: "America/Toronto",
        notes: "Over-cap demo: credited time capped until the learner confirms.",
        catalogId: "compass-clinical-cases",
        attempted: 18,
        correct: 11,
        incorrect: 6,
        omitted: 1,
        rawMinutes: 270,
        creditedMinutes: 240,
        safety: "needs_confirmation",
        confirmedOverCap: false,
      },
    ],
    reviews: [
      {
        id: "rev-1",
        topic: "Hyponatraemia workup (personal topic)",
        firstSeenAt: iso(24 * 10),
        completedIntervals: [1],
        notes: "Synthetic spaced-review card. Not from a paid bank.",
      },
      {
        id: "rev-2",
        topic: "Paediatric fever without source",
        firstSeenAt: iso(24 * 3),
        completedIntervals: [],
        notes: "",
      },
      {
        id: "rev-3",
        topic: "COPD exacerbation",
        firstSeenAt: iso(2),
        completedIntervals: [],
        notes: "Due soon on the 1-day interval.",
      },
    ],
    nacAttempts: [
      {
        id: "nac-att-1",
        stationId: "nac-hx-fatigue",
        startedAt: iso(50),
        endedAt: iso(49.85),
        durationSeconds: 540,
        score: 6.5,
        weakTags: ["time management"],
        notes: "Demo attempt.",
        kind: "station",
        mockId: null,
      },
      {
        id: "nac-att-2",
        stationId: "nac-pe-knee",
        startedAt: iso(40),
        endedAt: iso(39.9),
        durationSeconds: 360,
        score: 7,
        weakTags: ["exam sequence"],
        notes: "",
        kind: "station",
        mockId: null,
      },
      {
        id: "nac-att-3",
        stationId: "nac-comm-results",
        startedAt: iso(20),
        endedAt: iso(19.87),
        durationSeconds: 480,
        score: 6,
        weakTags: ["time management", "teach-back"],
        notes: "",
        kind: "station",
        mockId: null,
      },
    ],
    nacMocks: [
      {
        id: "nac-mock-1",
        startedAt: iso(18),
        endedAt: iso(17),
        stationIds: ["nac-hx-fatigue", "nac-dx-chest"],
        notes: "Short demo mock — two original stations.",
      },
    ],
    languagePlans: defaultLanguagePlans().map((p) =>
      p.examKind === "oet_medicine"
        ? { ...p, applicability: "needs_verification", testDate: "2026-11-15", notes: "Confirm acceptance with target programs." }
        : p.examKind === "celpip"
          ? { ...p, applicability: "unknown" }
          : p,
    ),
    languageAttempts: [
      {
        id: "lang-1",
        examKind: "oet_medicine",
        skill: "speaking",
        score: "350",
        attemptedAt: iso(12),
        notes: "Speaking practice.",
      },
    ],
    interviewSessions: [
      {
        id: "int-ses-1",
        promptId: "int-beh-team",
        practicedAt: iso(15),
        notes: "Practised aloud.",
        performanceTags: ["structure"],
        improvementAreas: "Tighter opening sentence.",
      },
    ],
    targetProvinceCodes,
    requirements,
    programs,
    matchOutcome: { status: "awaiting", programId: null, recordedAt: "", notes: "", nextCycleNotes: "" },
    credentials: defaultCredentials().map((c) =>
      c.kind === "physiciansapply_account"
        ? { ...c, status: "in_progress", notes: "Account created (synthetic)." }
        : c.kind === "source_verification"
          ? { ...c, status: "in_progress" }
          : c,
    ),
    mccqeExam: {
      status: "in_progress",
      scheduledDate: "2026-10-10",
      attempt: "1",
      result: "",
      notes: "Personal exam tracker — not an MCC registration.",
    },
    nacExam: { status: "not_started", scheduledDate: "", attempt: "", result: "", notes: "" },
    carmsPhase: "application",
  };
}

/** @deprecated Use PRACTICE_NAC_STATIONS */
export const DEMO_REQUIREMENTS: PathwayRequirement[] = [];
export const DEMO_PROGRAMS: CarmsProgram[] = [];
export const DEMO_LANGUAGE_PLANS = defaultLanguagePlans();
