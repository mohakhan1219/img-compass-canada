import { createDemoState } from "@/data/seed";
import type { LearnerStateRepository } from "@/data/learner-state-repository";
import type { AppState } from "@/domain/types";

/** Test double — not used in the browser. */
export class MemoryStateRepository implements LearnerStateRepository {
  private data = new Map<string, AppState>();

  async get(learnerId: string): Promise<AppState | null> {
    return this.data.get(learnerId) ?? null;
  }

  async save(learnerId: string, state: AppState): Promise<void> {
    this.data.set(learnerId, state);
  }

  async ping(): Promise<boolean> {
    return true;
  }

  seed(learnerId: string) {
    this.data.set(learnerId, createDemoState());
  }
}
