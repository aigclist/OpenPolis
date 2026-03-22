import { cn } from "@/lib/utils";
import { getUiNamespace } from "@openpolis/ui/namespaces";

type DashboardMetricCardProps = {
  label: string;
  value: string;
  detail?: string;
  tone?: "primary" | "support" | "alert";
  className?: string;
};

const toneClasses = {
  primary:
    "border-border/80 bg-card/95 shadow-[0_24px_50px_-36px_rgba(15,23,42,0.35)]",
  support:
    "border-border/70 bg-card/85 shadow-sm",
  alert:
    "border-[color:color-mix(in_oklab,var(--command-surface-accent)_36%,var(--border))] bg-[color:color-mix(in_oklab,var(--accent)_16%,var(--card))] shadow-[0_24px_50px_-36px_rgba(166,93,44,0.35)]"
} as const;

export function DashboardMetricCard({
  label,
  value,
  detail,
  tone = "support",
  className
}: DashboardMetricCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[1.7rem] border p-5",
        toneClasses[tone],
        className
      )}
      data-ui={getUiNamespace("dashboard", "metric-card")}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-foreground/15 to-transparent" />
      <div className="relative flex h-full flex-col justify-between gap-6">
        <div className="space-y-3">
          <div className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            {label}
          </div>
          {detail ? (
            <p className="max-w-xs text-sm leading-7 text-muted-foreground">
              {detail}
            </p>
          ) : null}
        </div>
        <div
          className={cn(
            "font-display leading-none tracking-[-0.06em] text-foreground",
            tone === "primary" ? "text-7xl sm:text-[5.5rem]" : "text-5xl sm:text-6xl"
          )}
        >
          {value}
        </div>
      </div>
    </div>
  );
}
