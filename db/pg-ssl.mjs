import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1", "db"]);

function bundlePath() {
  const fromModule = join(dirname(fileURLToPath(import.meta.url)), "..", "certs", "rds-ca-ca-central-1-bundle.pem");
  const fromCwd = join(process.cwd(), "certs", "rds-ca-ca-central-1-bundle.pem");
  try {
    readFileSync(fromModule);
    return fromModule;
  } catch {
    return fromCwd;
  }
}

/**
 * node-pg treats sslmode=require as verify-full against the *system* CA store,
 * which does not include Amazon RDS CAs on Alpine. We strip sslmode from the
 * URL and attach the regional RDS CA bundle ourselves with rejectUnauthorized:true.
 */
export function pgClientConfig(databaseUrl) {
  const parsed = new URL(databaseUrl);
  const sslmode = (parsed.searchParams.get("sslmode") || "").toLowerCase();
  parsed.searchParams.delete("sslmode");
  const host = parsed.hostname;
  const local = LOCAL_HOSTS.has(host);
  const disable = sslmode === "disable" || local;

  if (disable) {
    return { connectionString: parsed.toString(), ssl: false, tlsVerified: false };
  }

  const ca = readFileSync(bundlePath(), "utf8");
  return {
    connectionString: parsed.toString(),
    ssl: { rejectUnauthorized: true, ca },
    tlsVerified: true,
  };
}
