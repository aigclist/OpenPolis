import { ArrowUpRightIcon } from "lucide-react";

import { AiControlSectionCard } from "@/components/ai/ai-control-section-card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button-variants";
import { Link } from "@openpolis/i18n/navigation";
import { cn } from "@/lib/utils";

type ResultItem = {
  id: string;
  title: string;
  summary: string;
  badges: string[];
  meta: string;
  href?: string;
  actionLabel?: string;
};

type AiControlResultsPanelProps = {
  title: string;
  description: string;
  items: ResultItem[];
  emptyState: {
    title: string;
    description: string;
  };
};

export function AiControlResultsPanel({
  title,
  description,
  items,
  emptyState
}: AiControlResultsPanelProps) {
  return (
    <AiControlSectionCard
      contentClassName="grid gap-4 lg:grid-cols-2"
      description={description}
      slot="ai-control-results"
      title={title}
      tone="command"
    >
      {items.length > 0 ? (
        items.map((item, index) => (
          <div
            key={item.id}
            className={cn(
              "rounded-[1.5rem] border border-white/10 bg-black/[0.18] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]",
              index === 0 ? "lg:col-span-2" : ""
            )}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-2">
                <h2 className="text-xl font-semibold leading-tight text-[color:var(--command-surface-foreground)]">
                  {item.title}
                </h2>
                <p className="max-w-3xl text-sm leading-6 text-[color:var(--command-surface-muted)]">
                  {item.summary}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {item.badges.map((badge) => (
                  <Badge
                    key={badge}
                    className="border-white/10 bg-white/10 text-[color:var(--command-surface-foreground)]"
                    variant="outline"
                  >
                    {badge}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-[color:var(--command-surface-muted)]">
                {item.meta}
              </p>
              {item.href && item.actionLabel ? (
                <Link
                  className={cn(
                    buttonVariants({ size: "sm", variant: "secondary" }),
                    "bg-white/10 text-[color:var(--command-surface-foreground)] hover:bg-white/[0.14]"
                  )}
                  href={item.href}
                >
                  <span>{item.actionLabel}</span>
                  <ArrowUpRightIcon className="size-3.5" />
                </Link>
              ) : null}
            </div>
          </div>
        ))
      ) : (
        <div className="rounded-[1.5rem] border border-dashed border-white/15 bg-black/[0.16] p-5 text-[color:var(--command-surface-foreground)] lg:col-span-2">
          <h2 className="text-lg font-semibold">{emptyState.title}</h2>
          <p className="mt-2 text-sm leading-6 text-[color:var(--command-surface-muted)]">
            {emptyState.description}
          </p>
        </div>
      )}
    </AiControlSectionCard>
  );
}
