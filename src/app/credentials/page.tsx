"use client";

import { Card, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { SELECT } from "@/components/search-select";
import { CREDENTIAL_CATALOG } from "@/reference/catalogs";
import { useStore } from "@/components/store-provider";
import type { MilestoneStatus } from "@/domain/types";

export default function CredentialsPage() {
  const { state, setState } = useStore();

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Eligibility"
        title="Credentials"
        description="Track status only. Do not store passport numbers, MCC IDs, PR cards, or credential PDFs here."
      />
      <div className="grid gap-4">
        {CREDENTIAL_CATALOG.map((c) => {
          const row = state.credentials.find((x) => x.kind === c.id) ?? {
            id: c.id,
            kind: c.id,
            status: "" as MilestoneStatus,
            notes: "",
            targetDate: "",
          };
          return (
            <Card key={c.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <CardTitle>{c.name}</CardTitle>
                  <a className="mt-1 inline-block text-sm text-teal-800" href={c.officialUrl} target="_blank" rel="noreferrer">
                    View official source ↗
                  </a>
                </div>
                <select
                  className={SELECT + " max-w-xs"}
                  value={row.status}
                  onChange={(e) =>
                    setState({
                      ...state,
                      credentials: state.credentials.map((x) =>
                        x.kind === c.id ? { ...x, status: e.target.value as MilestoneStatus } : x,
                      ),
                    })
                  }
                >
                  <option value="">Not recorded</option>
                  <option value="not_started">Not started</option>
                  <option value="in_progress">In progress</option>
                  <option value="complete">Complete</option>
                  <option value="waiting">Waiting</option>
                  <option value="needs_verification">Needs verification</option>
                </select>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
