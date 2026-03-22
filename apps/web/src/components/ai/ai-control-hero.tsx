"use client";

import { useFormStatus } from "react-dom";
import { useState } from "react";
import { BotIcon, RadarIcon, ShieldCheckIcon, WorkflowIcon } from "lucide-react";

import {
  Alert,
  AlertDescription,
  AlertTitle
} from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { getUiNamespace } from "@openpolis/ui/namespaces";

type AiControlHeroProps = {
  action: (formData: FormData) => Promise<void>;
  eyebrow: string;
  title: string;
  description: string;
  inputTitle: string;
  inputDescription: string;
  promptPlaceholder: string;
  promptHelper: string;
  submitLabel: string;
  status?: "created" | "error";
  errorAlert?: {
    title: string;
    description: string;
  };
  successTitle: string;
  successDescription: string;
  errorTitle: string;
  errorDescription: string;
  quickActions: Array<{
    id: string;
    label: string;
    prompt: string;
  }>;
  stats: Array<{
    label: string;
    value: string;
    detail: string;
  }>;
};

const statIcons = [WorkflowIcon, BotIcon, ShieldCheckIcon, RadarIcon] as const;

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <Button className="min-w-36" disabled={pending} type="submit">
      {pending ? "..." : label}
    </Button>
  );
}

export function AiControlHero({
  action,
  eyebrow,
  title,
  description,
  inputTitle,
  inputDescription,
  promptPlaceholder,
  promptHelper,
  submitLabel,
  status,
  errorAlert,
  successTitle,
  successDescription,
  errorTitle,
  errorDescription,
  quickActions,
  stats
}: AiControlHeroProps) {
  const [prompt, setPrompt] = useState(quickActions[0]?.prompt ?? "");
  const resolvedErrorTitle = errorAlert?.title ?? errorTitle;
  const resolvedErrorDescription = errorAlert?.description ?? errorDescription;

  return (
    <section
      className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.9fr)]"
      data-ui={getUiNamespace("agent", "ai-control-hero")}
    >
      <div className="command-surface command-grid relative overflow-hidden rounded-[2rem] border border-[color:var(--command-surface-border)] p-6 text-[color:var(--command-surface-foreground)] shadow-[0_28px_80px_color-mix(in_oklab,var(--command-surface)_32%,transparent)] sm:p-8">
        <div className="dashboard-halo pointer-events-none absolute inset-0 opacity-80" />
        <div className="relative flex flex-col gap-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              className="border-white/[0.15] bg-white/10 text-[color:var(--command-surface-foreground)]"
              variant="outline"
            >
              {eyebrow}
            </Badge>
            <Badge
              className="border-white/[0.15] bg-white/10 text-[color:var(--command-surface-foreground)]"
              variant="outline"
            >
              {inputTitle}
            </Badge>
          </div>
          <div className="max-w-3xl space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[color:var(--command-surface-muted)]">
              {eyebrow}
            </p>
            <h1 className="max-w-4xl font-display text-4xl leading-none tracking-[-0.04em] text-balance sm:text-5xl">
              {title}
            </h1>
            <p className="max-w-3xl text-base leading-7 text-[color:var(--command-surface-muted)] sm:text-[1.05rem]">
              {description}
            </p>
          </div>
          <div className="rounded-[1.6rem] border border-white/10 bg-black/[0.18] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] sm:p-5">
            <form action={action} className="grid gap-4">
              {status === "created" ? (
                <Alert className="border-white/10 bg-white/[0.08] text-[color:var(--command-surface-foreground)]">
                  <AlertTitle>{successTitle}</AlertTitle>
                  <AlertDescription>{successDescription}</AlertDescription>
                </Alert>
              ) : null}
              {status === "error" ? (
                <Alert
                  className="border-destructive/30 bg-destructive/10 text-[color:var(--command-surface-foreground)]"
                  variant="destructive"
                >
                  <AlertTitle>{resolvedErrorTitle}</AlertTitle>
                  <AlertDescription>{resolvedErrorDescription}</AlertDescription>
                </Alert>
              ) : null}
              <div className="space-y-1">
                <h2 className="text-lg font-semibold">{inputTitle}</h2>
                <p className="text-sm text-[color:var(--command-surface-muted)]">
                  {inputDescription}
                </p>
              </div>
              <Textarea
                className="min-h-32 border-white/10 bg-white/[0.06] text-[color:var(--command-surface-foreground)] placeholder:text-[color:var(--command-surface-muted)] focus-visible:border-white/20 focus-visible:ring-white/10"
                name="prompt"
                onChange={(event) => setPrompt(event.target.value)}
                placeholder={promptPlaceholder}
                value={prompt}
              />
              <div className="flex flex-wrap items-center gap-2">
                {quickActions.map((quickAction) => (
                  <Button
                    className="border-white/10 bg-white/[0.08] text-[color:var(--command-surface-foreground)] hover:bg-white/[0.12]"
                    key={quickAction.id}
                    onClick={() => setPrompt(quickAction.prompt)}
                    size="sm"
                    type="button"
                    variant="outline"
                  >
                    {quickAction.label}
                  </Button>
                ))}
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-[color:var(--command-surface-muted)]">
                  {promptHelper}
                </p>
                <SubmitButton label={submitLabel} />
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
        {stats.map((stat, index) => {
          const Icon = statIcons[index] ?? BotIcon;

          return (
            <div
              key={stat.label}
              className="relative overflow-hidden rounded-[1.5rem] border border-border/70 bg-card/[0.92] p-5 shadow-[0_18px_48px_rgba(23,28,38,0.08)]"
            >
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                    {stat.label}
                  </p>
                  <p className="font-display text-4xl leading-none tracking-[-0.05em] text-foreground">
                    {stat.value}
                  </p>
                </div>
                <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Icon className="size-5" />
                </div>
              </div>
              <p className="mt-4 text-sm leading-6 text-muted-foreground">
                {stat.detail}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
