"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { SearchSelect, SELECT } from "@/components/search-select";
import { useStore } from "@/components/store-provider";
import { COUNTRIES, MEDICAL_SCHOOLS, TIMEZONES, schoolsForCountry } from "@/reference/geo";
import { JURISDICTIONS } from "@/reference/provinces";
import { SPECIALTIES } from "@/reference/specialties";
import { MATCH_CYCLES } from "@/reference/match-cycles";
import { mergeReferenceRequirements } from "@/data/seed";
import type { ImgProfile } from "@/domain/types";

const STEPS = [
  "About you",
  "Medical education",
  "Training",
  "Canada status",
  "Career goal",
  "Residency preferences",
  "Current milestones",
];

export default function OnboardingPage() {
  const { state, setState } = useStore();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<ImgProfile>(state.profile);
  const [provinces, setProvinces] = useState<string[]>(state.targetProvinceCodes);

  function patch(p: Partial<ImgProfile>) {
    setForm((f) => ({ ...f, ...p }));
  }

  function finish() {
    const next = {
      ...state,
      profile: { ...form, onboardingComplete: true },
      targetProvinceCodes: provinces,
      requirements: mergeReferenceRequirements(state.requirements),
    };
    setState(next);
    router.replace("/dashboard");
  }

  const schools = form.medicalSchoolCountry ? schoolsForCountry(form.medicalSchoolCountry) : MEDICAL_SCHOOLS;

  return (
    <div className="min-h-screen bg-[#f4f1ea]">
      <div className="mx-auto max-w-xl px-4 py-10">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-800">
          Step {step + 1} of {STEPS.length}
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-[#0b1f33]">{STEPS[step]}</h1>
        <div className="mt-8 space-y-4 rounded-3xl border border-[#e4ddd2] bg-[#fffcf8] p-6">
          {step === 0 ? (
            <>
              <div>
                <Label htmlFor="name">Display name</Label>
                <Input id="name" value={form.displayName} onChange={(e) => patch({ displayName: e.target.value })} />
              </div>
              <SearchSelect
                id="res"
                label="Current country of residence"
                value={form.countryOfResidence}
                onChange={(countryOfResidence) => patch({ countryOfResidence })}
                options={COUNTRIES.map((c) => ({ value: c.code, label: c.name }))}
              />
              <div>
                <Label htmlFor="tz">Timezone</Label>
                <select id="tz" className={SELECT} value={form.timezone} onChange={(e) => patch({ timezone: e.target.value })}>
                  {TIMEZONES.map((z) => (
                    <option key={z}>{z}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="lang">Preferred language</Label>
                <select
                  id="lang"
                  className={SELECT}
                  value={form.preferredLanguage}
                  onChange={(e) => patch({ preferredLanguage: e.target.value as ImgProfile["preferredLanguage"] })}
                >
                  <option value="">Select…</option>
                  <option value="en">English</option>
                  <option value="fr">French</option>
                  <option value="both">Both</option>
                </select>
              </div>
            </>
          ) : null}
          {step === 1 ? (
            <>
              <SearchSelect
                id="medc"
                label="Country of medical education"
                value={form.medicalSchoolCountry}
                onChange={(medicalSchoolCountry) => patch({ medicalSchoolCountry, medicalSchoolId: "" })}
                options={COUNTRIES.map((c) => ({ value: c.code, label: c.name }))}
              />
              <SearchSelect
                id="school"
                label="Medical school"
                value={form.medicalSchoolId}
                onChange={(medicalSchoolId) => patch({ medicalSchoolId })}
                options={[
                  ...schools.map((s) => ({ value: s.id, label: s.name })),
                  { value: "other", label: "Other / enter manually" },
                ]}
              />
              {form.medicalSchoolId === "other" ? (
                <div>
                  <Label htmlFor="schoolOther">School name</Label>
                  <Input id="schoolOther" value={form.medicalSchoolOther} onChange={(e) => patch({ medicalSchoolOther: e.target.value })} />
                </div>
              ) : null}
              <div>
                <Label htmlFor="gy">Graduation year</Label>
                <select id="gy" className={SELECT} value={form.graduationYear} onChange={(e) => patch({ graduationYear: e.target.value })}>
                  <option value="">Select…</option>
                  {Array.from({ length: 45 }, (_, i) => String(2026 - i)).map((y) => (
                    <option key={y}>{y}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="deg">Medical degree</Label>
                <select id="deg" className={SELECT} value={form.medicalDegree} onChange={(e) => patch({ medicalDegree: e.target.value as ImgProfile["medicalDegree"] })}>
                  <option value="">Select…</option>
                  <option value="mbbs">MBBS</option>
                  <option value="md">MD</option>
                  <option value="equivalent">Equivalent</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <Label htmlFor="int">Internship</Label>
                <select id="int" className={SELECT} value={form.internshipStatus} onChange={(e) => patch({ internshipStatus: e.target.value as ImgProfile["internshipStatus"] })}>
                  <option value="">Select…</option>
                  <option value="not_started">Not started</option>
                  <option value="in_progress">In progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div>
                <Label htmlFor="intd">Internship duration</Label>
                <Input id="intd" value={form.internshipDuration} onChange={(e) => patch({ internshipDuration: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="gst">Graduation / current medical status</Label>
                <Input id="gst" value={form.graduationStatus} onChange={(e) => patch({ graduationStatus: e.target.value })} />
              </div>
            </>
          ) : null}
          {step === 2 ? (
            <>
              <div>
                <Label htmlFor="pg">Postgraduate training?</Label>
                <select id="pg" className={SELECT} value={form.postgraduateTraining} onChange={(e) => patch({ postgraduateTraining: e.target.value as ImgProfile["postgraduateTraining"] })}>
                  <option value="">Select…</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                  <option value="in_progress">In progress</option>
                </select>
              </div>
              <div>
                <Label htmlFor="pgs">Specialty (if applicable)</Label>
                <Input id="pgs" value={form.postgraduateSpecialty} onChange={(e) => patch({ postgraduateSpecialty: e.target.value })} />
              </div>
              <SearchSelect
                id="pgc"
                label="Country"
                value={form.postgraduateCountry}
                onChange={(postgraduateCountry) => patch({ postgraduateCountry })}
                options={COUNTRIES.map((c) => ({ value: c.code, label: c.name }))}
              />
              <div>
                <Label htmlFor="pgd">Duration</Label>
                <Input id="pgd" value={form.postgraduateDuration} onChange={(e) => patch({ postgraduateDuration: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="ind">Independent clinical practice?</Label>
                <select id="ind" className={SELECT} value={form.independentPractice} onChange={(e) => patch({ independentPractice: e.target.value as ImgProfile["independentPractice"] })}>
                  <option value="">Select…</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>
              <div>
                <Label htmlFor="yop">Approximate years of practice</Label>
                <Input id="yop" value={form.yearsOfPractice} onChange={(e) => patch({ yearsOfPractice: e.target.value })} />
              </div>
            </>
          ) : null}
          {step === 3 ? (
            <div>
              <Label htmlFor="can">Canada status</Label>
              <select id="can" className={SELECT} value={form.canadaStatus} onChange={(e) => patch({ canadaStatus: e.target.value as ImgProfile["canadaStatus"] })}>
                <option value="">Select…</option>
                <option value="citizen">Canadian citizen</option>
                <option value="pr">Permanent resident</option>
                <option value="other">Other / currently not eligible</option>
                <option value="prefer_not">Prefer not to specify</option>
              </select>
              <p className="mt-3 text-sm text-slate-600">Do not enter passport or PR card numbers.</p>
            </div>
          ) : null}
          {step === 4 ? (
            <div>
              <Label htmlFor="goal">Career goal</Label>
              <select id="goal" className={SELECT} value={form.careerGoal} onChange={(e) => patch({ careerGoal: e.target.value as ImgProfile["careerGoal"] })}>
                <option value="">Select…</option>
                <option value="carms">Residency through CaRMS</option>
                <option value="pra">Practice Ready Assessment / alternative pathway exploration</option>
                <option value="specialist">Specialist recognition / pathway exploration</option>
                <option value="exploring">Exploring options / Not sure</option>
              </select>
              <p className="mt-3 text-sm text-slate-600">Compass does not make legal or licensing determinations.</p>
            </div>
          ) : null}
          {step === 5 ? (
            <>
              <div>
                <Label htmlFor="cycle">Target match cycle</Label>
                <select id="cycle" className={SELECT} value={form.targetMatchCycleId} onChange={(e) => patch({ targetMatchCycleId: e.target.value })}>
                  {MATCH_CYCLES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <fieldset>
                <legend className="mb-2 text-sm font-medium text-slate-700">Target provinces</legend>
                <div className="flex flex-wrap gap-2">
                  {JURISDICTIONS.map((j) => {
                    const on = provinces.includes(j.code);
                    return (
                      <button
                        key={j.code}
                        type="button"
                        onClick={() =>
                          setProvinces((p) => (on ? p.filter((x) => x !== j.code) : [...p, j.code]))
                        }
                        className={on ? "rounded-full bg-teal-700 px-3 py-1 text-sm text-white" : "rounded-full bg-white px-3 py-1 text-sm ring-1 ring-[#d6cfc4]"}
                      >
                        {j.name}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
              <fieldset>
                <legend className="mb-2 text-sm font-medium text-slate-700">Specialty interests</legend>
                <div className="flex flex-wrap gap-2">
                  {SPECIALTIES.map((s) => {
                    const on = form.specialtyInterestIds.includes(s.id);
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() =>
                          patch({
                            specialtyInterestIds: on
                              ? form.specialtyInterestIds.filter((x) => x !== s.id)
                              : [...form.specialtyInterestIds, s.id],
                          })
                        }
                        className={on ? "rounded-full bg-teal-700 px-3 py-1 text-sm text-white" : "rounded-full bg-white px-3 py-1 text-sm ring-1 ring-[#d6cfc4]"}
                      >
                        {s.name}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
              <div>
                <Label htmlFor="rel">Willing to relocate anywhere in Canada?</Label>
                <select id="rel" className={SELECT} value={form.relocateAnywhere} onChange={(e) => patch({ relocateAnywhere: e.target.value as ImgProfile["relocateAnywhere"] })}>
                  <option value="">Select…</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                  <option value="maybe">Maybe</option>
                </select>
              </div>
            </>
          ) : null}
          {step === 6 ? (
            <>
              {[
                ["physiciansapplyStatus", "physiciansapply.ca account"],
                ["credentialVerificationStatus", "Credential / source verification"],
                ["mccqeStatus", "MCCQE status"],
                ["nacExamStatus", "NAC status"],
                ["languageEvidenceStatus", "Language status"],
              ].map(([key, label]) => (
                <div key={key}>
                  <Label htmlFor={key}>{label}</Label>
                  <select
                    id={key}
                    className={SELECT}
                    value={form[key as keyof ImgProfile] as string}
                    onChange={(e) => patch({ [key]: e.target.value } as Partial<ImgProfile>)}
                  >
                    <option value="">Select…</option>
                    <option value="not_started">Not started</option>
                    <option value="in_progress">In progress</option>
                    <option value="complete">Complete</option>
                    <option value="waiting">Waiting</option>
                    <option value="needs_verification">Needs verification</option>
                  </select>
                </div>
              ))}
            </>
          ) : null}
        </div>
        <div className="mt-6 flex justify-between">
          <Button variant="outline" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>
            Back
          </Button>
          {step < STEPS.length - 1 ? (
            <Button onClick={() => setStep((s) => s + 1)}>Continue</Button>
          ) : (
            <Button onClick={finish}>Build My Path</Button>
          )}
        </div>
      </div>
    </div>
  );
}
