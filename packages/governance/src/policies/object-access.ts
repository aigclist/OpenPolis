import type {
  ActorRef,
  AgentRun,
  Approval,
  Asset,
  Brief,
  Feedback,
  Issue,
  Scope,
  Task,
  Sensitivity
} from "@openpolis/contracts";

import {
  getGovernanceRolePolicy,
  GovernancePolicyError,
  resolveActorRole
} from "../roles";

export type GovernedResource =
  | Issue
  | Brief
  | Asset
  | Approval
  | Task
  | Feedback
  | AgentRun;

const sensitivityRank: Record<Sensitivity, number> = {
  public: 0,
  internal: 1,
  restricted: 2,
  confidential: 3
};

function unique(values: Array<string | undefined>) {
  return [...new Set(values.filter((value): value is string => Boolean(value)))];
}

function getScopeTeams(scope: Scope | undefined) {
  return scope?.teamIds ?? [];
}

function getScopeRegions(scope: Scope | undefined) {
  return scope?.regionIds ?? [];
}

function getResourceSensitivity(resource: GovernedResource): Sensitivity {
  if ("sensitivity" in resource) {
    return resource.sensitivity;
  }

  return "internal";
}

function getResourceTeams(resource: GovernedResource) {
  if ("requestedByTeamId" in resource) {
    return unique([resource.requestedByTeamId, resource.reviewerTeamId]);
  }

  if ("intendedScope" in resource) {
    return unique([resource.ownerTeamId, ...getScopeTeams(resource.intendedScope)]);
  }

  if ("targetScope" in resource) {
    return unique([resource.ownerTeamId, ...getScopeTeams(resource.targetScope)]);
  }

  if ("visibleScope" in resource) {
    return unique(resource.visibleScope.teamIds);
  }

  if ("severity" in resource) {
    return unique([resource.ownerTeamId]);
  }

  return unique([resource.ownerTeamId, resource.assigneeTeamId]);
}

function getResourceRegions(resource: GovernedResource) {
  if ("requestedByTeamId" in resource) {
    return [];
  }

  if ("intendedScope" in resource) {
    return unique(getScopeRegions(resource.intendedScope));
  }

  if ("targetScope" in resource) {
    return unique([
      "primaryRegionId" in resource ? resource.primaryRegionId : undefined,
      ...getScopeRegions(resource.targetScope)
    ]);
  }

  if ("visibleScope" in resource) {
    return unique(resource.visibleScope.regionIds);
  }

  return unique([resource.regionId]);
}

function hasScopeOverlap(actor: ActorRef, resource: GovernedResource) {
  const resourceTeams = getResourceTeams(resource);
  const resourceRegions = getResourceRegions(resource);

  if (resourceTeams.length === 0 && resourceRegions.length === 0) {
    return true;
  }

  const teamMatch =
    actor.teamId !== undefined && resourceTeams.includes(actor.teamId);
  const regionMatch =
    actor.regionId !== undefined && resourceRegions.includes(actor.regionId);

  return teamMatch || regionMatch;
}

export function canAccessObject(
  actor: ActorRef,
  resource: GovernedResource
): boolean {
  const role = resolveActorRole(actor);
  const policy = getGovernanceRolePolicy(role);
  const resourceSensitivity = getResourceSensitivity(resource);

  if (
    sensitivityRank[resourceSensitivity] > sensitivityRank[policy.maxSensitivity]
  ) {
    return false;
  }

  if (policy.crossScopeAccess) {
    return true;
  }

  return hasScopeOverlap(actor, resource);
}

export function assertObjectAccess(actor: ActorRef, resource: GovernedResource) {
  if (!canAccessObject(actor, resource)) {
    throw new GovernancePolicyError(
      `Actor ${actor.actorId} cannot access governed resource.`
    );
  }
}
