import type { CoreModuleId } from "@openpolis/application";
import type { ActorRef, Sensitivity } from "@openpolis/contracts";
import {
  getGovernanceRolePolicy,
  resolveActorRole
} from "@openpolis/governance";

import { countWithParameters } from "./query-execution";

export type SqlFragment = {
  sql: string;
  parameters: unknown[];
};

const sensitivityOrder = [
  "public",
  "internal",
  "restricted",
  "confidential"
] as const satisfies readonly Sensitivity[];

const sensitivityRank: Record<Sensitivity, number> = {
  public: 0,
  internal: 1,
  restricted: 2,
  confidential: 3
};

export function combineSqlFragments(
  fragments: Array<SqlFragment | null | undefined>,
  operator: "AND" | "OR",
  fallbackSql?: string
): SqlFragment | undefined {
  const activeFragments = fragments.filter(
    (fragment): fragment is SqlFragment => Boolean(fragment?.sql)
  );

  if (activeFragments.length === 0) {
    return fallbackSql
      ? {
          sql: fallbackSql,
          parameters: []
        }
      : undefined;
  }

  return {
    sql: activeFragments.map((fragment) => `(${fragment.sql})`).join(` ${operator} `),
    parameters: activeFragments.flatMap((fragment) => fragment.parameters)
  };
}

export function toWhereClause(fragment?: SqlFragment) {
  if (!fragment?.sql) {
    return "";
  }

  return `\nWHERE ${fragment.sql}`;
}

function buildStatusFilter(status: string): SqlFragment {
  return {
    sql: "status = ?",
    parameters: [status]
  };
}

function buildSensitivityFragment(
  actor: ActorRef,
  moduleId: CoreModuleId
): SqlFragment | undefined {
  const policy = getGovernanceRolePolicy(resolveActorRole(actor));

  if (moduleId === "network" || moduleId === "calendar" || moduleId === "reports") {
    if (sensitivityRank[policy.maxSensitivity] < sensitivityRank.internal) {
      return {
        sql: "1 = 0",
        parameters: []
      };
    }

    return undefined;
  }

  const allowedSensitivities = sensitivityOrder.filter(
    (sensitivity) => sensitivityRank[sensitivity] <= sensitivityRank[policy.maxSensitivity]
  );

  const placeholders = allowedSensitivities.map(() => "?").join(", ");

  return {
    sql: `
      CASE
        WHEN sensitivity IN ('public', 'internal', 'restricted', 'confidential')
          THEN sensitivity
        ELSE 'internal'
      END IN (${placeholders})
    `.trim(),
    parameters: allowedSensitivities
  };
}

function buildScopeFragment(
  actor: ActorRef,
  moduleId: CoreModuleId
): SqlFragment | undefined {
  const policy = getGovernanceRolePolicy(resolveActorRole(actor));

  if (policy.crossScopeAccess || moduleId === "reports") {
    return undefined;
  }

  switch (moduleId) {
    case "issues":
      return combineSqlFragments(
        [
          actor.teamId
            ? {
                sql: "owner_team = ?",
                parameters: [actor.teamId]
              }
            : undefined,
          actor.regionId
            ? {
                sql: "region_code = ?",
                parameters: [actor.regionId]
              }
            : undefined
        ],
        "OR",
        "1 = 0"
      );
    case "assets":
    case "briefs":
      return combineSqlFragments(
        [
          actor.teamId
            ? {
                sql: "owner_team = ?",
                parameters: [actor.teamId]
              }
            : undefined
        ],
        "OR",
        "1 = 0"
      );
    case "operations":
      return combineSqlFragments(
        [
          actor.teamId
            ? {
                sql: "owner_team = ?",
                parameters: [actor.teamId]
              }
            : undefined,
          actor.teamId
            ? {
                sql: "assignee_team = ?",
                parameters: [actor.teamId]
              }
            : undefined,
          actor.regionId
            ? {
                sql: "region_code = ?",
                parameters: [actor.regionId]
              }
            : undefined
        ],
        "OR",
        "1 = 0"
      );
    case "network":
      return combineSqlFragments(
        [
          actor.regionId
            ? {
                sql: "code = ?",
                parameters: [actor.regionId]
              }
            : undefined
        ],
        "OR",
        "1 = 0"
      );
    case "calendar":
    case "feedback":
      return combineSqlFragments(
        [
          actor.teamId && moduleId === "feedback"
            ? {
                sql: "owner_team = ?",
                parameters: [actor.teamId]
              }
            : undefined,
          actor.regionId
            ? {
                sql: "region_code = ?",
                parameters: [actor.regionId]
              }
            : undefined
        ],
        "OR",
        "1 = 0"
      );
    case "review":
      return combineSqlFragments(
        [
          actor.teamId
            ? {
                sql: "owner_team = ?",
                parameters: [actor.teamId]
              }
            : undefined,
          actor.teamId
            ? {
                sql: "requested_by_team = ?",
                parameters: [actor.teamId]
              }
            : undefined
        ],
        "OR",
        "1 = 0"
      );
  }
}

export function buildActorFilter(
  moduleId: CoreModuleId,
  actor?: ActorRef
): SqlFragment | undefined {
  if (!actor) {
    return undefined;
  }

  return combineSqlFragments(
    [buildSensitivityFragment(actor, moduleId), buildScopeFragment(actor, moduleId)],
    "AND"
  );
}

export function countScopedRecords(
  tableName: string,
  actorFilter: SqlFragment | undefined
) {
  return countWithParameters(
    `SELECT COUNT(*) as count FROM ${tableName}${toWhereClause(actorFilter)}`,
    actorFilter?.parameters ?? []
  );
}

export function countScopedRecordsByStatus(
  tableName: string,
  actorFilter: SqlFragment | undefined,
  status: string
) {
  const statusFilter = combineSqlFragments(
    [actorFilter, buildStatusFilter(status)],
    "AND"
  );

  return countWithParameters(
    `SELECT COUNT(*) as count FROM ${tableName}${toWhereClause(statusFilter)}`,
    statusFilter?.parameters ?? []
  );
}
