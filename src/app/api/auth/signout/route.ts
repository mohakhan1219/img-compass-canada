import { json, withRequest } from "@/server/http";
import { clearLearnerCookie } from "@/server/session";
import { logJson } from "@/server/log";

export async function POST(req: Request) {
  return withRequest(req, async () => {
    await clearLearnerCookie();
    logJson("info", "demo_sign_out");
    return json({ ok: true });
  });
}
