import { getTranslations } from "next-intl/server";
import type { CoreModuleId, PaginationParams } from "@openpolis/application";

import { parseOptionalEntityCode } from "../security/input-validation";
import { getServerWorkspaceReadService } from "../workspace/read-service";

import {
  createRecordActionItems,
} from "./record-actions";
import { createRecordDetailItem } from "./record-detail";
import {
  createCoreRecordItem,
  createRecordOptionLabel
} from "./record-list";
import {
  createPaginationViewModel,
  createSummaryCards
} from "./record-summary";
import {
  getModuleBasePath,
  getRecordSummary,
  getRecordTitle,
  type CoreRouteModuleId,
  recordCollectionMap
} from "./shared";

export async function getCoreModuleViewModel(
  locale: string,
  moduleId: CoreRouteModuleId,
  options?: {
    recordCode?: string;
    basePath?: string;
    pagination?: PaginationParams;
  }
) {
  const readServicePromise = getServerWorkspaceReadService();
  const [tModules, tCommon, tRecords, tDetail, tPagination, snapshot] =
    await Promise.all([
      getTranslations({ locale, namespace: "modules" }),
      getTranslations({ locale, namespace: "common" }),
      getTranslations({ locale, namespace: "records" }),
      getTranslations({ locale, namespace: "recordDetail" }),
      getTranslations({ locale, namespace: "pagination" }),
      readServicePromise.then((service) =>
        service.getCoreModuleSnapshot(moduleId, options?.pagination)
      )
    ]);
  const selectedRecordCode = parseOptionalEntityCode(options?.recordCode);
  const selectedRecord =
    snapshot.records.find((row) => row.code === selectedRecordCode) ??
    snapshot.records[0];
  const basePath = options?.basePath ?? getModuleBasePath(locale, moduleId);

  return {
    eyebrow: tModules(`${moduleId}.eyebrow`),
    title: tModules(`${moduleId}.title`),
    description: tModules(`${moduleId}.description`),
    sectionTitle: tModules(`${moduleId}.title`),
    sectionDescription: tModules(`${moduleId}.description`),
    detailTitle: selectedRecord ? tDetail("title") : undefined,
    detailDescription: selectedRecord ? tDetail("description") : undefined,
    detailItem: selectedRecord
      ? createRecordDetailItem(
          locale,
          moduleId,
          selectedRecord,
          tCommon,
          tRecords,
          tDetail
        )
      : undefined,
    summaryCards: createSummaryCards(snapshot.metrics, tCommon),
    pagination: snapshot.pagination
      ? createPaginationViewModel(basePath, snapshot.pagination, tPagination)
      : undefined,
    items: snapshot.records.map((row) =>
      createCoreRecordItem(
        locale,
        moduleId,
        row,
        basePath,
        snapshot.pagination,
        selectedRecord?.code,
        tCommon("actions.open"),
        tCommon,
        tRecords
      )
    )
  };
}

export async function getCoreRecordDetailViewModel(
  locale: string,
  moduleId: CoreRouteModuleId,
  recordCode: string
) {
  const normalizedRecordCode = parseOptionalEntityCode(recordCode);

  if (!normalizedRecordCode) {
    return null;
  }

  const readServicePromise = getServerWorkspaceReadService();
  const [tModules, tCommon, tRecords, tDetail, tActions, snapshot] =
    await Promise.all([
      getTranslations({ locale, namespace: "modules" }),
      getTranslations({ locale, namespace: "common" }),
      getTranslations({ locale, namespace: "records" }),
      getTranslations({ locale, namespace: "recordDetail" }),
      getTranslations({ locale, namespace: "recordActions" }),
      readServicePromise.then((service) => service.getCoreModuleSnapshot(moduleId))
    ]);
  const selectedRecord = snapshot.records.find(
    (row) => row.code === normalizedRecordCode
  );

  if (!selectedRecord) {
    return null;
  }

  const collection = recordCollectionMap[moduleId];
  const basePath = getModuleBasePath(locale, moduleId);
  const actionItems = createRecordActionItems(
    locale,
    moduleId,
    selectedRecord,
    tRecords,
    tActions
  );

  return {
    eyebrow: tModules(`${moduleId}.eyebrow`),
    moduleTitle: tModules(`${moduleId}.title`),
    title: getRecordTitle(
      collection,
      selectedRecord.code,
      selectedRecord.title,
      tRecords
    ),
    description: getRecordSummary(
      collection,
      selectedRecord.code,
      selectedRecord.summary,
      tRecords
    ),
    moduleHref: basePath,
    detailTitle: tDetail("title"),
    detailDescription: tDetail("description"),
    actionCard:
      actionItems.length > 0
        ? {
            title: tActions("title"),
            description: tActions("description"),
            actions: actionItems
          }
        : undefined,
    detailItem: createRecordDetailItem(
      locale,
      moduleId,
      selectedRecord,
      tCommon,
      tRecords,
      tDetail
    )
  };
}

export async function getModuleCommandOptions(
  locale: string,
  moduleId: CoreModuleId
) {
  const readServicePromise = getServerWorkspaceReadService();
  const [tRecords, snapshot] = await Promise.all([
    getTranslations({ locale, namespace: "records" }),
    readServicePromise.then((service) => service.getCoreModuleSnapshot(moduleId))
  ]);

  return snapshot.records.map((row) => ({
    value: row.code,
    label: createRecordOptionLabel(moduleId, row, tRecords)
  }));
}
