import { currentRequestId } from "./request-context";

export type LogFields = Record<string, string | number | boolean | undefined>;

export function logJson(level: "info" | "warn" | "error", message: string, fields: LogFields = {}) {
  const line = JSON.stringify({
    ts: new Date().toISOString(),
    level,
    msg: message,
    requestId: currentRequestId(),
    service: "img-compass-canada",
    ...fields,
  });
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}
