"use client";

import { PageHeader } from "@/components/page-header";
import { Card, CardTitle } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { SELECT } from "@/components/search-select";
import { useStore } from "@/components/store-provider";
import type { DocumentItemStatus } from "@/domain/types";

export default function ResidencyPage() {
  const { state, setState } = useStore();
  const matched = state.matchOutcome?.status === "matched";
  const program = state.programs.find((p) => p.id === state.matchOutcome?.programId);

  if (state.matchOutcome?.status === "unmatched") {
    return (
      <div className="space-y-8">
        <PageHeader eyebrow="Match" title="Next-cycle planning" description="Unmatched is not a dead end." />
        <Card>
          <CardTitle>Where to go from here</CardTitle>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600">
            <li>Review the CaRMS second-iteration timeline when it applies.</li>
            <li>Capture a personal retrospective on applications and interviews.</li>
            <li>Adjust provinces, specialties, and exam milestones for the next cycle.</li>
          </ul>
        </Card>
      </div>
    );
  }

  if (!matched) {
    return (
      <div className="space-y-8">
        <PageHeader
          eyebrow="Match"
          title="Residency onboarding"
          description="This stage opens after you record a match. Until then, keep preparing applications and exams."
        />
        <Card>Record Match Day on the Match page when results are public.</Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Match"
        title="Residency onboarding"
        description="Track your own tasks after a match. Official licensing still lives with the college and program."
      />
      <Card>
        <CardTitle>{program?.name ?? "Matched program"}</CardTitle>
        <div className="mt-4">
          <Label htmlFor="start">Residency start date</Label>
          <Input
            id="start"
            type="date"
            value={state.residencyStartDate}
            onChange={(e) => setState({ ...state, residencyStartDate: e.target.value })}
          />
        </div>
      </Card>
      {state.onboardingTasks.map((t) => (
        <Card key={t.id}>
          <CardTitle>{t.label}</CardTitle>
          <select
            className={SELECT + " mt-3 max-w-xs"}
            value={t.status}
            onChange={(e) =>
              setState({
                ...state,
                onboardingTasks: state.onboardingTasks.map((x) =>
                  x.id === t.id ? { ...x, status: e.target.value as DocumentItemStatus } : x,
                ),
              })
            }
          >
            <option value="not_started">Not started</option>
            <option value="in_progress">In progress</option>
            <option value="complete">Complete</option>
            <option value="not_required">Not required (personal)</option>
          </select>
        </Card>
      ))}
    </div>
  );
}
