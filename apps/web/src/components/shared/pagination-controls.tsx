import Link from "next/link";

import { buttonVariants } from "@/components/ui/button-variants";
import { getUiNamespace } from "@openpolis/ui/namespaces";

export type PaginationControlsProps = {
  summary: string;
  totalLabel: string;
  previousLabel: string;
  nextLabel: string;
  previousHref?: string;
  nextHref?: string;
};

export function PaginationControls({
  summary,
  totalLabel,
  previousLabel,
  nextLabel,
  previousHref,
  nextHref
}: PaginationControlsProps) {
  return (
    <div
      className="flex flex-col gap-3 rounded-lg border border-border/70 bg-card/90 px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between"
      data-ui={getUiNamespace("module", "pagination-controls")}
    >
      <div className="space-y-1">
        <p className="text-sm font-medium">{summary}</p>
        <p className="text-sm text-muted-foreground">{totalLabel}</p>
      </div>
      <div className="flex items-center gap-2">
        {previousHref ? (
          <Link
            className={buttonVariants({ size: "sm", variant: "outline" })}
            href={previousHref}
          >
            {previousLabel}
          </Link>
        ) : null}
        {nextHref ? (
          <Link
            className={buttonVariants({ size: "sm", variant: "outline" })}
            href={nextHref}
          >
            {nextLabel}
          </Link>
        ) : null}
      </div>
    </div>
  );
}
