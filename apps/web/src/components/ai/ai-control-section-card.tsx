import type { ReactNode } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { getUiNamespace } from "@openpolis/ui/namespaces";

type AiControlSectionCardProps = {
  title: string;
  description: string;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  tone?: "default" | "command";
  slot: string;
};

export function AiControlSectionCard({
  title,
  description,
  children,
  className,
  contentClassName,
  tone = "default",
  slot
}: AiControlSectionCardProps) {
  return (
    <Card
      className={cn(
        "overflow-hidden border-border/70 shadow-[0_18px_48px_rgba(23,28,38,0.08)]",
        tone === "default"
          ? "bg-card/[0.92]"
          : "command-surface border-[color:var(--command-surface-border)] text-[color:var(--command-surface-foreground)]",
        className
      )}
      data-ui={getUiNamespace("agent", slot)}
    >
      <CardHeader className={cn(tone === "command" ? "border-white/10" : "border-border/70", "border-b")}>
        <CardTitle className={cn(tone === "command" ? "text-[color:var(--command-surface-foreground)]" : "")}>
          {title}
        </CardTitle>
        <CardDescription
          className={cn(
            tone === "command"
              ? "text-[color:var(--command-surface-muted)]"
              : "text-muted-foreground"
          )}
        >
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className={cn("p-4 sm:p-5", contentClassName)}>
        {children}
      </CardContent>
    </Card>
  );
}
