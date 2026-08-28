"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { addReview, completeReviewInterval, mccqe1Insights } from "@/lib/store";
import { useStore } from "@/components/store-provider";

export default function ReviewPage() {
  const { state, setState } = useStore();
  const { due } = mccqe1Insights(state);
  const [topic, setTopic] = useState("");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Interval review</h1>
        <p className="mt-1 text-slate-600">
          First pass, then 1 / 7 / 21 day follow-ups. Topics are learner-authored labels, not
          licensed question text.
        </p>
      </div>
      <Card>
        <CardTitle>Add a topic</CardTitle>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <Input
            placeholder="e.g. Hyperkalaemia emergency (demo)"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
          <Button
            onClick={() => {
              if (!topic.trim()) return;
              setState(addReview(state, topic.trim()));
              setTopic("");
            }}
          >
            Add
          </Button>
        </div>
      </Card>
      <ul className="space-y-3">
        {due.length === 0 ? (
          <li className="text-sm text-slate-600">No review cards yet.</li>
        ) : (
          due.map((item) => (
            <li key={item.id}>
              <Card>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{item.topic}</p>
                    <p className="mt-1 text-sm text-slate-600">
                      {item.nextIntervalDays
                        ? `Next: ${item.nextIntervalDays}-day interval`
                        : "All intervals complete"}
                      {item.dueAt ? ` · due ${new Date(item.dueAt).toLocaleDateString()}` : ""}
                    </p>
                  </div>
                  {item.overdue ? <Badge tone="amber">Overdue</Badge> : <Badge tone="slate">Queued</Badge>}
                </div>
                {item.nextIntervalDays ? (
                  <Button
                    className="mt-3"
                    size="sm"
                    onClick={() => setState(completeReviewInterval(state, item.id, item.nextIntervalDays!))}
                  >
                    Mark {item.nextIntervalDays}-day done
                  </Button>
                ) : null}
              </Card>
            </li>
          ))
        )}
      </ul>
      <Link href="/mccqe1" className="text-sm text-emerald-800">
        Back to MCCQE1
      </Link>
    </div>
  );
}
