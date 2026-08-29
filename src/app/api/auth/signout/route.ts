import { json, withRequest } from "@/server/http";
import { clearSession } from "@/server/session";
import { logJson } from "@/server/log";

export async function POST(req: Request) {
  return withRequest(req, async () => {
    await clearSession();
    logJson("info", "sign_out");
    return json({ ok: true });
  });
}
