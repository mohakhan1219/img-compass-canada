/**
 * Optional Amazon Cognito User Pool client.
 * When COGNITO_* env vars are absent, local hashed-password auth is used.
 */

type CognitoAuthResult = { ok: true; email: string; sub: string } | { ok: false; error: string };

function region(): string {
  return process.env.COGNITO_REGION || process.env.AWS_REGION || "ca-central-1";
}

async function cognitoCall(target: string, body: Record<string, unknown>): Promise<Record<string, unknown>> {
  const res = await fetch(`https://cognito-idp.${region()}.amazonaws.com/`, {
    method: "POST",
    headers: {
      "content-type": "application/x-amz-json-1.1",
      "x-amz-target": `AWSCognitoIdentityProviderService.${target}`,
    },
    body: JSON.stringify(body),
  });
  const json = (await res.json()) as Record<string, unknown>;
  if (!res.ok) {
    throw Object.assign(new Error(String(json.__type ?? json.message ?? "cognito_error")), { payload: json });
  }
  return json;
}

export async function cognitoSignUp(email: string, password: string): Promise<CognitoAuthResult> {
  try {
    await cognitoCall("SignUp", {
      ClientId: process.env.COGNITO_CLIENT_ID,
      Username: email,
      Password: password,
      UserAttributes: [{ Name: "email", Value: email }],
    });
    return { ok: true, email, sub: "" };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "signup_failed" };
  }
}

export async function cognitoConfirm(email: string, code: string): Promise<CognitoAuthResult> {
  try {
    await cognitoCall("ConfirmSignUp", {
      ClientId: process.env.COGNITO_CLIENT_ID,
      Username: email,
      ConfirmationCode: code,
    });
    return { ok: true, email, sub: "" };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "confirm_failed" };
  }
}

export async function cognitoSignIn(email: string, password: string): Promise<CognitoAuthResult> {
  try {
    const json = await cognitoCall("InitiateAuth", {
      AuthFlow: "USER_PASSWORD_AUTH",
      ClientId: process.env.COGNITO_CLIENT_ID,
      AuthParameters: { USERNAME: email, PASSWORD: password },
    });
    const payload = json.AuthenticationResult as { IdToken?: string } | undefined;
    const sub = payload?.IdToken ? decodeSub(payload.IdToken) : email;
    return { ok: true, email, sub };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "signin_failed" };
  }
}

export async function cognitoForgot(email: string): Promise<CognitoAuthResult> {
  try {
    await cognitoCall("ForgotPassword", {
      ClientId: process.env.COGNITO_CLIENT_ID,
      Username: email,
    });
    return { ok: true, email, sub: "" };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "forgot_failed" };
  }
}

export async function cognitoConfirmForgot(email: string, code: string, password: string): Promise<CognitoAuthResult> {
  try {
    await cognitoCall("ConfirmForgotPassword", {
      ClientId: process.env.COGNITO_CLIENT_ID,
      Username: email,
      ConfirmationCode: code,
      Password: password,
    });
    return { ok: true, email, sub: "" };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "reset_failed" };
  }
}

function decodeSub(jwt: string): string {
  try {
    const payload = JSON.parse(Buffer.from(jwt.split(".")[1] ?? "", "base64url").toString("utf8")) as { sub?: string };
    return payload.sub ?? "";
  } catch {
    return "";
  }
}
