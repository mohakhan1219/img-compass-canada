"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardTitle } from "@/components/ui/card";
import { Label, Textarea } from "@/components/ui/input";
import { PageHeader } from "@/components/page-header";
import { SELECT } from "@/components/search-select";
import { setTargetProvinces, updateRequirement } from "@/data/repositories/requirements-repository";
import { R1_JURISDICTIONS, JURISDICTIONS } from "@/reference/provinces";
import { institutionsForProvince } from "@/reference/institutions";
import { sourcesForJurisdiction } from "@/reference/official-sources";
import { pathwayNotesFor } from "@/reference/catalogs";
import { MATCH_CYCLES } from "@/reference/match-cycles";
import { computeProvincialSnapshot, requirementsForTargets } from "@/domain/requirements";
import type { RequirementUserStatus } from "@/domain/types";
import { useStore } from "@/components/store-provider";
import { cn } from "@/lib/utils";

const USER_STATUSES: RequirementUserStatus[] = ["not_started", "in_progress", "complete", "not_applicable", "blocked"];

export default function ProvincialPage() {
  const { state, setState } = useStore();
  const [focus, setFocus] = useState(state.targetProvinceCodes[0] ?? "ON");
  const snap = computeProvincialSnapshot(state.requirements, state.targetProvinceCodes);
  const rows = requirementsForTargets(state.requirements, [focus]);
  const notes = pathwayNotesFor(focus);
  const institutions = institutionsForProvince(focus);
  const sources = sourcesForJurisdiction(focus);
  const cycle = MATCH_CYCLES.find((c) => c.id === state.profile.targetMatchCycleId);

  function toggleProvince(code: string) {
    const has = state.targetProvinceCodes.includes(code);
    setState(
      setTargetProvinces(
        state,
        has ? state.targetProvinceCodes.filter((c) => c !== code) : [...state.targetProvinceCodes, code],
      ),
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Eligibility"
        title="Provincial pathways"
        description="What should you know about applying in this province? Official rules stay on official sites; you track personal progress separately."
      />

      <Card>
        <CardTitle>Target provinces</CardTitle>
        <div className="mt-4 flex flex-wrap gap-2">
          {JURISDICTIONS.map((p) => {
            const on = state.targetProvinceCodes.includes(p.code);
            return (
              <button
                key={p.code}
                type="button"
                onClick={() => toggleProvince(p.code)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-sm transition",
                  on ? "bg-teal-700 text-white" : "bg-white text-slate-700 ring-1 ring-[#d6cfc4] hover:bg-slate-50",
                )}
              >
                {p.name}
              </button>
            );
          })}
        </div>
      </Card>

      <div className="flex flex-wrap gap-2">
        {R1_JURISDICTIONS.filter((j) => state.targetProvinceCodes.includes(j.code) || j.code === "NS").map((j) => (
          <button
            key={j.code}
            type="button"
            onClick={() => setFocus(j.code)}
            className={cn("rounded-full px-3 py-1.5 text-sm", focus === j.code ? "bg-[#0b1f33] text-white" : "bg-white ring-1 ring-[#d6cfc4]")}
          >
            {j.name}
          </button>
        ))}
      </div>

      {institutions.length === 0 ? (
        <Card>
          Canada&apos;s territories are available as geographic preferences, but this catalog does not invent R-1 residency programs for them.
        </Card>
      ) : (
        <>
          <Card>
            <CardTitle>Overview</CardTitle>
            <p className="mt-3 text-sm text-slate-600">{notes?.overview}</p>
            <p className="mt-4 text-xs text-slate-500">
              Match cycle: {cycle?.name ?? "—"} · Last verified {notes ? "2026-08-28" : "—"}
            </p>
          </Card>
          <Card>
            <CardTitle>Institutions</CardTitle>
            <ul className="mt-3 space-y-2 text-sm">
              {institutions.map((i) => (
                <li key={i.id}>
                  {i.name}{" "}
                  <a className="text-teal-800" href={i.pgmeUrl} target="_blank" rel="noreferrer">
                    View official source ↗
                  </a>
                </li>
              ))}
            </ul>
          </Card>
          <Card>
            <CardTitle>Pathway notes</CardTitle>
            <dl className="mt-3 space-y-3 text-sm">
              <div>
                <dt className="font-medium">IMG</dt>
                <dd className="text-slate-600">{notes?.imgNotes}</dd>
              </div>
              <div>
                <dt className="font-medium">Citizenship / legal status</dt>
                <dd className="text-slate-600">{notes?.citizenshipNotes}</dd>
              </div>
              <div>
                <dt className="font-medium">MCC examinations</dt>
                <dd className="text-slate-600">{notes?.examNotes}</dd>
              </div>
              <div>
                <dt className="font-medium">NAC / assessment</dt>
                <dd className="text-slate-600">{notes?.nacNotes}</dd>
              </div>
              <div>
                <dt className="font-medium">Language</dt>
                <dd className="text-slate-600">{notes?.languageNotes}</dd>
              </div>
              <div>
                <dt className="font-medium">Return of service</dt>
                <dd className="text-slate-600">{notes?.returnOfServiceNotes}</dd>
              </div>
              <div>
                <dt className="font-medium">Additional provincial assessment</dt>
                <dd className="text-slate-600">{notes?.additionalAssessmentNotes}</dd>
              </div>
              <div>
                <dt className="font-medium">Program-specific warning</dt>
                <dd className="text-slate-600">{notes?.programWarning}</dd>
              </div>
            </dl>
          </Card>
          <Card>
            <CardTitle>Official sources</CardTitle>
            <ul className="mt-3 space-y-2 text-sm">
              {sources.map((s) => (
                <li key={s.id}>
                  <a className="text-teal-800" href={s.url} target="_blank" rel="noreferrer">
                    {s.name} ↗
                  </a>
                  <span className="ml-2 text-xs text-slate-500">
                    {s.sourceStatus} · verified {s.lastVerifiedDate}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        </>
      )}

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">My progress</h2>
        <p className="mb-3 text-sm text-slate-600">
          {snap.verify.length} item(s) need verification. You cannot change an official requirement from Required to Not required.
        </p>
        <div className="space-y-3">
          {rows.map((r) => (
            <Card key={r.id}>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <CardTitle>{r.name}</CardTitle>
                  <p className="mt-1 text-sm text-slate-500">
                    Official: {r.applicability.replaceAll("_", " ")} · {r.authority}
                  </p>
                </div>
                <Badge>{r.userStatus.replaceAll("_", " ")}</Badge>
              </div>
              <a className="mt-2 inline-block text-sm text-teal-800" href={r.sourceUrl} target="_blank" rel="noreferrer">
                View official source ↗
              </a>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div>
                  <Label>My status</Label>
                  <select
                    className={SELECT}
                    value={r.userStatus}
                    onChange={(e) => setState(updateRequirement(state, r.id, { userStatus: e.target.value as RequirementUserStatus }))}
                  >
                    {USER_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s.replaceAll("_", " ")}
                      </option>
                    ))}
                  </select>
                </div>
                <label className="mt-6 flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={r.blocker}
                    onChange={(e) => setState(updateRequirement(state, r.id, { blocker: e.target.checked }))}
                  />
                  Personal attention / blocker
                </label>
              </div>
              <Textarea
                className="mt-3"
                placeholder="Personal notes"
                value={r.notes}
                onChange={(e) => setState(updateRequirement(state, r.id, { notes: e.target.value }))}
              />
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
