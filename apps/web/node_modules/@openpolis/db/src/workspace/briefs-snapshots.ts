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

export function createBriefsSnapshot(
  pagination?: PaginationParams
): ModuleSnapshot {
  const totalCount = count("SELECT COUNT(*) as count FROM briefs");

  return {
    metrics: [
      { key: "queued", value: count("SELECT COUNT(*) as count FROM briefs WHERE status = 'queued'") },
      { key: "in_review", value: count("SELECT COUNT(*) as count FROM briefs WHERE status = 'in_review'") },
      { key: "scheduled", value: count("SELECT COUNT(*) as count FROM briefs WHERE status = 'scheduled'") }
    ],
    records: all<GenericRecordRow>(`
      SELECT
        code,
        title,
        summary,
        status,
        NULL AS priority,
        owner_team AS ownerTeam,
        NULL AS assigneeTeam,
        NULL AS requestedByTeam,
        due_date AS dueDate,
        updated_at AS updatedAt,
        NULL AS regionCode,
        NULL AS kind,
        NULL AS scope,
        CASE
          WHEN issue_id LIKE 'issue_%' THEN substr(issue_id, 7)
          ELSE issue_id
        END AS issueCode,
        NULL AS briefCode,
        NULL AS taskCode,
        NULL AS approvalCode,
        NULL AS subjectCode,
        NULL AS subjectType,
        NULL AS source,
        NULL AS locale,
        sensitivity
      FROM briefs
      ORDER BY due_date ASC
      ${buildPaginationClause(pagination)}
    `),
    pagination: buildPaginationMetadata(totalCount, pagination)
  };
}

export function createActorScopedBriefsSnapshot(
  actor: ActorRef,
  pagination?: PaginationParams
): ModuleSnapshot {
  const actorFilter = buildActorFilter("briefs", actor);
  const whereClause = toWhereClause(actorFilter);
  const whereParameters = actorFilter?.parameters ?? [];

  return {
    metrics: [
      {
        key: "queued",
        value: countScopedRecordsByStatus("briefs", actorFilter, "queued")
      },
      {
        key: "in_review",
        value: countScopedRecordsByStatus("briefs", actorFilter, "in_review")
      },
      {
        key: "scheduled",
        value: countScopedRecordsByStatus("briefs", actorFilter, "scheduled")
      }
    ],
    records: allWithParameters<GenericRecordRow>(
      `
        SELECT
          code,
          title,
          summary,
          status,
          NULL AS priority,
          owner_team AS ownerTeam,
          NULL AS assigneeTeam,
          NULL AS requestedByTeam,
          due_date AS dueDate,
          updated_at AS updatedAt,
          NULL AS regionCode,
          NULL AS kind,
          NULL AS scope,
          CASE
            WHEN issue_id LIKE 'issue_%' THEN substr(issue_id, 7)
            ELSE issue_id
          END AS issueCode,
          NULL AS briefCode,
          NULL AS taskCode,
          NULL AS approvalCode,
          NULL AS subjectCode,
          NULL AS subjectType,
          NULL AS source,
          NULL AS locale,
          sensitivity
        FROM briefs${whereClause}
        ORDER BY due_date ASC
        ${buildPaginationClause(pagination)}
      `,
      whereParameters
    ),
    pagination: buildPaginationMetadata(
      countScopedRecords("briefs", actorFilter),
      pagination
    )
  };
}
