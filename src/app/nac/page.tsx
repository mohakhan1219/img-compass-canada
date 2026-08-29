"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Input, Label, Textarea } from "@/components/ui/input";
import { SELECT } from "@/components/search-select";
import type { MilestoneStatus } from "@/domain/types";
import { PageHeader } from "@/components/page-header";
import { RingStat } from "@/components/progress";
import { logNacAttempt, logNacMock } from "@/data/repositories/nac-repository";
import { NAC_CATEGORIES, computeNacReadiness } from "@/domain/nac";
import { useStore } from "@/components/store-provider";

export default function NacPage() {
  const { state, setState } = useStore();
  const readiness = computeNacReadiness(state.nacStations, state.nacAttempts);
  const [stationId, setStationId] = useState(state.nacStations[0]?.id ?? "");
  const [running, setRunning] = useState(false);
  const [startedAt, setStartedAt] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [score, setScore] = useState(7);
  const [tags, setTags] = useState("time management");
  const [notes, setNotes] = useState("");
  const [mockIds, setMockIds] = useState<string[]>(state.nacStations.slice(0, 2).map((s) => s.id));

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setElapsed((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, [running]);

  const station = useMemo(
    () => state.nacStations.find((s) => s.id === stationId),
    [state.nacStations, stationId],
  );
  const completed = new Set(state.nacAttempts.map((a) => a.stationId)).size;
  const scorePct = readiness.meanScore === null ? null : Math.round((readiness.meanScore / 10) * 100);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Exams & Study"
        title="NAC"
        description="Official exam tracking plus a practice center. Stations are original Compass timing prompts, not proprietary NAC material."
      />

      <Card>
        <CardTitle>My NAC Exam</CardTitle>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <select
            className={SELECT}
            value={state.nacExam.status}
            onChange={(e) => setState({ ...state, nacExam: { ...state.nacExam, status: e.target.value as MilestoneStatus } })}
          >
            <option value="">Not recorded</option>
            <option value="not_started">Not started</option>
            <option value="in_progress">In progress</option>
            <option value="waiting">Waiting</option>
            <option value="complete">Complete</option>
          </select>
          <Input
            type="date"
            value={state.nacExam.scheduledDate.slice(0, 10)}
            onChange={(e) => setState({ ...state, nacExam: { ...state.nacExam, scheduledDate: e.target.value } })}
          />
          <Input placeholder="Attempt" value={state.nacExam.attempt} onChange={(e) => setState({ ...state, nacExam: { ...state.nacExam, attempt: e.target.value } })} />
          <Input placeholder="Result (optional)" value={state.nacExam.result} onChange={(e) => setState({ ...state, nacExam: { ...state.nacExam, result: e.target.value } })} />
        </div>
        <a className="mt-3 inline-block text-sm text-teal-800" href="https://mcc.ca/examinations/nac-examination/" target="_blank" rel="noreferrer">
          View official source ↗
        </a>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <RingStat value={scorePct} label="Practice indicator" hint={readiness.label} />
        </Card>
        <Card>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Stations</p>
          <p className="mt-2 text-3xl font-semibold">
            {completed}
            <span className="text-lg text-slate-400"> / {state.nacStations.length}</span>
          </p>
          <p className="mt-1 text-sm text-slate-600">{readiness.categoriesCovered} of 4 competencies touched</p>
        </Card>
        <Card>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Weak competencies</p>
          <p className="mt-3 text-sm text-slate-700">
            {readiness.topWeakTags.length ? readiness.topWeakTags.join(" · ") : "None logged yet"}
          </p>
        </Card>
      </div>

      <Card className="bg-[#0b1f33] text-white">
        <CardTitle className="text-white">Focused station</CardTitle>
        <select
          className="mt-4 h-11 w-full rounded-xl border-0 bg-white/10 px-3 text-sm text-white"
          value={stationId}
          onChange={(e) => setStationId(e.target.value)}
        >
          {state.nacStations.map((s) => (
            <option key={s.id} value={s.id} className="text-slate-900">
              {s.title} — {NAC_CATEGORIES.find((c) => c.id === s.category)?.label}
            </option>
          ))}
        </select>
        {station ? <p className="mt-3 text-sm text-teal-100/90">{station.prompt}</p> : null}
        <p className="mt-6 font-mono text-5xl tabular-nums tracking-tight">
          {String(Math.floor(elapsed / 60)).padStart(2, "0")}:{String(elapsed % 60).padStart(2, "0")}
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Button
            disabled={running}
            onClick={() => {
              setRunning(true);
              setStartedAt(new Date().toISOString());
              setElapsed(0);
            }}
          >
            Start practice
          </Button>
          <Button variant="secondary" disabled={!running} onClick={() => setRunning(false)}>
            Pause
          </Button>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div>
            <Label className="text-teal-100">Self-score (0–10)</Label>
            <Input type="number" min={0} max={10} step={0.5} value={score} onChange={(e) => setScore(Number(e.target.value))} />
          </div>
          <div>
            <Label className="text-teal-100">Weak-area tags</Label>
            <Input value={tags} onChange={(e) => setTags(e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <Label className="text-teal-100">Notes</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </div>
        <Button
          className="mt-4"
          variant="secondary"
          disabled={!startedAt}
          onClick={() => {
            const end = new Date().toISOString();
            setState(
              logNacAttempt(state, {
                stationId,
                startedAt: startedAt!,
                endedAt: end,
                durationSeconds: elapsed,
                score,
                weakTags: tags.split(",").map((t) => t.trim()).filter(Boolean),
                notes,
              }),
            );
            setRunning(false);
            setStartedAt(null);
            setElapsed(0);
          }}
        >
          Save attempt
        </Button>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardTitle>Mock circuit</CardTitle>
          <p className="mt-2 text-sm text-slate-600">Select stations and log a practice block.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {state.nacStations.map((s) => {
              const on = mockIds.includes(s.id);
              return (
                <button
                  key={s.id}
                  type="button"
                  className={`rounded-full px-3 py-1 text-xs ${on ? "bg-teal-700 text-white" : "bg-slate-100 text-slate-700"}`}
                  onClick={() => setMockIds((ids) => (on ? ids.filter((id) => id !== s.id) : [...ids, s.id]))}
                >
                  {s.title}
                </button>
              );
            })}
          </div>
          <Button
            className="mt-4"
            variant="outline"
            onClick={() => {
              const now = new Date().toISOString();
              setState(logNacMock(state, { stationIds: mockIds, notes: "Practice circuit", startedAt: now, endedAt: now }));
            }}
          >
            Log mock session
          </Button>
        </Card>
        <Card>
          <CardTitle>Recent practice</CardTitle>
          <ul className="mt-3 space-y-2 text-sm">
            {state.nacAttempts.slice(0, 5).map((a) => {
              const st = state.nacStations.find((s) => s.id === a.stationId);
              return (
                <li key={a.id} className="flex items-center justify-between gap-2 rounded-xl bg-slate-50 px-3 py-2">
                  <span className="truncate">{st?.title}</span>
                  <Badge tone="sky">{a.score}/10</Badge>
                </li>
              );
            })}
            {state.nacAttempts.length === 0 ? <li className="text-slate-500">No attempts yet.</li> : null}
          </ul>
        </Card>
      </div>
    </div>
  );
}
