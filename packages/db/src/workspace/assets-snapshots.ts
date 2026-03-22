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

export function createAssetsSnapshot(
  pagination?: PaginationParams
): ModuleSnapshot {
  const totalCount = count("SELECT COUNT(*) as count FROM assets");

  return {
    metrics: [
      { key: "draft", value: count("SELECT COUNT(*) as count FROM assets WHERE status = 'draft'") },
      { key: "approved", value: count("SELECT COUNT(*) as count FROM assets WHERE status = 'approved'") },
      { key: "localized", value: count("SELECT COUNT(*) as count FROM assets WHERE status = 'localized'") }
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
        NULL AS dueDate,
        updated_at AS updatedAt,
        NULL AS regionCode,
        kind,
        NULL AS scope,
        CASE
          WHEN issue_id LIKE 'issue_%' THEN substr(issue_id, 7)
          WHEN issue_code = 'unlinked' THEN NULL
          ELSE issue_code
        END AS issueCode,
        CASE
          WHEN brief_id LIKE 'brief_%' THEN substr(brief_id, 7)
          ELSE brief_id
        END AS briefCode,
        NULL AS taskCode,
        CASE
          WHEN approval_id LIKE 'approval_%' THEN substr(approval_id, 10)
          ELSE approval_id
        END AS approvalCode,
        NULL AS subjectCode,
        NULL AS subjectType,
        source,
        locale,
        sensitivity
      FROM assets
      ORDER BY updated_at DESC
      ${buildPaginationClause(pagination)}
    `),
    pagination: buildPaginationMetadata(totalCount, pagination)
  };
}

export function createActorScopedAssetsSnapshot(
  actor: ActorRef,
  pagination?: PaginationParams
): ModuleSnapshot {
  const actorFilter = buildActorFilter("assets", actor);
  const whereClause = toWhereClause(actorFilter);
  const whereParameters = actorFilter?.parameters ?? [];

  return {
    metrics: [
      {
        key: "draft",
        value: countScopedRecordsByStatus("assets", actorFilter, "draft")
      },
      {
        key: "approved",
        value: countScopedRecordsByStatus("assets", actorFilter, "approved")
      },
      {
        key: "localized",
        value: countScopedRecordsByStatus("assets", actorFilter, "localized")
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
          NULL AS dueDate,
          updated_at AS updatedAt,
          NULL AS regionCode,
          kind,
          NULL AS scope,
          CASE
            WHEN issue_id LIKE 'issue_%' THEN substr(issue_id, 7)
            WHEN issue_code = 'unlinked' THEN NULL
            ELSE issue_code
          END AS issueCode,
          CASE
            WHEN brief_id LIKE 'brief_%' THEN substr(brief_id, 7)
            ELSE brief_id
          END AS briefCode,
          NULL AS taskCode,
          CASE
            WHEN approval_id LIKE 'approval_%' THEN substr(approval_id, 10)
            ELSE approval_id
          END AS approvalCode,
          NULL AS subjectCode,
          NULL AS subjectType,
          source,
          locale,
          sensitivity
        FROM assets${whereClause}
        ORDER BY updated_at DESC
        ${buildPaginationClause(pagination)}
      `,
      whereParameters
    ),
    pagination: buildPaginationMetadata(
      countScopedRecords("assets", actorFilter),
      pagination
    )
  };
}
