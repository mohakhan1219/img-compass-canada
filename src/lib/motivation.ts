import type { JourneyStageId } from "@/domain/stages";

const GENERAL = [
  "Small progress each day creates remarkable results.",
  "Consistency today creates opportunities tomorrow.",
  "Focus on the next step, not the entire staircase.",
  "Progress does not have to be perfect to be meaningful.",
  "Steady effort compounds more reliably than intensity alone.",
  "Show up for the work in front of you. The rest follows.",
  "A calm, focused session is still a session that counts.",
  "Keep the next hour useful. That is enough for today.",
] as const;

const PHYSICIAN = [
  "Every hour of preparation brings you closer to the physician you are working to become.",
  "Medicine rewards preparation, persistence and compassion.",
  "Every clinical lesson strengthens the physician you are becoming.",
  "Knowledge grows through consistent practice.",
  "Careful study is part of how physicians look after the people they will serve.",
  "Preparation is a professional habit, not a performance.",
  "Clear thinking comes from repeated, honest practice.",
] as const;

const IMG = [
  "You have already crossed borders for your medical journey. Keep moving forward.",
  "Your medical experience is part of your foundation. This is the next chapter.",
  "The Canadian residency pathway is a journey — progress one milestone at a time.",
  "Every completed milestone moves your residency journey forward.",
  "The pathway is long. Completing the step in front of you still matters.",
  "Research, exams and applications are sequential work. Take the next one.",
  "You are building a Canadian training pathway on a career you have already begun.",
] as const;

/** Interleaved so consecutive days mix general, physician, and IMG tones. */
export const COMPASS_MESSAGES = GENERAL.flatMap((g, i) =>
  [g, PHYSICIAN[i % PHYSICIAN.length], IMG[i % IMG.length]],
);

const STAGE_FOCUS: Partial<Record<JourneyStageId, string>> = {
  mccqe1: "You are currently focusing on MCCQE preparation. Keep building consistency.",
  nac: "NAC is on your horizon. Preparation now reduces pressure later.",
  language: "Language evidence is part of the pathway. Keep this requirement visible.",
  provincial: "Eligibility notes only help if they stay aligned with official sources.",
  programs: "Program research is how you turn eligibility into options. Keep notes precise.",
  carms: "CaRMS rewards organisation. Confirm dates against the official calendar.",
  applications: "Application quality matters more than volume. Review each file carefully.",
  interviews: "Interview season rewards clarity. Rehearse how you tell your story.",
  ranking: "Ranking is a considered decision. Revisit your notes before you submit.",
  match: "Match week is a process, not a verdict on your worth as a physician.",
  credentials: "Credential verification takes time. Keep the checklist moving.",
  profile: "A complete profile makes later planning more accurate. Fill what you can today.",
};

export function utcDayIndex(now: Date = new Date()): number {
  return Math.floor(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) / 86_400_000);
}

export function compassMessage(currentStage: JourneyStageId, now: Date = new Date()): string {
  const day = utcDayIndex(now);
  if (day % 11 === 0 && STAGE_FOCUS[currentStage]) {
    return STAGE_FOCUS[currentStage]!;
  }
  return COMPASS_MESSAGES[day % COMPASS_MESSAGES.length];
}
