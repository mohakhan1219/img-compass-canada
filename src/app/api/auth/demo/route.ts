import { json, withRequest } from "@/server/http";
import { DEMO_LEARNER_ID, setLearnerCookie } from "@/server/session";
import { logJson } from "@/server/log";

export async function POST(req: Request) {
  return withRequest(req, async () => {
    await setLearnerCookie(DEMO_LEARNER_ID);
    logJson("info", "demo_sign_in");
    return json({ ok: true, learnerId: DEMO_LEARNER_ID });
  });
}
