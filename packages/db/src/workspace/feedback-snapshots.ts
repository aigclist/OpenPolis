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

export function createFeedbackSnapshot(
  pagination?: PaginationParams
): ModuleSnapshot {
  const totalCount = count("SELECT COUNT(*) as count FROM feedback");

  return {
    metrics: [
      { key: "attention", value: count("SELECT COUNT(*) as count FROM feedback WHERE status = 'attention'") },
      { key: "active", value: count("SELECT COUNT(*) as count FROM feedback WHERE status = 'active'") },
      { key: "resolved", value: count("SELECT COUNT(*) as count FROM feedback WHERE status = 'resolved'") }
    ],
    records: all<GenericRecordRow>(`
      SELECT
        code,
        title,
        summary,
        status,
        severity AS priority,
        owner_team AS ownerTeam,
        NULL AS assigneeTeam,
        NULL AS requestedByTeam,
        NULL AS dueDate,
        updated_at AS updatedAt,
        region_code AS regionCode,
        NULL AS kind,
        NULL AS scope,
        CASE
          WHEN issue_id LIKE 'issue_%' THEN substr(issue_id, 7)
          ELSE issue_id
        END AS issueCode,
        NULL AS briefCode,
        CASE
          WHEN task_id LIKE 'task_%' THEN substr(task_id, 6)
          ELSE task_id
        END AS taskCode,
        NULL AS approvalCode,
        NULL AS subjectCode,
        NULL AS subjectType,
        source,
        NULL AS locale,
        sensitivity
      FROM feedback
      ORDER BY updated_at DESC
      ${buildPaginationClause(pagination)}
    `),
    pagination: buildPaginationMetadata(totalCount, pagination)
  };
}

export function createActorScopedFeedbackSnapshot(
  actor: ActorRef,
  pagination?: PaginationParams
): ModuleSnapshot {
  const actorFilter = buildActorFilter("feedback", actor);
  const whereClause = toWhereClause(actorFilter);
  const whereParameters = actorFilter?.parameters ?? [];

  return {
    metrics: [
      {
        key: "attention",
        value: countScopedRecordsByStatus("feedback", actorFilter, "attention")
      },
      {
        key: "active",
        value: countScopedRecordsByStatus("feedback", actorFilter, "active")
      },
      {
        key: "resolved",
        value: countScopedRecordsByStatus("feedback", actorFilter, "resolved")
      }
    ],
    records: allWithParameters<GenericRecordRow>(
      `
        SELECT
          code,
          title,
          summary,
          status,
          severity AS priority,
          owner_team AS ownerTeam,
          NULL AS assigneeTeam,
          NULL AS requestedByTeam,
          NULL AS dueDate,
          updated_at AS updatedAt,
          region_code AS regionCode,
          NULL AS kind,
          NULL AS scope,
          CASE
            WHEN issue_id LIKE 'issue_%' THEN substr(issue_id, 7)
            ELSE issue_id
          END AS issueCode,
          NULL AS briefCode,
          CASE
            WHEN task_id LIKE 'task_%' THEN substr(task_id, 6)
            ELSE task_id
          END AS taskCode,
          NULL AS approvalCode,
          NULL AS subjectCode,
          NULL AS subjectType,
          source,
          NULL AS locale,
          sensitivity
        FROM feedback${whereClause}
        ORDER BY updated_at DESC
        ${buildPaginationClause(pagination)}
      `,
      whereParameters
    ),
    pagination: buildPaginationMetadata(
      countScopedRecords("feedback", actorFilter),
      pagination
    )
  };
}
