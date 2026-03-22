import type { ModuleSnapshot } from "@openpolis/application";

import type { PaginationViewModel, ServerTranslations } from "./shared";
import { createPaginationHref } from "./shared";

export function createSummaryCards(
  metrics: ModuleSnapshot["metrics"],
  tCommon: ServerTranslations
) {
  return metrics.map((metric) => ({
    label: tCommon(`status.${metric.key}`),
    value: String(metric.value)
  }));
}

export function createPaginationViewModel(
  basePath: string,
  pagination: NonNullable<ModuleSnapshot["pagination"]>,
  tPagination: ServerTranslations
): PaginationViewModel {
  return {
    summary: tPagination("page", {
      current: pagination.page,
      total: pagination.totalPages
    }),
    totalLabel: tPagination("totalItems", {
      count: pagination.totalCount
    }),
    previousLabel: tPagination("previous"),
    nextLabel: tPagination("next"),
    previousHref: pagination.hasPreviousPage
      ? createPaginationHref(basePath, pagination.page - 1, pagination.pageSize)
      : undefined,
    nextHref: pagination.hasNextPage
      ? createPaginationHref(basePath, pagination.page + 1, pagination.pageSize)
      : undefined
  };
}
