"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { ProgressBar } from "@/components/progress";
import { JOURNEY_STAGES } from "@/domain/stages";
import { computeJourneySnapshot, issuesForStage, isVerificationHold } from "@/domain/journey";
import { BLOCKER_KIND_LABEL, formatIssueHeadline } from "@/domain/blockers";
import { computeCarmsPipeline } from "@/domain/carms";
import { mccqe1Insights } from "@/lib/store";
import { useStore } from "@/components/store-provider";
import { cn } from "@/lib/utils";

const STATUS_COPY: Record<string, string> = {
  complete: "Complete",
  in_progress: "In progress",
  blocked: "Needs attention",
  not_started: "Not started",
};

export default function DashboardPage() {
  const { state } = useStore();
  const insights = mccqe1Insights(state);
  const journey = computeJourneySnapshot(state);
  const pipeline = computeCarmsPipeline(state.programs, state.matchOutcome);
  const verify = journey.flags.issues.filter((i) => isVerificationHold(i.kind));
  const blockers = journey.flags.issues.filter((i) => !isVerificationHold(i.kind) && i.kind !== "incomplete_requirement");
  const first = JOURNEY_STAGES.find((s) => journey.status[s.id] !== "complete");
  const done = JOURNEY_STAGES.filter((s) => journey.status[s.id] === "complete").length;
  const pct = Math.round((done / JOURNEY_STAGES.length) * 100);
  const firstName = state.profile.displayName.replace(/^Dr\.\s+/, "").split(" ")[0];

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Dashboard"
        title={`Welcome back, ${firstName}`}
        description="Your Canadian residency journey — progress, next step, and a quiet list of items to confirm."
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

      <Card className="bg-gradient-to-br from-[#0b1f33] to-teal-900 text-white">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-200">Overall progress</p>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-4xl font-semibold tabular-nums">{pct}%</p>
            <p className="mt-1 text-sm text-teal-100/80">
              {done} of {JOURNEY_STAGES.length} stages complete
            </p>
          </div>
          <div className="text-right text-sm">
            <p className="text-teal-100/70">Current stage</p>
            <p className="text-lg font-medium">{first?.label ?? "Journey complete"}</p>
          </div>
        </div>
        <ProgressBar value={pct} className="mt-5 bg-white/15" />
        <p className="mt-4 text-sm text-teal-50/90">{journey.flags.next}</p>
      </Card>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">Journey</h2>
        <ol className="grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
          {JOURNEY_STAGES.map((stage, i) => {
            const status = journey.status[stage.id];
            const stageIssues = issuesForStage(journey.flags.issues, stage.id);
            const verifyOnly =
              status === "blocked" &&
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
                  <Badge
                    className="mt-2 w-fit"
                    tone={
                      status === "complete"
                        ? "emerald"
                        : verifyOnly
                          ? "amber"
                          : status === "blocked"
                            ? "red"
                            : status === "in_progress"
                              ? "sky"
                              : "slate"
                    }
                  >
                    {verifyOnly ? "Verify" : STATUS_COPY[status]}
                  </Badge>
                </Link>
              </li>
            );
          })}
        </ol>
      </section>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardTitle>MCCQE1 readiness</CardTitle>
          <p className="mt-3 text-2xl font-semibold">{insights.readiness.label}</p>
          <p className="mt-1 text-sm text-slate-600">
            {insights.readiness.score === null ? "Log sessions to build an evidence index." : `${insights.readiness.score}/100 evidence index`}
          </p>
          <ProgressBar value={insights.readiness.score ?? 0} className="mt-4" />
        </Card>
        <Card>
          <CardTitle>Applications</CardTitle>
          <p className="mt-3 text-2xl font-semibold">
            {pipeline.submitted}
            <span className="text-base font-normal text-slate-500"> / {pipeline.programs} submitted</span>
          </p>
          <p className="mt-1 text-sm text-slate-600">
            {pipeline.invited} invited · {pipeline.ranked} on rank list
          </p>
        </Card>
        <Card>
          <CardTitle>Upcoming</CardTitle>
          <ul className="mt-3 space-y-2 text-sm text-slate-700">
            {state.programs.slice(0, 3).map((p) => (
              <li key={p.id} className="flex justify-between gap-2">
                <span className="truncate">{p.name.replace(" (demo)", "")}</span>
                <span className="shrink-0 text-slate-500">{p.deadline}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardTitle>Items to verify</CardTitle>
          {verify.length === 0 ? (
            <p className="mt-3 text-sm text-slate-600">Nothing waiting on source confirmation.</p>
          ) : (
            <ul className="mt-3 space-y-3">
              {verify.slice(0, 4).map((issue, i) => (
                <li key={`${issue.title}-${i}`} className="rounded-xl bg-amber-50/80 px-3 py-2.5">
                  <p className="text-xs font-medium text-amber-800">{BLOCKER_KIND_LABEL[issue.kind]}</p>
                  <p className="mt-0.5 text-sm font-medium text-[#0b1f33]">{formatIssueHeadline(issue)}</p>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card>
          <CardTitle>Action items</CardTitle>
          {blockers.length === 0 ? (
            <p className="mt-3 text-sm text-slate-600">No urgent blockers in the tracker.</p>
          ) : (
            <ul className="mt-3 space-y-3">
              {blockers.slice(0, 4).map((issue, i) => (
                <li key={`${issue.title}-${i}`} className="rounded-xl bg-slate-50 px-3 py-2.5">
                  <p className="text-xs font-medium text-slate-500">{BLOCKER_KIND_LABEL[issue.kind]}</p>
                  <p className="mt-0.5 text-sm font-medium text-[#0b1f33]">{formatIssueHeadline(issue)}</p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
