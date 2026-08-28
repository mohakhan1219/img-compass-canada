import type { AppState, ImgProfile } from "@/domain/types";

export function updateProfile(state: AppState, profile: ImgProfile): AppState {
  return { ...state, profile };
}

export function setDemoSignedIn(state: AppState, demoSignedIn: boolean): AppState {
  return { ...state, demoSignedIn };
}
