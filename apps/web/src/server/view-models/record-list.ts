import type {
  CoreModuleId,
  GenericRecordRow,
  ModuleSnapshot
} from "@openpolis/application";

import type { RecordListItem } from "@/components/shared/record-list-card";

import {
  formatDate,
  formatReference,
  formatTeamName,
  getCommonText,
  getRecordDetailHref,
  getRecordSelectionHref,
  getRecordSummary,
  getRecordTitle,
  getReferenceDetailHref,
  humanizeCode,
  type ReferenceType,
  recordCollectionMap,
  referenceCollectionMap,
  type ServerTranslations
} from "./shared";

export function createCoreRecordItem(
  locale: string,
  moduleId: CoreModuleId,
  row: GenericRecordRow,
  basePath: string,
  pagination: ModuleSnapshot["pagination"],
  selectedCode: string | undefined,
  actionLabel: string,
  tCommon: ServerTranslations,
  tRecords: ServerTranslations
): RecordListItem {
  const collection = recordCollectionMap[moduleId];
  const meta: RecordListItem["meta"] = [];

  meta.push(`${tCommon("labels.code")}: ${row.code}`);

  if (row.ownerTeam) {
    meta.push(
      `${tCommon(moduleId === "review" ? "labels.reviewer" : "labels.owner")}: ${formatTeamName(row.ownerTeam)}`
    );
  }

  if (row.assigneeTeam) {
    meta.push(
      `${tCommon("labels.assignee")}: ${formatTeamName(row.assigneeTeam)}`
    );
  }

  if (row.requestedByTeam) {
    meta.push(
      `${tCommon("labels.requestedBy")}: ${formatTeamName(row.requestedByTeam)}`
    );
  }

  if (row.updatedAt) {
    meta.push(`${tCommon("labels.updated")}: ${formatDate(locale, row.updatedAt)}`);
  }

  if (row.dueDate) {
    meta.push(`${tCommon("labels.due")}: ${formatDate(locale, row.dueDate)}`);
  }

  if (row.regionCode && moduleId !== "network") {
    meta.push({
      value: tRecords(`regions.${row.regionCode}.title`),
      href: getReferenceDetailHref(locale, "region", row.regionCode)
    });
  }

  if (row.issueCode) {
    meta.push({
      value: `${tCommon("labels.issue")}: ${formatReference("issue", row.issueCode, tRecords)}`,
      href: getReferenceDetailHref(locale, "issue", row.issueCode)
    });
  }

  if (row.briefCode) {
    meta.push({
      value: `${tCommon("labels.brief")}: ${formatReference("brief", row.briefCode, tRecords)}`,
      href: getReferenceDetailHref(locale, "brief", row.briefCode)
    });
  }

  if (row.taskCode) {
    meta.push({
      value: `${tCommon("labels.task")}: ${formatReference("task", row.taskCode, tRecords)}`,
      href: getReferenceDetailHref(locale, "task", row.taskCode)
    });
  }

  if (row.approvalCode) {
    meta.push({
      value: `${tCommon("labels.review")}: ${formatReference("approval", row.approvalCode, tRecords)}`,
      href: getReferenceDetailHref(locale, "approval", row.approvalCode)
    });
  }

  if (row.subjectCode && row.subjectType) {
    const referenceType =
      row.subjectType in referenceCollectionMap
        ? (row.subjectType as ReferenceType)
        : "asset";
    meta.push({
      value: `${tCommon("labels.subject")}: ${formatReference(referenceType, row.subjectCode, tRecords)}`,
      href: getReferenceDetailHref(locale, referenceType, row.subjectCode)
    });
  }

  if (row.kind) {
    meta.push(`${tCommon("labels.kind")}: ${humanizeCode(row.kind)}`);
  }

  if (row.source) {
    meta.push(
      `${tCommon("labels.source")}: ${getCommonText("source", row.source, tCommon)}`
    );
  }

  if (row.locale) {
    meta.push(`${tCommon("labels.locale")}: ${row.locale}`);
  }

  if (row.sensitivity) {
    meta.push(
      `${tCommon("labels.sensitivity")}: ${getCommonText("sensitivity", row.sensitivity, tCommon)}`
    );
  }

  if (row.scope) {
    const scopeValue =
      moduleId === "network"
        ? `${Math.round(Number(row.scope) * 100)}%`
        : humanizeCode(row.scope);
    meta.push(`${tCommon("labels.scope")}: ${scopeValue}`);
  }

  return {
    id: row.code,
    title: getRecordTitle(collection, row.code, row.title, tRecords),
    summary: getRecordSummary(collection, row.code, row.summary, tRecords),
    badges: [
      tCommon(`status.${row.status}`),
      ...(row.priority ? [tCommon(`priority.${row.priority}`)] : [])
    ],
    meta,
    selectHref: getRecordSelectionHref(basePath, row.code, pagination),
    href: getRecordDetailHref(basePath, row.code),
    actionLabel,
    selected: row.code === selectedCode
  };
}

export function createRecordOptionLabel(
  moduleId: CoreModuleId,
  row: GenericRecordRow,
  tRecords: ServerTranslations
) {
  const collection = recordCollectionMap[moduleId];
  const title = getRecordTitle(collection, row.code, row.title, tRecords);
  return `${title} (${row.code})`;
}
