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
  countScopedRecordsByStatus,
  toWhereClause
} from "../workspace-read-utils";

export function createNetworkSnapshot(): ModuleSnapshot {
  return {
    metrics: [
      { key: "active", value: count("SELECT COUNT(*) as count FROM regions WHERE status = 'active'") },
      { key: "attention", value: count("SELECT COUNT(*) as count FROM regions WHERE status = 'attention'") },
      { key: "ready", value: count("SELECT COUNT(*) as count FROM regions WHERE status = 'ready'") }
    ],
    records: all<GenericRecordRow>(`
      SELECT
        code,
        NULL AS title,
        NULL AS summary,
        status,
        NULL AS priority,
        NULL AS ownerTeam,
        NULL AS assigneeTeam,
        NULL AS requestedByTeam,
        NULL AS dueDate,
        updated_at AS updatedAt,
        NULL AS regionCode,
        CAST(blocked_count AS TEXT) AS kind,
        CAST(completion_rate AS TEXT) AS scope,
        NULL AS issueCode,
        NULL AS briefCode,
        NULL AS taskCode,
        NULL AS approvalCode,
        NULL AS subjectCode,
        NULL AS subjectType,
        NULL AS source,
        NULL AS locale,
        NULL AS sensitivity
      FROM regions
      ORDER BY completion_rate ASC
    `)
  };
}

export function createActorScopedNetworkSnapshot(actor: ActorRef): ModuleSnapshot {
  const actorFilter = buildActorFilter("network", actor);
  const whereClause = toWhereClause(actorFilter);
  const whereParameters = actorFilter?.parameters ?? [];

  return {
    metrics: [
      {
        key: "active",
        value: countScopedRecordsByStatus("regions", actorFilter, "active")
      },
      {
        key: "attention",
        value: countScopedRecordsByStatus("regions", actorFilter, "attention")
      },
      {
        key: "ready",
        value: countScopedRecordsByStatus("regions", actorFilter, "ready")
      }
    ],
    records: allWithParameters<GenericRecordRow>(
      `
        SELECT
          code,
          NULL AS title,
          NULL AS summary,
          status,
          NULL AS priority,
          NULL AS ownerTeam,
          NULL AS assigneeTeam,
          NULL AS requestedByTeam,
          NULL AS dueDate,
          updated_at AS updatedAt,
          NULL AS regionCode,
          CAST(blocked_count AS TEXT) AS kind,
          CAST(completion_rate AS TEXT) AS scope,
          NULL AS issueCode,
          NULL AS briefCode,
          NULL AS taskCode,
          NULL AS approvalCode,
          NULL AS subjectCode,
          NULL AS subjectType,
          NULL AS source,
          NULL AS locale,
          NULL AS sensitivity
        FROM regions${whereClause}
        ORDER BY completion_rate ASC
      `,
      whereParameters
    )
  };
}

export function createCalendarSnapshot(): ModuleSnapshot {
  return {
    metrics: [
      { key: "scheduled", value: count("SELECT COUNT(*) as count FROM events WHERE status = 'scheduled'") },
      { key: "active", value: count("SELECT COUNT(*) as count FROM events WHERE status = 'active'") },
      { key: "queued", value: count("SELECT COUNT(*) as count FROM events WHERE status = 'queued'") }
    ],
    records: all<GenericRecordRow>(`
      SELECT
        code,
        title,
        summary,
        status,
        NULL AS priority,
        NULL AS ownerTeam,
        NULL AS assigneeTeam,
        NULL AS requestedByTeam,
        starts_at AS dueDate,
        NULL AS updatedAt,
        region_code AS regionCode,
        NULL AS kind,
        NULL AS scope,
        NULL AS issueCode,
        NULL AS briefCode,
        NULL AS taskCode,
        NULL AS approvalCode,
        NULL AS subjectCode,
        NULL AS subjectType,
        NULL AS source,
        NULL AS locale,
        NULL AS sensitivity
      FROM events
      ORDER BY starts_at ASC
    `)
  };
}

export function createActorScopedCalendarSnapshot(actor: ActorRef): ModuleSnapshot {
  const actorFilter = buildActorFilter("calendar", actor);
  const whereClause = toWhereClause(actorFilter);
  const whereParameters = actorFilter?.parameters ?? [];

  return {
    metrics: [
      {
        key: "scheduled",
        value: countScopedRecordsByStatus("events", actorFilter, "scheduled")
      },
      {
        key: "active",
        value: countScopedRecordsByStatus("events", actorFilter, "active")
      },
      {
        key: "queued",
        value: countScopedRecordsByStatus("events", actorFilter, "queued")
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
          NULL AS ownerTeam,
          NULL AS assigneeTeam,
          NULL AS requestedByTeam,
          starts_at AS dueDate,
          NULL AS updatedAt,
          region_code AS regionCode,
          NULL AS kind,
          NULL AS scope,
          NULL AS issueCode,
          NULL AS briefCode,
          NULL AS taskCode,
          NULL AS approvalCode,
          NULL AS subjectCode,
          NULL AS subjectType,
          NULL AS source,
          NULL AS locale,
          NULL AS sensitivity
        FROM events${whereClause}
        ORDER BY starts_at ASC
      `,
      whereParameters
    )
  };
}

export function createReportsSnapshot(): ModuleSnapshot {
  return {
    metrics: [
      { key: "draft", value: count("SELECT COUNT(*) as count FROM reports WHERE status = 'draft'") },
      { key: "generated", value: count("SELECT COUNT(*) as count FROM reports WHERE status = 'generated'") },
      { key: "archived", value: count("SELECT COUNT(*) as count FROM reports WHERE status = 'archived'") }
    ],
    records: all<GenericRecordRow>(`
      SELECT
        code,
        title,
        summary,
        status,
        NULL AS priority,
        NULL AS ownerTeam,
        NULL AS assigneeTeam,
        NULL AS requestedByTeam,
        NULL AS dueDate,
        updated_at AS updatedAt,
        NULL AS regionCode,
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
        NULL AS sensitivity
      FROM reports
      ORDER BY updated_at DESC
    `)
  };
}

export function createActorScopedReportsSnapshot(actor: ActorRef): ModuleSnapshot {
  const actorFilter = buildActorFilter("reports", actor);
  const whereClause = toWhereClause(actorFilter);
  const whereParameters = actorFilter?.parameters ?? [];

  return {
    metrics: [
      {
        key: "draft",
        value: countScopedRecordsByStatus("reports", actorFilter, "draft")
      },
      {
        key: "generated",
        value: countScopedRecordsByStatus("reports", actorFilter, "generated")
      },
      {
        key: "archived",
        value: countScopedRecordsByStatus("reports", actorFilter, "archived")
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
          NULL AS ownerTeam,
          NULL AS assigneeTeam,
          NULL AS requestedByTeam,
          NULL AS dueDate,
          updated_at AS updatedAt,
          NULL AS regionCode,
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
          NULL AS sensitivity
        FROM reports${whereClause}
        ORDER BY updated_at DESC
      `,
      whereParameters
    )
  };
}
