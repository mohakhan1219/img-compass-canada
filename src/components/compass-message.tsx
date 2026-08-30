"use client";

import { useEffect, useState } from "react";
import { compassMessage } from "@/lib/motivation";
import type { JourneyStageId } from "@/domain/stages";

export function CompassMessage({ currentStage }: { currentStage: JourneyStageId }) {
  const [text, setText] = useState(() => compassMessage(currentStage));

  useEffect(() => {
    setText(compassMessage(currentStage));
  }, [currentStage]);

  return (
    <aside className="rounded-2xl border border-teal-200/80 bg-gradient-to-r from-teal-50/90 to-sky-50/70 px-5 py-4 shadow-sm">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-teal-800">Daily compass</p>
      <p className="mt-2 text-sm leading-relaxed text-[#0b1f33]">{text}</p>
    </aside>
  );
}
