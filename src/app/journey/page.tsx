"use client";

import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { JOURNEY_STAGES } from "@/domain/stages";
import { computeJourneySnapshot } from "@/domain/journey";
import { useStore } from "@/components/store-provider";

export default function JourneyPage() {
  const { state } = useStore();
  const snap = computeJourneySnapshot(state);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="My Journey"
        title="Personalized pathway"
        description="Stages follow your recorded profile. Statuses are tracker labels, not eligibility rulings."
      />
      <p className="text-sm text-slate-600">{snap.flags.next}</p>
      <ol className="space-y-3">
        {JOURNEY_STAGES.map((stage, i) => (
          <li key={stage.id}>
            <Link href={stage.href}>
              <Card className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs text-slate-400">{String(i + 1).padStart(2, "0")}</p>
                  <p className="font-medium text-[#0b1f33]">{stage.label}</p>
                </div>
                <Badge>{snap.status[stage.id].replaceAll("_", " ")}</Badge>
              </Card>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
