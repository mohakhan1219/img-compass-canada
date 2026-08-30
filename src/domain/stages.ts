/** Personalized IMG journey stages. */

export const JOURNEY_STAGES = [
  { id: "profile", label: "IMG Profile", href: "/profile", group: "foundation" },
  { id: "credentials", label: "Credentials", href: "/credentials", group: "eligibility" },
  { id: "mccqe1", label: "MCCQE", href: "/mccqe1", group: "exams" },
  { id: "nac", label: "NAC", href: "/nac", group: "exams" },
  { id: "language", label: "Language", href: "/language", group: "exams" },
  { id: "provincial", label: "Provinces", href: "/provincial", group: "eligibility" },
  { id: "programs", label: "Programs", href: "/programs", group: "eligibility" },
  { id: "carms", label: "CaRMS", href: "/carms", group: "match" },
  { id: "applications", label: "Applications", href: "/applications", group: "match" },
  { id: "interviews", label: "Interviews", href: "/interviews", group: "match" },
  { id: "ranking", label: "Ranking", href: "/ranking", group: "match" },
  { id: "match", label: "Match", href: "/match", group: "match" },
  { id: "residency", label: "Residency", href: "/residency", group: "match" },
] as const;

export type JourneyStageId = (typeof JOURNEY_STAGES)[number]["id"];

export const NAV_GROUPS = [
  { id: "home", label: "Dashboard", href: "/dashboard" },
  { id: "journey", label: "Journey", href: "/journey" },
  { id: "mccqe", label: "MCCQE", href: "/mccqe1" },
  { id: "programs", label: "Programs", href: "/programs" },
  { id: "carms", label: "CaRMS", href: "/carms" },
  { id: "match", label: "Match", href: "/match" },
] as const;

export const NAV_FOOTER = [
  { href: "/about", label: "About" },
  { href: "/settings", label: "Settings" },
] as const;
