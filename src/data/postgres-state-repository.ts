import { migrateToCurrent } from "@/data/migrate";
import type { LearnerStateRepository } from "@/data/learner-state-repository";
import type { AppState } from "@/domain/types";
import { getPool, pingDatabase } from "@/server/db";
import { logJson } from "@/server/log";
import { inc } from "@/server/metrics";

export class PostgresStateRepository implements LearnerStateRepository {
  async get(learnerId: string): Promise<AppState | null> {
    const pool = getPool();
    if (!pool) throw new Error("DATABASE_URL is not configured");
    const result = await pool.query<{ payload: AppState }>(
      "select payload from learner_state where learner_id = $1",
      [learnerId],
    );
    const row = result.rows[0];
    if (!row) return null;
    const mode = learnerId === "demo-alex" ? "demo" : "empty";
    return migrateToCurrent(row.payload, mode);
  }

  async save(learnerId: string, state: AppState): Promise<void> {
    const pool = getPool();
    if (!pool) throw new Error("DATABASE_URL is not configured");
    try {
      await pool.query(
        `insert into learner_state (learner_id, payload, updated_at)
         values ($1, $2::jsonb, now())
         on conflict (learner_id)
         do update set payload = excluded.payload, updated_at = now()`,
        [learnerId, JSON.stringify(state)],
      );
      inc("persist_saves");
    } catch (err) {
      inc("persist_errors");
      logJson("error", "persist_save_failed", { error: err instanceof Error ? err.message : "unknown" });
      throw err;
    }
  }

  async ping(): Promise<boolean> {
    return pingDatabase();
  }
}
