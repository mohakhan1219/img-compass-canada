"use client";

import { createContext, useCallback, useContext, useMemo, useState, useSyncExternalStore } from "react";
import { localStorageAdapter } from "@/data/local-storage-adapter";
import { createDemoState } from "@/data/seed";
import { setDemoSignedIn } from "@/data/repositories/profile-repository";
import { clientPersistenceMode } from "@/lib/persistence-mode";
import type { AppState } from "@/domain/types";

type Ctx = {
  state: AppState;
  setState: (next: AppState) => void;
  ready: boolean;
  signIn: () => void;
  signOut: () => void;
  reset: () => void;
};

const StoreContext = createContext<Ctx | null>(null);
const listeners = new Set<() => void>();
const serverSnapshot = createDemoState();
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
      signIn: () => persistLocal(setDemoSignedIn(state, true)),
      signOut: () => persistLocal(setDemoSignedIn(state, false)),
      reset: () => persistLocal(setDemoSignedIn(createDemoState(), true)),
    }),
    [state, setState],
  );
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

function RemoteStoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setStateInner] = useState<AppState>(createDemoState);
  const [ready, setReady] = useState(false);
  const [boot, setBoot] = useState(0);

  const refresh = useCallback(async () => {
    const res = await fetch("/api/state", { credentials: "include" });
    if (res.status === 401) {
      setStateInner(createDemoState());
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
      signOut: () => {
        void fetch("/api/auth/signout", { method: "POST", credentials: "include" }).then(() => {
          setStateInner(createDemoState());
        });
      },
      reset: () => setState(setDemoSignedIn(createDemoState(), true)),
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
