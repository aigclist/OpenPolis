import { getTranslations } from "next-intl/server";

import { RouteLoadingState } from "@/components/shared/route-loading-state";

export default async function LocaleLoading() {
  const t = await getTranslations("routeState.loading.global");

  return (
    <RouteLoadingState
      description={t("description")}
      title={t("title")}
    />
  );
}
