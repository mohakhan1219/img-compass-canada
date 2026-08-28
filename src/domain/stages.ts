/** Full Canadian IMG pathway stages. */
export const JOURNEY_STAGES = [
  { id: "profile", label: "IMG Profile", href: "/profile", group: "foundation" },
  { id: "mccqe1", label: "MCCQE1", href: "/mccqe1", group: "exams" },
  { id: "nac", label: "NAC", href: "/nac", group: "exams" },
  { id: "language", label: "Language", href: "/language", group: "exams" },
  { id: "provincial", label: "Provincial pathway", href: "/provincial", group: "eligibility" },
  { id: "carms", label: "CaRMS", href: "/carms", group: "match" },
  { id: "applications", label: "Applications", href: "/applications", group: "match" },
  { id: "interviews", label: "Interviews", href: "/interviews", group: "match" },
  { id: "ranking", label: "Ranking", href: "/ranking", group: "match" },
  { id: "match", label: "Match", href: "/match", group: "match" },
] as const;

export type JourneyStageId = (typeof JOURNEY_STAGES)[number]["id"];
