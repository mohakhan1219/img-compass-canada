"use client";

import Link from "next/link";
import {
  ArrowRight,
  Bookmark,
  BookOpen,
  Building2,
  Calendar,
  FileText,
  Languages,
  Stethoscope,
} from "lucide-react";
import { CompassMessage } from "@/components/compass-message";
import { PathwayProgressChart } from "@/components/pathway-progress-chart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ProgressBar } from "@/components/progress";
import {
  dashboardCompletion,
  dashboardPathStatuses,
  deriveDashboardPriorities,
  JOURNEY_PHASES,
  pathwayProgressSeries,
  programSnapshot,
  readinessCards,
  upcomingMilestones,
  welcomeContext,
  type PathStep,
  type PathTone,
} from "@/domain/dashboard";
import { useStore } from "@/components/store-provider";
import { cn } from "@/lib/utils";

const TONE_BADGE: Record<PathTone, "emerald" | "sky" | "slate" | "red" | "amber"> = {
  complete: "emerald",
  current: "sky",
  upcoming: "slate",
  verify: "amber",
  blocked: "red",
};

const STEP_DOT: Record<PathTone, string> = {
  complete: "bg-emerald-600 text-white",
  current: "bg-teal-700 text-white ring-2 ring-teal-200",
  upcoming: "bg-slate-200 text-slate-500",
  verify: "bg-amber-500 text-white",
  blocked: "bg-red-600 text-white",
};

const APP_STATUS: Record<string, string> = {
  not_started: "Research",
  in_progress: "In progress",
  submitted: "Submitted",
  withdrawn: "Withdrawn",
};

const READINESS_ICON = {
  mccqe: BookOpen,
  nac: Stethoscope,
  language: Languages,
  programs: Building2,
  applications: FileText,
} as const;

function formatDay(iso: string): string {
  const d = new Date(iso);
  if (!Number.isFinite(d.getTime())) return iso.slice(0, 10);
  return d.toLocaleDateString("en-CA", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" });
}

function CompactRing({ percent, label }: { percent: number; label: string }) {
  const r = 34;
  const c = 2 * Math.PI * r;
  const offset = c - (percent / 100) * c;
  return (
    <div className="relative h-[5.5rem] w-[5.5rem] shrink-0">
      <svg viewBox="0 0 88 88" className="h-full w-full -rotate-90">
        <circle cx="44" cy="44" r={r} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="7" />
        <circle
          cx="44"
          cy="44"
          r={r}
          fill="none"
          stroke="#5eead4"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
        <span className="text-lg font-semibold tabular-nums leading-none">{percent}%</span>
        <span className="mt-1 text-[9px] uppercase tracking-wider text-teal-100">{label}</span>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { state } = useStore();
  const welcome = welcomeContext(state);
  const path = dashboardPathStatuses(state);
  const byId = new Map(path.map((s) => [s.id, s]));
  const completion = dashboardCompletion(state);
  const priorities = deriveDashboardPriorities(state);
  const readiness = readinessCards(state);
  const milestones = upcomingMilestones(state);
  const programs = programSnapshot(state);
  const currentId = path.find((s) => s.tone === "current" || s.tone === "verify" || s.tone === "blocked")?.id ?? "profile";
  const series = pathwayProgressSeries(state);

  return (
    <div className="max-w-full space-y-8 overflow-x-hidden">
      <section className="relative overflow-hidden rounded-3xl bg-[#0b1f33] px-5 py-6 text-white shadow-[0_16px_40px_rgba(11,31,51,0.18)] sm:px-8">
        <svg
          viewBox="0 0 120 120"
          className="pointer-events-none absolute -right-6 top-1/2 hidden h-44 w-44 -translate-y-1/2 text-teal-400/15 sm:block lg:right-8 lg:h-52 lg:w-52"
          aria-hidden
        >
          <circle cx="60" cy="60" r="28" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="60" cy="60" r="8" fill="currentColor" />
          {[0, 45, 90, 135].map((deg) => (
            <line
              key={deg}
              x1="60"
              y1="12"
              x2="60"
              y2="32"
              stroke="currentColor"
              strokeWidth="2"
              transform={`rotate(${deg} 60 60)`}
            />
          ))}
        </svg>
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-start gap-4 sm:gap-5">
            <CompactRing percent={completion.percent} label="pathway" />
            <div className="min-w-0">
              <CompassMessage currentStage={currentId} variant="hero" />
              <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">Welcome back, {welcome.greetingName}</h1>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-teal-50/85">{welcome.message}</p>
              <p className="mt-2 text-xs text-teal-100/80">
                {completion.completed} of {completion.total} pathway stages complete
              </p>
              <Link href={welcome.cta.href} className="mt-4 inline-flex">
                <Button className="bg-teal-500 text-white hover:bg-teal-400">
                  Continue preparation
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">Journey progress</h2>
          <ul className="flex flex-wrap gap-3 text-[11px] text-slate-500">
            <li className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-600" /> Completed
            </li>
            <li className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-teal-700" /> In progress
            </li>
            <li className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-500" /> Verify
            </li>
            <li className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-slate-300" /> Upcoming
            </li>
          </ul>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {JOURNEY_PHASES.map((phase) => (
            <Card key={phase.id} className="p-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-teal-800">{phase.label}</p>
                <ol className="mt-3 space-y-2.5">
                  {phase.ids.map((id) => {
                    const step = byId.get(id) as PathStep;
                    return (
                      <li key={id}>
                        <Link href={step.href} className="flex items-center gap-2">
                          <span className={cn("flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold", STEP_DOT[step.tone])}>
                            {path.findIndex((s) => s.id === id) + 1}
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-medium text-[#0b1f33]">{step.label}</span>
                            <Badge className="mt-0.5" tone={TONE_BADGE[step.tone]}>
                              {step.statusLabel}
                            </Badge>
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ol>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <Card className="p-4 sm:px-5 sm:py-4">
          <PathwayProgressChart
            points={series}
            overallPercent={completion.percent}
            completed={completion.completed}
            total={completion.total}
          />
        </Card>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">Today’s priorities</h2>
        {priorities.length === 0 ? (
          <Card>
            <p className="text-sm text-slate-600">No outstanding tracker actions. Confirm official sources before applying.</p>
          </Card>
        ) : (
          <ol className="grid gap-3 md:grid-cols-3">
            {priorities.map((item, i) => (
              <li key={item.href + item.title}>
                <Link href={item.href} className="block h-full">
                  <Card className="flex h-full flex-col p-4 transition hover:shadow-md">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0b1f33] text-xs font-semibold text-white">
                      {i + 1}
                    </span>
                    <p className="mt-3 font-semibold text-[#0b1f33]">{item.title}</p>
                    <p className="mt-1 flex-1 text-sm text-slate-600">{item.detail}</p>
                    <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-teal-800">
                      Continue <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </Card>
                </Link>
              </li>
            ))}
          </ol>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">Readiness overview</h2>
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {readiness.map((card) => {
            const Icon = READINESS_ICON[card.id as keyof typeof READINESS_ICON] ?? BookOpen;
            return (
              <li key={card.id}>
                <Link href={card.href} className="block h-full">
                  <Card className="h-full p-4 hover:shadow-md">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">{card.label}</p>
                      <Icon className="h-4 w-4 text-teal-800" />
                    </div>
                    <p className="mt-2 text-sm font-semibold text-[#0b1f33]">{card.status}</p>
                    <p className="mt-1 text-xs text-slate-500">{card.detail}</p>
                    <ProgressBar className="mt-3" value={card.progress} />
                  </Card>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">Upcoming milestones</h2>
          <Card className="p-5">
            {milestones.length === 0 ? (
              <p className="text-sm text-slate-600">No personal or cycle dates recorded yet.</p>
            ) : (
              <ol className="relative space-y-0 border-l border-[#e4ddd2] pl-4">
                {milestones.map((m) => (
                  <li key={m.label + m.date} className="relative pb-4 last:pb-0">
                    <span className="absolute -left-[21px] mt-1.5 h-2.5 w-2.5 rounded-full bg-teal-700 ring-4 ring-[#fffcf8]" />
                    <Link href={m.href} className="block">
                      <p className="text-sm font-medium text-[#0b1f33]">{m.label}</p>
                      <p className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <Calendar className="h-3 w-3" />
                        {formatDay(m.date)}
                        {m.relative ? <span className="text-teal-800">{m.relative}</span> : null}
                      </p>
                    </Link>
                  </li>
                ))}
              </ol>
            )}
          </Card>
        </section>
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">My programs</h2>
          <Card className="p-5">
            {programs.length === 0 ? (
              <p className="text-sm text-slate-600">No saved programs yet. Use Program Explorer to research faculties.</p>
            ) : (
              <ul className="space-y-4">
                {programs.map((p) => (
                  <li key={p.id} className="flex items-start justify-between gap-3 rounded-xl border border-[#efe8de] bg-white/60 px-3 py-3">
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-[#0b1f33]">{p.institution}</span>
                      <span className="text-xs text-slate-500">
                        {p.specialty} · {p.provinceCode}
                      </span>
                    </span>
                    <span className="flex shrink-0 flex-col items-end gap-1">
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700">
                        <Bookmark className="h-3.5 w-3.5 fill-emerald-600 text-emerald-600" />
                        Saved
                      </span>
                      <Badge tone={p.applicationStatus === "submitted" ? "emerald" : p.applicationStatus === "in_progress" ? "sky" : "slate"}>
                        {APP_STATUS[p.applicationStatus] ?? p.applicationStatus}
                      </Badge>
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-5 flex flex-wrap gap-4 text-sm font-medium">
              <Link href="/programs" className="text-teal-800">
                Explore Programs →
              </Link>
              <Link href="/applications" className="text-teal-800">
                View Applications →
              </Link>
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
}
