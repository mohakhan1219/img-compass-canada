import { createId } from "@/domain/ids";
import type { AppState } from "@/domain/types";

export function logInterviewPractice(
  state: AppState,
  payload: { promptId: string; notes: string; performanceTags: string[]; improvementAreas: string },
): AppState {
  return {
    ...state,
    interviewSessions: [
      {
        id: createId("int-ses"),
        promptId: payload.promptId,
        practicedAt: new Date().toISOString(),
        notes: payload.notes,
        performanceTags: payload.performanceTags,
        improvementAreas: payload.improvementAreas,
      },
      ...state.interviewSessions,
    ],
  };
}
