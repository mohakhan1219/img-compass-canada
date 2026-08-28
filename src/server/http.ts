import { NextResponse } from "next/server";
import { requestContext } from "@/server/request-context";
import { inc } from "@/server/metrics";
import { logJson } from "@/server/log";

export function requestIdOf(req: Request): string {
  return req.headers.get("x-request-id") ?? crypto.randomUUID();
}

export function withRequest<T>(req: Request, fn: () => Promise<T>): Promise<T> {
  const requestId = requestIdOf(req);
  inc("http_requests");
  return requestContext.run({ requestId }, async () => {
    try {
      return await fn();
    } catch (err) {
      inc("http_errors");
      logJson("error", "unhandled_route_error", { error: err instanceof Error ? err.message : "unknown" });
      throw err;
    }
  });
}

export function json(data: unknown, init?: ResponseInit) {
  const headers = new Headers(init?.headers);
  headers.set("content-type", "application/json");
  return new NextResponse(JSON.stringify(data), { ...init, headers });
}
