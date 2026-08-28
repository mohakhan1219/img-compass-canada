"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { confirmSessionCap, updateEndedSession } from "@/lib/store";
import { useStore } from "@/components/store-provider";

export default function HistoryPage() {
  const { state, setState } = useStore();
  const [editing, setEditing] = useState<string | null>(null);
  const [error, setError] = useState<string | undefined>();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Session history</h1>
        <p className="mt-1 text-slate-600">
          Edit start/end times for closed sessions. Overnight or over-cap logs stay capped until
          confirmed.
        </p>
      </div>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      <ul className="space-y-3">
        {state.sessions.map((s) => {
          const catalog = state.catalogs.find((c) => c.id === s.catalogId);
          return (
            <li key={s.id}>
              <Card>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">{catalog?.name ?? s.catalogId}</span>
                  <Badge
                    tone={
                      s.safety === "needs_confirmation" ? "amber" : s.safety === "open" ? "sky" : "slate"
                    }
                  >
                    {s.safety.replace("_", " ")}
                  </Badge>
                </div>
                <p className="mt-2 text-sm text-slate-600">
                  {new Date(s.startedAt).toLocaleString()} →{" "}
                  {s.endedAt ? new Date(s.endedAt).toLocaleString() : "open"}
                </p>
                <p className="text-sm text-slate-600">
                  Attempted {s.attempted} · correct {s.correct} · incorrect {s.incorrect} · omitted {s.omitted}
                </p>
                <p className="text-sm text-slate-600">
                  Raw {s.rawMinutes ?? "—"} min · credited {s.creditedMinutes ?? "—"} min
                </p>
                {s.notes ? <p className="mt-1 text-sm text-slate-700">{s.notes}</p> : null}
                {s.safety === "needs_confirmation" && s.endedAt ? (
                  <Button className="mt-3" size="sm" onClick={() => setState(confirmSessionCap(state, s.id))}>
                    Confirm full duration
                  </Button>
                ) : null}
                {s.endedAt && editing === s.id ? (
                  <form
                    className="mt-4 grid gap-3 sm:grid-cols-2"
                    onSubmit={(e) => {
                      e.preventDefault();
                      const fd = new FormData(e.currentTarget);
                      const result = updateEndedSession(state, s.id, {
                        startedAt: new Date(String(fd.get("startedAt"))).toISOString(),
                        endedAt: new Date(String(fd.get("endedAt"))).toISOString(),
                      });
                      if (result.error) setError(result.error);
                      else {
                        setState(result.state);
                        setEditing(null);
                      }
                    }}
                  >
                    <div>
                      <Label>Start</Label>
                      <Input name="startedAt" type="datetime-local" defaultValue={s.startedAt.slice(0, 16)} />
                    </div>
                    <div>
                      <Label>End</Label>
                      <Input name="endedAt" type="datetime-local" defaultValue={s.endedAt.slice(0, 16)} />
                    </div>
                    <div className="sm:col-span-2 flex gap-2">
                      <Button type="submit" size="sm">
                        Save times
                      </Button>
                      <Button type="button" variant="ghost" size="sm" onClick={() => setEditing(null)}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                ) : s.endedAt ? (
                  <Button className="mt-3" variant="outline" size="sm" onClick={() => setEditing(s.id)}>
                    Edit times
                  </Button>
                ) : null}
              </Card>
            </li>
          );
        })}
      </ul>
      <Link href="/mccqe1" className="text-sm text-emerald-800">
        Back to MCCQE1
      </Link>
    </div>
  );
}
