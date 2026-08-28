import type { InterviewPractice, InterviewPrompt } from "./types";

export function practicesForPrompt(sessions: InterviewPractice[], promptId: string): InterviewPractice[] {
  return sessions.filter((s) => s.promptId === promptId);
}

export function recurringImprovementThemes(sessions: InterviewPractice[]): string[] {
  const counts = new Map<string, number>();
  for (const s of sessions) {
    for (const tag of s.performanceTags) {
      const t = tag.trim().toLowerCase();
      if (!t) continue;
      counts.set(t, (counts.get(t) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([t]) => t);
}

export function interviewPrepStarted(sessions: InterviewPractice[], bank: InterviewPrompt[]): boolean {
  return sessions.length > 0 && bank.length > 0;
}
