import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";
import { pgClientConfig } from "./pg-ssl.mjs";

const dir = path.dirname(fileURLToPath(import.meta.url));
const sql = fs.readFileSync(path.join(dir, "migrations/001_learner_state.sql"), "utf8");

if (!process.env.DATABASE_URL) {
  console.log(JSON.stringify({ ts: new Date().toISOString(), msg: "skip_migrate_no_database_url" }));
  process.exit(0);
}

const cfg = pgClientConfig(process.env.DATABASE_URL);
const client = new pg.Client({
  connectionString: cfg.connectionString,
  ssl: cfg.ssl,
});
await client.connect();
await client.query(sql);
await client.end();
console.log(JSON.stringify({ ts: new Date().toISOString(), msg: "migrate_ok", tlsVerified: cfg.tlsVerified }));
