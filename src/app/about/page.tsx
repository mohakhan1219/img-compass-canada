"use client";

import Link from "next/link";
import { Compass } from "lucide-react";
import { PortfolioBanner } from "@/components/portfolio-banner";
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
    body: "Understand the Canadian residency pathway and personal milestones.",
  },
  {
    title: "Prepare",
    body: "Track MCCQE, NAC and language preparation.",
  },
  {
    title: "Explore & Apply",
    body: "Research programs and organize CaRMS applications.",
  },
  {
    title: "Track",
    body: "Manage interviews, ranking, Match Day and next steps.",
  },
] as const;

const ENGINEERING = [
  {
    title: "Application",
    items: ["Next.js", "TypeScript", "PostgreSQL"],
  },
  {
    title: "Container / platform",
    items: ["Docker", "AWS ECS Fargate", "ECR"],
  },
  {
    title: "Data",
    items: ["Amazon RDS PostgreSQL", "Private database networking", "Verified RDS TLS"],
  },
  {
    title: "Networking",
    items: ["Application Load Balancer", "VPC", "Public/private subnet architecture"],
  },
  {
    title: "Security",
    items: ["AWS Secrets Manager", "Security-group isolation", "No database credentials in the browser"],
  },
  {
    title: "Infrastructure as code",
    items: ["Terraform", "S3 remote state", "DynamoDB state locking"],
  },
  {
    title: "Observability / SRE",
    items: ["CloudWatch", "Structured JSON logging", "Request correlation IDs", "/api/health", "/api/ready", "/api/metrics"],
  },
  {
    title: "Delivery / quality",
    items: ["CI validation", "Lint", "Tests", "Production build", "Docker build", "Terraform validation"],
  },
  {
    title: "Cost strategy",
    items: ["Deploy → Validate → Capture Evidence → Destroy Runtime → Restore On Demand"],
  },
] as const;

export default function AboutPage() {
  const { state } = useStore();
  const signedIn = isSignedIn(state);

  return (
    <div className={signedIn ? "" : "min-h-screen bg-[#f4f1ea]"}>
      {signedIn ? null : <PortfolioBanner />}
      <div className={signedIn ? "max-w-5xl" : "mx-auto max-w-5xl px-4 py-12"}>
        {signedIn ? null : (
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-teal-800">
            <Compass className="h-4 w-4" />
            Back
          </Link>
        )}

        <section className="mt-4 overflow-hidden rounded-3xl bg-[#0b1f33] px-6 py-10 text-white sm:px-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-teal-200">About</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">IMG Compass Canada</h1>
          <p className="mt-2 text-lg text-teal-100">Your Path to Canadian Residency</p>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-teal-50/85 sm:text-[15px]">
            IMG Compass Canada is a navigation and tracking platform designed to help International Medical Graduates
            organize the journey toward Canadian residency.
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
          <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">What it helps you do</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {FEATURES.map((f) => (
              <li key={f.title} className="rounded-2xl border border-[#e4ddd2] bg-[#fffcf8] p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-teal-800">{f.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{f.body}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-10">
          <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">Engineering the Platform</h2>
          <p className="mt-2 max-w-3xl text-sm text-slate-600">
            Production-shaped AWS architecture for a Next.js app. This portfolio uses a synthetic learner workspace
            rather than a public self-serve registration product.
          </p>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {ENGINEERING.map((group) => (
              <li key={group.title} className="rounded-2xl border border-[#e4ddd2] bg-[#fffcf8] p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-teal-800">{group.title}</p>
                <ul className="mt-3 flex flex-wrap gap-1.5">
                  {group.items.map((item) => (
                    <li key={item} className="rounded-full bg-white px-2.5 py-1 text-xs text-[#0b1f33] ring-1 ring-[#e4ddd2]">
                      {item}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-10">
          <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">Portfolio disclosure</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">{PORTFOLIO_SYNTHETIC_DISCLOSURE}</p>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            Current licensing and program requirements should be confirmed with the appropriate official organizations
            such as MCC, CaRMS, provincial authorities and universities.
          </p>
        </section>
      </div>
    </div>
  );
}
