import { AsyncLocalStorage } from "node:async_hooks";

type Store = { requestId: string };

export const requestContext = new AsyncLocalStorage<Store>();

export function currentRequestId(): string {
  return requestContext.getStore()?.requestId ?? "no-request";
}
