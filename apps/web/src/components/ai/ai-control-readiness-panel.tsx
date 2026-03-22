import { AiControlSectionCard } from "@/components/ai/ai-control-section-card";
import { Badge } from "@/components/ui/badge";

type ReadinessItem = {
  id: string;
  title: string;
  summary: string;
  badges: string[];
  meta: string[];
};

type AiControlReadinessPanelProps = {
  title: string;
  description: string;
  providersTitle: string;
  skillsTitle: string;
  providerItems: ReadinessItem[];
  skillItems: ReadinessItem[];
};

export function AiControlReadinessPanel({
  title,
  description,
  providersTitle,
  skillsTitle,
  providerItems,
  skillItems
}: AiControlReadinessPanelProps) {
  return (
    <AiControlSectionCard
      description={description}
      slot="ai-control-readiness"
      title={title}
    >
      <div className="grid gap-5">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            {providersTitle}
          </p>
          <div className="grid gap-3">
            {providerItems.map((item) => (
              <ReadinessCard item={item} key={item.id} />
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            {skillsTitle}
          </p>
          <div className="grid gap-3">
            {skillItems.map((item) => (
              <ReadinessCard item={item} key={item.id} />
            ))}
          </div>
        </div>
      </div>
    </AiControlSectionCard>
  );
}

function ReadinessCard({ item }: { item: ReadinessItem }) {
  return (
    <div className="rounded-[1.25rem] border border-border/70 bg-background/[0.84] p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-foreground">{item.title}</h3>
          <p className="text-sm leading-6 text-muted-foreground">{item.summary}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {item.badges.map((badge) => (
            <Badge key={badge} variant="outline">
              {badge}
            </Badge>
          ))}
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        {item.meta.map((meta) => (
          <span key={meta}>{meta}</span>
        ))}
      </div>
    </div>
  );
}
