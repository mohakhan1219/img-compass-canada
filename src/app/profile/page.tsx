"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Input, Label, Textarea } from "@/components/ui/input";
import { PageHeader } from "@/components/page-header";
import { ProgressBar } from "@/components/progress";
import { updateProfile } from "@/lib/store";
import { CANADIAN_PROVINCES } from "@/domain/requirements";
import { useStore } from "@/components/store-provider";

export default function ProfilePage() {
  const { state, setState } = useStore();
  const [form, setForm] = useState(state.profile);
  const [saved, setSaved] = useState(false);
  const fields = [
    form.displayName,
    form.graduationYear,
    form.medicalSchoolCountry,
    form.targetExamWindow,
    form.timezone,
  ];
  const complete = fields.filter((v) => v.trim()).length;
  const pct = Math.round((complete / fields.length) * 100);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Foundation"
        title="IMG profile"
        description="Your IMG planning profile. Do not store licence numbers or identity documents here."
      />

      <Card>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Completeness</p>
            <p className="mt-1 text-2xl font-semibold">{pct}%</p>
          </div>
          <p className="text-sm text-slate-600">{complete} of {fields.length} core fields filled</p>
        </div>
        <ProgressBar value={pct} className="mt-4" />
      </Card>

      <form
        className="space-y-6"
        onSubmit={(e) => {
          e.preventDefault();
          setState(updateProfile(state, form));
          setSaved(true);
        }}
      >
        <Card>
          <CardTitle>Identity</CardTitle>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="displayName">Display name</Label>
              <Input
                id="displayName"
                value={form.displayName}
                onChange={(e) => setForm({ ...form, displayName: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="tz">Timezone</Label>
              <Input
                id="tz"
                value={form.timezone}
                onChange={(e) => setForm({ ...form, timezone: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="window">Target exam window</Label>
              <Input
                id="window"
                value={form.targetExamWindow}
                onChange={(e) => setForm({ ...form, targetExamWindow: e.target.value })}
              />
            </div>
          </div>
        </Card>

        <Card>
          <CardTitle>Education</CardTitle>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="year">Graduation year</Label>
              <Input
                id="year"
                value={form.graduationYear}
                onChange={(e) => setForm({ ...form, graduationYear: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="country">Medical school country</Label>
              <Input
                id="country"
                value={form.medicalSchoolCountry}
                onChange={(e) => setForm({ ...form, medicalSchoolCountry: e.target.value })}
              />
            </div>
          </div>
        </Card>

        <Card>
          <CardTitle>Target provinces</CardTitle>
          <p className="mt-2 text-sm text-slate-600">
            {state.targetProvinceCodes.length
              ? state.targetProvinceCodes
                  .map((c) => CANADIAN_PROVINCES.find((p) => p.code === c)?.name ?? c)
                  .join(", ")
              : "None selected yet — choose them on Provincial pathway."}
          </p>
        </Card>

        <Card>
          <CardTitle>Planning notes</CardTitle>
          <Textarea
            className="mt-3"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
        </Card>

        <div className="flex items-center gap-3">
          <Button type="submit">Save profile</Button>
          {saved ? <span className="text-sm text-emerald-700">Saved</span> : null}
        </div>
      </form>
    </div>
  );
}
