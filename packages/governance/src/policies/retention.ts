import type { ObjectType, Sensitivity } from "@openpolis/contracts";

export type RetentionPolicy = {
  days: number;
  portable: boolean;
  reviewRequired: boolean;
};

const baseRetentionDays: Record<ObjectType, number> = {
  issue: 365,
  asset: 365,
  brief: 365,
  task: 180,
  team: 365,
  region: 365,
  event: 180,
  feedback: 180,
  approval: 730,
  agent_run: 90
};

export function getRetentionPolicy(
  objectType: ObjectType,
  sensitivity: Sensitivity
): RetentionPolicy {
  const multiplier =
    sensitivity === "confidential"
      ? 2
      : sensitivity === "restricted"
        ? 1.5
        : 1;

  return {
    days: Math.round(baseRetentionDays[objectType] * multiplier),
    portable: objectType !== "agent_run",
    reviewRequired: sensitivity !== "public"
  };
}
