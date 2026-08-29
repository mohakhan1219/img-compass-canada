import { json, withRequest } from "@/server/http";
import { cognitoEnabled, consumeResetToken } from "@/server/users";
import { cognitoConfirmForgot } from "@/server/cognito";
import { logJson } from "@/server/log";
import { isPostgresConfigured } from "@/server/config";

export async function POST(req: Request) {
  return withRequest(req, async () => {
    if (!isPostgresConfigured()) return json({ error: "postgres_disabled" }, { status: 501 });
    const body = (await req.json()) as { email?: string; code?: string; password?: string };
    const email = String(body.email ?? "").trim();
    const code = String(body.code ?? "");
    const password = String(body.password ?? "");
    if (!email.includes("@") || password.length < 8 || !code) {
      return json({ error: "invalid_body" }, { status: 400 });
    }
    if (cognitoEnabled()) {
      const result = await cognitoConfirmForgot(email, code, password);
      if (!result.ok) return json({ error: result.error }, { status: 400 });
      logJson("info", "cognito_reset");
      return json({ ok: true });
    }
    const ok = await consumeResetToken(email, code, password);
    if (!ok) return json({ error: "invalid_code" }, { status: 400 });
    logJson("info", "local_reset");
    return json({ ok: true });
  });
}
