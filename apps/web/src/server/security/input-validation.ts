import type { PaginationParams } from "@openpolis/application";
import { EntityCodeSchema, SummarySchema, TitleSchema } from "@openpolis/contracts";
import { z } from "zod";

function trimStringInput(value: unknown) {
  return typeof value === "string" ? value.trim() : value;
}

function normalizeCodeInput(value: unknown) {
  if (typeof value !== "string") {
    return value;
  }

  const normalized = value.trim().toLowerCase();
  return normalized.length > 0 ? normalized : undefined;
}

export const RequiredTitleInputSchema = z.preprocess(
  trimStringInput,
  TitleSchema
);

export const RequiredSummaryInputSchema = z.preprocess(
  trimStringInput,
  SummarySchema
);

export const RequiredEntityCodeInputSchema = z.preprocess(
  normalizeCodeInput,
  EntityCodeSchema
);

export const OptionalEntityCodeInputSchema = z.preprocess(
  normalizeCodeInput,
  EntityCodeSchema.optional()
);

export function parseOptionalEntityCode(value: string | null | undefined) {
  const parsed = OptionalEntityCodeInputSchema.safeParse(value);
  return parsed.success ? parsed.data : undefined;
}

function parseOptionalPositiveInteger(
  value: string | null | undefined,
  options?: {
    max?: number;
  }
) {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();

  if (trimmed.length === 0 || !/^\d+$/.test(trimmed)) {
    return undefined;
  }

  const parsed = Number.parseInt(trimmed, 10);

  if (!Number.isSafeInteger(parsed) || parsed < 1) {
    return undefined;
  }

  return options?.max ? Math.min(options.max, parsed) : parsed;
}

export function parsePaginationParams(
  pageValue: string | null | undefined,
  pageSizeValue: string | null | undefined
): PaginationParams | undefined {
  const page = parseOptionalPositiveInteger(pageValue);
  const pageSize = parseOptionalPositiveInteger(pageSizeValue, { max: 200 });

  if (page === undefined && pageSize === undefined) {
    return undefined;
  }

  return {
    page: page ?? 1,
    pageSize: pageSize ?? 50
  };
}
