import { ArrowUpRightIcon, ShieldCheckIcon } from "lucide-react";

import { AiControlSectionCard } from "@/components/ai/ai-control-section-card";
import {
  Alert,
  AlertDescription,
  AlertTitle
} from "@/components/ui/alert";
import { buttonVariants } from "@/components/ui/button-variants";
import { Link } from "@openpolis/i18n/navigation";
import { cn } from "@/lib/utils";

type ConfirmationItem = {
  id: string;
  title: string;
  summary: string;
  reason: string;
  owner: string;
  agentRunId?: string;
  href?: string;
  actionLabel?: string;
};

type AiControlConfirmationsPanelProps = {
  title: string;
  description: string;
  items: ConfirmationItem[];
  emptyState: {
    title: string;
    description: string;
  };
  alerts: {
    responseCreated: {
      title: string;
      description: string;
    };
    responseError: {
      title: string;
      description: string;
    };
  };
  actions: {
    approve: string;
    reject: string;
  };
  responseStatus?: "created" | "error";
  responseErrorAlert?: {
    title: string;
    description: string;
  };
  action: (formData: FormData) => Promise<void>;
};

export function AiControlConfirmationsPanel({
  title,
  description,
  items,
  emptyState,
  alerts,
  actions,
  responseStatus,
  responseErrorAlert,
  action
}: AiControlConfirmationsPanelProps) {
  return (
    <AiControlSectionCard
      description={description}
      slot="ai-control-confirmations"
      title={title}
    >
      <div className="grid gap-4">
        {responseStatus === "created" ? (
          <Alert>
            <AlertTitle>{alerts.responseCreated.title}</AlertTitle>
            <AlertDescription>{alerts.responseCreated.description}</AlertDescription>
          </Alert>
        ) : null}
        {responseStatus === "error" ? (
          <Alert variant="destructive">
            <AlertTitle>
              {responseErrorAlert?.title ?? alerts.responseError.title}
            </AlertTitle>
            <AlertDescription>
              {responseErrorAlert?.description ?? alerts.responseError.description}
            </AlertDescription>
          </Alert>
        ) : null}

        {items.length > 0 ? (
          items.map((item) => (
            <div
              key={item.id}
              className="rounded-[1.35rem] border border-border/70 bg-background/[0.84] p-4"
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
                <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <ShieldCheckIcon className="size-[1.125rem]" />
                </div>
              </div>
              <div className="mt-4 space-y-2 text-sm">
                <p className="text-muted-foreground">{item.reason}</p>
                <p className="font-medium text-foreground">{item.owner}</p>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                {item.agentRunId ? (
                  <>
                    <form action={action}>
                      <input name="agentRunId" type="hidden" value={item.agentRunId} />
                      <input name="decision" type="hidden" value="approved" />
                      <button
                        className={cn(
                          buttonVariants({ size: "sm", variant: "secondary" })
                        )}
                        type="submit"
                      >
                        {actions.approve}
                      </button>
                    </form>
                    <form action={action}>
                      <input name="agentRunId" type="hidden" value={item.agentRunId} />
                      <input name="decision" type="hidden" value="rejected" />
                      <button
                        className={cn(
                          buttonVariants({ size: "sm", variant: "destructive" })
                        )}
                        type="submit"
                      >
                        {actions.reject}
                      </button>
                    </form>
                  </>
                ) : item.href && item.actionLabel ? (
                  <Link
                    className={cn(buttonVariants({ size: "sm", variant: "outline" }))}
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
          <div className="rounded-[1.35rem] border border-dashed border-border/70 bg-background/[0.84] p-4">
            <h3 className="text-base font-semibold text-foreground">
              {emptyState.title}
            </h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {emptyState.description}
            </p>
          </div>
        )}
      </div>
    </AiControlSectionCard>
  );
}
