import { getTranslations } from "next-intl/server";

import { getServerWorkspaceReadService } from "../workspace/read-service";

export async function getSettingsViewModel(locale: string) {
  const readServicePromise = getServerWorkspaceReadService();
  const [tModules, tSettings, snapshot] = await Promise.all([
    getTranslations({ locale, namespace: "modules" }),
    getTranslations({ locale, namespace: "settings" }),
    readServicePromise.then((service) => service.getSettingsSnapshot())
  ]);

  return {
    eyebrow: tModules("settings.eyebrow"),
    title: tModules("settings.title"),
    description: tModules("settings.description"),
    summaryCards: [
      { label: tSettings("cards.locales"), value: String(snapshot.locales) },
      { label: tSettings("cards.retention"), value: `${snapshot.retention}` },
      { label: tSettings("cards.exports"), value: String(snapshot.exports) }
    ]
  };
}
