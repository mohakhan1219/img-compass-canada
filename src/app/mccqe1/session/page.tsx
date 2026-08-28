"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Input, Label, Textarea } from "@/components/ui/input";
import { SESSION_CAP_MINUTES, SESSION_WARN_MINUTES, minutesBetween } from "@/lib/session-safety";
import { endSession, startSession } from "@/lib/store";
import { useStore } from "@/components/store-provider";

export default function SessionPage() {
  const { state, setState } = useStore();
  const open = state.sessions.find((s) => !s.endedAt);
  const [catalogId, setCatalogId] = useState(state.catalogs[0]?.id ?? "");
  const [attempted, setAttempted] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [incorrect, setIncorrect] = useState(0);
  const [omitted, setOmitted] = useState(0);
  const [notes, setNotes] = useState("");
  const [confirm, setConfirm] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), 30_000);
    return () => clearInterval(id);
  }, []);

  const liveMinutes = open ? minutesBetween(open.startedAt, new Date().toISOString()) : 0;
  void tick;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Study session</h1>
        <p className="mt-1 text-slate-600">
          Start session / End session. After {SESSION_WARN_MINUTES / 60} hours you see a warning.
          After {SESSION_CAP_MINUTES / 60} hours credited time stays capped until you confirm the
          duration was real (for example you did not leave the timer running overnight).
        </p>
      </div>

      {!open ? (
        <Card>
          <CardTitle>Start a session</CardTitle>
          <Label className="mt-4" htmlFor="catalog">
            Catalog
          </Label>
          <select
            id="catalog"
            className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm"
            value={catalogId}
            onChange={(e) => setCatalogId(e.target.value)}
          >
            {state.catalogs.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <Button className="mt-4" onClick={() => setState(startSession(state, catalogId))}>
            Start session
          </Button>
        </Card>
      ) : (
        <Card>
          <CardTitle>Open session</CardTitle>
          <p className="mt-2 text-sm text-slate-600">
            Started {new Date(open.startedAt).toLocaleString()} · ~{liveMinutes} min elapsed
          </p>
          {liveMinutes >= SESSION_WARN_MINUTES ? (
            <p className="mt-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
              Long session warning. Confirm you are still studying before this crosses the 4-hour
              credit cap.
            </p>
          ) : null}
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div>
              <Label>Attempted</Label>
              <Input type="number" min={0} value={attempted} onChange={(e) => setAttempted(Number(e.target.value))} />
            </div>
            <div>
              <Label>Correct</Label>
              <Input type="number" min={0} value={correct} onChange={(e) => setCorrect(Number(e.target.value))} />
            </div>
            <div>
              <Label>Incorrect</Label>
              <Input type="number" min={0} value={incorrect} onChange={(e) => setIncorrect(Number(e.target.value))} />
            </div>
            <div>
              <Label>Omitted</Label>
              <Input type="number" min={0} value={omitted} onChange={(e) => setOmitted(Number(e.target.value))} />
            </div>
            <div className="sm:col-span-2">
              <Label>Notes</Label>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
          </div>
          {liveMinutes > SESSION_CAP_MINUTES ? (
            <label className="mt-4 flex items-start gap-2 text-sm">
              <input type="checkbox" checked={confirm} onChange={(e) => setConfirm(e.target.checked)} className="mt-1" />
              I confirm this duration is real. Credit the full time instead of the {SESSION_CAP_MINUTES}-minute cap.
            </label>
          ) : null}
          {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}
          <Button
            className="mt-4"
            onClick={() => {
              const result = endSession(state, {
                sessionId: open.id,
                attempted,
                correct,
                incorrect,
                omitted,
                notes,
                confirmOverCap: confirm,
              });
              if (result.error) setError(result.error);
              else setState(result.state);
            }}
          >
            End session
          </Button>
        </Card>
      )}

      <Link href="/mccqe1" className="text-sm text-emerald-800">
        Back to MCCQE1
      </Link>
    </div>
  );
}
