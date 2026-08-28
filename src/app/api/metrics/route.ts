import { snapshotMetrics } from "@/server/metrics";
import { json, withRequest } from "@/server/http";

export async function GET(req: Request) {
  return withRequest(req, async () => json({ metrics: snapshotMetrics() }));
}
