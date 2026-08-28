import type { AppState, PathwayRequirement } from "@/domain/types";

export function setTargetProvinces(state: AppState, codes: string[]): AppState {
  const unique = [...new Set(codes)];
  return { ...state, targetProvinceCodes: unique };
}

export function updateRequirement(
  state: AppState,
  id: string,
  patch: Partial<Omit<PathwayRequirement, "id" | "fictional">>,
): AppState {
  const requirements = state.requirements.map((r) => (r.id === id ? { ...r, ...patch, fictional: true as const } : r));
  return { ...state, requirements };
}
