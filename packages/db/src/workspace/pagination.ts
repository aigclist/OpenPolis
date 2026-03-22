import type { PaginationMetadata, PaginationParams } from "@openpolis/application";

function normalizePaginationParams(pagination?: PaginationParams) {
  if (!pagination) {
    return undefined;
  }

  const page = Number.isInteger(pagination.page) && (pagination.page ?? 0) > 0
    ? (pagination.page as number)
    : 1;
  const pageSize =
    Number.isInteger(pagination.pageSize) && (pagination.pageSize ?? 0) > 0
      ? Math.min(200, pagination.pageSize as number)
      : 50;

  return {
    page,
    pageSize,
    offset: (page - 1) * pageSize
  };
}

export function buildPaginationClause(pagination?: PaginationParams) {
  const normalized = normalizePaginationParams(pagination);

  if (!normalized) {
    return "";
  }

  return `\nLIMIT ${normalized.pageSize}\nOFFSET ${normalized.offset}`;
}

export function buildPaginationMetadata(
  totalCount: number,
  pagination?: PaginationParams
): PaginationMetadata | undefined {
  const normalized = normalizePaginationParams(pagination);

  if (!normalized) {
    return undefined;
  }

  const totalPages = Math.max(1, Math.ceil(totalCount / normalized.pageSize));

  return {
    page: normalized.page,
    pageSize: normalized.pageSize,
    totalCount,
    totalPages,
    hasNextPage: normalized.page < totalPages,
    hasPreviousPage: normalized.page > 1
  };
}
