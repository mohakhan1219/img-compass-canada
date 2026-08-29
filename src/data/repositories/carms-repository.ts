import type { AppState, CarmsProgram, MatchOutcome } from "@/domain/types";
import { trackingFromReference } from "@/data/seed";

export function updateProgram(state: AppState, id: string, patch: Partial<Omit<CarmsProgram, "id">>): AppState {
  const programs = state.programs.map((p) => (p.id === id ? { ...p, ...patch } : p));
  return { ...state, programs };
}

export function saveReferenceProgram(state: AppState, referenceProgramId: string): AppState {
  if (state.programs.some((p) => p.referenceProgramId === referenceProgramId)) {
    return {
      ...state,
      programs: state.programs.map((p) => (p.referenceProgramId === referenceProgramId ? { ...p, saved: true } : p)),
    };
  }
  return { ...state, programs: [...state.programs, trackingFromReference(referenceProgramId)] };
}

export function addApplication(state: AppState, programId: string): AppState {
  return updateProgram(state, programId, { applicationStatus: "in_progress", saved: true });
}

export function setMatchOutcome(state: AppState, matchOutcome: MatchOutcome): AppState {
  return { ...state, matchOutcome };
}

export function setRankOrder(state: AppState, orderedIds: string[]): AppState {
  const programs = state.programs.map((p) => {
    const idx = orderedIds.indexOf(p.id);
    if (idx === -1)     return { ...p, rankIncluded: false, rankPosition: null };
    return { ...p, rankIncluded: true, rankPosition: idx + 1 };
  });
  return { ...state, programs };
}
