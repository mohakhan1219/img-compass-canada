import type { AppState } from "@/domain/types";

/** Server-side persistence port. Adapters: Postgres (RDS) or in-memory for tests. */
export interface LearnerStateRepository {
  get(learnerId: string): Promise<AppState | null>;
  save(learnerId: string, state: AppState): Promise<void>;
  ping(): Promise<boolean>;
}
