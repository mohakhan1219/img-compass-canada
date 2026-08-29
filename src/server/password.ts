import { pbkdf2 as pbkdf2Cb, randomBytes, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const pbkdf2 = promisify(pbkdf2Cb);
const ITERATIONS = 100_000;
const KEYLEN = 32;

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const hash = await pbkdf2(password, salt, ITERATIONS, KEYLEN, "sha256");
  return `pbkdf2$${ITERATIONS}$${salt.toString("base64")}$${hash.toString("base64")}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split("$");
  if (parts.length !== 4 || parts[0] !== "pbkdf2") return false;
  const iterations = Number(parts[1]);
  const salt = Buffer.from(parts[2], "base64");
  const expected = Buffer.from(parts[3], "base64");
  const actual = await pbkdf2(password, salt, iterations, expected.length, "sha256");
  if (actual.length !== expected.length) return false;
  return timingSafeEqual(actual, expected);
}

export function newId(prefix: string): string {
  return `${prefix}_${randomBytes(16).toString("hex")}`;
}
