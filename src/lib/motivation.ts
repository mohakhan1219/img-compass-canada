import type { JourneyStageId } from "@/domain/stages";

const BASE_MESSAGES = [
  "Every focused study session moves you one step closer to residency.",
  "Progress doesn't need to be perfect. It needs to continue.",
  "One milestone at a time. Keep moving forward.",
  "Today's preparation builds tomorrow's opportunity.",
  "Your journey is long, but every completed step counts.",
  "Consistency compounds. Show up for the work in front of you.",
  "Steady preparation is more durable than last-minute intensity.",
] as const;

const STAGE_FOCUS: Partial<Record<JourneyStageId, string>> = {
  mccqe1: "You're currently focusing on MCCQE preparation. Keep building consistency.",
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
  if (day % 3 === 0 && STAGE_FOCUS[currentStage]) {
    return STAGE_FOCUS[currentStage]!;
  }
  return BASE_MESSAGES[day % BASE_MESSAGES.length];
}
