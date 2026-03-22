import { AiControlSectionCard } from "@/components/ai/ai-control-section-card";
import { Badge } from "@/components/ui/badge";

type AgentSeat = {
  id: string;
  name: string;
  role: string;
  summary: string;
  status: string;
  load: string;
};

type AiControlAgentsPanelProps = {
  title: string;
  description: string;
  agents: AgentSeat[];
  loadLabel: string;
};

export function AiControlAgentsPanel({
  title,
  description,
  agents,
  loadLabel
}: AiControlAgentsPanelProps) {
  return (
    <AiControlSectionCard
      contentClassName="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
      description={description}
      slot="ai-control-agents"
      title={title}
    >
      {agents.map((agent) => (
        <div
          key={agent.id}
          className="rounded-[1.4rem] border border-border/70 bg-background/[0.84] p-4"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <h3 className="text-base font-semibold text-foreground">
                {agent.name}
              </h3>
              <p className="text-sm text-muted-foreground">{agent.role}</p>
            </div>
            <Badge variant="secondary">{agent.status}</Badge>
          </div>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            {agent.summary}
          </p>
          <div className="mt-4 flex items-center justify-between border-t border-border/70 pt-3 text-sm">
            <span className="text-muted-foreground">{loadLabel}</span>
            <span className="font-semibold text-foreground">{agent.load}</span>
          </div>
        </div>
      ))}
    </AiControlSectionCard>
  );
}
