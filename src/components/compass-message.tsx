"use client";

import { Compass } from "lucide-react";
import { compassMessage } from "@/lib/motivation";
import type { JourneyStageId } from "@/domain/stages";

export function CompassMessage({ currentStage }: { currentStage: JourneyStageId }) {
  return (
    <aside className="rounded-2xl border border-teal-200/70 bg-[#fffcf8] px-5 py-4 shadow-[0_8px_24px_rgba(11,31,51,0.05)]">
      <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-teal-800">
        <Compass className="h-3.5 w-3.5" />
        Daily Compass
      </p>
      <p suppressHydrationWarning className="mt-2 text-sm leading-relaxed text-[#0b1f33]">
        {compassMessage(currentStage)}
      </p>
    </aside>
  );
}
