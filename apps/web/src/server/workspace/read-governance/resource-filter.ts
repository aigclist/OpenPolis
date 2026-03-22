import type {
  ActorRef,
  Scope,
  Sensitivity
} from "@openpolis/contracts";
import type {
  CoreModuleId,
  DashboardPriorityRow,
  GenericRecordRow,
  ModuleSnapshot,
  RegionRow
} from "@openpolis/application";
import { canAccessObject, type GovernedResource } from "@openpolis/governance";

const internalSensitivity: Sensitivity = "internal";

function normalizeSensitivity(
  value: string | null | undefined,
  fallback: Sensitivity = internalSensitivity
): Sensitivity {
  switch (value) {
    case "public":
    case "internal":
    case "restricted":
    case "confidential":
      return value;
    default:
      return fallback;
  }
}

function compactScope(values: Array<string | null | undefined>) {
  return values.filter((value): value is string => Boolean(value));
}

function buildScope(
  teamIds: Array<string | null | undefined>,
  regionIds: Array<string | null | undefined>
): Scope {
  return {
    teamIds: compactScope(teamIds),
    regionIds: compactScope(regionIds)
  };
}

function toReadGovernedResource(
  moduleId: CoreModuleId,
  row: GenericRecordRow
): GovernedResource {
  switch (moduleId) {
    case "issues":
      return {
        ownerTeamId: row.ownerTeam ?? undefined,
        targetScope: buildScope([row.ownerTeam], [row.regionCode]),
        sensitivity: normalizeSensitivity(row.sensitivity)
      } as GovernedResource;
    case "assets":
      return {
        ownerTeamId: row.ownerTeam ?? undefined,
        intendedScope: buildScope([row.ownerTeam], []),
        sensitivity: normalizeSensitivity(row.sensitivity)
      } as GovernedResource;
    case "briefs":
      return {
        ownerTeamId: row.ownerTeam ?? undefined,
        targetScope: buildScope([row.ownerTeam], []),
        sensitivity: normalizeSensitivity(row.sensitivity)
      } as GovernedResource;
    case "operations":
      return {
        ownerTeamId: row.ownerTeam ?? undefined,
        assigneeTeamId: row.assigneeTeam ?? undefined,
        regionId: row.regionCode ?? undefined,
        sensitivity: normalizeSensitivity(row.sensitivity)
      } as GovernedResource;
    case "network":
      return {
        regionId: row.code,
        sensitivity: internalSensitivity
      } as GovernedResource;
    case "calendar":
      return {
        regionId: row.regionCode ?? undefined,
        sensitivity: internalSensitivity
      } as GovernedResource;
    case "feedback":
      return {
        ownerTeamId: row.ownerTeam ?? undefined,
        regionId: row.regionCode ?? undefined,
        sensitivity: normalizeSensitivity(row.sensitivity)
      } as GovernedResource;
    case "review":
      return {
        requestedByTeamId: row.requestedByTeam ?? undefined,
        reviewerTeamId: row.ownerTeam ?? undefined,
        sensitivity: normalizeSensitivity(row.sensitivity)
      } as GovernedResource;
    case "reports":
      return {
        sensitivity: internalSensitivity
      } as GovernedResource;
  }
}

export function toDashboardGovernedResource(
  row: DashboardPriorityRow
): GovernedResource {
  return {
    ownerTeamId: row.ownerTeam,
    targetScope: buildScope([row.ownerTeam], [row.regionCode]),
    sensitivity: internalSensitivity
  } as GovernedResource;
}

export function toRegionGovernedResource(row: RegionRow): GovernedResource {
  return {
    regionId: row.code,
    sensitivity: internalSensitivity
  } as GovernedResource;
}

export function filterModuleSnapshot(
  actor: ActorRef,
  moduleId: CoreModuleId,
  snapshot: ModuleSnapshot
): ModuleSnapshot {
  const records = snapshot.records.filter((row) =>
    canAccessObject(actor, toReadGovernedResource(moduleId, row))
  );

  return {
    records,
    metrics: snapshot.metrics.map((metric) => ({
      key: metric.key,
      value: records.filter((row) => row.status === metric.key).length
    })),
    pagination: undefined
  };
}
