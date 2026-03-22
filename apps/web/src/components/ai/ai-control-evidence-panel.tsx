import { ArrowUpRightIcon } from "lucide-react";

import { AiControlSectionCard } from "@/components/ai/ai-control-section-card";
import { Link } from "@openpolis/i18n/navigation";

type EvidenceItem = {
  id: string;
  title: string;
  summary: string;
  href: string;
};

type AiControlEvidencePanelProps = {
  title: string;
  description: string;
  items: EvidenceItem[];
};

export function AiControlEvidencePanel({
  title,
  description,
  items
}: AiControlEvidencePanelProps) {
  return (
    <AiControlSectionCard
      description={description}
      slot="ai-control-evidence"
      title={title}
    >
      <div className="grid gap-3">
        {items.map((item) => (
          <Link
            key={item.id}
            className="group rounded-[1.25rem] border border-border/70 bg-background/[0.84] p-4 transition-colors hover:bg-muted/[0.60]"
            href={item.href}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-foreground">
                  {item.title}
                </h3>
                <p className="text-sm leading-6 text-muted-foreground">
                  {item.summary}
                </p>
              </div>
              <ArrowUpRightIcon className="mt-0.5 size-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </div>
          </Link>
        ))}
      </div>
    </AiControlSectionCard>
  );
}
