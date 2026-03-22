import type { GenericRecordRow, RegionRow } from "@openpolis/application";
import type { ActorRef } from "@openpolis/contracts";
import { resolveActorRole } from "@openpolis/governance";

export function sortByUpdatedDesc<T extends { updatedAt: string | null }>(rows: T[]) {
  return [...rows].sort((left, right) =>
    (right.updatedAt ?? "").localeCompare(left.updatedAt ?? "")
  );
}

export function sortByDueAsc<T extends { dueDate: string | null }>(rows: T[]) {
  return [...rows].sort((left, right) =>
    (left.dueDate ?? "").localeCompare(right.dueDate ?? "")
  );
}

export function sortPriorities(rows: GenericRecordRow[]) {
  const priorityRank: Record<string, number> = {
    critical: 0,
    high: 1,
    medium: 2,
    steady: 3
  };

  return [...rows].sort((left, right) => {
    const leftRank = priorityRank[left.priority ?? "steady"] ?? 99;
    const rightRank = priorityRank[right.priority ?? "steady"] ?? 99;

    if (leftRank !== rightRank) {
      return leftRank - rightRank;
    }

    return (right.updatedAt ?? "").localeCompare(left.updatedAt ?? "");
  });
}

export function createDashboardPriorityRow(row: GenericRecordRow) {
  if (!row.priority || !row.ownerTeam || !row.updatedAt || !row.regionCode) {
    return null;
  }

  return {
    code: row.code,
    title: row.title,
    summary: row.summary,
    status: row.status,
    priority: row.priority,
    ownerTeam: row.ownerTeam,
    updatedAt: row.updatedAt,
    regionCode: row.regionCode
  };
}

export function createRegionRow(row: GenericRecordRow): RegionRow | null {
  if (!row.updatedAt) {
    return null;
  }

  return {
    code: row.code,
    status: row.status,
    completionRate: Number(row.scope ?? 0),
    blockedCount: Number(row.kind ?? 0),
    updatedAt: row.updatedAt
  };
}

export function canAccessWorkspaceSkills(actor: ActorRef) {
  return resolveActorRole(actor) !== "viewer";
}

export function canAccessWorkspaceAdmin(actor: ActorRef) {
  const role = resolveActorRole(actor);
  return role === "super_admin" || role === "central_ops";
}
