"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { ProgressBar, RingStat } from "@/components/progress";
import { catalogUsage, mccqe1Insights } from "@/lib/store";
import { useStore } from "@/components/store-provider";
import { COMPASS_INDICATOR_DISCLAIMER, explainReadiness } from "@/lib/readiness";
import { Input, Label } from "@/components/ui/input";
import { SELECT } from "@/components/search-select";
import type { MilestoneStatus } from "@/domain/types";

export default function Mccqe1Page() {
  const { state, setState } = useStore();
  const insights = mccqe1Insights(state);
  const open = state.sessions.find((s) => !s.endedAt);
  const ended = state.sessions.filter((s) => s.endedAt);
  const catalogSize = state.catalogs.reduce((n, c) => n + c.totalQuestions, 0);
  const used = state.catalogs.reduce((n, c) => n + catalogUsage(state, c.id).used, 0);
  const goalPct = catalogSize ? Math.round((used / catalogSize) * 100) : 0;
  const weak = insights.due.filter((d) => d.overdue).slice(0, 4);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Exams & Study"
        title="MCCQE"
        description="Exam tracker, preparation logs, and official MCC links. Compass catalogs are personal volume trackers, not the MCCQE universe."
        actions={
          <Link href="/mccqe1/session">
            <Button>{open ? "Resume session" : "Start session"}</Button>
          </Link>
        }
      />

      <Card>
        <CardTitle>My Exam</CardTitle>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Label>Status</Label>
            <select
              className={SELECT}
              value={state.mccqeExam.status}
              onChange={(e) => setState({ ...state, mccqeExam: { ...state.mccqeExam, status: e.target.value as MilestoneStatus } })}
            >
              <option value="">Not recorded</option>
              <option value="not_started">Not started</option>
              <option value="in_progress">In progress</option>
              <option value="waiting">Waiting</option>
              <option value="complete">Complete</option>
            </select>
          </div>
          <div>
            <Label>Scheduled date</Label>
            <Input
              type="date"
              value={state.mccqeExam.scheduledDate.slice(0, 10)}
              onChange={(e) => setState({ ...state, mccqeExam: { ...state.mccqeExam, scheduledDate: e.target.value } })}
            />
          </div>
          <div>
            <Label>Attempt</Label>
            <Input value={state.mccqeExam.attempt} onChange={(e) => setState({ ...state, mccqeExam: { ...state.mccqeExam, attempt: e.target.value } })} />
          </div>
          <div>
            <Label>Result (optional)</Label>
            <Input value={state.mccqeExam.result} onChange={(e) => setState({ ...state, mccqeExam: { ...state.mccqeExam, result: e.target.value } })} />
          </div>
        </div>
        <a className="mt-3 inline-block text-sm text-teal-800" href="https://mcc.ca/examinations/mccqe-part-i/" target="_blank" rel="noreferrer">
          View official source ↗
        </a>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
        <Card>
          <RingStat
            value={insights.readiness.score}
            label="Compass indicator"
            hint={insights.readiness.label}
          />
          <ul className="mt-4 space-y-1 text-sm text-slate-600">
            {explainReadiness(insights.readiness).slice(0, 5).map((line) => (
              <li key={line}>· {line}</li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-slate-500">{COMPASS_INDICATOR_DISCLAIMER}</p>
        </Card>
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Accuracy</p>
            <p className="mt-2 text-3xl font-semibold">
              {insights.accounting.accuracy === null ? "—" : `${insights.accounting.accuracy}%`}
            </p>
            <p className="mt-1 text-sm text-slate-600">{insights.accounting.attempted} questions (14 days)</p>
          </Card>
          <Card>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Study time</p>
            <p className="mt-2 text-3xl font-semibold">{insights.creditedMinutes}</p>
            <p className="mt-1 text-sm text-slate-600">credited minutes</p>
          </Card>
          <Card>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Review due</p>
            <p className="mt-2 text-3xl font-semibold">{insights.overdue}</p>
            <Link href="/mccqe1/review" className="mt-1 block text-sm font-medium text-teal-800">
              Open queue
            </Link>
          </Card>
          <Card>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Question goal</p>
            <p className="mt-2 text-3xl font-semibold">{goalPct}%</p>
            <ProgressBar value={goalPct} className="mt-3" />
            <p className="mt-1 text-xs text-slate-500">
              {used} / {catalogSize} logged
            </p>
          </Card>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <div className="flex items-center justify-between">
            <CardTitle>Recent activity</CardTitle>
            <Link href="/mccqe1/history" className="text-sm font-medium text-teal-800">
              History
            </Link>
          </div>
          <ul className="mt-4 space-y-3">
            {ended.slice(0, 4).map((s) => {
              const cat = state.catalogs.find((c) => c.id === s.catalogId);
              return (
                <li key={s.id} className="flex items-center justify-between gap-3 text-sm">
                  <span>
                    <span className="font-medium text-[#0b1f33]">{cat?.name.replace(" (demo)", "")}</span>
                    <span className="mt-0.5 block text-slate-500">
                      {s.attempted} Q · {s.creditedMinutes ?? 0} min
                    </span>
                  </span>
                  <span className="text-slate-500">{s.endedAt ? new Date(s.endedAt).toLocaleDateString() : ""}</span>
                </li>
              );
            })}
          </ul>
        </Card>
        <Card>
          <CardTitle>Focus areas</CardTitle>
          {weak.length === 0 ? (
            <p className="mt-3 text-sm text-slate-600">No overdue review topics.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {weak.map((w) => (
                <li key={w.id} className="flex items-center justify-between rounded-xl bg-amber-50 px-3 py-2 text-sm">
                  <span>{w.topic}</span>
                  <Badge tone="amber">Due</Badge>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            <Link className="font-medium text-teal-800" href="/mccqe1/catalogs">
              Catalogs
            </Link>
            <Link className="font-medium text-teal-800" href="/mccqe1/review">
              Interval review
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
