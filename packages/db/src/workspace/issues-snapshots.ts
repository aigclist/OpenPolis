import type {
  GenericRecordRow,
  ModuleSnapshot,
  PaginationParams
} from "@openpolis/application";
import type { ActorRef } from "@openpolis/contracts";

import {
  all,
  allWithParameters,
  buildActorFilter,
  buildPaginationClause,
  buildPaginationMetadata,
  count,
  countScopedRecords,
  countScopedRecordsByStatus,
  toWhereClause
} from "../workspace-read-utils";

export function createIssuesSnapshot(
  pagination?: PaginationParams
): ModuleSnapshot {
  const totalCount = count("SELECT COUNT(*) as count FROM issues");

  return {
    metrics: [
      { key: "active", value: count("SELECT COUNT(*) as count FROM issues WHERE status = 'active'") },
      { key: "monitoring", value: count("SELECT COUNT(*) as count FROM issues WHERE status = 'monitoring'") },
      { key: "response_needed", value: count("SELECT COUNT(*) as count FROM issues WHERE status = 'response_needed'") }
    ],
    records: all<GenericRecordRow>(`
      SELECT
        code,
        title,
        summary,
        status,
        priority,
        owner_team AS ownerTeam,
        NULL AS assigneeTeam,
        NULL AS requestedByTeam,
        NULL AS dueDate,
        updated_at AS updatedAt,
        region_code AS regionCode,
        kind,
        NULL AS scope,
        NULL AS issueCode,
        NULL AS briefCode,
        NULL AS taskCode,
        NULL AS approvalCode,
        NULL AS subjectCode,
        NULL AS subjectType,
        NULL AS source,
        NULL AS locale,
        sensitivity
      FROM issues
      ORDER BY updated_at DESC
      ${buildPaginationClause(pagination)}
    `),
    pagination: buildPaginationMetadata(totalCount, pagination)
  };
}

export function createActorScopedIssuesSnapshot(
  actor: ActorRef,
  pagination?: PaginationParams
): ModuleSnapshot {
  const actorFilter = buildActorFilter("issues", actor);
  const whereClause = toWhereClause(actorFilter);
  const whereParameters = actorFilter?.parameters ?? [];

  return {
    metrics: [
      {
        key: "active",
        value: countScopedRecordsByStatus("issues", actorFilter, "active")
      },
      {
        key: "monitoring",
        value: countScopedRecordsByStatus("issues", actorFilter, "monitoring")
      },
      {
        key: "response_needed",
        value: countScopedRecordsByStatus(
          "issues",
          actorFilter,
          "response_needed"
        )
      }
    ],
    records: allWithParameters<GenericRecordRow>(
      `
        SELECT
          code,
          title,
          summary,
          status,
          priority,
          owner_team AS ownerTeam,
          NULL AS assigneeTeam,
          NULL AS requestedByTeam,
          NULL AS dueDate,
          updated_at AS updatedAt,
          region_code AS regionCode,
          kind,
          NULL AS scope,
          NULL AS issueCode,
          NULL AS briefCode,
          NULL AS taskCode,
          NULL AS approvalCode,
          NULL AS subjectCode,
          NULL AS subjectType,
          NULL AS source,
          NULL AS locale,
          sensitivity
        FROM issues${whereClause}
        ORDER BY updated_at DESC
        ${buildPaginationClause(pagination)}
      `,
      whereParameters
    ),
    pagination: buildPaginationMetadata(
      countScopedRecords("issues", actorFilter),
      pagination
    )
  };
}
