"use client";

import Link from "next/link";
import { Card, CardTitle } from "@/components/ui/card";
import { catalogUsage } from "@/lib/store";
import { useStore } from "@/components/store-provider";

export default function CatalogsPage() {
  const { state } = useStore();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Demo catalogs</h1>
        <p className="mt-1 text-slate-600">Original Compass catalogs for volume tracking. Do not paste licensed question text.</p>
      </div>
      {state.catalogs.map((c) => {
        const u = catalogUsage(state, c.id);
        const pct = c.totalQuestions === 0 ? 0 : Math.round((u.used / c.totalQuestions) * 100);
        return (
          <Card key={c.id}>
            <CardTitle>{c.name}</CardTitle>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full bg-emerald-600" style={{ width: `${Math.min(100, pct)}%` }} />
            </div>
            <p className="mt-2 text-sm text-slate-700">
              {u.used} used · {u.remaining} remaining · {c.totalQuestions} total
            </p>
          </Card>
        );
      })}
      <Link href="/mccqe1" className="text-sm text-emerald-800">
        Back to MCCQE1
      </Link>
    </div>
  );
}
