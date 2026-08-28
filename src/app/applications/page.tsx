"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/page-header";
import { ProgressBar } from "@/components/progress";
import { updateProgram } from "@/data/repositories/carms-repository";
import {
  approachingDeadlines,
  applicationTrackProgress,
  computeCarmsPipeline,
  documentsComplete,
} from "@/domain/carms";
import type { ApplicationStatus, DocumentItemStatus } from "@/domain/types";
import { useStore } from "@/components/store-provider";

const APP: ApplicationStatus[] = ["not_started", "in_progress", "submitted", "withdrawn"];
const DOC: DocumentItemStatus[] = ["not_started", "in_progress", "complete", "not_required"];
const SELECT = "h-10 w-full rounded-lg border border-[#d6cfc4] bg-white px-3 text-sm";

export default function ApplicationsPage() {
  const { state, setState } = useStore();
  const pipe = computeCarmsPipeline(state.programs, state.matchOutcome);
  const docsReady = state.programs.filter((p) => documentsComplete(p)).length;
  const dueSoon = approachingDeadlines(state.programs);
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Match"
        title="Applications"
        description="Track documents and submission status for each programme. Do not paste CV or letter text here."
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Programmes", String(pipe.programs)],
          ["Documents ready", `${docsReady} / ${pipe.programs}`],
          ["Submitted", String(pipe.submitted)],
          ["Deadlines approaching", String(dueSoon.length)],
        ].map(([label, value]) => (
          <Card key={label}>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
            <p className="mt-2 text-2xl font-semibold">{value}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {state.programs.map((p) => {
          const { done, total } = applicationTrackProgress(p);
          const open = openId === p.id;
          return (
            <Card key={p.id}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <CardTitle>{p.name.replace(" (demo)", "")}</CardTitle>
                  <p className="mt-1 text-sm text-slate-500">Deadline {p.deadline}</p>
                </div>
                <Badge tone={p.applicationStatus === "submitted" ? "emerald" : documentsComplete(p) ? "sky" : "amber"}>
                  {p.applicationStatus.replace("_", " ")}
                </Badge>
              </div>
              <p className="mt-4 text-sm font-medium text-[#0b1f33]">
                {done} of {total} requirements complete
              </p>
              <ProgressBar value={(done / total) * 100} className="mt-2" />
              <ul className="mt-3 space-y-1 text-sm text-slate-600">
                <li>CV · {p.cvStatus.replace("_", " ")}</li>
                <li>Personal letter · {p.letterStatus.replace("_", " ")}</li>
                <li>References · {p.referencesStatus.replace("_", " ")}</li>
                <li>Application · {p.applicationStatus.replace("_", " ")}</li>
              </ul>
              <Button className="mt-4" size="sm" variant="outline" onClick={() => setOpenId(open ? null : p.id)}>
                {open ? "Hide details" : "Update checklist"}
              </Button>
              {open ? (
                <div className="mt-4 space-y-3 border-t border-[#eee8de] pt-4 text-sm">
                  {(
                    [
                      ["cvStatus", "CV"],
                      ["letterStatus", "Personal letter"],
                      ["referencesStatus", "References"],
                    ] as const
                  ).map(([field, label]) => (
                    <label key={field} className="block">
                      <span className="mb-1 block font-medium text-slate-700">{label}</span>
                      <select
                        className={SELECT}
                        value={p[field]}
                        onChange={(e) =>
                          setState(updateProgram(state, p.id, { [field]: e.target.value as DocumentItemStatus }))
                        }
                      >
                        {DOC.map((d) => (
                          <option key={d} value={d}>
                            {d.replace("_", " ")}
                          </option>
                        ))}
                      </select>
                    </label>
                  ))}
                  <label className="block">
                    <span className="mb-1 block font-medium text-slate-700">Application</span>
                    <select
                      className={SELECT}
                      value={p.applicationStatus}
                      onChange={(e) =>
                        setState(updateProgram(state, p.id, { applicationStatus: e.target.value as ApplicationStatus }))
                      }
                    >
                      {APP.map((d) => (
                        <option key={d} value={d}>
                          {d.replace("_", " ")}
                        </option>
                      ))}
                    </select>
                  </label>
                  <Button
                    size="sm"
                    onClick={() => setState(updateProgram(state, p.id, { applicationStatus: "submitted" }))}
                  >
                    Mark submitted
                  </Button>
                </div>
              ) : null}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
