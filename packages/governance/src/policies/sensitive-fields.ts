import type { ActorRole, Sensitivity } from "@openpolis/contracts";

type SensitiveFieldPolicy = {
  fields: string[];
  maxSensitivity: Sensitivity;
};

const policies: Record<ActorRole, SensitiveFieldPolicy> = {
  super_admin: {
    fields: ["audit", "latestComment", "riskNotes", "visibleScope"],
    maxSensitivity: "confidential"
  },
  central_ops: {
    fields: ["audit", "latestComment", "riskNotes", "visibleScope"],
    maxSensitivity: "confidential"
  },
  communications_lead: {
    fields: ["riskNotes", "latestComment"],
    maxSensitivity: "restricted"
  },
  regional_manager: {
    fields: ["riskNotes"],
    maxSensitivity: "restricted"
  },
  candidate_team: {
    fields: ["latestComment"],
    maxSensitivity: "internal"
  },
  volunteer_coordinator: {
    fields: [],
    maxSensitivity: "internal"
  },
  reviewer: {
    fields: ["latestComment", "riskNotes"],
    maxSensitivity: "confidential"
  },
  viewer: {
    fields: [],
    maxSensitivity: "public"
  }
};

export function getSensitiveFieldPolicy(role: ActorRole) {
  return policies[role];
}
