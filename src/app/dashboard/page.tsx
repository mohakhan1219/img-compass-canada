"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CompassMessage } from "@/components/compass-message";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import {
  dashboardPathStatuses,
  deriveDashboardPriorities,
  programSnapshot,
  readinessCards,
  upcomingMilestones,
  welcomeContext,
  type PathTone,
} from "@/domain/dashboard";
import { useStore } from "@/components/store-provider";
import { cn } from "@/lib/utils";

const TONE_BADGE: Record<PathTone, "emerald" | "sky" | "slate" | "red" | "amber"> = {
  complete: "emerald",
  current: "sky",
  upcoming: "slate",
  attention: "red",
};

const STEP_DOT: Record<PathTone, string> = {
  complete: "bg-emerald-600 text-white",
  current: "bg-teal-700 text-white ring-4 ring-teal-200",
  upcoming: "bg-slate-200 text-slate-500",
  attention: "bg-red-600 text-white",
};

const APP_STATUS: Record<string, string> = {
  not_started: "Research",
  in_progress: "In progress",
  submitted: "Submitted",
  withdrawn: "Withdrawn",
};

function formatDay(iso: string): string {
  const d = new Date(iso);
  if (!Number.isFinite(d.getTime())) return iso.slice(0, 10);
  return d.toLocaleDateString("en-CA", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" });
}

export default function DashboardPage() {
  const { state } = useStore();
  const welcome = welcomeContext(state);
  const path = dashboardPathStatuses(state);
  const priorities = deriveDashboardPriorities(state);
  const readiness = readinessCards(state);
  const milestones = upcomingMilestones(state);
  const programs = programSnapshot(state);
  const currentId = path.find((s) => s.tone === "current" || s.tone === "attention")?.id ?? "profile";

  return (
    <div className="space-y-10">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(16rem,0.8fr)] lg:items-start">
        <PageHeader
          eyebrow="Dashboard"
          title={`Welcome back, ${welcome.greetingName}`}
          description={welcome.message}
          actions={
            <Link href={welcome.cta.href}>
              <Button>
                {welcome.cta.label}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          }
        />
        <CompassMessage currentStage={currentId} />
      </div>

      <section>
        <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">Journey progress</h2>
          <ul className="flex flex-wrap gap-3 text-[11px] text-slate-500">
            <li className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-600" /> Completed
            </li>
            <li className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-teal-700" /> Current
            </li>
            <li className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-slate-300" /> Upcoming
            </li>
            <li className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-red-600" /> Needs attention
            </li>
          </ul>
        </div>
        <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <ol className="flex min-w-[52rem] items-start gap-0 sm:min-w-0 sm:flex-wrap lg:flex-nowrap">
            {path.map((step, i) => (
              <li key={step.id} className="flex min-w-[4.5rem] flex-1 flex-col items-center">
                <div className="flex w-full items-center">
                  <span className={cn("mx-auto flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold", STEP_DOT[step.tone])}>
                    {i + 1}
                  </span>
                </div>
                {i < path.length - 1 ? (
                  <span className="sr-only">then</span>
                ) : null}
                <Link href={step.href} className="mt-2 px-1 text-center">
                  <span className="block text-xs font-medium text-[#0b1f33]">{step.label}</span>
                  <Badge className="mt-1" tone={TONE_BADGE[step.tone]}>
                    {step.statusLabel}
                  </Badge>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">Today’s priorities</h2>
        {priorities.length === 0 ? (
          <Card>
            <p className="text-sm text-slate-600">No outstanding tracker actions. Confirm official sources before applying.</p>
          </Card>
        ) : (
          <Card className="p-0">
            <ol className="divide-y divide-[#e4ddd2]">
              {priorities.map((item, i) => (
                <li key={item.href + item.title}>
                  <Link href={item.href} className="flex items-start gap-4 px-5 py-4 transition hover:bg-teal-50/40">
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#0b1f33] text-xs font-semibold text-white">
                      {i + 1}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-medium text-[#0b1f33]">{item.title}</span>
                      <span className="mt-1 block text-sm text-slate-600">{item.detail}</span>
                    </span>
                    <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-teal-800" />
                  </Link>
                </li>
              ))}
            </ol>
          </Card>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">Readiness overview</h2>
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {readiness.map((card) => (
            <li key={card.id}>
              <Link href={card.href} className="block h-full">
                <Card className="h-full p-4 hover:shadow-md">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">{card.label}</p>
                  <p className="mt-2 text-sm font-semibold text-[#0b1f33]">{card.status}</p>
                  <p className="mt-1 text-xs text-slate-500">{card.detail}</p>
                  <Badge className="mt-3" tone={TONE_BADGE[card.tone]}>
                    {card.tone === "attention" ? "Needs attention" : card.tone === "complete" ? "Complete" : card.tone === "current" ? "In progress" : "Upcoming"}
                  </Badge>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">Upcoming milestones</h2>
          <Card>
            {milestones.length === 0 ? (
              <p className="text-sm text-slate-600">No personal or cycle dates recorded yet.</p>
            ) : (
              <ul className="space-y-3">
                {milestones.map((m) => (
                  <li key={m.label + m.date}>
                    <Link href={m.href} className="flex items-baseline justify-between gap-3 text-sm">
                      <span className="min-w-0 text-[#0b1f33]">{m.label}</span>
                      <span className="shrink-0 tabular-nums text-slate-500">{formatDay(m.date)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </section>
        <section>
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">My programs</h2>
            <Link href="/programs" className="text-sm font-medium text-teal-800">
              Continue in Explorer
            </Link>
          </div>
          <Card>
            {programs.length === 0 ? (
              <p className="text-sm text-slate-600">No saved programs yet. Use Program Explorer to research faculties.</p>
            ) : (
              <ul className="space-y-3">
                {programs.map((p) => (
                  <li key={p.id} className="flex items-start justify-between gap-3 text-sm">
                    <span>
                      <span className="block font-medium text-[#0b1f33]">{p.name}</span>
                      <span className="text-xs text-slate-500">
                        {p.specialty} · {p.provinceCode}
                      </span>
                    </span>
                    <Badge tone={p.applicationStatus === "submitted" ? "emerald" : p.applicationStatus === "in_progress" ? "sky" : "slate"}>
                      {APP_STATUS[p.applicationStatus] ?? p.applicationStatus}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
            <Link href="/applications" className="mt-4 inline-flex text-sm font-medium text-teal-800">
              Open applications →
            </Link>
          </Card>
        </section>
      </div>
    </div>
  );
}
