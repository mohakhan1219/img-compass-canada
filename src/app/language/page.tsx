"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { PageHeader } from "@/components/page-header";
import { logLanguageAttempt, updateLanguagePlan } from "@/data/repositories/language-repository";
import {
  LANGUAGE_APPLICABILITY,
  LANGUAGE_EXAMS,
  computeLanguageReadiness,
} from "@/domain/language";
import type { LanguageApplicability, LanguageExamKind, LanguageSkill } from "@/domain/types";
import { useStore } from "@/components/store-provider";

const SKILLS: LanguageSkill[] = ["reading", "writing", "listening", "speaking"];
const SELECT = "h-10 w-full rounded-lg border border-[#d6cfc4] bg-white px-3 text-sm";

function toneFor(a: LanguageApplicability): "amber" | "slate" | "emerald" | "sky" {
  if (a === "needs_verification") return "amber";
  if (a === "unknown") return "slate";
  if (a === "not_required") return "emerald";
  return "sky";
}

export default function LanguagePage() {
  const { state, setState } = useStore();
  const readiness = computeLanguageReadiness(state.languagePlans, state.languageAttempts);
  const [open, setOpen] = useState<LanguageExamKind | null>(null);
  const [logOpen, setLogOpen] = useState(false);
  const [examKind, setExamKind] = useState<LanguageExamKind>("oet_medicine");
  const [skill, setSkill] = useState<LanguageSkill>("reading");
  const [score, setScore] = useState("");
  const [notes, setNotes] = useState("");
  const recent = [...state.languageAttempts].slice(-5).reverse();

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Exams"
        title="Language evidence"
        description="Track OET, IELTS, and CELPIP as planning records. Applicability is your classification, not a national rule."
      />

      <Card>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Snapshot</p>
        <p className="mt-2 text-xl font-semibold">{readiness.label}</p>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        {state.languagePlans.map((plan) => {
          const label = LANGUAGE_EXAMS.find((e) => e.id === plan.examKind)?.label;
          const expanded = open === plan.examKind;
          return (
            <Card key={plan.examKind}>
              <div className="flex items-start justify-between gap-2">
                <CardTitle>{label}</CardTitle>
                <Badge tone={toneFor(plan.applicability)}>
                  {LANGUAGE_APPLICABILITY.find((a) => a.id === plan.applicability)?.label}
                </Badge>
              </div>
              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-500">Target</dt>
                  <dd>{plan.targetOverall || "—"}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-500">Date</dt>
                  <dd>{plan.testDate || "—"}</dd>
                </div>
              </dl>
              <Button className="mt-4" size="sm" variant="outline" onClick={() => setOpen(expanded ? null : plan.examKind)}>
                {expanded ? "Close" : "Edit"}
              </Button>
              {expanded ? (
                <div className="mt-4 space-y-3 border-t border-[#eee8de] pt-4">
                  <div>
                    <Label>Applicability</Label>
                    <select
                      className={SELECT}
                      value={plan.applicability}
                      onChange={(e) =>
                        setState(
                          updateLanguagePlan(state, plan.examKind, {
                            applicability: e.target.value as typeof plan.applicability,
                          }),
                        )
                      }
                    >
                      {LANGUAGE_APPLICABILITY.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label>Test date</Label>
                    <Input
                      type="date"
                      value={plan.testDate}
                      onChange={(e) => setState(updateLanguagePlan(state, plan.examKind, { testDate: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>Target</Label>
                    <Input
                      value={plan.targetOverall}
                      onChange={(e) =>
                        setState(updateLanguagePlan(state, plan.examKind, { targetOverall: e.target.value }))
                      }
                    />
                  </div>
                </div>
              ) : null}
            </Card>
          );
        })}
      </div>

      <Card className="border-dashed bg-[#f7f4ee]">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Optional</p>
            <CardTitle className="mt-1">Log a practice score</CardTitle>
            <p className="mt-1 text-sm text-slate-500">Skill-level notes only — not an official exam result.</p>
          </div>
          <Button size="sm" variant="outline" onClick={() => setLogOpen((v) => !v)}>
            {logOpen ? "Close" : "Log a score"}
          </Button>
        </div>
        {logOpen ? (
          <div className="mt-4 grid gap-3 border-t border-[#eee8de] pt-4 sm:grid-cols-2">
            <div>
              <Label>Exam</Label>
              <select className={SELECT} value={examKind} onChange={(e) => setExamKind(e.target.value as LanguageExamKind)}>
                {LANGUAGE_EXAMS.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Skill</Label>
              <select className={SELECT} value={skill} onChange={(e) => setSkill(e.target.value as LanguageSkill)}>
                {SKILLS.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <Label>Score</Label>
              <Input value={score} onChange={(e) => setScore(e.target.value)} />
            </div>
            <div>
              <Label>Notes</Label>
              <Input value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <Button
                onClick={() => {
                  setState(logLanguageAttempt(state, { examKind, skill, score, notes }));
                  setScore("");
                  setNotes("");
                }}
              >
                Save attempt
              </Button>
            </div>
          </div>
        ) : null}
        <ul className="mt-4 space-y-2">
          {recent.length === 0 ? (
            <li className="text-sm text-slate-500">No practice attempts yet.</li>
          ) : (
            recent.map((a) => (
              <li key={a.id} className="flex justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2 text-sm">
                <span>
                  {LANGUAGE_EXAMS.find((e) => e.id === a.examKind)?.label} · {a.skill}
                </span>
                <span className="font-medium text-[#0b1f33]">{a.score}</span>
              </li>
            ))
          )}
        </ul>
      </Card>
    </div>
  );
}
