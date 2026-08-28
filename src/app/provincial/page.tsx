"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Input, Label, Textarea } from "@/components/ui/input";
import { PageHeader } from "@/components/page-header";
import { DemoChip } from "@/components/demo-chip";
import { setTargetProvinces, updateRequirement } from "@/data/repositories/requirements-repository";
import {
  CANADIAN_PROVINCES,
  REQUIREMENT_APPLICABILITY,
  computeProvincialSnapshot,
  requirementsForTargets,
} from "@/domain/requirements";
import type { RequirementApplicability, RequirementUserStatus } from "@/domain/types";
import { useStore } from "@/components/store-provider";
import { cn } from "@/lib/utils";

const USER_STATUSES: RequirementUserStatus[] = [
  "not_started",
  "in_progress",
  "complete",
  "not_applicable",
  "blocked",
];

const SELECT =
  "h-10 w-full rounded-lg border border-[#d6cfc4] bg-white px-3 text-sm";

function statusTone(status: RequirementUserStatus): "emerald" | "sky" | "red" | "slate" {
  if (status === "complete" || status === "not_applicable") return "emerald";
  if (status === "in_progress") return "sky";
  if (status === "blocked") return "red";
  return "slate";
}

export default function ProvincialPage() {
  const { state, setState } = useStore();
  const snap = computeProvincialSnapshot(state.requirements, state.targetProvinceCodes);
  const rows = requirementsForTargets(state.requirements, state.targetProvinceCodes);
  const [openId, setOpenId] = useState<string | null>(null);

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
        title="Provincial pathway"
        description="Choose target provinces and track requirement items. Confirm each one with the college or ministry."
      />

      <Card>
        <CardTitle>Target provinces</CardTitle>
        <div className="mt-4 flex flex-wrap gap-2">
          {CANADIAN_PROVINCES.map((p) => {
            const on = state.targetProvinceCodes.includes(p.code);
            return (
              <button
                key={p.code}
                type="button"
                onClick={() => toggleProvince(p.code)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-sm transition",
                  on
                    ? "bg-teal-700 text-white"
                    : "bg-white text-slate-700 ring-1 ring-[#d6cfc4] hover:bg-slate-50",
                )}
              >
                {p.code} · {p.name}
              </button>
            );
          })}
        </div>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Completed", `${snap.completed} / ${snap.totalTarget}`, "emerald"],
          ["To verify", String(snap.verify.length), "amber"],
          ["Open", String(snap.incomplete.length), "sky"],
          ["Blockers", String(snap.blockers.length), "red"],
        ].map(([label, value]) => (
          <Card key={label}>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
            <p className="mt-2 text-2xl font-semibold">{value}</p>
          </Card>
        ))}
      </div>

      {state.targetProvinceCodes.length === 0 ? (
        <Card>
          <p className="text-sm text-slate-600">Select at least one province to explore requirements.</p>
        </Card>
      ) : (
        <ul className="space-y-3">
          {rows.map((r) => {
            const open = openId === r.id;
            return (
              <li key={r.id}>
                <Card>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge>{r.provinceCode}</Badge>
                        <span className="font-medium text-[#0b1f33]">{r.name}</span>
                        <DemoChip />
                      </div>
                      <p className="mt-1 text-sm text-slate-500">
                        {r.category} · {r.authority} · reviewed {r.lastVerifiedDate || "—"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        tone={
                          r.applicability === "needs_verification" || r.applicability === "unknown"
                            ? "amber"
                            : r.applicability === "not_required" || r.applicability === "not_applicable"
                              ? "emerald"
                              : "slate"
                        }
                      >
                        {REQUIREMENT_APPLICABILITY.find((a) => a.id === r.applicability)?.label}
                      </Badge>
                      <Badge tone={r.blocker ? "red" : statusTone(r.userStatus)}>
                        {r.blocker ? "Blocker" : r.userStatus.replace("_", " ")}
                      </Badge>
                      <Button size="sm" variant="outline" onClick={() => setOpenId(open ? null : r.id)}>
                        {open ? "Hide details" : "Review details"}
                      </Button>
                    </div>
                  </div>
                  {open ? (
                    <div className="mt-5 grid gap-3 border-t border-[#eee8de] pt-5 sm:grid-cols-2">
                      <div>
                        <Label>Applicability</Label>
                        <select
                          className={SELECT}
                          value={r.applicability}
                          onChange={(e) =>
                            setState(
                              updateRequirement(state, r.id, {
                                applicability: e.target.value as RequirementApplicability,
                              }),
                            )
                          }
                        >
                          {REQUIREMENT_APPLICABILITY.map((a) => (
                            <option key={a.id} value={a.id}>
                              {a.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <Label>Your status</Label>
                        <select
                          className={SELECT}
                          value={r.userStatus}
                          onChange={(e) =>
                            setState(
                              updateRequirement(state, r.id, { userStatus: e.target.value as RequirementUserStatus }),
                            )
                          }
                        >
                          {USER_STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s.replace("_", " ")}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <Label>Authority</Label>
                        <Input
                          value={r.authority}
                          onChange={(e) => setState(updateRequirement(state, r.id, { authority: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label>Last reviewed</Label>
                        <Input
                          type="date"
                          value={r.lastVerifiedDate}
                          onChange={(e) =>
                            setState(updateRequirement(state, r.id, { lastVerifiedDate: e.target.value }))
                          }
                        />
                      </div>
                      <div>
                        <Label>Effective</Label>
                        <Input
                          type="date"
                          value={r.effectiveDate}
                          onChange={(e) => setState(updateRequirement(state, r.id, { effectiveDate: e.target.value }))}
                        />
                      </div>
                      <div className="flex items-end pb-1">
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={r.blocker}
                            onChange={(e) => setState(updateRequirement(state, r.id, { blocker: e.target.checked }))}
                          />
                          Mark as blocker
                        </label>
                      </div>
                      <div className="sm:col-span-2">
                        <Label>Notes</Label>
                        <Textarea
                          value={r.notes}
                          onChange={(e) => setState(updateRequirement(state, r.id, { notes: e.target.value }))}
                        />
                      </div>
                    </div>
                  ) : null}
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
