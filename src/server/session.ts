import { cookies } from "next/headers";

export const LEARNER_COOKIE = "compass_learner";
export const DEMO_LEARNER_ID = "demo-alex";

export async function getLearnerId(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(LEARNER_COOKIE)?.value ?? null;
}

export async function setLearnerCookie(id: string) {
  const jar = await cookies();
  jar.set(LEARNER_COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    // HTTP ALB/local standalone must not set Secure or browsers drop the demo cookie.
    // Set COMPASS_COOKIE_SECURE=true only when the site is served over HTTPS.
    secure: process.env.COMPASS_COOKIE_SECURE === "true",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearLearnerCookie() {
  const jar = await cookies();
  jar.delete(LEARNER_COOKIE);
}
