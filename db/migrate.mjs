import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";
import { pgClientConfig } from "./pg-ssl.mjs";

const dir = path.dirname(fileURLToPath(import.meta.url));
const migrationsDir = path.join(dir, "migrations");

if (!process.env.DATABASE_URL) {
  console.log(JSON.stringify({ ts: new Date().toISOString(), msg: "skip_migrate_no_database_url" }));
  process.exit(0);
}

const files = fs
  .readdirSync(migrationsDir)
  .filter((f) => f.endsWith(".sql"))
  .sort();

const cfg = pgClientConfig(process.env.DATABASE_URL);
const client = new pg.Client({
  connectionString: cfg.connectionString,
  ssl: cfg.ssl,
});
await client.connect();
for (const file of files) {
  const sql = fs.readFileSync(path.join(migrationsDir, file), "utf8");
  await client.query(sql);
  console.log(JSON.stringify({ ts: new Date().toISOString(), msg: "migrate_file", file }));
}
await client.end();
console.log(JSON.stringify({ ts: new Date().toISOString(), msg: "migrate_ok", tlsVerified: cfg.tlsVerified, files }));
