import { AiControlJobCard } from "@/components/ai/ai-control-job-card";
import { AiControlSectionCard } from "@/components/ai/ai-control-section-card";

type JobItem = {
  id: string;
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

type AiControlActiveWorkPanelProps = {
  title: string;
  description: string;
  items: JobItem[];
  emptyState: {
    title: string;
    description: string;
  };
};

export function AiControlActiveWorkPanel({
  title,
  description,
  items,
  emptyState
}: AiControlActiveWorkPanelProps) {
  return (
    <AiControlSectionCard
      contentClassName="grid gap-4 md:grid-cols-2 2xl:grid-cols-3"
      description={description}
      slot="ai-control-active-work"
      title={title}
    >
      {items.length > 0 ? (
        items.map((job) => (
          <AiControlJobCard
            actionLabel={job.actionLabel}
            href={job.href}
            key={job.id}
            leadAgent={job.leadAgent}
            meta={job.meta}
            progress={job.progress}
            status={job.status}
            summary={job.summary}
            supportingAgents={job.supportingAgents}
            title={job.title}
          />
        ))
      ) : (
        <div className="rounded-[1.4rem] border border-dashed border-border/70 bg-background/[0.84] p-5 md:col-span-2 2xl:col-span-3">
          <h3 className="text-base font-semibold text-foreground">
            {emptyState.title}
          </h3>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {emptyState.description}
          </p>
        </div>
      )}
    </AiControlSectionCard>
  );
}
