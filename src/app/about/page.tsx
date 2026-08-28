"use client";

import Link from "next/link";
import { Compass } from "lucide-react";
import { DEMO_DATA_NOTICE, ELIGIBILITY_DISCLAIMER } from "@/lib/eligibility";
import { PortfolioBanner } from "@/components/portfolio-banner";
import { useStore } from "@/components/store-provider";

export default function AboutPage() {
  const { state } = useStore();
  const signedIn = state.demoSignedIn;

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
        <h1 className="text-3xl font-semibold tracking-tight text-[#0b1f33]">About this demo</h1>
        <div className="mt-8 space-y-6 text-[15px] leading-relaxed text-slate-700">
          <section>
            <h2 className="text-base font-semibold text-[#0b1f33]">What this is</h2>
            <p className="mt-2">
              IMG Compass Canada is a portfolio product: a journey planner for International Medical
              Graduates targeting Canadian residency. It demonstrates a Next.js application, a BFF
              over PostgreSQL, and a small AWS production stack (ECS Fargate, private RDS, ALB).
            </p>
          </section>
          <section>
            <h2 className="text-base font-semibold text-[#0b1f33]">What this is not</h2>
            <p className="mt-2">{ELIGIBILITY_DISCLAIMER}</p>
          </section>
          <section>
            <h2 className="text-base font-semibold text-[#0b1f33]">Demo data</h2>
            <p className="mt-2">{DEMO_DATA_NOTICE}</p>
            <p className="mt-2">
              The seeded learner is Dr. Alex Morgan. Catalogs, NAC stations, interview prompts,
              CaRMS programmes, and provincial requirement rows are original sample content — not
              MCC, CaRMS, or paid Qbank materials.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
