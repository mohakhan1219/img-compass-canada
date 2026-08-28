import { createId } from "@/domain/ids";
import { clampNacScore } from "@/domain/nac";
import type { AppState } from "@/domain/types";

export function logNacAttempt(
  state: AppState,
  payload: {
    stationId: string;
    startedAt: string;
    endedAt: string;
    durationSeconds: number;
    score: number;
    weakTags: string[];
    notes: string;
    mockId?: string | null;
  },
): AppState {
  return {
    ...state,
    nacAttempts: [
      {
        id: createId("nac-att"),
        stationId: payload.stationId,
        startedAt: payload.startedAt,
        endedAt: payload.endedAt,
        durationSeconds: payload.durationSeconds,
        score: clampNacScore(payload.score),
        weakTags: payload.weakTags.filter(Boolean),
        notes: payload.notes,
        kind: payload.mockId ? "mock_station" : "station",
        mockId: payload.mockId ?? null,
      },
      ...state.nacAttempts,
    ],
  };
}

export function logNacMock(
  state: AppState,
  payload: { stationIds: string[]; notes: string; startedAt: string; endedAt: string },
): AppState {
  const mockId = createId("nac-mock");
  return {
    ...state,
    nacMocks: [
      { id: mockId, startedAt: payload.startedAt, endedAt: payload.endedAt, stationIds: payload.stationIds, notes: payload.notes },
      ...state.nacMocks,
    ],
  };
}
