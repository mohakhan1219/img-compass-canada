"use client";

import Link from "next/link";
import { Compass } from "lucide-react";
import { PortfolioBanner } from "@/components/portfolio-banner";
import { isSignedIn, useStore } from "@/components/store-provider";
import { JOURNEY_STAGES } from "@/domain/stages";
import { PORTFOLIO_SYNTHETIC_DISCLOSURE } from "@/lib/eligibility";

const FEATURES = [
  {
    title: "Plan",
    body: "See the Canadian residency pathway as connected stages, from profile and credentials through Match Day.",
  },
  {
    title: "Prepare",
    body: "Track MCCQE, NAC, and language work against dates you record, with links to official sources — not copied exam banks.",
  },
  {
    title: "Apply",
    body: "Research real CaRMS R-1 faculties, save programs, and keep application, interview, and ranking notes in one place.",
  },
  {
    title: "Track",
    body: "Watch personal milestones, provincial notes, and cycle dates so the next step is visible without replacing any regulator.",
  },
] as const;

const ENGINEERING = [
  "Next.js / TypeScript",
  "PostgreSQL",
  "Docker",
  "AWS ECS Fargate",
  "RDS PostgreSQL",
  "ALB",
  "ECR",
  "Secrets Manager",
  "CloudWatch",
  "Terraform",
  "Health / ready / metrics",
  "Structured logs & request IDs",
  "Verified database TLS",
  "CI validation",
] as const;

export default function AboutPage() {
  const { state } = useStore();
  const signedIn = isSignedIn(state);

  return (
    <div className={signedIn ? "" : "min-h-screen bg-[#f4f1ea]"}>
      {signedIn ? null : <PortfolioBanner />}
      <div className={signedIn ? "max-w-4xl" : "mx-auto max-w-4xl px-4 py-12"}>
        {signedIn ? null : (
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-teal-800">
            <Compass className="h-4 w-4" />
            Back
          </Link>
        )}
        <h1 className="text-3xl font-semibold tracking-tight text-[#0b1f33]">About IMG Compass Canada</h1>
        <div className="mt-8 space-y-10 text-[15px] leading-relaxed text-slate-700">
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
            <ol className="mt-4 flex gap-0 overflow-x-auto pb-2">
              {JOURNEY_STAGES.map((s, i) => (
                <li key={s.id} className="flex min-w-[5.5rem] flex-1 flex-col items-center text-center">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0b1f33] text-[11px] font-semibold text-white">
                    {i + 1}
                  </span>
                  <span className="mt-2 text-xs font-medium text-[#0b1f33]">{s.label}</span>
                </li>
              ))}
            </ol>
          </section>

          <section>
            <h2 className="text-base font-semibold text-[#0b1f33]">What it helps users do</h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {FEATURES.map((f) => (
                <li key={f.title} className="rounded-2xl border border-[#e4ddd2] bg-[#fffcf8] p-4 shadow-sm">
                  <p className="text-sm font-semibold text-teal-800">{f.title}</p>
                  <p className="mt-2 text-sm text-slate-600">{f.body}</p>
                </li>
              ))}
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
            <h2 className="text-base font-semibold text-[#0b1f33]">Engineering the platform</h2>
            <p className="mt-2">
              The demo is a production-shaped web app: Next.js and TypeScript in Docker on AWS ECS Fargate,
              PostgreSQL on RDS behind an ALB, images in ECR, secrets in Secrets Manager, and operations in
              CloudWatch. Infrastructure is Terraform. The service exposes health, readiness, and metrics endpoints,
              emits structured logs with request correlation, and uses verified TLS to the database. CI validates
              the build before release.
            </p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {ENGINEERING.map((item) => (
                <li key={item} className="rounded-full bg-white px-3 py-1 text-xs font-medium text-[#0b1f33] ring-1 ring-[#e4ddd2]">
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-[#0b1f33]">Portfolio disclosure</h2>
            <p className="mt-2">{PORTFOLIO_SYNTHETIC_DISCLOSURE}</p>
            <p className="mt-2">
              Real institution names and official-source references may be used for navigation. Compass does not copy
              paid or proprietary exam content.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
