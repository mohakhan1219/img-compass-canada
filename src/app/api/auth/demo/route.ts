import { json, withRequest } from "@/server/http";
import { createSession, DEMO_LEARNER_ID } from "@/server/session";
import { logJson } from "@/server/log";

export async function POST(req: Request) {
  return withRequest(req, async () => {
    await createSession(DEMO_LEARNER_ID, "demo");
    logJson("info", "demo_sign_in");
    return json({ ok: true, mode: "demo" });
  });
}
