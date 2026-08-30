"use client";

import { ArrowRight, Compass } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useStore } from "@/components/store-provider";

export default function LoginPage() {
  const { signInDemo } = useStore();

  return (
    <div className="min-h-screen bg-[#f4f1ea]">
      <div className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-4 py-16">
        <div className="mb-10 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-700 text-white shadow-lg shadow-teal-900/15">
            <Compass className="h-6 w-6" />
          </span>
          <h1 className="mt-6 text-3xl font-semibold tracking-tight text-[#0b1f33]">IMG Compass Canada</h1>
          <p className="mt-2 text-base text-slate-600">Your Path to Canadian Residency</p>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate-500">
            A personal workspace to plan exams, research programs, and track the CaRMS journey — from credentials to
            Match Day.
          </p>
        </div>

        <div className="rounded-3xl border border-[#e4ddd2] bg-[#fffcf8] px-8 py-10 shadow-[0_16px_40px_rgba(11,31,51,0.08)]">
          <p className="text-center text-xs font-semibold uppercase tracking-[0.16em] text-teal-800">Explore the Platform</p>
          <Button className="mt-6 w-full" size="lg" onClick={() => signInDemo()}>
            Continue as Dr. Alex Morgan
            <ArrowRight className="h-4 w-4" />
          </Button>
          <p className="mt-6 text-center text-xs text-slate-400">Portfolio demo · Synthetic learner data</p>
        </div>

        <p className="mt-8 text-center text-xs text-slate-400">
          <Link href="/about" className="underline-offset-2 hover:text-teal-800 hover:underline">
            About
          </Link>
        </p>
      </div>
    </div>
  );
}
