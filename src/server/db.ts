import { Pool } from "pg";
import { databaseUrl } from "./config";
import { logJson } from "./log";
import { pgClientConfig } from "./pg-ssl";

let pool: Pool | null = null;
let tlsVerified = false;

export function isTlsVerified(): boolean {
  return tlsVerified;
}

export function getPool(): Pool | null {
  const url = databaseUrl();
  if (!url) return null;
  if (!pool) {
    const cfg = pgClientConfig(url);
    tlsVerified = cfg.tlsVerified;
    pool = new Pool({
      connectionString: cfg.connectionString,
      max: 10,
      idleTimeoutMillis: 10_000,
      ssl: cfg.ssl,
    });
    pool.on("error", (err) => logJson("error", "pg_pool_error", { error: err.message }));
    logJson("info", "pg_pool_created", { tlsVerified: cfg.tlsVerified, rejectUnauthorized: cfg.ssl !== false });
  }
  return pool;
}

export async function pingDatabase(): Promise<boolean> {
  const p = getPool();
  if (!p) return false;
  const result = await p.query("select 1 as ok");
  return result.rows[0]?.ok === 1;
}
