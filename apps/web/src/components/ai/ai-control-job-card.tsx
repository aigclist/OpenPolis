import { ArrowUpRightIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { buttonVariants } from "@/components/ui/button-variants";
import { Link } from "@openpolis/i18n/navigation";
import { cn } from "@/lib/utils";
import { getUiNamespace } from "@openpolis/ui/namespaces";

type AiControlJobCardProps = {
  title: string;
  summary: string;
  status: string;
  progress: number;
  leadAgent: string;
  supportingAgents: string[];
  meta: string;
  href?: string;
  actionLabel?: string;
};

export function AiControlJobCard({
  title,
  summary,
  status,
  progress,
  leadAgent,
  supportingAgents,
  meta,
  href,
  actionLabel
}: AiControlJobCardProps) {
  return (
    <div
      className="rounded-[1.4rem] border border-border/70 bg-background/[0.84] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]"
      data-ui={getUiNamespace("agent", "ai-control-job-card")}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <h3 className="text-base font-semibold leading-snug text-foreground">
            {title}
          </h3>
          <p className="text-sm leading-6 text-muted-foreground">{summary}</p>
        </div>
        <Badge variant="secondary">{status}</Badge>
      </div>
      <div className="mt-4 rounded-2xl border border-border/60 bg-card/80 p-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium text-foreground">{leadAgent}</p>
          <p className="text-sm text-muted-foreground">{progress}%</p>
        </div>
        <Progress className="mt-3" value={progress} />
        <p className="mt-3 text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
          {supportingAgents.join(" / ")}
        </p>
      </div>
      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">{meta}</p>
        {href && actionLabel ? (
          <Link
            className={cn(buttonVariants({ size: "sm", variant: "outline" }))}
            href={href}
          >
            <span>{actionLabel}</span>
            <ArrowUpRightIcon className="size-3.5" />
          </Link>
        ) : null}
      </div>
    </div>
  );
}
