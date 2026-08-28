import { isPostgresConfigured } from "@/server/config";
import { isTlsVerified, pingDatabase } from "@/server/db";
import { json, withRequest } from "@/server/http";
import { logJson } from "@/server/log";

export async function GET(req: Request) {
  return withRequest(req, async () => {
    if (!isPostgresConfigured()) {
      logJson("info", "ready_local_mode");
      return json({ ready: true, persistence: "local", tls: { rejectUnauthorized: false, verified: false } });
    }
    try {
      const ok = await pingDatabase();
      const tls = { rejectUnauthorized: isTlsVerified(), verified: isTlsVerified() };
      if (!ok) return json({ ready: false, persistence: "postgres", tls }, { status: 503 });
      logJson("info", "ready_postgres", { tlsVerified: tls.verified });
      return json({ ready: true, persistence: "postgres", tls });
    } catch {
      return json({ ready: false, persistence: "postgres", tls: { rejectUnauthorized: false, verified: false } }, { status: 503 });
    }
  });
}
