import type { SourceStatus } from "./official-sources";

export type MatchCycleEvent = {
  id: string;
  phase:
    | "registration"
    | "application"
    | "documents"
    | "program_selection"
    | "file_review"
    | "interviews"
    | "ranking"
    | "match_day"
    | "second_iteration"
    | "post_match";
  label: string;
  occursOn: string;
  notes: string;
};

export type MatchCycle = {
  id: string;
  name: string;
  iteration: "first" | "second";
  lastVerifiedDate: string;
  sourceStatus: SourceStatus;
  sourceUrl: string;
  events: MatchCycleEvent[];
};

export const MATCH_CYCLES: MatchCycle[] = [
  {
    id: "r1-2027-first",
    name: "2027 R-1 Main Residency Match — first iteration",
    iteration: "first",
    lastVerifiedDate: "2026-08-28",
    sourceStatus: "current",
    sourceUrl: "https://www.carms.ca/match/r-1-main-residency-match/applicant/r-1-match-timeline/",
    events: [
      {
        id: "reg-open",
        phase: "registration",
        label: "Registration available (new applicants)",
        occursOn: "2026-07-08T16:00:00.000Z",
        notes: "CaRMS: new applicants may register starting 8 July 2026, 12:00 ET.",
      },
      {
        id: "online-open",
        phase: "application",
        label: "CaRMS Online opens for applicants",
        occursOn: "2026-09-09T16:00:00.000Z",
        notes: "Confirm on the official timeline; program descriptions also targeted for this date.",
      },
      {
        id: "program-select",
        phase: "program_selection",
        label: "Program selection opens",
        occursOn: "2026-10-15T16:00:00.000Z",
        notes: "CaRMS: 15 October 2026, 12:00 ET.",
      },
      {
        id: "app-deadline",
        phase: "documents",
        label: "Application and document assignment deadline",
        occursOn: "2026-11-26T17:00:00.000Z",
        notes: "CaRMS: 26 November 2026, 12:00 ET. Late submissions may not be reviewed.",
      },
      {
        id: "file-review",
        phase: "file_review",
        label: "File review begins",
        occursOn: "2026-11-26T17:05:00.000Z",
        notes: "CaRMS: 26 November 2026, 12:05 ET.",
      },
      {
        id: "interview-period",
        phase: "interviews",
        label: "National interview period (CMG out-of-town)",
        occursOn: "2027-01-16T05:00:00.000Z",
        notes: "16 January–7 February 2027. IMG interviews are coordinated separately.",
      },
      {
        id: "rank-open",
        phase: "ranking",
        label: "Ranking period begins",
        occursOn: "2027-01-21T17:00:00.000Z",
        notes: "CaRMS: 21 January 2027, 12:00 ET.",
      },
      {
        id: "rank-deadline",
        phase: "ranking",
        label: "Applicant rank order list deadline",
        occursOn: "2027-02-18T20:00:00.000Z",
        notes: "CaRMS: 18 February 2027, 15:00 ET. Firm deadline.",
      },
      {
        id: "match-day",
        phase: "match_day",
        label: "Match Day",
        occursOn: "2027-03-02T17:00:00.000Z",
        notes: "CaRMS: 2 March 2027, 12:00 ET.",
      },
      {
        id: "access-close",
        phase: "post_match",
        label: "CaRMS Online access closes for this season",
        occursOn: "2027-05-12T19:00:00.000Z",
        notes: "CaRMS: 12 May 2027, 15:00 ET.",
      },
    ],
  },
  {
    id: "r1-2027-second",
    name: "2027 R-1 Main Residency Match — second iteration",
    iteration: "second",
    lastVerifiedDate: "2026-08-28",
    sourceStatus: "current",
    sourceUrl: "https://www.carms.ca/match/r-1-main-residency-match/applicant/r-1-second-iteration-timeline/",
    events: [
      {
        id: "second-reg",
        phase: "second_iteration",
        label: "Second-iteration registration (new applicants)",
        occursOn: "2026-12-02T17:00:00.000Z",
        notes: "CaRMS: 2 December 2026, 12:00 ET.",
      },
      {
        id: "second-match",
        phase: "match_day",
        label: "Second-iteration Match Day",
        occursOn: "2027-03-23T16:00:00.000Z",
        notes: "CaRMS: 23 March 2027, 12:00 ET.",
      },
    ],
  },
];

export function matchCycleById(id: string): MatchCycle | undefined {
  return MATCH_CYCLES.find((c) => c.id === id);
}
