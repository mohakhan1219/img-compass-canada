"use client";

import { Compass } from "lucide-react";
import { compassEntry } from "@/lib/motivation";
import type { JourneyStageId } from "@/domain/stages";
import { cn } from "@/lib/utils";

export function CompassMessage({
  currentStage,
  variant = "card",
}: {
  currentStage: JourneyStageId;
  variant?: "card" | "hero";
}) {
  const { emoji, text } = compassEntry(currentStage);

  if (variant === "hero") {
    return (
      <p className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1" data-testid="daily-compass-hero">
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-teal-300">Daily Compass</span>
        <span className="hidden text-teal-400/90 sm:inline" aria-hidden>
          •
        </span>
        <span suppressHydrationWarning className="text-[15px] font-medium leading-snug text-white sm:text-base">
          <span className="mr-1.5 text-[1.05rem] leading-none" aria-hidden>
            {emoji}
          </span>
          {text}
        </span>
      </p>
    );
  }

  return (
    <aside className="rounded-2xl border border-teal-200/70 bg-[#fffcf8] px-5 py-4 shadow-[0_8px_24px_rgba(11,31,51,0.05)]">
      <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-teal-800">
        <Compass className="h-3.5 w-3.5" />
        Daily Compass
      </p>
      <p suppressHydrationWarning className={cn("mt-2 text-base font-semibold leading-snug text-[#0b1f33]")}>
        <span className="mr-2 text-[1.05rem] leading-none" aria-hidden>
          {emoji}
        </span>{" "}
        <span className="text-teal-900">{text}</span>
      </p>
    </aside>
  );
}
