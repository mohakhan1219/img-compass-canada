import { PostgresStateRepository } from "@/data/postgres-state-repository";
import { isPostgresConfigured } from "@/server/config";
import type { LearnerStateRepository } from "@/data/learner-state-repository";

let repo: LearnerStateRepository | null = null;

export function getLearnerStateRepository(): LearnerStateRepository {
  if (!isPostgresConfigured()) {
    throw new Error("PostgreSQL is not configured (DATABASE_URL). Use local persistence mode.");
  }
  if (!repo) repo = new PostgresStateRepository();
  return repo;
}
