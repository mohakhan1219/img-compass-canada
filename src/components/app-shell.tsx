"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { NAV_FOOTER, NAV_GROUPS } from "@/domain/stages";
import { computeJourneySnapshot } from "@/domain/journey";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { AppState } from "@/domain/types";

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppShell({
  children,
  state,
  onSignOut,
}: {
  children: React.ReactNode;
  state: AppState;
  onSignOut: () => void;
}) {
  const pathname = usePathname();
  const journey = computeJourneySnapshot(state);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f4f1ea]">
      <div className="mx-auto flex max-w-[1440px]">
        <aside className="hidden w-60 shrink-0 border-r border-[#e4ddd2] bg-[#0b1f33] lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col">
          <Link href="/dashboard" className="flex items-center gap-2.5 px-5 py-5 text-white">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-600">
              <Compass className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-sm font-semibold leading-tight">IMG Compass</span>
              <span className="text-[11px] font-medium text-teal-200/80">Canada</span>
            </span>
          </Link>
          <nav className="flex-1 px-3 pb-4">
            {NAV_GROUPS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "mb-1 block rounded-xl px-2.5 py-2 text-sm",
                  isActive(pathname, item.href)
                    ? "bg-white/10 font-medium text-white"
                    : "text-slate-300 hover:bg-white/5 hover:text-white",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <nav className="border-t border-white/10 px-3 py-4">
            {NAV_FOOTER.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "mb-1 block rounded-xl px-2.5 py-2 text-sm",
                  isActive(pathname, item.href)
                    ? "bg-white/10 font-medium text-white"
                    : "text-slate-400 hover:bg-white/5 hover:text-white",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-20 border-b border-[#e4ddd2] bg-[#fffcf8]/90 backdrop-blur">
            <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-8">
              <button type="button" className="lg:hidden" onClick={() => setMobileOpen((v) => !v)} aria-label="Menu">
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
              <Link href="/dashboard" className="flex items-center gap-2 font-semibold text-[#0b1f33] lg:hidden">
                <Compass className="h-5 w-5 text-teal-700" />
                IMG Compass
              </Link>
              <p className="hidden text-sm text-slate-500 lg:block">
                {journey.flags.currentLabel}
              </p>
              <div className="ml-auto flex items-center gap-3 text-sm">
                <span className="hidden max-w-[200px] truncate font-medium text-[#0b1f33] sm:inline">
                  {state.profile.displayName || "IMG learner"}
                </span>
                <Button variant="ghost" size="sm" onClick={onSignOut}>
                  <LogOut className="h-4 w-4" />
                  Sign out
                </Button>
              </div>
            </div>
            {mobileOpen ? (
              <nav className="flex flex-wrap gap-1 border-t border-[#e4ddd2] px-4 py-3 lg:hidden">
                {[...NAV_GROUPS, ...NAV_FOOTER].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="rounded-full bg-white px-3 py-1.5 text-xs ring-1 ring-[#e4ddd2]"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            ) : (
              <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:hidden">
                {NAV_GROUPS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium",
                      isActive(pathname, item.href) ? "bg-teal-700 text-white" : "bg-white text-slate-600 ring-1 ring-[#e4ddd2]",
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            )}
          </header>
          <main className="px-4 py-8 sm:px-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
