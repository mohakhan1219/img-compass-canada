import { DemoChip } from "@/components/demo-chip";

/** @deprecated Use DemoChip. Kept so older imports stay valid during the redesign. */
export function FictionalTag({ className }: { className?: string }) {
  return <DemoChip className={className} />;
}
