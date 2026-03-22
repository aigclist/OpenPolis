import type { ObjectRef } from "@openpolis/contracts";
import { eq } from "drizzle-orm";

import { getDrizzleDb } from "../client";
import { workflowObjects } from "../schema";
import { getDatabase } from "../workspace-bootstrap";

export function getStoredObject<TEntity>(objectId: string) {
  const row = getDrizzleDb()
    .select({ payload: workflowObjects.payload })
    .from(workflowObjects)
    .where(eq(workflowObjects.objectId, objectId))
    .get();

  if (!row) {
    return null;
  }

  return JSON.parse(row.payload) as TEntity;
}

export function createAudit(updatedAt: string) {
  return {
    createdAt: updatedAt,
    updatedAt
  };
}

export function createTitle(code: string, title: string | null) {
  if (title && title.length > 0) {
    return title;
  }

  return code
    .replace(/_/g, " ")
    .replace(/\b\w/g, (segment) => segment.toUpperCase());
}

export function createSummary(summary: string | null, fallback: string) {
  if (summary && summary.length > 0) {
    return summary;
  }

  return fallback;
}

export function getCodeCandidate(objectId: string, prefix: string) {
  const withSeparator = `${prefix}_`;
  return objectId.startsWith(withSeparator)
    ? objectId.slice(withSeparator.length)
    : objectId;
}

export function toReferenceId(value: string | null | undefined, prefix: string) {
  if (!value || value === "unlinked") {
    return undefined;
  }

  const withSeparator = `${prefix}_`;
  return value.startsWith(withSeparator) ? value : `${withSeparator}${value}`;
}

export function toReferenceCode(value: string | null | undefined, prefix: string) {
  if (!value) {
    return undefined;
  }

  const withSeparator = `${prefix}_`;
  return value.startsWith(withSeparator)
    ? value.slice(withSeparator.length)
    : value;
}

export function parseStringArray(value: string[] | string | null | undefined) {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string");
  }

  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}

export function createScope(
  teamIdsValue: string[] | string | null | undefined,
  regionIdsValue: string[] | string | null | undefined,
  fallbackTeamId: string,
  fallbackRegionId: string
) {
  const teamIds = parseStringArray(teamIdsValue);
  const regionIds = parseStringArray(regionIdsValue);

  return {
    teamIds: teamIds.length > 0 ? teamIds : [fallbackTeamId],
    regionIds: regionIds.length > 0 ? regionIds : [fallbackRegionId]
  };
}

export async function runInSqliteTransaction<T>(operation: () => Promise<T>) {
  const database = getDatabase();
  database.exec("BEGIN IMMEDIATE");

  try {
    const result = await operation();
    database.exec("COMMIT");
    return result;
  } catch (error) {
    database.exec("ROLLBACK");
    throw error;
  }
}

export function saveStoredObject(
  objectType: string,
  objectId: string,
  objectCode: string,
  payload: unknown,
  updatedAt: string
) {
  const payloadJson = JSON.stringify(payload);

  getDrizzleDb()
    .insert(workflowObjects)
    .values({
      objectId,
      objectType,
      objectCode,
      payload: payloadJson,
      updatedAt
    })
    .onConflictDoUpdate({
      target: workflowObjects.objectId,
      set: {
        objectType,
        objectCode,
        payload: payloadJson,
        updatedAt
      }
    })
    .run();
}

export function resolveApprovalSubject(
  row: {
    subjectType: string | null;
    subjectId: string | null;
    subjectCode: string | null;
    summary: string | null;
  },
  fallbackCode: string
) {
  const subjectType = (row.subjectType ?? "asset") as ObjectRef["objectType"];
  const subjectCode =
    row.subjectCode ??
    toReferenceCode(row.subjectId, subjectType) ??
    row.summary ??
    fallbackCode;
  const subjectId =
    row.subjectId ??
    (subjectType === "asset" ? `asset_${subjectCode}` : subjectCode);

  return {
    subjectType,
    subjectCode,
    subjectId
  };
}
