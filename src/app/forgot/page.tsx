"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { PortfolioBanner } from "@/components/portfolio-banner";

export default function ForgotPage() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [phase, setPhase] = useState<"request" | "reset">("request");
  const [message, setMessage] = useState("");

  async function requestReset(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/auth/forgot", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const body = (await res.json()) as { resetCode?: string; hint?: string };
    setMessage(body.resetCode ? `Reset code (local only): ${body.resetCode}` : body.hint ?? "If an account exists, follow the next step.");
    setPhase("reset");
  }

  async function reset(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/auth/reset", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, code, password }),
    });
    setMessage(res.ok ? "Password updated. You can sign in." : "Reset failed. Check the code.");
  }

  return (
    <div className="min-h-screen bg-[#f4f1ea]">
      <PortfolioBanner />
      <div className="mx-auto max-w-md px-4 py-16">
        <h1 className="text-2xl font-semibold">Reset password</h1>
        {phase === "request" ? (
          <form className="mt-6 space-y-4" onSubmit={requestReset}>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <Button className="w-full">Send reset</Button>
          </form>
        ) : (
          <form className="mt-6 space-y-4" onSubmit={reset}>
            <div>
              <Label htmlFor="code">Code</Label>
              <Input id="code" value={code} onChange={(e) => setCode(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="pw">New password</Label>
              <Input id="pw" type="password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <Button className="w-full">Update password</Button>
          </form>
        )}
        {message ? <p className="mt-4 text-sm text-slate-600">{message}</p> : null}
        <Link href="/" className="mt-6 inline-block text-sm text-teal-800">
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
