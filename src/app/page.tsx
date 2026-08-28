"use client";

import { Compass } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PortfolioBanner } from "@/components/portfolio-banner";
import { useStore } from "@/components/store-provider";

export default function LoginPage() {
  const { signIn, state } = useStore();

  return (
    <div className="min-h-screen bg-[#f4f1ea]">
      <PortfolioBanner />
      <div className="mx-auto flex min-h-[calc(100vh-40px)] max-w-lg flex-col justify-center px-4 py-12">
        <div className="mb-8 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-700 text-white shadow-lg shadow-teal-900/20">
            <Compass className="h-6 w-6" />
          </span>
          <div>
            <p className="text-xl font-semibold text-[#0b1f33]">IMG Compass Canada</p>
            <p className="text-sm text-slate-600">Your path to Canadian residency</p>
          </div>
        </div>
        <div className="rounded-3xl border border-[#e4ddd2] bg-[#fffcf8] p-8 shadow-[0_16px_40px_rgba(11,31,51,0.08)]">
          <h1 className="text-2xl font-semibold tracking-tight">Continue as Dr. Alex</h1>
          <p className="mt-3 text-[15px] leading-relaxed text-slate-600">
            Open the seeded portfolio profile — a complete IMG journey with study logs, provincial
            planning, and a CaRMS pipeline. No email or identity provider.
          </p>
          <p className="mt-4 text-sm text-slate-800">
            Demo profile: <strong>{state.profile.displayName}</strong>
          </p>
          <Button className="mt-6 w-full" size="lg" onClick={signIn}>
            Enter the workspace
          </Button>
        </div>
        <p className="mt-6 text-center text-xs text-slate-500">
          <Link href="/about" className="text-teal-800 underline-offset-2 hover:underline">
            About this demo
          </Link>
        </p>
      </div>
    </div>
  );
}
