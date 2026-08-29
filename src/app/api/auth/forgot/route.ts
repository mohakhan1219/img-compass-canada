import { json, withRequest } from "@/server/http";
import { cognitoEnabled, issueResetToken } from "@/server/users";
import { cognitoForgot } from "@/server/cognito";
import { logJson } from "@/server/log";
import { isPostgresConfigured } from "@/server/config";

export async function POST(req: Request) {
  return withRequest(req, async () => {
    if (!isPostgresConfigured()) return json({ error: "postgres_disabled" }, { status: 501 });
    const body = (await req.json()) as { email?: string };
    const email = String(body.email ?? "").trim();
    if (!email.includes("@")) return json({ error: "invalid_email" }, { status: 400 });
    if (cognitoEnabled()) {
      await cognitoForgot(email);
      logJson("info", "cognito_forgot");
      return json({ ok: true, delivery: "cognito" });
    }
    const token = await issueResetToken(email);
    logJson("info", "local_forgot_issued", { issued: Boolean(token) });
    const expose = process.env.COMPASS_AUTH_EXPOSE_RESET === "true";
    return json({
      ok: true,
      delivery: "local",
      resetCode: expose && token ? token : undefined,
      hint: expose
        ? "Email is not configured. Use the reset code now."
        : "If an account exists, a reset code was stored. Enable COMPASS_AUTH_EXPOSE_RESET for local recovery, or Cognito for email.",
    });
  });
}
