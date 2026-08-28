import Link from "next/link";
import { PORTFOLIO_BANNER } from "@/lib/eligibility";

export function PortfolioBanner() {
  return (
    <div className="border-b border-teal-900/20 bg-[#0b1f33] px-4 py-2 text-center text-xs text-teal-50/90 sm:text-[13px]">
      {PORTFOLIO_BANNER}{" "}
      <Link href="/about" className="font-medium text-teal-200 underline-offset-2 hover:underline">
        About
      </Link>
    </div>
  );
}
