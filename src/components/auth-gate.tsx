"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { AppShell } from "@/components/app-shell";
import { isSignedIn, useStore } from "@/components/store-provider";

const PUBLIC = new Set(["/", "/about", "/forgot"]);

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { state, ready, signOut } = useStore();
  const router = useRouter();
  const pathname = usePathname();
  const signedIn = isSignedIn(state);

  useEffect(() => {
    if (!ready) return;
    if (!signedIn && !PUBLIC.has(pathname) && !pathname.startsWith("/forgot")) router.replace("/");
    if (signedIn && pathname === "/") {
      if (!state.profile.onboardingComplete && state.authMode === "account") router.replace("/onboarding");
      else router.replace("/dashboard");
    }
    if (signedIn && state.authMode === "account" && !state.profile.onboardingComplete && pathname !== "/onboarding" && pathname !== "/about") {
      router.replace("/onboarding");
    }
  }, [ready, signedIn, pathname, router, state.profile.onboardingComplete, state.authMode]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4f1ea] text-sm text-slate-500">
        Loading…
      </div>
    );
  }

  if (!signedIn) return <>{children}</>;
  if (pathname === "/") return <>{children}</>;
  if (pathname === "/onboarding") return <>{children}</>;

  return (
    <AppShell state={state} onSignOut={signOut}>
      {children}
    </AppShell>
  );
}
