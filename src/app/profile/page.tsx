"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Input, Label, Textarea } from "@/components/ui/input";
import { PageHeader } from "@/components/page-header";
import { ProgressBar } from "@/components/progress";
import { SearchSelect, SELECT } from "@/components/search-select";
import { updateProfile } from "@/lib/store";
import { setTargetProvinces } from "@/data/repositories/requirements-repository";
import { COUNTRIES, TIMEZONES, schoolsForCountry } from "@/reference/geo";
import { JURISDICTIONS } from "@/reference/provinces";
import { SPECIALTIES } from "@/reference/specialties";
import { MATCH_CYCLES } from "@/reference/match-cycles";
import { overallCompleteness, profileSections } from "@/domain/profile-completeness";
import { useStore } from "@/components/store-provider";
import type { ImgProfile } from "@/domain/types";

export default function ProfilePage() {
  const { state, setState } = useStore();
  const [form, setForm] = useState(state.profile);
  const [saved, setSaved] = useState(false);
  const sections = profileSections({ ...form });
  const overall = overallCompleteness(form);

  function save() {
    let next = updateProfile(state, form);
    next = setTargetProvinces(next, state.targetProvinceCodes);
    setState(next);
    setSaved(true);
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Eligibility"
        title="IMG profile"
        description="Edit every onboarding answer. Completeness is counted by section, not by a handful of trivial fields."
      />
      <Card>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Completeness</p>
        <p className="mt-1 text-2xl font-semibold">{overall.label}</p>
        <ProgressBar value={(overall.filled / overall.total) * 100} className="mt-4" />
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {sections.map((s) => (
            <li key={s.id}>
              <Link href={s.href} className="flex justify-between text-sm">
                <span>{s.label}</span>
                <span className={s.complete ? "text-emerald-700" : "text-amber-800"}>
                  {s.filled}/{s.total}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Card>

      <form
        className="space-y-6"
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
      >
        <Card id="personal">
          <CardTitle>Personal</CardTitle>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="displayName">Display name</Label>
              <Input id="displayName" value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} />
            </div>
            <SearchSelect
              id="res"
              label="Country of residence"
              value={form.countryOfResidence}
              onChange={(countryOfResidence) => setForm({ ...form, countryOfResidence })}
              options={COUNTRIES.map((c) => ({ value: c.code, label: c.name }))}
            />
            <div>
              <Label htmlFor="tz">Timezone</Label>
              <select id="tz" className={SELECT} value={form.timezone} onChange={(e) => setForm({ ...form, timezone: e.target.value })}>
                {TIMEZONES.map((z) => (
                  <option key={z}>{z}</option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="lang">Preferred language</Label>
              <select id="lang" className={SELECT} value={form.preferredLanguage} onChange={(e) => setForm({ ...form, preferredLanguage: e.target.value as ImgProfile["preferredLanguage"] })}>
                <option value="">Select…</option>
                <option value="en">English</option>
                <option value="fr">French</option>
                <option value="both">Both</option>
              </select>
            </div>
          </div>
        </Card>
        <Card id="education">
          <CardTitle>Medical education</CardTitle>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <SearchSelect
              id="medc"
              label="Country of medical education"
              value={form.medicalSchoolCountry}
              onChange={(medicalSchoolCountry) => setForm({ ...form, medicalSchoolCountry })}
              options={COUNTRIES.map((c) => ({ value: c.code, label: c.name }))}
            />
            <SearchSelect
              id="school"
              label="Medical school"
              value={form.medicalSchoolId}
              onChange={(medicalSchoolId) => setForm({ ...form, medicalSchoolId })}
              options={[
                ...schoolsForCountry(form.medicalSchoolCountry).map((s) => ({ value: s.id, label: s.name })),
                { value: "other", label: "Other / enter manually" },
              ]}
            />
            <div>
              <Label htmlFor="gy">Graduation year</Label>
              <select id="gy" className={SELECT} value={form.graduationYear} onChange={(e) => setForm({ ...form, graduationYear: e.target.value })}>
                <option value="">Select…</option>
                {Array.from({ length: 45 }, (_, i) => String(2026 - i)).map((y) => (
                  <option key={y}>{y}</option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="deg">Degree</Label>
              <select id="deg" className={SELECT} value={form.medicalDegree} onChange={(e) => setForm({ ...form, medicalDegree: e.target.value as ImgProfile["medicalDegree"] })}>
                <option value="">Select…</option>
                <option value="mbbs">MBBS</option>
                <option value="md">MD</option>
                <option value="equivalent">Equivalent</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </Card>
        <Card id="training">
          <CardTitle>Training / experience</CardTitle>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="pg">Postgraduate training</Label>
              <select id="pg" className={SELECT} value={form.postgraduateTraining} onChange={(e) => setForm({ ...form, postgraduateTraining: e.target.value as ImgProfile["postgraduateTraining"] })}>
                <option value="">Select…</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
                <option value="in_progress">In progress</option>
              </select>
            </div>
            <div>
              <Label htmlFor="ind">Independent practice</Label>
              <select id="ind" className={SELECT} value={form.independentPractice} onChange={(e) => setForm({ ...form, independentPractice: e.target.value as ImgProfile["independentPractice"] })}>
                <option value="">Select…</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>
          </div>
        </Card>
        <Card id="canada">
          <CardTitle>Canada status</CardTitle>
          <select className={SELECT + " mt-4"} value={form.canadaStatus} onChange={(e) => setForm({ ...form, canadaStatus: e.target.value as ImgProfile["canadaStatus"] })}>
            <option value="">Select…</option>
            <option value="citizen">Canadian citizen</option>
            <option value="pr">Permanent resident</option>
            <option value="other">Other / currently not eligible</option>
            <option value="prefer_not">Prefer not to specify</option>
          </select>
        </Card>
        <Card id="career">
          <CardTitle>Career goal</CardTitle>
          <select className={SELECT + " mt-4"} value={form.careerGoal} onChange={(e) => setForm({ ...form, careerGoal: e.target.value as ImgProfile["careerGoal"] })}>
            <option value="">Select…</option>
            <option value="carms">Residency through CaRMS</option>
            <option value="pra">Practice Ready Assessment exploration</option>
            <option value="specialist">Specialist recognition exploration</option>
            <option value="exploring">Exploring / not sure</option>
          </select>
        </Card>
        <Card id="preferences">
          <CardTitle>Provinces / specialties</CardTitle>
          <div className="mt-4">
            <Label htmlFor="cycle">Target match cycle</Label>
            <select id="cycle" className={SELECT} value={form.targetMatchCycleId} onChange={(e) => setForm({ ...form, targetMatchCycleId: e.target.value })}>
              {MATCH_CYCLES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <p className="mt-3 text-sm text-slate-600">Target provinces are edited on Provincial Pathways so official requirements stay in sync.</p>
          <p className="mt-2 text-sm">{state.targetProvinceCodes.map((c) => JURISDICTIONS.find((j) => j.code === c)?.name).join(", ") || "None selected"}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {SPECIALTIES.map((s) => {
              const on = form.specialtyInterestIds.includes(s.id);
              return (
                <button
                  type="button"
                  key={s.id}
                  className={on ? "rounded-full bg-teal-700 px-3 py-1 text-sm text-white" : "rounded-full bg-white px-3 py-1 text-sm ring-1 ring-[#d6cfc4]"}
                  onClick={() =>
                    setForm({
                      ...form,
                      specialtyInterestIds: on ? form.specialtyInterestIds.filter((x) => x !== s.id) : [...form.specialtyInterestIds, s.id],
                    })
                  }
                >
                  {s.name}
                </button>
              );
            })}
          </div>
        </Card>
        <Card id="exams">
          <CardTitle>Exam milestones</CardTitle>
          <p className="mt-2 text-sm text-slate-600">Detailed exam tracking lives on MCCQE and NAC pages.</p>
        </Card>
        <Card>
          <Label htmlFor="notes">Notes</Label>
          <Textarea id="notes" className="mt-2" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <Button className="mt-4" type="submit">
            Save profile
          </Button>
          {saved ? <p className="mt-2 text-sm text-emerald-800">Saved.</p> : null}
        </Card>
      </form>
    </div>
  );
}
