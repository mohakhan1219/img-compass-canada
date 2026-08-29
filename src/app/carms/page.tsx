"use client";

import Link from "next/link";
import { Card, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { MATCH_CYCLES } from "@/reference/match-cycles";
import { computeCarmsPipeline, programPipelineSteps } from "@/domain/carms";
import { CANADIAN_PROVINCES } from "@/domain/requirements";
import { useStore } from "@/components/store-provider";
import { cn } from "@/lib/utils";

export default function CarmsPage() {
  const { state } = useStore();
  const pipe = computeCarmsPipeline(state.programs, state.matchOutcome);
  const cycle = MATCH_CYCLES.find((c) => c.id === state.profile.targetMatchCycleId) ?? MATCH_CYCLES[0];

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Match"
        title="CaRMS pipeline"
        description="Match-cycle command center. Dates are sourced from CaRMS and labelled with last verified."
      />

      <Card>
        <CardTitle>{cycle.name}</CardTitle>
        <p className="mt-1 text-sm text-slate-500">
          Last verified {cycle.lastVerifiedDate} · {cycle.sourceStatus}
        </p>
        <a className="mt-2 inline-block text-sm text-teal-800" href={cycle.sourceUrl} target="_blank" rel="noreferrer">
          View official source ↗
        </a>
        <ol className="mt-4 space-y-2 text-sm">
          {cycle.events.map((e) => (
            <li key={e.id} className="flex justify-between gap-3">
              <span>{e.label}</span>
              <span className="text-slate-500">{e.occursOn.slice(0, 10)}</span>
            </li>
          ))}
        </ol>
      </Card>

      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {[
          ["Programmes", pipe.programs],
          ["Submitted", pipe.submitted],
          ["Invited", pipe.invited],
          ["Interviewed", pipe.interviewed],
          ["Ranked", pipe.ranked],
        ].map(([k, v]) => (
          <Card key={String(k)}>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{k}</p>
            <p className="mt-2 text-2xl font-semibold">{v}</p>
          </Card>
        ))}
      </div>
      <p className="text-sm text-slate-600">{pipe.nextHint}</p>
      <div className="flex flex-wrap gap-3 text-sm font-medium text-teal-800">
        <Link href="/applications">Applications</Link>
        <Link href="/interviews">Interviews</Link>
        <Link href="/ranking">Ranking</Link>
        <Link href="/match">Match</Link>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        {state.programs.map((p) => {
          const steps = programPipelineSteps(p);
          return (
            <Card key={p.id}>
              <div className="flex items-start justify-between gap-2">
                <CardTitle>{p.name}</CardTitle>
              </div>
              <p className="mt-1 text-sm text-slate-500">
                {p.specialty} · {CANADIAN_PROVINCES.find((x) => x.code === p.provinceCode)?.name}
              </p>
              <ol className="mt-4 flex flex-wrap gap-1.5">
                {steps.map((step, i) => (
                  <li key={step.id} className="flex items-center gap-1.5">
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[11px] font-medium",
                        step.done ? "bg-teal-700 text-white" : "bg-slate-100 text-slate-500",
                      )}
                    >
                      {step.label}
                    </span>
                    {i < steps.length - 1 ? <span className="text-slate-300">→</span> : null}
                  </li>
                ))}
              </ol>
              <dl className="mt-4 space-y-1 text-sm text-slate-600">
                <div>Deadline {p.deadline}</div>
                <div>Rank {p.rankIncluded ? `#${p.rankPosition}` : "not listed"}</div>
              </dl>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
