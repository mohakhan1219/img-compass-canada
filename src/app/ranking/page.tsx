"use client";

import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { setRankOrder } from "@/data/repositories/carms-repository";
import { computeCarmsPipeline, rankedPrograms, rankingConflicts } from "@/domain/carms";
import { useStore } from "@/components/store-provider";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function RankingPage() {
  const { state, setState } = useStore();
  const pipe = computeCarmsPipeline(state.programs, state.matchOutcome);
  const ranked = rankedPrograms(state.programs);
  const unranked = state.programs.filter((p) => !p.rankIncluded);
  const conflicts = rankingConflicts(state.programs);
  const first = ranked[0];
  const orderedIds = ranked.map((p) => p.id);

  function move(id: string, dir: -1 | 1) {
    const i = orderedIds.indexOf(id);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= orderedIds.length) return;
    const next = [...orderedIds];
    [next[i], next[j]] = [next[j], next[i]];
    setState(setRankOrder(state, next));
  }

  function include(id: string) {
    setState(setRankOrder(state, [...orderedIds, id]));
  }

  function exclude(id: string) {
    setState(setRankOrder(state, orderedIds.filter((x) => x !== id)));
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Match"
        title="Rank order"
        description="Build a private list of programmes in the order you would submit them."
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <Card>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Interviewed</p>
          <p className="mt-2 text-2xl font-semibold">{pipe.interviewed}</p>
        </Card>
        <Card>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Programmes ranked</p>
          <p className="mt-2 text-2xl font-semibold">{pipe.ranked}</p>
        </Card>
        <Card>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Current #1</p>
          <p className="mt-2 text-lg font-semibold leading-snug">
            {first ? first.name.replace(" (demo)", "") : "Not set"}
          </p>
        </Card>
      </div>

      {conflicts.map((c) => (
        <p key={c} className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-950">
          {c}
        </p>
      ))}

      <Card>
        <CardTitle>Your list</CardTitle>
        {ranked.length === 0 ? (
          <p className="mt-3 text-sm text-slate-600">Include a programme below to start the rank order.</p>
        ) : (
          <ol className="mt-4 space-y-2">
            {ranked.map((p, i) => (
              <li
                key={p.id}
                className="flex items-center gap-3 rounded-2xl border border-[#eee8de] bg-[#fffcf8] px-3 py-3"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0b1f33] text-lg font-semibold text-white">
                  {p.rankPosition ?? i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-[#0b1f33]">{p.name.replace(" (demo)", "")}</p>
                  <p className="text-sm text-slate-500">
                    {p.specialty}
                    {p.interviewed ? " · Interviewed" : ""}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Button size="sm" variant="ghost" disabled={i === 0} onClick={() => move(p.id, -1)}>
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={i === ranked.length - 1}
                    onClick={() => move(p.id, 1)}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => exclude(p.id)}>
                    Remove
                  </Button>
                </div>
              </li>
            ))}
          </ol>
        )}
      </Card>

      {unranked.length ? (
        <Card>
          <CardTitle>Not on the list</CardTitle>
          <ul className="mt-3 space-y-2">
            {unranked.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-3">
                <div>
                  <p className="font-medium">{p.name.replace(" (demo)", "")}</p>
                  <p className="text-sm text-slate-500">{p.specialty}</p>
                </div>
                <Button size="sm" onClick={() => include(p.id)}>
                  Include
                </Button>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}
    </div>
  );
}
