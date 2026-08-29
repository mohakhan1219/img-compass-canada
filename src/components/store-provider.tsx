"use client";

import { createContext, useCallback, useContext, useMemo, useState, useSyncExternalStore } from "react";
import {
  hashLocalPassword,
  loadStateFor,
  localStorageAdapter,
  readAuth,
  saveStateFor,
  writeAuth,
} from "@/data/local-storage-adapter";
import { createDemoState, createEmptyState } from "@/data/seed";
import { clientPersistenceMode } from "@/lib/persistence-mode";
import type { AppState } from "@/domain/types";
import { createId } from "@/domain/ids";

type Ctx = {
  state: AppState;
  setState: (next: AppState) => void;
  ready: boolean;
  signInDemo: () => void;
  signInAccount: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  signUp: (email: string, password: string) => Promise<{ ok: boolean; error?: string; confirmRequired?: boolean }>;
  signOut: () => void;
  reset: () => void;
  /** @deprecated */
  signIn: () => void;
};

const StoreContext = createContext<Ctx | null>(null);
const listeners = new Set<() => void>();
const serverSnapshot = createEmptyState();
let snapshot = serverSnapshot;
let hydrated = false;

function emit() {
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function readSnapshot(): AppState {
  if (!hydrated && typeof window !== "undefined") {
    snapshot = localStorageAdapter.load();
    hydrated = true;
  }
  return snapshot;
}

function persistLocal(next: AppState) {
  localStorageAdapter.save(next);
  snapshot = next;
  emit();
}

function LocalStoreProvider({ children }: { children: React.ReactNode }) {
  const state = useSyncExternalStore(subscribe, readSnapshot, () => serverSnapshot);
  const setState = useCallback((next: AppState) => persistLocal(next), []);
  const value = useMemo(
    () => ({
      state,
      setState,
      ready: true,
      signInDemo: () => {
        writeAuth({ ...readAuth(), mode: "demo", currentUserId: "demo-alex" });
        persistLocal({ ...loadStateFor("demo-alex", "demo"), demoSignedIn: true, authMode: "demo" });
      },
      signIn: () => {
        writeAuth({ ...readAuth(), mode: "demo", currentUserId: "demo-alex" });
        persistLocal({ ...loadStateFor("demo-alex", "demo"), demoSignedIn: true, authMode: "demo" });
      },
      signInAccount: async (email: string, password: string) => {
        const auth = readAuth();
        const hash = await hashLocalPassword(password, email.trim().toLowerCase());
        const found = auth.accounts.find((a) => a.email === email.trim().toLowerCase() && a.passwordHash === hash);
        if (!found) return { ok: false, error: "invalid_credentials" };
        writeAuth({ ...auth, mode: "account", currentUserId: found.id });
        persistLocal({ ...loadStateFor(found.id, "empty"), demoSignedIn: true, authMode: "account" });
        return { ok: true };
      },
      signUp: async (email: string, password: string) => {
        if (password.length < 8) return { ok: false, error: "invalid_credentials" };
        const auth = readAuth();
        const normalized = email.trim().toLowerCase();
        if (auth.accounts.some((a) => a.email === normalized)) return { ok: false, error: "email_taken" };
        const id = createId("usr");
        const passwordHash = await hashLocalPassword(password, normalized);
        writeAuth({
          accounts: [...auth.accounts, { id, email: normalized, passwordHash }],
          currentUserId: id,
          mode: "account",
        });
        const empty = { ...createEmptyState(), demoSignedIn: true, authMode: "account" as const };
        saveStateFor(id, empty);
        persistLocal(empty);
        return { ok: true, confirmRequired: false };
      },
      signOut: () => {
        writeAuth({ ...readAuth(), mode: "anonymous", currentUserId: null });
        persistLocal(createEmptyState());
      },
      reset: () => {
        const auth = readAuth();
        if (auth.mode === "demo") {
          persistLocal({ ...createDemoState(), demoSignedIn: true, authMode: "demo" });
          return;
        }
        if (auth.currentUserId) {
          persistLocal({ ...createEmptyState(), demoSignedIn: true, authMode: "account", profile: state.profile });
        }
      },
    }),
    [state, setState],
  );
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

function RemoteStoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setStateInner] = useState<AppState>(createEmptyState);
  const [ready, setReady] = useState(false);
  const [boot, setBoot] = useState(0);

  const refresh = useCallback(async () => {
    const res = await fetch("/api/state", { credentials: "include" });
    if (res.status === 401) {
      setStateInner(createEmptyState());
      setReady(true);
      return;
    }
    if (!res.ok) {
      setReady(true);
      return;
    }
    const body = (await res.json()) as { state: AppState };
    setStateInner(body.state);
    setReady(true);
  }, []);

  if (boot === 0) {
    setBoot(1);
    if (typeof window !== "undefined") {
      void refresh();
    } else {
      setReady(true);
    }
  }

  const setState = useCallback((next: AppState) => {
    setStateInner(next);
    void fetch("/api/state", {
      method: "PUT",
      credentials: "include",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ state: next }),
    });
  }, []);

  const value = useMemo(
    () => ({
      state,
      setState,
      ready,
      signIn: () => {
        void fetch("/api/auth/demo", { method: "POST", credentials: "include" }).then(() => refresh());
      },
      signInDemo: () => {
        void fetch("/api/auth/demo", { method: "POST", credentials: "include" }).then(() => refresh());
      },
      signInAccount: async (email: string, password: string) => {
        const res = await fetch("/api/auth/signin", {
          method: "POST",
          credentials: "include",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        if (!res.ok) return { ok: false, error: "invalid_credentials" };
        await refresh();
        return { ok: true };
      },
      signUp: async (email: string, password: string) => {
        const res = await fetch("/api/auth/signup", {
          method: "POST",
          credentials: "include",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const body = (await res.json()) as { error?: string; confirmRequired?: boolean };
        if (!res.ok) return { ok: false, error: body.error ?? "signup_failed" };
        await refresh();
        return { ok: true, confirmRequired: body.confirmRequired };
      },
      signOut: () => {
        void fetch("/api/auth/signout", { method: "POST", credentials: "include" }).then(() => {
          setStateInner(createEmptyState());
        });
      },
      reset: () => setState({ ...createDemoState(), demoSignedIn: true, authMode: state.authMode }),
    }),
    [state, setState, ready, refresh],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  if (clientPersistenceMode() === "remote") {
    return <RemoteStoreProvider>{children}</RemoteStoreProvider>;
  }
  return <LocalStoreProvider>{children}</LocalStoreProvider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}

export function isSignedIn(state: AppState): boolean {
  return Boolean(state.demoSignedIn && state.authMode !== "anonymous");
}
