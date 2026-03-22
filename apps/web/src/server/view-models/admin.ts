import { getTranslations } from "next-intl/server";

import { getServerWorkspaceReadService } from "../workspace/read-service";

export async function getAdminViewModel(locale: string) {
  const readServicePromise = getServerWorkspaceReadService();
  const [tModules, tAdmin, snapshot] = await Promise.all([
    getTranslations({ locale, namespace: "modules" }),
    getTranslations({ locale, namespace: "admin" }),
    readServicePromise.then((service) => service.getAdminSnapshot())
  ]);

  return {
    eyebrow: tModules("admin.eyebrow"),
    title: tModules("admin.title"),
    description: tModules("admin.description"),
    summaryCards: [
      { label: tAdmin("cards.roles"), value: String(snapshot.roles) },
      { label: tAdmin("cards.audit"), value: String(snapshot.audit) },
      { label: tAdmin("cards.sensitive"), value: String(snapshot.sensitive) }
    ]
  };
}
