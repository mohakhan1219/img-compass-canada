import { json, withRequest } from "@/server/http";
import { createSession } from "@/server/session";
import { cognitoEnabled, upsertCognitoUser, verifyLocalUser } from "@/server/users";
import { cognitoSignIn } from "@/server/cognito";
import { logJson } from "@/server/log";
import { isPostgresConfigured } from "@/server/config";

export async function POST(req: Request) {
  return withRequest(req, async () => {
    if (!isPostgresConfigured()) return json({ error: "postgres_disabled" }, { status: 501 });
    const body = (await req.json()) as { email?: string; password?: string };
    const email = String(body.email ?? "").trim();
    const password = String(body.password ?? "");
    if (!email.includes("@") || password.length < 8) {
      return json({ error: "invalid_credentials" }, { status: 400 });
    }
    if (cognitoEnabled()) {
      const result = await cognitoSignIn(email, password);
      if (!result.ok) return json({ error: "invalid_credentials" }, { status: 401 });
      const user = await upsertCognitoUser(email, result.sub || email);
      await createSession(user.id, "account");
      logJson("info", "cognito_signin");
      return json({ ok: true, mode: "cognito" });
    }
    const user = await verifyLocalUser(email, password);
    if (!user) return json({ error: "invalid_credentials" }, { status: 401 });
    await createSession(user.id, "account");
    logJson("info", "local_signin");
    return json({ ok: true, mode: "local" });
  });
}
