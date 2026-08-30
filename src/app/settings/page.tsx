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
        description="Restore the original sample journey used in this workspace."
      />
      <Card>
        <CardTitle>Sample records</CardTitle>
        <p className="mt-2 text-sm text-slate-600">
          Restore Dr. Alex Morgan’s original pathway notes. This does not change exams or programs in the real world.
        </p>
        <Button className="mt-4" variant="danger" onClick={reset}>
          Restore sample journey
        </Button>
      </Card>
      <Card>
        <CardTitle>About</CardTitle>
        <p className="mt-2 text-sm text-slate-600">Product background and a quiet data note live on the About page.</p>
        <Link href="/about" className="mt-3 inline-block text-sm font-medium text-teal-800">
          Open About
        </Link>
      </Card>
    </div>
  );
}
