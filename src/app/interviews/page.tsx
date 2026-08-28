"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Input, Label, Textarea } from "@/components/ui/input";
import { PageHeader } from "@/components/page-header";
import { logInterviewPractice } from "@/data/repositories/interview-repository";
import { updateProgram } from "@/data/repositories/carms-repository";
import { computeCarmsPipeline } from "@/domain/carms";
import { recurringImprovementThemes } from "@/domain/interviews";
import { useStore } from "@/components/store-provider";

export default function InterviewsPage() {
  const { state, setState } = useStore();
  const pipe = computeCarmsPipeline(state.programs, state.matchOutcome);
  const themes = recurringImprovementThemes(state.interviewSessions);
  const invited = state.programs.filter((p) => p.invitationStatus === "invited").length;
  const [promptId, setPromptId] = useState(state.interviewBank[0]?.id ?? "");
  const [notes, setNotes] = useState("");
  const [tags, setTags] = useState("structure");
  const [improve, setImprove] = useState("");
  const prompt = state.interviewBank.find((p) => p.id === promptId);
  const recent = [...state.interviewSessions].slice(-4).reverse();

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Match"
        title="Interviews"
        description="Track invitations and rehearse answers before interview day."
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Invitations", String(invited)],
          ["Interviews completed", String(pipe.interviewed)],
          ["Practice sessions", String(state.interviewSessions.length)],
          ["Weak themes", themes.length ? themes.slice(0, 2).join(", ") : "None yet"],
        ].map(([label, value]) => (
          <Card key={label}>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
            <p className="mt-2 text-lg font-semibold leading-snug">{value}</p>
          </Card>
        ))}
      </div>

      <Card>
        <CardTitle>Programme invitations</CardTitle>
        <ul className="mt-4 space-y-2">
          {state.programs.map((p) => (
            <li
              key={p.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#eee8de] px-3 py-3"
            >
              <span>
                <span className="font-medium">{p.name.replace(" (demo)", "")}</span>
                <span className="ml-2 text-sm text-slate-500">
                  {p.interviewed ? "Interviewed" : p.invitationStatus === "invited" ? "Invited" : "None yet"}
                </span>
              </span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setState(updateProgram(state, p.id, { invitationStatus: "invited" }))}
                >
                  Mark invited
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() =>
                    setState(
                      updateProgram(state, p.id, {
                        interviewed: true,
                        invitationStatus: p.invitationStatus === "none" ? "invited" : p.invitationStatus,
                      }),
                    )
                  }
                >
                  Mark interviewed
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <Card className="bg-[#0b1f33] text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-200">Practice workspace</p>
          <Label className="mt-4 text-teal-100">Selected prompt</Label>
          <select
            className="mt-1 h-11 w-full rounded-xl border-0 bg-white/10 px-3 text-sm text-white"
            value={promptId}
            onChange={(e) => setPromptId(e.target.value)}
          >
            {state.interviewBank.map((p) => (
              <option key={p.id} value={p.id} className="text-slate-900">
                {p.kind} — {p.prompt.slice(0, 72)}
              </option>
            ))}
          </select>
          {prompt ? (
            <p className="mt-5 text-lg leading-relaxed text-teal-50">{prompt.prompt}</p>
          ) : null}
          <div className="mt-6 space-y-3">
            <div>
              <Label className="text-teal-100">Answer notes</Label>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="min-h-28" />
            </div>
            <div>
              <Label className="text-teal-100">Performance tags</Label>
              <Input value={tags} onChange={(e) => setTags(e.target.value)} />
            </div>
            <div>
              <Label className="text-teal-100">Areas to improve</Label>
              <Input value={improve} onChange={(e) => setImprove(e.target.value)} />
            </div>
          </div>
          <Button
            className="mt-5"
            variant="secondary"
            onClick={() =>
              setState(
                logInterviewPractice(state, {
                  promptId,
                  notes,
                  performanceTags: tags.split(",").map((t) => t.trim()).filter(Boolean),
                  improvementAreas: improve,
                }),
              )
            }
          >
            Save practice
          </Button>
        </Card>
        <Card>
          <CardTitle>Recent practice</CardTitle>
          {themes.length ? (
            <p className="mt-2 text-sm text-slate-600">Recurring: {themes.join(", ")}</p>
          ) : null}
          <ul className="mt-4 space-y-3">
            {recent.length === 0 ? (
              <li className="text-sm text-slate-500">No practice sessions yet.</li>
            ) : (
              recent.map((s) => {
                const p = state.interviewBank.find((x) => x.id === s.promptId);
                return (
                  <li key={s.id} className="rounded-xl bg-slate-50 p-3 text-sm">
                    <div className="flex flex-wrap gap-2">
                      <Badge>{p?.kind}</Badge>
                      {s.performanceTags.map((t) => (
                        <Badge key={t} tone="sky">
                          {t}
                        </Badge>
                      ))}
                    </div>
                    <p className="mt-2 line-clamp-3 text-slate-700">{p?.prompt}</p>
                    {s.improvementAreas ? (
                      <p className="mt-1 text-slate-500">Improve: {s.improvementAreas}</p>
                    ) : null}
                  </li>
                );
              })
            )}
          </ul>
        </Card>
      </div>
    </div>
  );
}
