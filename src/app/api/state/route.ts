import { createDemoState } from "@/data/seed";
import { getLearnerStateRepository } from "@/server/repository";
import { json, withRequest } from "@/server/http";
import { getLearnerId } from "@/server/session";
import { logJson } from "@/server/log";
import { isPostgresConfigured } from "@/server/config";
import type { AppState } from "@/domain/types";

export async function GET(req: Request) {
  return withRequest(req, async () => {
    if (!isPostgresConfigured()) {
      return json({ error: "postgres_disabled", hint: "Use local persistence or set DATABASE_URL." }, { status: 501 });
    }
    const learnerId = await getLearnerId();
    if (!learnerId) return json({ error: "unauthorized" }, { status: 401 });
    const repo = getLearnerStateRepository();
    const existing = await repo.get(learnerId);
    const state = existing ?? createDemoState();
    if (!existing) {
      state.demoSignedIn = true;
      await repo.save(learnerId, state);
    }
    logJson("info", "state_loaded");
    return json({ state });
  });
}

export async function PUT(req: Request) {
  return withRequest(req, async () => {
    if (!isPostgresConfigured()) {
      return json({ error: "postgres_disabled" }, { status: 501 });
    }
    const learnerId = await getLearnerId();
    if (!learnerId) return json({ error: "unauthorized" }, { status: 401 });
    const body = (await req.json()) as { state?: AppState };
    if (!body.state) return json({ error: "invalid_body" }, { status: 400 });
    await getLearnerStateRepository().save(learnerId, { ...body.state, demoSignedIn: true });
    logJson("info", "state_saved");
    return json({ ok: true });
  });
}
