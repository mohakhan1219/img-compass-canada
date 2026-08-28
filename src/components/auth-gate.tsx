"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { AppShell } from "@/components/app-shell";
import { useStore } from "@/components/store-provider";

const PUBLIC = new Set(["/", "/about"]);

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { state, ready, signOut } = useStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!ready) return;
    if (!state.demoSignedIn && !PUBLIC.has(pathname)) router.replace("/");
    if (state.demoSignedIn && pathname === "/") router.replace("/dashboard");
  }, [ready, state.demoSignedIn, pathname, router]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4f1ea] text-sm text-slate-500">
        Loading…
      </div>
    );
  }

  if (!state.demoSignedIn) return <>{children}</>;
  if (pathname === "/") return <>{children}</>;

  return (
    <AppShell state={state} onSignOut={signOut}>
      {children}
    </AppShell>
  );
}
