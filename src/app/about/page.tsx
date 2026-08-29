"use client";

import Link from "next/link";
import { Compass } from "lucide-react";
import { PortfolioBanner } from "@/components/portfolio-banner";
import { isSignedIn, useStore } from "@/components/store-provider";
import { JOURNEY_STAGES } from "@/domain/stages";

export default function AboutPage() {
  const { state } = useStore();
  const signedIn = isSignedIn(state);

  return (
    <div className={signedIn ? "" : "min-h-screen bg-[#f4f1ea]"}>
      {signedIn ? null : <PortfolioBanner />}
      <div className={signedIn ? "max-w-2xl" : "mx-auto max-w-2xl px-4 py-12"}>
        {signedIn ? null : (
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-teal-800">
            <Compass className="h-4 w-4" />
            Back
          </Link>
        )}
        <h1 className="text-3xl font-semibold tracking-tight text-[#0b1f33]">About IMG Compass Canada</h1>
        <div className="mt-8 space-y-8 text-[15px] leading-relaxed text-slate-700">
          <section>
            <h2 className="text-base font-semibold text-[#0b1f33]">What is IMG Compass Canada?</h2>
            <p className="mt-2">
              IMG Compass Canada is a personal navigation and tracking platform for International Medical
              Graduates pursuing medical residency in Canada. It brings pathway planning, credential milestones,
              MCCQE preparation, NAC preparation, language requirements, provincial research, program research,
              CaRMS applications, interviews, ranking and Match Day into one connected workspace.
            </p>
          </section>
          <section>
            <h2 className="text-base font-semibold text-[#0b1f33]">Journey</h2>
            <p className="mt-2">{JOURNEY_STAGES.map((s) => s.label).join(" → ")}</p>
          </section>
          <section>
            <h2 className="text-base font-semibold text-[#0b1f33]">What it helps users do</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>understand their journey</li>
              <li>see what comes next</li>
              <li>track personal milestones</li>
              <li>research provinces and institutions</li>
              <li>reach official sources quickly</li>
              <li>manage applications, interviews, and a private rank list</li>
              <li>track Match Day and residency onboarding or next-cycle planning</li>
            </ul>
          </section>
          <section>
            <h2 className="text-base font-semibold text-[#0b1f33]">What it is not</h2>
            <p className="mt-2">
              IMG Compass does not replace MCC, CaRMS, provincial regulators or universities. Requirements change
              and final eligibility must always be confirmed with the responsible organization.
            </p>
          </section>
          <section>
            <h2 className="text-base font-semibold text-[#0b1f33]">Portfolio disclosure</h2>
            <p className="mt-2">
              Demo learner activity is synthetic. Real institution names and official-source references may be used
              for navigation. Compass does not copy paid or proprietary exam content.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
