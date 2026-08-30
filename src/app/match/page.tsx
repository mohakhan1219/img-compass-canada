"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { setMatchOutcome } from "@/data/repositories/carms-repository";
import type { MatchOutcomeStatus } from "@/domain/types";
import { useStore } from "@/components/store-provider";

export default function MatchPage() {
  const { state, setState } = useStore();
  const match = state.matchOutcome;
  const [openControls, setOpenControls] = useState(false);
  const program = state.programs.find((p) => p.id === match?.programId);
  const status = match?.status ?? "awaiting";

  function record(next: MatchOutcomeStatus, programId: string | null) {
    setState(
      setMatchOutcome(state, {
        status: next,
        programId,
        recordedAt: new Date().toISOString(),
        notes: match?.notes ?? "",
        nextCycleNotes: match?.nextCycleNotes ?? "",
      }),
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Match"
        title="Match day"
        description="The last step on the tracked journey — record the result when it is public."
      />

      {status === "matched" && program ? (
        <Card className="bg-gradient-to-br from-teal-800 to-[#0b1f33] text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-200">Matched</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight">{program.name.replace(" (demo)", "")}</h2>
          <p className="mt-2 text-lg text-teal-100">{program.specialty}</p>
          <p className="mt-5 max-w-xl text-sm text-teal-50/90">
            Continue into residency onboarding. Confirm next steps with the programme and the college.
          </p>
          <a className="mt-4 inline-block text-sm font-medium text-teal-100 underline" href="/residency">
            Open residency onboarding
          </a>
        </Card>
      ) : null}

      {status === "unmatched" ? (
        <Card>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Unmatched</p>
          <h2 className="mt-2 text-2xl font-semibold text-[#0b1f33]">No match recorded</h2>
          <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-slate-600">
            Review second iteration when it applies, post-match options, and next-cycle planning. Capture a personal
            retrospective. This tracker stays available.
          </p>
          <a className="mt-3 inline-block text-sm text-teal-800" href="https://www.carms.ca/match/r-1-main-residency-match/applicant/r-1-second-iteration-timeline/" target="_blank" rel="noreferrer">
            View official source ↗
          </a>
        </Card>
      ) : null}

      {status === "awaiting" ? (
        <Card className="border-teal-800/10 bg-gradient-to-br from-[#fffcf8] to-teal-50">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-800">Awaiting match result</p>
          <h2 className="mt-3 text-2xl font-semibold text-[#0b1f33]">Results are not in yet</h2>
          <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-slate-600">
            Rank list is in place. When CaRMS publishes outcomes, record matched or unmatched here so
            the journey snapshot stays current.
          </p>
          <p className="mt-4 text-sm text-slate-500">
            {state.programs.filter((p) => p.rankIncluded).length} programme
            {state.programs.filter((p) => p.rankIncluded).length === 1 ? "" : "s"} on the rank list.
          </p>
        </Card>
      ) : null}

      <div>
        <button
          type="button"
          className="text-xs font-medium text-slate-500 underline-offset-2 hover:text-slate-700 hover:underline"
          onClick={() => setOpenControls((v) => !v)}
        >
          {openControls ? "Hide result recording" : "Record match result"}
        </button>
        {openControls ? (
          <Card className="mt-3">
            <CardTitle>Record result</CardTitle>
            <p className="mt-2 text-sm text-slate-600">Update this tracker when CaRMS publishes outcomes.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button variant="secondary" size="sm" onClick={() => record("awaiting", null)}>
                Awaiting
              </Button>
              {state.programs.map((p) => (
                <Button key={p.id} size="sm" onClick={() => record("matched", p.id)}>
                  Matched: {p.name.replace(" (demo)", "")}
                </Button>
              ))}
              <Button variant="danger" size="sm" onClick={() => record("unmatched", null)}>
                Unmatched
              </Button>
            </div>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
