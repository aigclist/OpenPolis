"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";

import { RouteErrorState } from "@/components/shared/route-error-state";

type AppErrorProps = {
  error: Error & {
    digest?: string;
  };
  reset: () => void;
};

export default function AppError({ error, reset }: AppErrorProps) {
  const t = useTranslations("routeState.error.app");

  useEffect(() => {
    console.error("[app-route-error]", error);
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
