import type { JourneyStageId } from "@/domain/stages";

type CompassLine = { emoji: string; text: string };

const GENERAL: CompassLine[] = [
  { emoji: "🌟", text: "Small steps today build stronger outcomes tomorrow." },
  { emoji: "🎯", text: "Consistency turns preparation into progress." },
  { emoji: "🧭", text: "Keep moving forward — preparation compounds." },
  { emoji: "✨", text: "Learn. Reflect. Improve. Repeat." },
  { emoji: "🎯", text: "Focus on the next step, not the entire staircase." },
  { emoji: "✨", text: "Progress does not have to be perfect to be meaningful." },
  { emoji: "📚", text: "A calm, focused session is still a session that counts." },
  { emoji: "🌟", text: "Show up for the work in front of you. The rest follows." },
];

const MEDICAL: CompassLine[] = [
  { emoji: "🩺", text: "Every clinical lesson strengthens the physician you are becoming." },
  { emoji: "🩺", text: "Progress in medicine is built one focused day at a time." },
  { emoji: "📚", text: "Every question reviewed is another step toward readiness." },
  { emoji: "🩺", text: "Your medical journey is built through steady preparation." },
  { emoji: "🩺", text: "Medicine rewards preparation, persistence and compassion." },
  { emoji: "📚", text: "Knowledge grows through consistent practice." },
  { emoji: "🎯", text: "Preparation is a professional habit, not a performance." },
  { emoji: "📚", text: "Careful study is how you look after the people you will one day serve." },
];

/** Interleaved so consecutive days mix general and medical tones. */
export const COMPASS_MESSAGES: CompassLine[] = GENERAL.flatMap((g, i) => [g, MEDICAL[i % MEDICAL.length]]);

export function utcDayIndex(now: Date = new Date()): number {
  return Math.floor(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) / 86_400_000);
}

export function compassEntry(_currentStage: JourneyStageId, now: Date = new Date()): CompassLine {
  const day = utcDayIndex(now);
  return COMPASS_MESSAGES[day % COMPASS_MESSAGES.length];
}

export function compassMessage(currentStage: JourneyStageId, now: Date = new Date()): string {
  return compassEntry(currentStage, now).text;
}
