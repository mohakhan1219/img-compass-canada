import type { AppState, CarmsProgram, MatchOutcome } from "@/domain/types";

export function updateProgram(state: AppState, id: string, patch: Partial<Omit<CarmsProgram, "id" | "fictional">>): AppState {
  const programs = state.programs.map((p) => (p.id === id ? { ...p, ...patch, fictional: true as const } : p));
  return { ...state, programs };
}

export function setMatchOutcome(state: AppState, matchOutcome: MatchOutcome): AppState {
  return { ...state, matchOutcome };
}

export function setRankOrder(state: AppState, orderedIds: string[]): AppState {
  const programs = state.programs.map((p) => {
    const idx = orderedIds.indexOf(p.id);
    if (idx === -1) return { ...p, rankIncluded: false, rankPosition: null, fictional: true as const };
    return { ...p, rankIncluded: true, rankPosition: idx + 1, fictional: true as const };
  });
  return { ...state, programs };
}
