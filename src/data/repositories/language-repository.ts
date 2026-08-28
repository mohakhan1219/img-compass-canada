import { createId } from "@/domain/ids";
import type { AppState, LanguageApplicability, LanguageExamKind, LanguageSkill } from "@/domain/types";

export function updateLanguagePlan(
  state: AppState,
  examKind: LanguageExamKind,
  patch: Partial<{ applicability: LanguageApplicability; testDate: string; targetOverall: string; notes: string }>,
): AppState {
  const languagePlans = state.languagePlans.map((p) => (p.examKind === examKind ? { ...p, ...patch } : p));
  return { ...state, languagePlans };
}

export function logLanguageAttempt(
  state: AppState,
  payload: { examKind: LanguageExamKind; skill: LanguageSkill; score: string; notes: string },
): AppState {
  return {
    ...state,
    languageAttempts: [
      {
        id: createId("lang"),
        examKind: payload.examKind,
        skill: payload.skill,
        score: payload.score,
        attemptedAt: new Date().toISOString(),
        notes: payload.notes,
      },
      ...state.languageAttempts,
    ],
  };
}
