"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { useStore } from "@/components/store-provider";

export default function SettingsPage() {
  const { reset } = useStore();
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Workspace"
        title="Settings"
        description="Reset restores the synthetic Dr. Alex Morgan records used throughout this workspace."
      />
      <Card>
        <CardTitle>Demo data</CardTitle>
        <p className="mt-2 text-sm text-slate-600">
          Restore the original synthetic journey. This does not change programmes, exams, or infrastructure.
        </p>
        <Button className="mt-4" variant="danger" onClick={reset}>
          Reset demo data
        </Button>
      </Card>
      <Card>
        <CardTitle>About</CardTitle>
        <p className="mt-2 text-sm text-slate-600">Full product and data disclosure lives on the About page.</p>
        <Link href="/about" className="mt-3 inline-block text-sm font-medium text-teal-800">
          Open About
        </Link>
      </Card>
    </div>
  );
}
