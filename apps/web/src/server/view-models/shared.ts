import { getTranslations } from "next-intl/server";
import type { ModuleSnapshot } from "@openpolis/application";
import type { ModuleId } from "@openpolis/ui/namespaces";

import type { PaginationControlsProps } from "@/components/shared/pagination-controls";

export const recordCollectionMap = {
  issues: "issues",
  assets: "assets",
  briefs: "briefs",
  operations: "tasks",
  network: "regions",
  calendar: "events",
  feedback: "feedback",
  review: "reviews",
  reports: "reports"
} as const;

export const referenceCollectionMap = {
  issue: "issues",
  asset: "assets",
  brief: "briefs",
  task: "tasks",
  feedback: "feedback",
  approval: "reviews",
  region: "regions"
} as const;

export type ReferenceType = keyof typeof referenceCollectionMap;
export type CoreRouteModuleId = Exclude<ModuleId, "dashboard">;
export type PaginationViewModel = PaginationControlsProps;
export type ServerTranslations = Awaited<ReturnType<typeof getTranslations>>;

export const referenceModuleMap = {
  issue: "issues",
  asset: "assets",
  brief: "briefs",
  task: "operations",
  feedback: "feedback",
  approval: "review",
  region: "network"
} as const satisfies Record<ReferenceType, CoreRouteModuleId>;

function normalizeIdentifier(value: string) {
  return value.replace(
    /^(team|region|issue|asset|brief|task|feedback|approval)_/,
    ""
  );
}

export function humanizeCode(value: string) {
  return normalizeIdentifier(value)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (segment) => segment.toUpperCase());
}

export function formatDate(locale: string, value: string) {
  return new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric"
  }).format(new Date(value));
}

export function getModuleBasePath(locale: string, moduleId: CoreRouteModuleId) {
  return `/${locale}/${moduleId}`;
}

export function getRecordSelectionHref(
  basePath: string,
  code: string,
  pagination?: ModuleSnapshot["pagination"]
) {
  const searchParams = new URLSearchParams();
  searchParams.set("record", code);

  if (pagination?.page && pagination.page > 1) {
    searchParams.set("page", String(pagination.page));
  }

  if (pagination?.pageSize && pagination.pageSize !== 50) {
    searchParams.set("pageSize", String(pagination.pageSize));
  }

  return `${basePath}?${searchParams.toString()}`;
}

export function getRecordDetailHref(basePath: string, code: string) {
  return `${basePath}/${code}`;
}

export function createPaginationHref(
  basePath: string,
  page: number,
  pageSize: number
) {
  const searchParams = new URLSearchParams();

  if (page > 1) {
    searchParams.set("page", String(page));
  }

  if (pageSize !== 50) {
    searchParams.set("pageSize", String(pageSize));
  }

  const query = searchParams.toString();
  return query ? `${basePath}?${query}` : basePath;
}

export function createModuleQueryHref(
  locale: string,
  moduleId: CoreRouteModuleId,
  params: Record<string, string | undefined>
) {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value) {
      searchParams.set(key, value);
    }
  }

  const basePath = getModuleBasePath(locale, moduleId);
  const query = searchParams.toString();

  return query ? `${basePath}?${query}` : basePath;
}

function getRecordText(
  collection: string,
  code: string,
  field: "title" | "summary",
  tRecords: ServerTranslations
) {
  try {
    return tRecords(`${collection}.${code}.${field}`);
  } catch {
    return field === "title"
      ? humanizeCode(code)
      : `${humanizeCode(code)} (${code})`;
  }
}

export function getRecordTitle(
  collection: string,
  code: string,
  title: string | null,
  tRecords: ServerTranslations
) {
  return title ?? getRecordText(collection, code, "title", tRecords);
}

export function getRecordSummary(
  collection: string,
  code: string,
  summary: string | null,
  tRecords: ServerTranslations
) {
  return summary ?? getRecordText(collection, code, "summary", tRecords);
}

export function getCommonText(
  namespace: "source" | "sensitivity",
  key: string,
  tCommon: ServerTranslations
) {
  try {
    return tCommon(`${namespace}.${key}`);
  } catch {
    return humanizeCode(key);
  }
}

export function formatTeamName(value: string) {
  return humanizeCode(value);
}

export function formatReference(
  type: ReferenceType,
  code: string,
  tRecords: ServerTranslations
) {
  const collection = referenceCollectionMap[type];
  const title = getRecordText(collection, code, "title", tRecords);
  return `${title} (${code})`;
}

export function getReferenceDetailHref(
  locale: string,
  type: ReferenceType,
  code: string
) {
  const moduleId = referenceModuleMap[type];
  return getRecordDetailHref(getModuleBasePath(locale, moduleId), code);
}
