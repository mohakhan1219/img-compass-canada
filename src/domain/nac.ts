import type { NacAttempt, NacStation, NacStationCategory } from "./types";

export const NAC_CATEGORIES: { id: NacStationCategory; label: string }[] = [
  { id: "history_taking", label: "History taking" },
  { id: "physical_examination", label: "Physical examination" },
  { id: "communication_counselling", label: "Communication / counselling" },
  { id: "differential_diagnosis", label: "Differential diagnosis" },
];

export function clampNacScore(score: number): number {
  if (!Number.isFinite(score)) return 0;
  return Math.max(0, Math.min(10, Math.round(score * 10) / 10));
}

export type NacReadiness = {
  band: "insufficient_evidence" | "building" | "on_track";
  label: string;
  meanScore: number | null;
  attempts: number;
  categoriesCovered: number;
  topWeakTags: string[];
  rationale: string[];
};

export function computeNacReadiness(stations: NacStation[], attempts: NacAttempt[]): NacReadiness {
  const rationale: string[] = [];
  if (attempts.length < 3) {
    rationale.push("Log at least three timed station attempts before estimating NAC readiness.");
    return {
      band: "insufficient_evidence",
      label: "Insufficient evidence",
      meanScore: null,
      attempts: attempts.length,
      categoriesCovered: 0,
      topWeakTags: [],
      rationale,
    };
  }

  const mean = attempts.reduce((s, a) => s + a.score, 0) / attempts.length;
  const covered = new Set(
    attempts
      .map((a) => stations.find((st) => st.id === a.stationId)?.category)
      .filter(Boolean),
  ).size;

  const tagCounts = new Map<string, number>();
  for (const a of attempts) {
    for (const tag of a.weakTags) {
      const t = tag.trim().toLowerCase();
      if (!t) continue;
      tagCounts.set(t, (tagCounts.get(t) ?? 0) + 1);
    }
  }
  const topWeakTags = [...tagCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([t]) => t);

  rationale.push(`Mean self-score ${mean.toFixed(1)} / 10 across ${attempts.length} attempts.`);
  rationale.push(`${covered} of 4 station categories practised.`);
  if (topWeakTags.length) rationale.push(`Recurring weak-area tags: ${topWeakTags.join(", ")}.`);

  if (mean >= 7 && covered >= 4 && attempts.length >= 6) {
    return {
      band: "on_track",
      label: "On track",
      meanScore: Math.round(mean * 10) / 10,
      attempts: attempts.length,
      categoriesCovered: covered,
      topWeakTags,
      rationale,
    };
  }

  return {
    band: "building",
    label: "Building evidence",
    meanScore: Math.round(mean * 10) / 10,
    attempts: attempts.length,
    categoriesCovered: covered,
    topWeakTags,
    rationale,
  };
}
