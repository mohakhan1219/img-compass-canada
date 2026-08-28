import type { AppState } from "@/domain/types";

/** Persistence port. Step G can implement this with an API + PostgreSQL. */
export interface PersistenceAdapter {
  load(): AppState;
  save(state: AppState): void;
}
