import { json, withRequest } from "@/server/http";
import { logJson } from "@/server/log";

export async function GET(req: Request) {
  return withRequest(req, async () => {
    logJson("info", "health");
    return json({ status: "ok", service: "img-compass-canada" });
  });
}
