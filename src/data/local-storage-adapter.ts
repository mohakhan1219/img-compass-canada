import { STORAGE_KEY, type AppState } from "@/domain/types";
import type { PersistenceAdapter } from "./adapter";
import { migrateToCurrent } from "./migrate";
import { createDemoState } from "./seed";

export class LocalStorageAdapter implements PersistenceAdapter {
  load(): AppState {
    if (typeof window === "undefined") return createDemoState();
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return createDemoState();
      return migrateToCurrent(JSON.parse(raw));
    } catch {
      return createDemoState();
    }
  }

  save(state: AppState): void {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }
}

export const localStorageAdapter = new LocalStorageAdapter();
