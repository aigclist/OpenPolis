import { getTranslations } from "next-intl/server";

import { RouteLoadingState } from "@/components/shared/route-loading-state";

export default async function DocsLoading() {
  const t = await getTranslations("routeState.loading.docs");

  return (
    <RouteLoadingState
      description={t("description")}
      title={t("title")}
    />
  );
}
