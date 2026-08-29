import { json, withRequest } from "@/server/http";
import { cognitoConfirm } from "@/server/cognito";
import { cognitoEnabled, upsertCognitoUser } from "@/server/users";
import { createSession } from "@/server/session";
import { isPostgresConfigured } from "@/server/config";

export async function POST(req: Request) {
  return withRequest(req, async () => {
    if (!isPostgresConfigured()) return json({ error: "postgres_disabled" }, { status: 501 });
    if (!cognitoEnabled()) return json({ error: "cognito_disabled" }, { status: 400 });
    const body = (await req.json()) as { email?: string; code?: string };
    const email = String(body.email ?? "").trim();
    const code = String(body.code ?? "");
    const result = await cognitoConfirm(email, code);
    if (!result.ok) return json({ error: result.error }, { status: 400 });
    const user = await upsertCognitoUser(email, result.sub || email);
    await createSession(user.id, "account");
    return json({ ok: true });
  });
}
