import type { ActorRef } from "@openpolis/contracts";

import type { GovernedResource } from "./object-access";
import { assertObjectAccess } from "./object-access";
import {
  getGovernanceRolePolicy,
  GovernancePolicyError,
  resolveActorRole,
  type GovernanceCommandName
} from "../roles";

export function canRunCommand(
  actor: ActorRef,
  commandName: GovernanceCommandName
) {
  const role = resolveActorRole(actor);
  const policy = getGovernanceRolePolicy(role);

  return policy.allowedCommands.includes(commandName);
}

export function assertCommandPermission(
  actor: ActorRef,
  commandName: GovernanceCommandName,
  resource?: GovernedResource
) {
  if (!canRunCommand(actor, commandName)) {
    throw new GovernancePolicyError(
      `Actor ${actor.actorId} cannot execute ${commandName}.`
    );
  }

  if (resource) {
    assertObjectAccess(actor, resource);
  }
}
