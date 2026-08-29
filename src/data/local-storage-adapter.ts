import { AUTH_STORAGE_KEY, STORAGE_KEY, type AppState } from "@/domain/types";
import { migrateToCurrent } from "./migrate";
import { createDemoState, createEmptyState } from "./seed";

export type LocalAccount = { id: string; email: string; passwordHash: string };
export type LocalAuthFile = {
  accounts: LocalAccount[];
  currentUserId: string | null;
  mode: "anonymous" | "demo" | "account";
};

function emptyAuth(): LocalAuthFile {
  return { accounts: [], currentUserId: null, mode: "anonymous" };
}

export function readAuth(): LocalAuthFile {
  if (typeof window === "undefined") return emptyAuth();
  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return emptyAuth();
    return JSON.parse(raw) as LocalAuthFile;
  } catch {
    return emptyAuth();
  }
}

export function writeAuth(auth: LocalAuthFile) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
}

export function stateKey(userId: string) {
  return `${STORAGE_KEY}.${userId}`;
}

export function loadStateFor(userId: string, mode: "demo" | "empty"): AppState {
  if (typeof window === "undefined") return mode === "demo" ? createDemoState() : createEmptyState();
  try {
    const raw = window.localStorage.getItem(stateKey(userId));
    if (!raw) return mode === "demo" ? createDemoState() : createEmptyState();
    return migrateToCurrent(JSON.parse(raw), mode);
  } catch {
    return mode === "demo" ? createDemoState() : createEmptyState();
  }
}

export function saveStateFor(userId: string, state: AppState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(stateKey(userId), JSON.stringify(state));
}

export async function hashLocalPassword(password: string, email: string): Promise<string> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: enc.encode(email), iterations: 80_000, hash: "SHA-256" },
    keyMaterial,
    256,
  );
  return btoa(String.fromCharCode(...new Uint8Array(bits)));
}

export class LocalStorageAdapter {
  load(): AppState {
    if (typeof window === "undefined") return createEmptyState();
    const auth = readAuth();
    if (auth.mode === "demo") {
      const state = loadStateFor("demo-alex", "demo");
      return { ...state, demoSignedIn: true, authMode: "demo" };
    }
    if (auth.mode === "account" && auth.currentUserId) {
      const state = loadStateFor(auth.currentUserId, "empty");
      return { ...state, demoSignedIn: true, authMode: "account" };
    }
    try {
      const legacy = window.localStorage.getItem(STORAGE_KEY);
      if (legacy) return migrateToCurrent(JSON.parse(legacy), "empty");
    } catch {
      /* ignore */
    }
    return createEmptyState();
  }

  save(state: AppState): void {
    if (typeof window === "undefined") return;
    const auth = readAuth();
    if (auth.mode === "demo") {
      saveStateFor("demo-alex", state);
      return;
    }
    if (auth.currentUserId) {
      saveStateFor(auth.currentUserId, state);
      return;
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }
}

export const localStorageAdapter = new LocalStorageAdapter();
