"use client";

import { Compass } from "lucide-react";
import { CANADA_FLAG_EMOJI, compassEntry, compassQuotedText } from "@/lib/motivation";
import type { JourneyStageId } from "@/domain/stages";

function CanadaFlag() {
  return (
    <span className="ml-1 inline-flex items-center align-[-0.15em]" role="img" aria-label={CANADA_FLAG_EMOJI}>
      <svg viewBox="0 0 60 30" className="h-[1.15em] w-[2.3em] shrink-0" aria-hidden="true">
        <rect width="60" height="30" fill="#ff0000" />
        <rect x="15" width="30" height="30" fill="#fff" />
        <path
          fill="#ff0000"
          d="M30 7.2 31.1 12l4.9.2-3.9 3.4 1.5 4.6L30 17.4l-3.6 2.8 1.5-4.6-3.9-3.4 4.9-.2z"
        />
      </svg>
      <span className="emoji-flag sr-only">{CANADA_FLAG_EMOJI}</span>
    </span>
  );
}

export function CompassMessage({
  currentStage,
  variant = "card",
}: {
  currentStage: JourneyStageId;
  variant?: "card" | "hero";
}) {
  const { emoji, text } = compassEntry(currentStage);
  const quoted = compassQuotedText(text);

  if (variant === "hero") {
    return (
      <p className="min-w-0 text-[1.05rem] leading-snug sm:text-lg" data-testid="daily-compass-hero">
        <span className="align-baseline text-[11px] font-semibold uppercase tracking-[0.18em] text-teal-300">
          Daily Compass
        </span>
        <span className="mx-1.5 text-teal-300/80" aria-hidden>
          ·
        </span>
        <span suppressHydrationWarning className="font-semibold text-[#f3d5a3]">
          <span className="mr-1.5 text-[1.05em] leading-none" aria-hidden>
            {emoji}
          </span>
          {quoted}
          <CanadaFlag />
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
      <p suppressHydrationWarning className="mt-2 text-base font-semibold leading-snug text-teal-900">
        <span className="mr-2 text-[1.05rem] leading-none" aria-hidden>
          {emoji}
        </span>
        {quoted}
        <CanadaFlag />
      </p>
    </aside>
  );
}
