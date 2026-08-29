import { cookies } from "next/headers";
import { getPool } from "@/server/db";
import { newId } from "@/server/password";

export const SESSION_COOKIE = "compass_session";
export const DEMO_LEARNER_ID = "demo-alex";

const THIRTY_DAYS = 60 * 60 * 24 * 30;

function cookieSecure() {
  return process.env.COMPASS_COOKIE_SECURE === "true";
}

export type SessionKind = "account" | "demo";

export type SessionRecord = {
  id: string;
  userId: string;
  kind: SessionKind;
};

export async function createSession(userId: string, kind: SessionKind): Promise<string> {
  const id = newId("ses");
  const expires = new Date(Date.now() + THIRTY_DAYS * 1000);
  const pool = getPool();
  if (pool) {
    await pool.query(
      `insert into app_session (id, user_id, kind, expires_at) values ($1, $2, $3, $4)`,
      [id, userId, kind, expires.toISOString()],
    );
  }
  const jar = await cookies();
  jar.set(SESSION_COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: cookieSecure(),
    maxAge: THIRTY_DAYS,
  });
  return id;
}

export async function getSession(): Promise<SessionRecord | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const pool = getPool();
  if (!pool) {
    // Tests / misconfigured remote: do not trust a raw learner id.
    return null;
  }
  const result = await pool.query<{ user_id: string; kind: SessionKind; expires_at: Date }>(
    `select user_id, kind, expires_at from app_session where id = $1`,
    [token],
  );
  const row = result.rows[0];
  if (!row) return null;
  if (new Date(row.expires_at).getTime() < Date.now()) {
    await pool.query(`delete from app_session where id = $1`, [token]);
    return null;
  }
  return { id: token, userId: row.user_id, kind: row.kind };
}

export async function clearSession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  const pool = getPool();
  if (token && pool) {
    await pool.query(`delete from app_session where id = $1`, [token]);
  }
  jar.delete(SESSION_COOKIE);
  // Drop the legacy cookie so old learner-id spoofing cannot resume.
  jar.delete("compass_learner");
}

/** @deprecated Use getSession(). Kept so old imports fail loudly in review. */
export async function getLearnerId(): Promise<string | null> {
  const session = await getSession();
  return session?.userId ?? null;
}
