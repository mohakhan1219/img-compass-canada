"use client";

import { Compass } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { PortfolioBanner } from "@/components/portfolio-banner";
import { useStore } from "@/components/store-provider";

export default function LoginPage() {
  const { signInDemo, signInAccount, signUp } = useStore();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const result =
      mode === "signup" ? await signUp(email, password) : await signInAccount(email, password);
    setBusy(false);
    if (!result.ok) setError(result.error === "email_taken" ? "That email is already registered." : "Check email and password.");
  }

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
            <p className="text-sm text-slate-600">Your complete journey from IMG to Canadian residency — in one place.</p>
          </div>
        </div>
        <div className="rounded-3xl border border-[#e4ddd2] bg-[#fffcf8] p-8 shadow-[0_16px_40px_rgba(11,31,51,0.08)]">
          <h1 className="text-2xl font-semibold tracking-tight">{mode === "signup" ? "Create an account" : "Sign in"}</h1>
          <p className="mt-2 text-sm text-slate-600">
            Your pathway data stays on your account. Explore Demo remains available separately.
          </p>
          <form className="mt-6 space-y-4" onSubmit={onSubmit}>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={8}
                required
              />
            </div>
            {error ? <p className="text-sm text-red-700">{error}</p> : null}
            <Button className="w-full" size="lg" disabled={busy}>
              {mode === "signup" ? "Create account" : "Sign in"}
            </Button>
          </form>
          <p className="mt-4 text-sm text-slate-600">
            {mode === "signup" ? (
              <button type="button" className="text-teal-800" onClick={() => setMode("signin")}>
                Already have an account? Sign in
              </button>
            ) : (
              <button type="button" className="text-teal-800" onClick={() => setMode("signup")}>
                New here? Create an account
              </button>
            )}
          </p>
          <p className="mt-2 text-sm">
            <Link href="/forgot" className="text-teal-800 underline-offset-2 hover:underline">
              Forgot password
            </Link>
          </p>
          <div className="mt-8 border-t border-[#eee8de] pt-6">
            <p className="text-sm font-medium text-[#0b1f33]">Explore Demo</p>
            <p className="mt-1 text-sm text-slate-600">
              Open the synthetic workspace for Dr. Alex Morgan. Optional — not required to use the product.
            </p>
            <Button className="mt-4 w-full" variant="outline" onClick={() => signInDemo()}>
              Continue as Dr. Alex
            </Button>
          </div>
        </div>
        <p className="mt-6 text-center text-xs text-slate-500">
          <Link href="/about" className="text-teal-800 underline-offset-2 hover:underline">
            About IMG Compass
          </Link>
        </p>
      </div>
    </div>
  );
}
