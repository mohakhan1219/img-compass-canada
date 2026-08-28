import { readFileSync } from "node:fs";
import { join } from "node:path";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1", "db"]);

function loadRdsCa(): string {
  return readFileSync(join(process.cwd(), "certs", "rds-ca-ca-central-1-bundle.pem"), "utf8");
}

export type PgSslConfig = {
  connectionString: string;
  ssl: false | { rejectUnauthorized: true; ca: string };
  tlsVerified: boolean;
};

/**
 * node-pg treats sslmode=require as verify-full against the system CA store,
 * which does not include Amazon RDS CAs on Alpine. Strip sslmode and attach
 * the regional RDS CA bundle with rejectUnauthorized: true.
 */
export function pgClientConfig(databaseUrl: string): PgSslConfig {
  const parsed = new URL(databaseUrl);
  const sslmode = (parsed.searchParams.get("sslmode") || "").toLowerCase();
  parsed.searchParams.delete("sslmode");
  const host = parsed.hostname;
  const disable = sslmode === "disable" || LOCAL_HOSTS.has(host);

  if (disable) {
    return { connectionString: parsed.toString(), ssl: false, tlsVerified: false };
  }

  return {
    connectionString: parsed.toString(),
    ssl: { rejectUnauthorized: true, ca: loadRdsCa() },
    tlsVerified: true,
  };
}
