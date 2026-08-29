import { createEmptyState, createDemoState } from "@/data/seed";
import { getLearnerStateRepository } from "@/server/repository";
import { json, withRequest } from "@/server/http";
import { DEMO_LEARNER_ID, getSession } from "@/server/session";
import { logJson } from "@/server/log";
import { isPostgresConfigured } from "@/server/config";
import type { AppState } from "@/domain/types";

export async function GET(req: Request) {
  return withRequest(req, async () => {
    if (!isPostgresConfigured()) {
      return json({ error: "postgres_disabled", hint: "Use local persistence or set DATABASE_URL." }, { status: 501 });
    }
    const session = await getSession();
    if (!session) return json({ error: "unauthorized" }, { status: 401 });
    const repo = getLearnerStateRepository();
    const existing = await repo.get(session.userId);
    const isDemo = session.kind === "demo" || session.userId === DEMO_LEARNER_ID;
    const state = existing ?? (isDemo ? createDemoState() : createEmptyState());
    if (!existing) {
      state.demoSignedIn = true;
      state.authMode = isDemo ? "demo" : "account";
      await repo.save(session.userId, state);
    }
    logJson("info", "state_loaded", { learner: session.userId, kind: session.kind });
    return json({ state });
  });
}

export async function PUT(req: Request) {
  return withRequest(req, async () => {
    if (!isPostgresConfigured()) {
      return json({ error: "postgres_disabled" }, { status: 501 });
    }
    const session = await getSession();
    if (!session) return json({ error: "unauthorized" }, { status: 401 });
    const body = (await req.json()) as { state?: AppState };
    if (!body.state) return json({ error: "invalid_body" }, { status: 400 });
    const isDemo = session.kind === "demo" || session.userId === DEMO_LEARNER_ID;
    await getLearnerStateRepository().save(session.userId, {
      ...body.state,
      demoSignedIn: true,
      authMode: isDemo ? "demo" : "account",
    });
    logJson("info", "state_saved", { learner: session.userId });
    return json({ ok: true });
  });
}
