import type { JourneyStageId } from "@/domain/stages";

const GENERAL = [
  "Small steps today build stronger outcomes tomorrow.",
  "Consistency turns preparation into progress.",
  "Keep moving forward — preparation compounds.",
  "Learn. Reflect. Improve. Repeat.",
  "Focus on the next step, not the entire staircase.",
  "Progress does not have to be perfect to be meaningful.",
  "A calm, focused session is still a session that counts.",
  "Show up for the work in front of you. The rest follows.",
] as const;

const MEDICAL = [
  "Every clinical lesson strengthens the physician you are becoming.",
  "Progress in medicine is built one focused day at a time.",
  "Every question reviewed is another step toward readiness.",
  "Your medical journey is built through steady preparation.",
  "Medicine rewards preparation, persistence and compassion.",
  "Knowledge grows through consistent practice.",
  "Preparation is a professional habit, not a performance.",
  "Careful study is how you look after the people you will one day serve.",
] as const;

/** Interleaved so consecutive days mix general and medical tones. */
export const COMPASS_MESSAGES = GENERAL.flatMap((g, i) => [g, MEDICAL[i % MEDICAL.length]]);

export function utcDayIndex(now: Date = new Date()): number {
  return Math.floor(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) / 86_400_000);
}

export function compassMessage(_currentStage: JourneyStageId, now: Date = new Date()): string {
  const day = utcDayIndex(now);
  return COMPASS_MESSAGES[day % COMPASS_MESSAGES.length];
}
