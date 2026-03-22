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

export function createOperationsSnapshot(
  pagination?: PaginationParams
): ModuleSnapshot {
  const totalCount = count("SELECT COUNT(*) as count FROM tasks");

  return {
    metrics: [
      { key: "active", value: count("SELECT COUNT(*) as count FROM tasks WHERE status = 'active'") },
      { key: "in_review", value: count("SELECT COUNT(*) as count FROM tasks WHERE status = 'in_review'") },
      { key: "blocked", value: count("SELECT COUNT(*) as count FROM tasks WHERE status = 'blocked'") }
    ],
    records: all<GenericRecordRow>(`
      SELECT
        code,
        title,
        summary,
        status,
        priority,
        owner_team AS ownerTeam,
        assignee_team AS assigneeTeam,
        NULL AS requestedByTeam,
        due_date AS dueDate,
        updated_at AS updatedAt,
        region_code AS regionCode,
        NULL AS kind,
        NULL AS scope,
        CASE
          WHEN issue_id LIKE 'issue_%' THEN substr(issue_id, 7)
          ELSE issue_id
        END AS issueCode,
        CASE
          WHEN brief_id LIKE 'brief_%' THEN substr(brief_id, 7)
          ELSE brief_id
        END AS briefCode,
        NULL AS taskCode,
        NULL AS approvalCode,
        NULL AS subjectCode,
        NULL AS subjectType,
        NULL AS source,
        NULL AS locale,
        sensitivity
      FROM tasks
      ORDER BY due_date ASC
      ${buildPaginationClause(pagination)}
    `),
    pagination: buildPaginationMetadata(totalCount, pagination)
  };
}

export function createActorScopedOperationsSnapshot(
  actor: ActorRef,
  pagination?: PaginationParams
): ModuleSnapshot {
  const actorFilter = buildActorFilter("operations", actor);
  const whereClause = toWhereClause(actorFilter);
  const whereParameters = actorFilter?.parameters ?? [];

  return {
    metrics: [
      {
        key: "active",
        value: countScopedRecordsByStatus("tasks", actorFilter, "active")
      },
      {
        key: "in_review",
        value: countScopedRecordsByStatus("tasks", actorFilter, "in_review")
      },
      {
        key: "blocked",
        value: countScopedRecordsByStatus("tasks", actorFilter, "blocked")
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
          assignee_team AS assigneeTeam,
          NULL AS requestedByTeam,
          due_date AS dueDate,
          updated_at AS updatedAt,
          region_code AS regionCode,
          NULL AS kind,
          NULL AS scope,
          CASE
            WHEN issue_id LIKE 'issue_%' THEN substr(issue_id, 7)
            ELSE issue_id
          END AS issueCode,
          CASE
            WHEN brief_id LIKE 'brief_%' THEN substr(brief_id, 7)
            ELSE brief_id
          END AS briefCode,
          NULL AS taskCode,
          NULL AS approvalCode,
          NULL AS subjectCode,
          NULL AS subjectType,
          NULL AS source,
          NULL AS locale,
          sensitivity
        FROM tasks${whereClause}
        ORDER BY due_date ASC
        ${buildPaginationClause(pagination)}
      `,
      whereParameters
    ),
    pagination: buildPaginationMetadata(
      countScopedRecords("tasks", actorFilter),
      pagination
    )
  };
}
