import type {
  CoreModuleId,
  GenericRecordRow
} from "@openpolis/application";

import type {
  RecordDetailItem,
  RecordDetailSection
} from "@/components/shared/record-detail-card";

import {
  formatDate,
  formatReference,
  formatTeamName,
  getCommonText,
  getRecordSummary,
  getRecordTitle,
  getReferenceDetailHref,
  humanizeCode,
  type ReferenceType,
  recordCollectionMap,
  referenceCollectionMap,
  type ServerTranslations
} from "./shared";

function createDetailSections(
  locale: string,
  moduleId: CoreModuleId,
  row: GenericRecordRow,
  tCommon: ServerTranslations,
  tRecords: ServerTranslations,
  tDetail: ServerTranslations
) {
  const sections: RecordDetailSection[] = [];
  const timingFields: RecordDetailSection["fields"] = [];
  const coordinationFields: RecordDetailSection["fields"] = [];
  const linksFields: RecordDetailSection["fields"] = [];
  const governanceFields: RecordDetailSection["fields"] = [];

  timingFields.push({
    label: tCommon("labels.code"),
    value: row.code
  });

  if (row.updatedAt) {
    timingFields.push({
      label: tCommon("labels.updated"),
      value: formatDate(locale, row.updatedAt)
    });
  }

  if (row.dueDate) {
    timingFields.push({
      label: tCommon("labels.due"),
      value: formatDate(locale, row.dueDate)
    });
  }

  if (row.ownerTeam) {
    coordinationFields.push({
      label: tCommon(moduleId === "review" ? "labels.reviewer" : "labels.owner"),
      value: formatTeamName(row.ownerTeam)
    });
  }

  if (row.assigneeTeam) {
    coordinationFields.push({
      label: tCommon("labels.assignee"),
      value: formatTeamName(row.assigneeTeam)
    });
  }

  if (row.requestedByTeam) {
    coordinationFields.push({
      label: tCommon("labels.requestedBy"),
      value: formatTeamName(row.requestedByTeam)
    });
  }

  if (row.regionCode && moduleId !== "network") {
    coordinationFields.push({
      label: tCommon("labels.scope"),
      value: getRecordTitle("regions", row.regionCode, null, tRecords),
      href: getReferenceDetailHref(locale, "region", row.regionCode)
    });
  }

  if (row.issueCode) {
    linksFields.push({
      label: tCommon("labels.issue"),
      value: formatReference("issue", row.issueCode, tRecords),
      href: getReferenceDetailHref(locale, "issue", row.issueCode)
    });
  }

  if (row.briefCode) {
    linksFields.push({
      label: tCommon("labels.brief"),
      value: formatReference("brief", row.briefCode, tRecords),
      href: getReferenceDetailHref(locale, "brief", row.briefCode)
    });
  }

  if (row.taskCode) {
    linksFields.push({
      label: tCommon("labels.task"),
      value: formatReference("task", row.taskCode, tRecords),
      href: getReferenceDetailHref(locale, "task", row.taskCode)
    });
  }

  if (row.approvalCode) {
    linksFields.push({
      label: tCommon("labels.review"),
      value: formatReference("approval", row.approvalCode, tRecords),
      href: getReferenceDetailHref(locale, "approval", row.approvalCode)
    });
  }

  if (row.subjectCode && row.subjectType) {
    const referenceType =
      row.subjectType in referenceCollectionMap
        ? (row.subjectType as ReferenceType)
        : "asset";
    linksFields.push({
      label: tCommon("labels.subject"),
      value: formatReference(referenceType, row.subjectCode, tRecords),
      href: getReferenceDetailHref(locale, referenceType, row.subjectCode)
    });
  }

  if (row.kind) {
    governanceFields.push({
      label: tCommon("labels.kind"),
      value: humanizeCode(row.kind)
    });
  }

  if (row.source) {
    governanceFields.push({
      label: tCommon("labels.source"),
      value: getCommonText("source", row.source, tCommon)
    });
  }

  if (row.locale) {
    governanceFields.push({
      label: tCommon("labels.locale"),
      value: row.locale
    });
  }

  if (row.sensitivity) {
    governanceFields.push({
      label: tCommon("labels.sensitivity"),
      value: getCommonText("sensitivity", row.sensitivity, tCommon)
    });
  }

  if (timingFields.length > 0) {
    sections.push({
      id: "timing",
      title: tDetail("sections.timing"),
      fields: timingFields
    });
  }

  if (coordinationFields.length > 0) {
    sections.push({
      id: "coordination",
      title: tDetail("sections.coordination"),
      fields: coordinationFields
    });
  }

  if (linksFields.length > 0) {
    sections.push({
      id: "links",
      title: tDetail("sections.links"),
      fields: linksFields
    });
  }

  if (governanceFields.length > 0) {
    sections.push({
      id: "governance",
      title: tDetail("sections.governance"),
      fields: governanceFields
    });
  }

  return sections;
}

export function createRecordDetailItem(
  locale: string,
  moduleId: CoreModuleId,
  row: GenericRecordRow,
  tCommon: ServerTranslations,
  tRecords: ServerTranslations,
  tDetail: ServerTranslations
): RecordDetailItem {
  const collection = recordCollectionMap[moduleId];

  return {
    title: getRecordTitle(collection, row.code, row.title, tRecords),
    summary: getRecordSummary(collection, row.code, row.summary, tRecords),
    description: tDetail("description"),
    badges: [
      tCommon(`status.${row.status}`),
      ...(row.priority ? [tCommon(`priority.${row.priority}`)] : [])
    ],
    sections: createDetailSections(
      locale,
      moduleId,
      row,
      tCommon,
      tRecords,
      tDetail
    )
  };
}
