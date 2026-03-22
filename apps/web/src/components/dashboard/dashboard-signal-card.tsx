import Link from "next/link";

import type { RecordListItem } from "@/components/shared/record-list-card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";
import { getUiNamespace } from "@openpolis/ui/namespaces";

type DashboardSignalCardProps = {
  title: string;
  description: string;
  items: RecordListItem[];
  variant?: "primary" | "rail" | "compact";
  limit?: number;
};

type MetaEntry = RecordListItem["meta"][number];

function renderMetaEntry(entry: MetaEntry, key: string) {
  if (typeof entry === "string") {
    return <span key={key}>{entry}</span>;
  }

  if (entry.href) {
    return (
      <Link
        key={key}
        className="underline decoration-foreground/20 underline-offset-4 hover:text-foreground"
        href={entry.href}
      >
        {entry.value}
      </Link>
    );
  }

  return <span key={key}>{entry.value}</span>;
}

const variantClasses = {
  primary:
    "border-border/75 bg-card/95 shadow-[0_24px_50px_-36px_rgba(15,23,42,0.35)]",
  rail: "border-border/70 bg-card/90 shadow-sm",
  compact: "border-border/65 bg-card/80 shadow-sm"
} as const;

export function DashboardSignalCard({
  title,
  description,
  items,
  variant = "rail",
  limit
}: DashboardSignalCardProps) {
  const visibleItems = items.slice(0, limit ?? (variant === "compact" ? 2 : 3));

  return (
    <section
      className={cn(
        "overflow-hidden rounded-[1.8rem] border",
        variantClasses[variant]
      )}
      data-ui={getUiNamespace("dashboard", "signal-card")}
    >
      <div className="border-b border-border/60 px-5 py-4 sm:px-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <h2 className="font-display text-3xl leading-none tracking-[-0.04em] text-foreground">
              {title}
            </h2>
            <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
              {description}
            </p>
          </div>
          <div className="rounded-full border border-border/70 bg-background/75 px-3 py-1 font-display text-2xl leading-none tracking-[-0.04em] text-foreground">
            {items.length}
          </div>
        </div>
      </div>
      <div
        className={cn(
          "flex flex-col",
          variant === "compact" ? "divide-y divide-border/55" : "divide-y divide-border/60"
        )}
      >
        {visibleItems.map((item, index) => (
          <article
            key={item.id}
            className={cn(
              "px-5 py-5 sm:px-6",
              variant === "primary" && index === 0
                ? "bg-[color:color-mix(in_oklab,var(--accent)_12%,var(--card))]"
                : ""
            )}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 space-y-3">
                <div className="space-y-2">
                  {item.selectHref ? (
                    <Link
                      className="block font-display text-[1.85rem] leading-none tracking-[-0.04em] text-foreground transition hover:text-primary"
                      href={item.selectHref}
                    >
                      {item.title}
                    </Link>
                  ) : (
                    <div className="font-display text-[1.85rem] leading-none tracking-[-0.04em] text-foreground">
                      {item.title}
                    </div>
                  )}
                  {variant !== "compact" ? (
                    <p className="max-w-3xl text-sm leading-7 text-muted-foreground">
                      {item.summary}
                    </p>
                  ) : null}
                </div>
                {item.badges.length ? (
                  <div className="flex flex-wrap gap-2">
                    {item.badges.slice(0, variant === "compact" ? 1 : 2).map((badge) => (
                      <Badge key={`${item.id}-${badge}`} variant="secondary">
                        {badge}
                      </Badge>
                    ))}
                  </div>
                ) : null}
                {item.meta.length ? (
                  <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
                    {item.meta
                      .slice(0, variant === "primary" ? 3 : 2)
                      .map((entry, metaIndex) =>
                        renderMetaEntry(entry, `${item.id}-meta-${metaIndex}`)
                      )}
                  </div>
                ) : null}
              </div>
              {item.href && item.actionLabel ? (
                <Link
                  className={buttonVariants({
                    className:
                      variant === "primary"
                        ? "border-border/70 bg-background/80 hover:bg-background"
                        : undefined,
                    size: "sm",
                    variant: "outline"
                  })}
                  href={item.href}
                >
                  {item.actionLabel}
                </Link>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
