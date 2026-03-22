import type { ActorRef, ActorRole, Sensitivity } from "@openpolis/contracts";

export const governanceRoleIds = [
  "super_admin",
  "central_ops",
  "communications_lead",
  "regional_manager",
  "candidate_team",
  "volunteer_coordinator",
  "reviewer",
  "viewer"
] as const satisfies readonly ActorRole[];

export type GovernanceCommandName =
  | "createIssue"
  | "createBrief"
  | "createAssetDraft"
  | "submitApproval"
  | "respondToApproval"
  | "publishApproval"
  | "createTask"
  | "assignTask"
  | "closeTask"
  | "createFeedback"
  | "escalateFeedback"
  | "createAgentRun"
  | "respondToAgentRun"
  | "finalizeAgentRun";

export class GovernancePolicyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GovernancePolicyError";
  }
}

export type GovernanceRolePolicy = {
  maxSensitivity: Sensitivity;
  crossScopeAccess: boolean;
  allowedCommands: readonly GovernanceCommandName[];
};

const rolePolicies: Record<ActorRole, GovernanceRolePolicy> = {
  super_admin: {
    maxSensitivity: "confidential",
    crossScopeAccess: true,
    allowedCommands: [
      "createIssue",
      "createBrief",
      "createAssetDraft",
      "submitApproval",
      "respondToApproval",
      "publishApproval",
      "createTask",
      "assignTask",
      "closeTask",
      "createFeedback",
      "escalateFeedback",
      "createAgentRun",
      "respondToAgentRun",
      "finalizeAgentRun"
    ]
  },
  central_ops: {
    maxSensitivity: "confidential",
    crossScopeAccess: true,
    allowedCommands: [
      "createIssue",
      "createBrief",
      "createAssetDraft",
      "submitApproval",
      "respondToApproval",
      "publishApproval",
      "createTask",
      "assignTask",
      "closeTask",
      "createFeedback",
      "escalateFeedback",
      "createAgentRun",
      "respondToAgentRun",
      "finalizeAgentRun"
    ]
  },
  communications_lead: {
    maxSensitivity: "restricted",
    crossScopeAccess: true,
    allowedCommands: [
      "createIssue",
      "createBrief",
      "createAssetDraft",
      "submitApproval",
      "createFeedback",
      "createAgentRun",
      "finalizeAgentRun"
    ]
  },
  regional_manager: {
    maxSensitivity: "restricted",
    crossScopeAccess: false,
    allowedCommands: [
      "createBrief",
      "createTask",
      "assignTask",
      "closeTask",
      "createFeedback",
      "escalateFeedback"
    ]
  },
  candidate_team: {
    maxSensitivity: "internal",
    crossScopeAccess: false,
    allowedCommands: ["createAssetDraft", "createTask", "createFeedback"]
  },
  volunteer_coordinator: {
    maxSensitivity: "internal",
    crossScopeAccess: false,
    allowedCommands: ["createTask", "assignTask", "closeTask", "createFeedback"]
  },
  reviewer: {
    maxSensitivity: "confidential",
    crossScopeAccess: true,
    allowedCommands: [
      "respondToApproval",
      "publishApproval",
      "respondToAgentRun"
    ]
  },
  viewer: {
    maxSensitivity: "public",
    crossScopeAccess: false,
    allowedCommands: []
  }
};

export function resolveActorRole(actor: ActorRef): ActorRole {
  if (actor.role) {
    return actor.role;
  }

  if (actor.actorType === "system") {
    return "super_admin";
  }

  if (actor.teamId === "team_central_ops") {
    return "central_ops";
  }

  if (actor.teamId === "team_review") {
    return "reviewer";
  }

  if (actor.regionId) {
    return "regional_manager";
  }

  return "viewer";
}

export function getGovernanceRolePolicy(role: ActorRole): GovernanceRolePolicy {
  return rolePolicies[role];
}

export function getAllGovernanceRolePolicies() {
  return governanceRoleIds.map((role) => ({
    role,
    ...rolePolicies[role]
  }));
}
