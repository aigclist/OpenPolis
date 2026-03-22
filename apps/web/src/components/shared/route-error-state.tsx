"use client";

import { AlertTriangleIcon, RotateCcwIcon } from "lucide-react";
import { getUiNamespace } from "@openpolis/ui/namespaces";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";

type RouteErrorStateProps = {
  description: string;
  detailsLabel: string;
  error?: Error & {
    digest?: string;
  };
  retryLabel: string;
  title: string;
  onRetry: () => void;
};

export function RouteErrorState({
  description,
  detailsLabel,
  error,
  retryLabel,
  title,
  onRetry
}: RouteErrorStateProps) {
  const errorDetails = error?.digest ?? error?.message;

  return (
    <Card
      className="border-border/70 bg-card/90 shadow-sm"
      data-ui={getUiNamespace("module", "route-error-state")}
    >
      <CardHeader className="gap-4">
        <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertTriangleIcon className="size-5" />
        </div>
        <div className="space-y-2">
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div>
          <Button onClick={onRetry} type="button" variant="outline">
            <RotateCcwIcon className="mr-1 size-4" />
            {retryLabel}
          </Button>
        </div>
        {errorDetails ? (
          <details className="rounded-lg border border-border/70 bg-muted/30 px-4 py-3 text-sm">
            <summary className="cursor-pointer font-medium">
              {detailsLabel}
            </summary>
            <pre className="mt-3 overflow-x-auto whitespace-pre-wrap break-words font-mono text-xs text-muted-foreground">
              {errorDetails}
            </pre>
          </details>
        ) : null}
      </CardContent>
    </Card>
  );
}
