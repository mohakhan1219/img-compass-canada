"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Building2,
  Compass,
  FileText,
  Languages,
  ListOrdered,
  LogOut,
  Map,
  MessageSquare,
  Settings,
  Stethoscope,
  Trophy,
  UserRound,
} from "lucide-react";
import { JOURNEY_STAGES } from "@/domain/stages";
import { computeJourneySnapshot, issuesForStage, isVerificationHold } from "@/domain/journey";
import { Button } from "@/components/ui/button";
import { PortfolioBanner } from "@/components/portfolio-banner";
import { cn } from "@/lib/utils";
import type { AppState } from "@/domain/types";

const ICONS: Record<string, typeof Compass> = {
  profile: UserRound,
  mccqe1: BookOpen,
  nac: Stethoscope,
  language: Languages,
  provincial: Map,
  carms: Building2,
  applications: FileText,
  interviews: MessageSquare,
  ranking: ListOrdered,
  match: Trophy,
};

const statusTone: Record<string, string> = {
  complete: "bg-emerald-400",
  in_progress: "bg-sky-400",
  blocked: "bg-red-400",
  verify_hold: "bg-amber-400",
  not_started: "bg-slate-500",
};

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

  return (
    <div className="min-h-screen bg-[#f4f1ea]">
      <PortfolioBanner />
      <div className="mx-auto flex max-w-[1440px]">
        <aside className="hidden w-64 shrink-0 border-r border-[#e4ddd2] bg-[#0b1f33] lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col">
          <Link href="/dashboard" className="flex items-center gap-2.5 px-5 py-5 text-white">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-600">
              <Compass className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-sm font-semibold leading-tight">IMG Compass</span>
              <span className="text-[11px] font-medium text-teal-200/80">Canada</span>
            </span>
          </Link>
          <nav className="flex-1 overflow-y-auto px-3 pb-4">
            <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              Journey
            </p>
            <ul className="space-y-0.5">
              {JOURNEY_STAGES.map((stage) => {
                const Icon = ICONS[stage.id] ?? Compass;
                const active = pathname === stage.href || pathname.startsWith(`${stage.href}/`);
                const status = journey.status[stage.id];
                const stageIssues = issuesForStage(journey.flags.issues, stage.id);
                const verifyHold =
                  status === "blocked" &&
                  stageIssues.length > 0 &&
                  stageIssues.every((x) => isVerificationHold(x.kind));
                const toneKey = verifyHold ? "verify_hold" : status;
                return (
                  <li key={stage.id}>
                    <Link
                      href={stage.href}
                      className={cn(
                        "flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm transition-colors",
                        active
                          ? "bg-white/10 font-medium text-white"
                          : "text-slate-300 hover:bg-white/5 hover:text-white",
                      )}
                    >
                      <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", statusTone[toneKey])} />
                      <Icon className="h-4 w-4 shrink-0 opacity-80" />
                      <span className="flex-1 truncate">{stage.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          <div className="border-t border-white/10 p-3">
            <Link
              href="/settings"
              className="flex items-center gap-2 rounded-xl px-2.5 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white"
            >
              <Settings className="h-4 w-4" />
              Settings
            </Link>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-20 border-b border-[#e4ddd2] bg-[#fffcf8]/90 backdrop-blur">
            <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-8">
              <Link href="/dashboard" className="flex items-center gap-2 font-semibold text-[#0b1f33] lg:hidden">
                <Compass className="h-5 w-5 text-teal-700" />
                IMG Compass
              </Link>
              <p className="hidden text-sm text-slate-500 lg:block">Your path to Canadian residency</p>
              <div className="ml-auto flex items-center gap-3 text-sm">
                <span className="hidden max-w-[200px] truncate font-medium text-[#0b1f33] sm:inline">
                  {state.profile.displayName}
                </span>
                <Button variant="ghost" size="sm" onClick={onSignOut}>
                  <LogOut className="h-4 w-4" />
                  Sign out
                </Button>
              </div>
            </div>
            <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:hidden">
              {JOURNEY_STAGES.map((stage) => {
                const active = pathname === stage.href || pathname.startsWith(`${stage.href}/`);
                return (
                  <Link
                    key={stage.id}
                    href={stage.href}
                    className={cn(
                      "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium",
                      active ? "bg-teal-700 text-white" : "bg-white text-slate-600 ring-1 ring-[#e4ddd2]",
                    )}
                  >
                    {stage.label}
                  </Link>
                );
              })}
            </nav>
          </header>
          <main className="px-4 py-8 sm:px-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
