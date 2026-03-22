import { createHash } from "node:crypto";
import { z } from "zod";

import {
  ActorRefSchema,
  ActorRoleSchema,
  EntityIdSchema,
  type ActorRef
} from "@openpolis/contracts";

export const operatorProfileIds = [
  "central_ops",
  "reviewer",
  "regional_manager_north",
  "viewer"
] as const;

export const OperatorProfileIdSchema = z.enum(operatorProfileIds);

export type OperatorProfileId = z.infer<typeof OperatorProfileIdSchema>;

type OperatorProfile = {
  id: OperatorProfileId;
  actor: ActorRef;
};

const OptionalEntityIdSchema = EntityIdSchema.nullish().transform((value) =>
  value ?? undefined
);

const OperatorUserClaimsSchema = z.object({
  operatorProfileId: OperatorProfileIdSchema,
  operatorActorId: EntityIdSchema,
  operatorRole: ActorRoleSchema,
  operatorTeamId: OptionalEntityIdSchema,
  operatorRegionId: OptionalEntityIdSchema
});

export type OperatorUserClaims = z.infer<typeof OperatorUserClaimsSchema>;

const operatorProfiles = [
  {
    id: "central_ops",
    actor: ActorRefSchema.parse({
      actorType: "human",
      actorId: "operator_central",
      role: "central_ops",
      teamId: "team_central_ops",
      regionId: "north_network"
    })
  },
  {
    id: "reviewer",
    actor: ActorRefSchema.parse({
      actorType: "human",
      actorId: "reviewer_lead",
      role: "reviewer",
      teamId: "team_review"
    })
  },
  {
    id: "regional_manager_north",
    actor: ActorRefSchema.parse({
      actorType: "human",
      actorId: "regional_manager_north",
      role: "regional_manager",
      teamId: "team_region_north",
      regionId: "north_network"
    })
  },
  {
    id: "viewer",
    actor: ActorRefSchema.parse({
      actorType: "human",
      actorId: "viewer_readonly",
      role: "viewer"
    })
  }
] as const satisfies ReadonlyArray<OperatorProfile>;

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function sanitizeActorIdSegment(value: string) {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

  return normalized || "operator";
}

export function getOperatorProfiles() {
  return operatorProfiles.map((profile) => ({
    id: profile.id,
    actor: profile.actor
  }));
}

export function getOperatorProfile(profileId: OperatorProfileId) {
  return operatorProfiles.find((profile) => profile.id === profileId) ?? null;
}

export function createOperatorActorId(email: string) {
  const normalizedEmail = normalizeEmail(email);
  const [localPart] = normalizedEmail.split("@");
  const localSegment = sanitizeActorIdSegment(localPart ?? normalizedEmail).slice(
    0,
    48
  );
  const fingerprint = createHash("sha256")
    .update(normalizedEmail)
    .digest("hex")
    .slice(0, 10);

  return `operator_${localSegment}_${fingerprint}`;
}

export function createOperatorUserClaims(
  profileId: OperatorProfileId,
  actorId: string
) {
  const profile = getOperatorProfile(profileId);

  if (!profile) {
    return null;
  }

  return OperatorUserClaimsSchema.parse({
    operatorProfileId: profile.id,
    operatorActorId: actorId,
    operatorRole: profile.actor.role,
    operatorTeamId: profile.actor.teamId,
    operatorRegionId: profile.actor.regionId
  });
}

export function resolveOperatorClaimsFromSessionUser(
  user: Record<string, unknown> | null | undefined
) {
  if (!user) {
    return null;
  }

  const parsed = OperatorUserClaimsSchema.safeParse(user);
  return parsed.success ? parsed.data : null;
}

export function resolveOperatorActorFromSessionUser(
  user: Record<string, unknown> | null | undefined
) {
  const claims = resolveOperatorClaimsFromSessionUser(user);

  if (!claims) {
    return null;
  }

  return ActorRefSchema.parse({
    actorType: "human",
    actorId: claims.operatorActorId,
    role: claims.operatorRole,
    teamId: claims.operatorTeamId,
    regionId: claims.operatorRegionId
  });
}

export function resolveOperatorProfileFromSessionUser(
  user: Record<string, unknown> | null | undefined
) {
  const claims = resolveOperatorClaimsFromSessionUser(user);
  return claims ? getOperatorProfile(claims.operatorProfileId) : null;
}
