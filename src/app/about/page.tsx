"use client";

import Link from "next/link";
import { Compass } from "lucide-react";
import { isSignedIn, useStore } from "@/components/store-provider";
import { PORTFOLIO_SYNTHETIC_DISCLOSURE } from "@/lib/eligibility";

const PATHWAY = [
  "Profile",
  "Credentials",
  "MCCQE",
  "NAC",
  "Language",
  "Provinces",
  "Programs",
  "CaRMS",
  "Applications",
  "Interviews",
  "Ranking",
  "Match",
] as const;

const FEATURES = [
  {
    title: "Plan",
    body: "Understand your pathway, requirements and important milestones.",
  },
  {
    title: "Prepare",
    body: "Track MCCQE, NAC and language preparation.",
  },
  {
    title: "Explore & Apply",
    body: "Research provinces/programs and organize the CaRMS application journey.",
  },
  {
    title: "Track",
    body: "Manage applications, interviews, ranking, Match Day and next steps.",
  },
] as const;

export default function AboutPage() {
  const { state } = useStore();
  const signedIn = isSignedIn(state);

  return (
    <div className={signedIn ? "" : "min-h-screen bg-[#f4f1ea]"}>
      <div className={signedIn ? "max-w-5xl" : "mx-auto max-w-5xl px-4 py-12"}>
        {signedIn ? null : (
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-teal-800">
            <Compass className="h-4 w-4" />
            Back
          </Link>
        )}

        <section className="mt-4 overflow-hidden rounded-3xl bg-[#0b1f33] px-6 py-10 text-white sm:px-10">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">IMG Compass Canada</h1>
          <p className="mt-2 text-lg text-teal-100">Your Path to Canadian Residency</p>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-teal-50/90 sm:text-[15px]">
            IMG Compass Canada helps International Medical Graduates organize and navigate the journey toward Canadian
            residency — from credentials and exams through program research, CaRMS, interviews and Match Day.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">Pathway</h2>
          <ol className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
            {PATHWAY.map((label, i) => (
              <li key={label} className="rounded-2xl border border-[#e4ddd2] bg-[#fffcf8] px-3 py-3 text-center shadow-sm">
                <span className="text-[10px] font-semibold text-teal-800">{String(i + 1).padStart(2, "0")}</span>
                <span className="mt-1 block text-sm font-medium text-[#0b1f33]">{label}</span>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-10">
          <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">What IMG Compass helps you do</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {FEATURES.map((f) => (
              <li key={f.title} className="rounded-2xl border border-[#e4ddd2] bg-[#fffcf8] p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-teal-800">{f.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{f.body}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-10 rounded-3xl border border-[#e4ddd2] bg-[#fffcf8] px-6 py-8 shadow-sm sm:px-8">
          <h2 className="text-base font-semibold text-[#0b1f33]">One journey. One workspace.</h2>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-600">
            IMG Compass brings preparation, requirements, program research, applications and milestones together so you
            can see the next step without tracking everything in separate spreadsheets and bookmarks.
          </p>
        </section>

        <p className="mt-12 text-xs leading-relaxed text-slate-400">
          {PORTFOLIO_SYNTHETIC_DISCLOSURE} Confirm current licensing and program requirements with the appropriate official
          Canadian organizations, including MCC, CaRMS, provincial authorities and universities.
        </p>
      </div>
    </div>
  );
}
