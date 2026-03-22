import type { ComponentType } from "react";
import Link from "next/link";
import {
  NetworkIcon,
  ShieldCheckIcon,
  TargetIcon
} from "lucide-react";

import type { RecordListItem } from "@/components/shared/record-list-card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";
import { getUiNamespace } from "@openpolis/ui/namespaces";

type DashboardCommandHeroProps = {
  eyebrow: string;
  title: string;
  description: string;
  heroBadges: string[];
  priorityLabel: string;
  regionLabel: string;
  reviewLabel: string;
  priority?: RecordListItem;
  region?: RecordListItem;
  review?: RecordListItem;
};

type SignalSummaryProps = {
  icon: ComponentType<{ className?: string }>;
  label: string;
  item?: RecordListItem;
  compact?: boolean;
};

function SignalSummary({
  icon: Icon,
  label,
  item,
  compact = false
}: SignalSummaryProps) {
  return (
    <div
      className={cn(
        "rounded-[1.4rem] border border-[var(--command-surface-border)] bg-white/[0.03] p-4 backdrop-blur-sm",
        compact ? "min-h-0" : "min-h-52"
      )}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[var(--command-surface-muted)]">
          <Icon className="size-4 text-[var(--command-surface-accent)]" />
          <span>{label}</span>
        </div>
        {item?.href && item.actionLabel ? (
          <Link
            className={buttonVariants({
              className:
                "border-white/12 bg-white/[0.06] text-[var(--command-surface-foreground)] hover:bg-white/[0.1]",
              size: "sm",
              variant: "outline"
            })}
            href={item.href}
          >
            {item.actionLabel}
          </Link>
        ) : null}
      </div>
      <div className="space-y-3">
        <div
          className={cn(
            "font-display tracking-tight text-[var(--command-surface-foreground)]",
            compact ? "text-2xl leading-none" : "text-3xl leading-none"
          )}
        >
          {item?.title ?? label}
        </div>
        <p
          className={cn(
            "max-w-lg text-[var(--command-surface-muted)]",
            compact ? "text-sm leading-6" : "text-sm leading-7"
          )}
        >
          {item?.summary}
        </p>
        {item?.badges?.length ? (
          <div className="flex flex-wrap gap-2">
            {item.badges.slice(0, compact ? 1 : 2).map((badge) => (
              <Badge
                key={`${label}-${badge}`}
                className="border-white/10 bg-white/[0.08] text-[var(--command-surface-foreground)]"
                variant="outline"
              >
                {badge}
              </Badge>
            ))}
          </div>
        ) : null}
        {item?.meta?.length ? (
          <div className="space-y-1.5 text-xs text-[var(--command-surface-muted)]">
            {item.meta.slice(0, compact ? 1 : 2).map((entry, index) =>
              typeof entry === "string" ? (
                <div key={`${label}-meta-${index}`}>{entry}</div>
              ) : entry.href ? (
                <Link
                  key={`${label}-meta-${index}`}
                  className="underline decoration-white/30 underline-offset-4 transition hover:text-[var(--command-surface-foreground)]"
                  href={entry.href}
                >
                  {entry.value}
                </Link>
              ) : (
                <div key={`${label}-meta-${index}`}>{entry.value}</div>
              )
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function DashboardCommandHero({
  eyebrow,
  title,
  description,
  heroBadges,
  priorityLabel,
  regionLabel,
  reviewLabel,
  priority,
  region,
  review
}: DashboardCommandHeroProps) {
  return (
    <section
      className="relative overflow-hidden rounded-[2rem] border border-border/70 bg-card/90 p-6 shadow-[0_24px_60px_-36px_rgba(15,23,42,0.45)] sm:p-8"
      data-ui={getUiNamespace("dashboard", "command-hero")}
    >
      <div className="dashboard-halo pointer-events-none absolute inset-0 opacity-80" />
      <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-foreground/10 to-transparent" />
      <div className="relative grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(380px,0.95fr)] xl:items-stretch">
        <div className="flex flex-col justify-between gap-8">
          <div className="space-y-5">
            <div className="text-[0.72rem] font-semibold uppercase tracking-[0.34em] text-muted-foreground">
              {eyebrow}
            </div>
            <div className="space-y-4">
              <h1 className="max-w-3xl font-display text-5xl leading-[0.92] tracking-[-0.05em] text-balance text-foreground sm:text-6xl xl:text-[4.8rem]">
                {title}
              </h1>
              <p className="max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
                {description}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            {heroBadges.map((badge) => (
              <Badge
                key={badge}
                className="rounded-full border-border/70 bg-background/80 px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-foreground"
                variant="outline"
              >
                {badge}
              </Badge>
            ))}
          </div>
        </div>
        <div className="command-surface command-grid relative overflow-hidden rounded-[1.8rem] border border-[var(--command-surface-border)] p-4 text-[var(--command-surface-foreground)] sm:p-5">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/[0.06] to-transparent" />
          <div className="relative flex flex-col gap-4">
            <SignalSummary
              icon={TargetIcon}
              item={priority}
              label={priorityLabel}
            />
            <div className="grid gap-4 md:grid-cols-2">
              <SignalSummary
                compact
                icon={NetworkIcon}
                item={region}
                label={regionLabel}
              />
              <SignalSummary
                compact
                icon={ShieldCheckIcon}
                item={review}
                label={reviewLabel}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
