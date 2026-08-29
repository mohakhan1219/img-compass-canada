import { getPool } from "@/server/db";
import { hashPassword, newId, verifyPassword } from "@/server/password";

export type AppUser = {
  id: string;
  email: string;
  passwordHash: string | null;
  cognitoSub: string | null;
};

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function findUserByEmail(email: string): Promise<AppUser | null> {
  const pool = getPool();
  if (!pool) throw new Error("DATABASE_URL is not configured");
  const result = await pool.query<{
    id: string;
    email: string;
    password_hash: string | null;
    cognito_sub: string | null;
  }>(`select id, email, password_hash, cognito_sub from app_user where email = $1`, [normalizeEmail(email)]);
  const row = result.rows[0];
  if (!row) return null;
  return { id: row.id, email: row.email, passwordHash: row.password_hash, cognitoSub: row.cognito_sub };
}

export async function createLocalUser(email: string, password: string): Promise<AppUser> {
  const existing = await findUserByEmail(email);
  if (existing) throw Object.assign(new Error("email_taken"), { code: "email_taken" });
  const id = newId("usr");
  const passwordHash = await hashPassword(password);
  const pool = getPool();
  if (!pool) throw new Error("DATABASE_URL is not configured");
  await pool.query(`insert into app_user (id, email, password_hash) values ($1, $2, $3)`, [
    id,
    normalizeEmail(email),
    passwordHash,
  ]);
  return { id, email: normalizeEmail(email), passwordHash, cognitoSub: null };
}

export async function verifyLocalUser(email: string, password: string): Promise<AppUser | null> {
  const user = await findUserByEmail(email);
  if (!user?.passwordHash) return null;
  const ok = await verifyPassword(password, user.passwordHash);
  return ok ? user : null;
}

export async function upsertCognitoUser(email: string, cognitoSub: string): Promise<AppUser> {
  const pool = getPool();
  if (!pool) throw new Error("DATABASE_URL is not configured");
  const existing = await pool.query<{ id: string; email: string }>(
    `select id, email from app_user where cognito_sub = $1 or email = $2`,
    [cognitoSub, normalizeEmail(email)],
  );
  if (existing.rows[0]) {
    await pool.query(`update app_user set cognito_sub = $1 where id = $2`, [cognitoSub, existing.rows[0].id]);
    return { id: existing.rows[0].id, email: existing.rows[0].email, passwordHash: null, cognitoSub };
  }
  const id = newId("usr");
  await pool.query(`insert into app_user (id, email, cognito_sub) values ($1, $2, $3)`, [
    id,
    normalizeEmail(email),
    cognitoSub,
  ]);
  return { id, email: normalizeEmail(email), passwordHash: null, cognitoSub };
}

export async function issueResetToken(email: string): Promise<string | null> {
  const user = await findUserByEmail(email);
  if (!user) return null;
  const token = newId("rst").slice(0, 20);
  const hash = await hashPassword(token);
  const pool = getPool();
  if (!pool) throw new Error("DATABASE_URL is not configured");
  await pool.query(`update app_user set reset_token_hash = $1, reset_expires_at = now() + interval '1 hour' where id = $2`, [
    hash,
    user.id,
  ]);
  return token;
}

export async function consumeResetToken(email: string, token: string, newPassword: string): Promise<boolean> {
  const pool = getPool();
  if (!pool) throw new Error("DATABASE_URL is not configured");
  const result = await pool.query<{ id: string; reset_token_hash: string | null; reset_expires_at: Date | null }>(
    `select id, reset_token_hash, reset_expires_at from app_user where email = $1`,
    [normalizeEmail(email)],
  );
  const row = result.rows[0];
  if (!row?.reset_token_hash || !row.reset_expires_at) return false;
  if (new Date(row.reset_expires_at).getTime() < Date.now()) return false;
  const ok = await verifyPassword(token, row.reset_token_hash);
  if (!ok) return false;
  const passwordHash = await hashPassword(newPassword);
  await pool.query(`update app_user set password_hash = $1, reset_token_hash = null, reset_expires_at = null where id = $2`, [
    passwordHash,
    row.id,
  ]);
  return true;
}

export function cognitoEnabled(): boolean {
  return Boolean(process.env.COGNITO_USER_POOL_ID && process.env.COGNITO_CLIENT_ID);
}
