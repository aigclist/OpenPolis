import { getTranslations } from "next-intl/server";

import { RouteLoadingState } from "@/components/shared/route-loading-state";

export default async function AppLoading() {
  const t = await getTranslations("routeState.loading.app");

  return (
    <RouteLoadingState
      description={t("description")}
      title={t("title")}
    />
  );
}
