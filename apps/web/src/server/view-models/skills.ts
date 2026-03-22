import { getTranslations } from "next-intl/server";

import { getServerWorkspaceReadService } from "../workspace/read-service";

import {
  formatDate,
  getRecordSummary,
  getRecordTitle,
  humanizeCode
} from "./shared";

export async function getSkillViewModel(locale: string) {
  const readServicePromise = getServerWorkspaceReadService();
  const [tModules, tCommon, tRecords, snapshot] = await Promise.all([
    getTranslations({ locale, namespace: "modules" }),
    getTranslations({ locale, namespace: "common" }),
    getTranslations({ locale, namespace: "records" }),
    readServicePromise.then((service) => service.getSkillProviderSnapshot())
  ]);

  const metrics = [
    {
      label: tCommon("status.enabled"),
      value: String(
        snapshot.skills.filter((skill) => skill.status === "enabled").length
      )
    },
    {
      label: tCommon("status.ready"),
      value: String(
        snapshot.skills.filter((skill) => skill.status === "ready").length
      )
    },
    {
      label: tCommon("status.configured"),
      value: String(snapshot.providers.length)
    }
  ];

  const items = snapshot.skills.map((row) => ({
    id: row.code,
    title: getRecordTitle("skills", row.code, row.title, tRecords),
    summary: getRecordSummary("skills", row.code, row.summary, tRecords),
    badges: [tCommon(`status.${row.status}`)],
    meta: [
      `${tCommon("labels.code")}: ${row.code}`,
      row.updatedAt
        ? `${tCommon("labels.updated")}: ${formatDate(locale, row.updatedAt)}`
        : "",
      row.scope ? `${tCommon("labels.scope")}: ${humanizeCode(row.scope)}` : ""
    ].filter(Boolean)
  }));

  return {
    eyebrow: tModules("skills.eyebrow"),
    title: tModules("skills.title"),
    description: tModules("skills.description"),
    sectionTitle: tModules("skills.title"),
    sectionDescription: tModules("skills.description"),
    summaryCards: metrics,
    items
  };
}
