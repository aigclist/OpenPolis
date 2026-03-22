import { getTranslations } from "next-intl/server";

import { getServerWorkspaceReadService } from "../workspace/read-service";

import {
  formatDate,
  getRecordSummary,
  getRecordTitle,
  getReferenceDetailHref
} from "./shared";

export async function getDashboardViewModel(locale: string) {
  const readServicePromise = getServerWorkspaceReadService();
  const [tDashboard, tCommon, tRecords, tShell, snapshot] = await Promise.all([
    getTranslations({ locale, namespace: "dashboard" }),
    getTranslations({ locale, namespace: "common" }),
    getTranslations({ locale, namespace: "records" }),
    getTranslations({ locale, namespace: "shell" }),
    readServicePromise.then((service) => service.getDashboardSnapshot())
  ]);

  return {
    eyebrow: tShell("header.eyebrow"),
    title: tDashboard("title"),
    description: tDashboard("description"),
    heroBadges: [tShell("header.deployment"), tShell("header.governance")],
    metrics: [
      {
        key: "openTasks",
        label: tDashboard("metrics.openTasks"),
        value: String(snapshot.metrics.openTasks)
      },
      {
        key: "inReview",
        label: tDashboard("metrics.inReview"),
        value: String(snapshot.metrics.inReview)
      },
      {
        key: "blocked",
        label: tDashboard("metrics.blocked"),
        value: String(snapshot.metrics.blocked)
      },
      {
        key: "urgentFeedback",
        label: tDashboard("metrics.urgentFeedback"),
        value: String(snapshot.metrics.urgentFeedback)
      }
    ],
    priorities: {
      title: tDashboard("panels.priorities.title"),
      description: tDashboard("panels.priorities.description"),
      items: snapshot.priorities.map((row) => ({
        id: row.code,
        title: getRecordTitle("issues", row.code, row.title, tRecords),
        summary: getRecordSummary("issues", row.code, row.summary, tRecords),
        badges: [
          tCommon(`status.${row.status}`),
          tCommon(`priority.${row.priority}`)
        ],
        meta: [
          `${tCommon("labels.updated")}: ${formatDate(locale, row.updatedAt)}`,
          tRecords(`regions.${row.regionCode}.title`)
        ],
        selectHref: getReferenceDetailHref(locale, "issue", row.code),
        href: getReferenceDetailHref(locale, "issue", row.code),
        actionLabel: tCommon("actions.open")
      }))
    },
    regions: {
      title: tDashboard("panels.regions.title"),
      description: tDashboard("panels.regions.description"),
      items: snapshot.regions.map((row) => ({
        id: row.code,
        title: tRecords(`regions.${row.code}.title`),
        summary: tRecords(`regions.${row.code}.summary`),
        badges: [tCommon(`status.${row.status}`)],
        meta: [
          `${tCommon("labels.updated")}: ${formatDate(locale, row.updatedAt)}`,
          `${tCommon("labels.scope")}: ${Math.round(row.completionRate * 100)}%`,
          `${tCommon("labels.kind")}: ${String(row.blockedCount)}`
        ],
        selectHref: getReferenceDetailHref(locale, "region", row.code),
        href: getReferenceDetailHref(locale, "region", row.code),
        actionLabel: tCommon("actions.open")
      }))
    },
    feedback: {
      title: tDashboard("panels.feedback.title"),
      description: tDashboard("panels.feedback.description"),
      items: snapshot.feedback.map((row) => ({
        id: row.code,
        title: getRecordTitle("feedback", row.code, row.title, tRecords),
        summary: getRecordSummary("feedback", row.code, row.summary, tRecords),
        badges: [
          tCommon(`status.${row.status}`),
          ...(row.priority ? [tCommon(`priority.${row.priority}`)] : [])
        ],
        meta: [
          row.updatedAt
            ? `${tCommon("labels.updated")}: ${formatDate(locale, row.updatedAt)}`
            : "",
          row.regionCode ? tRecords(`regions.${row.regionCode}.title`) : ""
        ].filter(Boolean),
        selectHref: getReferenceDetailHref(locale, "feedback", row.code),
        href: getReferenceDetailHref(locale, "feedback", row.code),
        actionLabel: tCommon("actions.open")
      }))
    },
    reviews: {
      title: tDashboard("panels.review.title"),
      description: tDashboard("panels.review.description"),
      items: snapshot.reviews.map((row) => ({
        id: row.code,
        title: getRecordTitle("reviews", row.code, row.title, tRecords),
        summary: getRecordSummary("reviews", row.code, row.summary, tRecords),
        badges: [tCommon(`status.${row.status}`)],
        meta: row.dueDate
          ? [`${tCommon("labels.due")}: ${formatDate(locale, row.dueDate)}`]
          : [],
        selectHref: getReferenceDetailHref(locale, "approval", row.code),
        href: getReferenceDetailHref(locale, "approval", row.code),
        actionLabel: tCommon("actions.open")
      }))
    }
  };
}
