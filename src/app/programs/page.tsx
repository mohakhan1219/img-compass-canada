"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SELECT } from "@/components/search-select";
import { JURISDICTIONS, R1_JURISDICTIONS } from "@/reference/provinces";
import { institutionsForProvince } from "@/reference/institutions";
import { SPECIALTIES } from "@/reference/specialties";
import { MATCH_CYCLES } from "@/reference/match-cycles";
import { programsForFilters, type ReferenceProgram } from "@/reference/programs";
import { institutionById } from "@/reference/institutions";
import { specialtyById } from "@/reference/specialties";
import { saveReferenceProgram, addApplication } from "@/data/repositories/carms-repository";
import { useStore } from "@/components/store-provider";

export default function ProgramsPage() {
  const { state, setState } = useStore();
  const [province, setProvince] = useState(state.targetProvinceCodes[0] ?? "ON");
  const [institutionId, setInstitutionId] = useState("");
  const [specialtyId, setSpecialtyId] = useState("");
  const [cycleId, setCycleId] = useState("r1-2027-first");
  const [savedOnly, setSavedOnly] = useState(false);

  const institutions = institutionsForProvince(province);
  const rows = useMemo(() => {
    const list = programsForFilters({
      provinceCode: province || undefined,
      institutionId: institutionId || undefined,
      specialtyId: specialtyId || undefined,
      matchCycleId: cycleId || undefined,
    });
    if (!savedOnly) return list;
    const saved = new Set(state.programs.filter((p) => p.saved).map((p) => p.referenceProgramId));
    return list.filter((p) => saved.has(p.id));
  }, [province, institutionId, specialtyId, cycleId, savedOnly, state.programs]);

  function saved(p: ReferenceProgram) {
    return state.programs.some((x) => x.referenceProgramId === p.id && x.saved);
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Eligibility"
        title="Program Explorer"
        description="Research real CaRMS R-1 faculties. 2027 program descriptions are not copied here — open the official listing when it is published."
      />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <select className={SELECT} value={province} onChange={(e) => { setProvince(e.target.value); setInstitutionId(""); }}>
          {R1_JURISDICTIONS.map((j) => (
            <option key={j.code} value={j.code}>
              {j.name}
            </option>
          ))}
        </select>
        <select className={SELECT} value={institutionId} onChange={(e) => setInstitutionId(e.target.value)}>
          <option value="">All institutions</option>
          {institutions.map((i) => (
            <option key={i.id} value={i.id}>
              {i.name}
            </option>
          ))}
        </select>
        <select className={SELECT} value={specialtyId} onChange={(e) => setSpecialtyId(e.target.value)}>
          <option value="">All specialties</option>
          {SPECIALTIES.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        <select className={SELECT} value={cycleId} onChange={(e) => setCycleId(e.target.value)}>
          {MATCH_CYCLES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.iteration === "first" ? "2027 first iteration" : "2027 second iteration"}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={savedOnly} onChange={(e) => setSavedOnly(e.target.checked)} />
          Saved only
        </label>
      </div>
      {institutions.length === 0 ? (
        <Card>No R-1 institution is catalogued for that filter. Territories are not given fabricated programs.</Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {rows.map((p) => {
            const inst = institutionById(p.institutionId);
            const spec = specialtyById(p.specialtyId);
            return (
              <Card key={p.id}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle>{inst?.name}</CardTitle>
                    <p className="mt-1 text-sm text-slate-600">
                      {spec?.name} · {JURISDICTIONS.find((j) => j.code === p.provinceCode)?.name}
                    </p>
                  </div>
                  <Badge tone="amber">{p.sourceStatus.replace("_", " ")}</Badge>
                </div>
                <p className="mt-3 text-sm text-slate-600">{p.imgNotes}</p>
                <p className="mt-2 text-xs text-slate-500">Last verified {p.lastVerifiedDate} · {p.matchCycleId}</p>
                <div className="mt-3 flex flex-wrap gap-3 text-sm">
                  <a className="text-teal-800" href={p.officialUrl} target="_blank" rel="noreferrer">
                    View official source ↗
                  </a>
                  <a className="text-teal-800" href={p.carmsUrl} target="_blank" rel="noreferrer">
                    CaRMS ↗
                  </a>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button size="sm" variant={saved(p) ? "secondary" : "default"} onClick={() => setState(saveReferenceProgram(state, p.id))}>
                    {saved(p) ? "Saved" : "Save to My Programs"}
                  </Button>
                  {saved(p) ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const row = state.programs.find((x) => x.referenceProgramId === p.id);
                        if (row) setState(addApplication(state, row.id));
                      }}
                    >
                      Add to Applications
                    </Button>
                  ) : null}
                </div>
              </Card>
            );
          })}
        </div>
      )}
      <p className="text-sm text-slate-600">
        Saved programs flow into <Link className="text-teal-800" href="/applications">Applications</Link>.
      </p>
    </div>
  );
}
