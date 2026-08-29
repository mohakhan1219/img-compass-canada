import { json, withRequest } from "@/server/http";
import { createSession } from "@/server/session";
import { cognitoEnabled } from "@/server/users";
import { createLocalUser } from "@/server/users";
import { cognitoSignUp } from "@/server/cognito";
import { logJson } from "@/server/log";
import { isPostgresConfigured } from "@/server/config";

function validPassword(password: string): boolean {
  return password.length >= 8 && password.length <= 128;
}

export async function POST(req: Request) {
  return withRequest(req, async () => {
    if (!isPostgresConfigured()) return json({ error: "postgres_disabled" }, { status: 501 });
    const body = (await req.json()) as { email?: string; password?: string };
    const email = String(body.email ?? "").trim();
    const password = String(body.password ?? "");
    if (!email.includes("@") || !validPassword(password)) {
      return json({ error: "invalid_credentials" }, { status: 400 });
    }
    try {
      if (cognitoEnabled()) {
        const result = await cognitoSignUp(email, password);
        if (!result.ok) return json({ error: result.error, confirmRequired: true }, { status: 400 });
        logJson("info", "cognito_signup");
        return json({ ok: true, confirmRequired: true, mode: "cognito" });
      }
      const user = await createLocalUser(email, password);
      await createSession(user.id, "account");
      logJson("info", "local_signup");
      return json({ ok: true, confirmRequired: false, mode: "local" });
    } catch (err) {
      const code = (err as { code?: string }).code;
      if (code === "email_taken") return json({ error: "email_taken" }, { status: 409 });
      throw err;
    }
  });
}
