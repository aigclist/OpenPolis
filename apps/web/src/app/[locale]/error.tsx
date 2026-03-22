"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";

import { RouteErrorState } from "@/components/shared/route-error-state";

type LocaleErrorProps = {
  error: Error & {
    digest?: string;
  };
  reset: () => void;
};

export default function LocaleError({ error, reset }: LocaleErrorProps) {
  const t = useTranslations("routeState.error.global");

  useEffect(() => {
    console.error("[locale-route-error]", error);
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
