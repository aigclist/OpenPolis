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

export function createReviewSnapshot(
  pagination?: PaginationParams
): ModuleSnapshot {
  const totalCount = count("SELECT COUNT(*) as count FROM reviews");

  return {
    metrics: [
      { key: "in_review", value: count("SELECT COUNT(*) as count FROM reviews WHERE status = 'in_review'") },
      { key: "changes_requested", value: count("SELECT COUNT(*) as count FROM reviews WHERE status = 'changes_requested'") },
      { key: "approved", value: count("SELECT COUNT(*) as count FROM reviews WHERE status = 'approved'") }
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
        requested_by_team AS requestedByTeam,
        due_date AS dueDate,
        updated_at AS updatedAt,
        NULL AS regionCode,
        NULL AS kind,
        NULL AS scope,
        NULL AS issueCode,
        NULL AS briefCode,
        NULL AS taskCode,
        NULL AS approvalCode,
        subject_code AS subjectCode,
        subject_type AS subjectType,
        NULL AS source,
        NULL AS locale,
        sensitivity
      FROM reviews
      ORDER BY due_date ASC
      ${buildPaginationClause(pagination)}
    `),
    pagination: buildPaginationMetadata(totalCount, pagination)
  };
}

export function createActorScopedReviewSnapshot(
  actor: ActorRef,
  pagination?: PaginationParams
): ModuleSnapshot {
  const actorFilter = buildActorFilter("review", actor);
  const whereClause = toWhereClause(actorFilter);
  const whereParameters = actorFilter?.parameters ?? [];

  return {
    metrics: [
      {
        key: "in_review",
        value: countScopedRecordsByStatus("reviews", actorFilter, "in_review")
      },
      {
        key: "changes_requested",
        value: countScopedRecordsByStatus(
          "reviews",
          actorFilter,
          "changes_requested"
        )
      },
      {
        key: "approved",
        value: countScopedRecordsByStatus("reviews", actorFilter, "approved")
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
          requested_by_team AS requestedByTeam,
          due_date AS dueDate,
          updated_at AS updatedAt,
          NULL AS regionCode,
          NULL AS kind,
          NULL AS scope,
          NULL AS issueCode,
          NULL AS briefCode,
          NULL AS taskCode,
          NULL AS approvalCode,
          subject_code AS subjectCode,
          subject_type AS subjectType,
          NULL AS source,
          NULL AS locale,
          sensitivity
        FROM reviews${whereClause}
        ORDER BY due_date ASC
        ${buildPaginationClause(pagination)}
      `,
      whereParameters
    ),
    pagination: buildPaginationMetadata(
      countScopedRecords("reviews", actorFilter),
      pagination
    )
  };
}
