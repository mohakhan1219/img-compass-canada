import { json, withRequest } from "@/server/http";
import { getSession } from "@/server/session";

export async function GET(req: Request) {
  return withRequest(req, async () => {
    const session = await getSession();
    if (!session) return json({ authenticated: false });
    return json({ authenticated: true, kind: session.kind, userId: session.userId });
  });
}
