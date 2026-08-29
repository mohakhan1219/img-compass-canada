"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { JOURNEY_STAGES } from "@/domain/stages";
import { computeJourneySnapshot, deriveNextActions, issuesForStage, isVerificationHold } from "@/domain/journey";
import { MATCH_CYCLES } from "@/reference/match-cycles";
import { useStore } from "@/components/store-provider";
import { cn } from "@/lib/utils";

const STATUS_COPY: Record<string, string> = {
  complete: "Complete",
  in_progress: "In progress",
  blocked: "Needs attention",
  not_started: "Not started",
  waiting: "Waiting",
  needs_verification: "Needs verification",
};

export default function DashboardPage() {
  const { state } = useStore();
  const journey = computeJourneySnapshot(state);
  const actions = deriveNextActions(state);
  const first = JOURNEY_STAGES.find((s) => journey.status[s.id] !== "complete");
  const firstName = (state.profile.displayName || "there").replace(/^Dr\.\s+/, "").split(" ")[0];
  const cycle = MATCH_CYCLES.find((c) => c.id === state.profile.targetMatchCycleId);
  const upcoming = [
    state.mccqeExam?.scheduledDate ? { label: "MCCQE (personal date)", date: state.mccqeExam.scheduledDate, href: "/mccqe1" } : null,
    ...state.programs
      .filter((p) => p.deadline)
      .map((p) => ({ label: p.name, date: p.deadline, href: "/applications" })),
  ]
    .filter(Boolean)
    .slice(0, 4) as { label: string; date: string; href: string }[];

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Dashboard"
        title={`Welcome back, ${firstName}`}
        description="A connected view of where you are, what still needs attention, and which official source to check next."
        actions={
          first ? (
            <Link href={first.href}>
              <Button>
                Continue {first.label}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          ) : null
        }
      />

      <div className="grid gap-4 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-[#0b1f33] to-teal-900 text-white lg:col-span-2">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-200">You are here</p>
          <p className="mt-2 text-2xl font-semibold">{journey.flags.currentLabel}</p>
          <p className="mt-3 text-sm text-teal-50/90">{journey.flags.next}</p>
        </Card>
        <Card>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Main attention</p>
          <p className="mt-2 font-medium text-[#0b1f33]">{journey.flags.attention}</p>
        </Card>
        <Card>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">CaRMS</p>
          <p className="mt-2 font-medium text-[#0b1f33]">{cycle ? "2027 cycle" : "Select a cycle"}</p>
          <p className="mt-1 text-sm text-slate-500">{cycle?.name ?? "No cycle recorded"}</p>
        </Card>
      </div>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">Next actions</h2>
        <ul className="grid gap-2 md:grid-cols-3">
          {actions.length === 0 ? (
            <Card>No outstanding tracker actions. Confirm official sources before applying.</Card>
          ) : (
            actions.map((a) => (
              <li key={a.href + a.title}>
                <Link href={a.href} className="block h-full">
                  <Card className="h-full hover:shadow-md">
                    <CardTitle>{a.title}</CardTitle>
                    <p className="mt-2 text-sm text-slate-600">{a.detail}</p>
                  </Card>
                </Link>
              </li>
            ))
          )}
        </ul>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">Journey</h2>
        <ol className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          {JOURNEY_STAGES.map((stage, i) => {
            const status = journey.status[stage.id];
            const stageIssues = issuesForStage(journey.flags.issues, stage.id);
            const verifyOnly =
              (status === "blocked" || status === "needs_verification") &&
              stageIssues.length > 0 &&
              stageIssues.every((x) => isVerificationHold(x.kind));
            return (
              <li key={stage.id}>
                <Link
                  href={stage.href}
                  className={cn(
                    "flex h-full flex-col rounded-2xl border border-[#e4ddd2] bg-[#fffcf8] p-3 transition hover:-translate-y-0.5 hover:shadow-md",
                    first?.id === stage.id ? "ring-2 ring-teal-600/40" : "",
                  )}
                >
                  <span className="text-[11px] font-medium text-slate-400">{String(i + 1).padStart(2, "0")}</span>
                  <span className="mt-1 font-medium text-[#0b1f33]">{stage.label}</span>
                  <Badge className="mt-2 w-fit" tone={status === "complete" ? "emerald" : verifyOnly ? "amber" : status === "blocked" ? "red" : status === "in_progress" ? "sky" : "slate"}>
                    {verifyOnly ? "Verify" : STATUS_COPY[status] ?? status}
                  </Badge>
                </Link>
              </li>
            );
          })}
        </ol>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardTitle>Upcoming</CardTitle>
          {upcoming.length === 0 ? (
            <p className="mt-3 text-sm text-slate-600">No personal dates recorded yet.</p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm">
              {upcoming.map((u) => (
                <li key={u.label}>
                  <Link href={u.href} className="text-teal-800">
                    {u.label} · {u.date.slice(0, 10)}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card>
          <CardTitle>Attention</CardTitle>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            {journey.flags.issues.slice(0, 5).map((i) => (
              <li key={i.title}>{i.title}</li>
            ))}
            {journey.flags.issues.length === 0 ? <li>No tracker holds right now.</li> : null}
          </ul>
        </Card>
      </div>
    </div>
  );
}
