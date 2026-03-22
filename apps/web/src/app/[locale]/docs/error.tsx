"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";

import { RouteErrorState } from "@/components/shared/route-error-state";

type DocsErrorProps = {
  error: Error & {
    digest?: string;
  };
  reset: () => void;
};

export default function DocsError({ error, reset }: DocsErrorProps) {
  const t = useTranslations("routeState.error.docs");

  useEffect(() => {
    console.error("[docs-route-error]", error);
  }, [error]);

  return (
    <RouteErrorState
      description={t("description")}
      detailsLabel={t("details")}
      error={error}
      onRetry={reset}
      retryLabel={t("retry")}
      title={t("title")}
    />
  );
}
