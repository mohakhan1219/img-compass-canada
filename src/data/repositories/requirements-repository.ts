import type { AppState, PathwayRequirement } from "@/domain/types";

import { mergeReferenceRequirements } from "@/data/seed";

export function setTargetProvinces(state: AppState, codes: string[]): AppState {
  const unique = [...new Set(codes)];
  return {
    ...state,
    targetProvinceCodes: unique,
    profile: { ...state.profile },
    requirements: mergeReferenceRequirements(state.requirements),
  };
}

/** Learners may update personal tracking only — not official applicability. */
export function updateRequirement(
  state: AppState,
  id: string,
  patch: Partial<Pick<PathwayRequirement, "userStatus" | "notes" | "blocker" | "targetDate">>,
): AppState {
  const requirements = state.requirements.map((r) => (r.id === id ? { ...r, ...patch } : r));
  return { ...state, requirements };
}
