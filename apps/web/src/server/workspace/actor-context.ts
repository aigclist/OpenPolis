import {
  ActorRefSchema,
  ActorRoleSchema,
  ActorTypeSchema,
  EntityIdSchema,
  type ActorRef,
  type Scope
} from "@openpolis/contracts";

type ActorEnvironment = Partial<
  Record<
    | "OPENPOLIS_ACTOR_TYPE"
    | "OPENPOLIS_ACTOR_ID"
    | "OPENPOLIS_ACTOR_ROLE"
    | "OPENPOLIS_ACTOR_TEAM_ID"
    | "OPENPOLIS_ACTOR_REGION_ID"
    | "OPENPOLIS_ALLOW_ACTOR_OVERRIDE",
    string | undefined
  >
>;

export const actorOverrideHeaderName = "x-openpolis-actor";
export const actorOverrideCookieName = "openpolis_actor";

const defaultActor = ActorRefSchema.parse({
  actorType: "human",
  actorId: "operator_central",
  role: "central_ops",
  teamId: "team_central_ops",
  regionId: "north_network"
});

export const anonymousViewerActor = ActorRefSchema.parse({
  actorType: "human",
  actorId: "viewer_anonymous",
  role: "viewer"
});

function normalizeEnvValue(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function parseOptionalEnvValue<T>(
  parser: { safeParse: (value: unknown) => { success: true; data: T } | { success: false } },
  value: string | undefined
) {
  const normalized = normalizeEnvValue(value);

  if (!normalized) {
    return undefined;
  }

  const parsed = parser.safeParse(normalized);
  return parsed.success ? parsed.data : undefined;
}

export function resolveBaseActor(env?: ActorEnvironment): ActorRef {
  const source = env ?? (process.env as ActorEnvironment);

  return ActorRefSchema.parse({
    actorType:
      parseOptionalEnvValue(ActorTypeSchema, source.OPENPOLIS_ACTOR_TYPE) ??
      defaultActor.actorType,
    actorId:
      parseOptionalEnvValue(EntityIdSchema, source.OPENPOLIS_ACTOR_ID) ??
      defaultActor.actorId,
    role:
      parseOptionalEnvValue(ActorRoleSchema, source.OPENPOLIS_ACTOR_ROLE) ??
      defaultActor.role,
    teamId:
      parseOptionalEnvValue(EntityIdSchema, source.OPENPOLIS_ACTOR_TEAM_ID) ??
      defaultActor.teamId,
    regionId:
      parseOptionalEnvValue(EntityIdSchema, source.OPENPOLIS_ACTOR_REGION_ID) ??
      defaultActor.regionId
  });
}

export function isActorOverrideEnabled(env?: ActorEnvironment) {
  const source = env ?? (process.env as ActorEnvironment);
  return normalizeEnvValue(source.OPENPOLIS_ALLOW_ACTOR_OVERRIDE) === "true";
}

export function parseActorOverride(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  try {
    return ActorRefSchema.parse(JSON.parse(value));
  } catch {
    return null;
  }
}

export type ResolvedCommandActor = {
  actor: ActorRef;
  ownerTeamId: string;
  regionId: string | undefined;
  scope: Scope;
  usedOverride: boolean;
  source: "bootstrap" | "override" | "session" | "anonymous";
};

export function resolveCommandActor(
  options: {
    env?: ActorEnvironment;
    overrideValue?: string | null;
    sessionActor?: ActorRef | null;
    fallbackActor?: ActorRef | null;
  } = {}
): ResolvedCommandActor {
  const baselineActor = options.fallbackActor ?? resolveBaseActor(options.env);
  const allowOverride = isActorOverrideEnabled(options.env);
  const overrideActor = allowOverride
    ? parseActorOverride(options.overrideValue)
    : null;
  const actor = options.sessionActor ?? overrideActor ?? baselineActor;
  const ownerTeamId =
    actor.teamId ?? baselineActor.teamId ?? defaultActor.teamId ?? "team_central_ops";
  const regionId = actor.regionId ?? baselineActor.regionId ?? defaultActor.regionId;
  const source = options.sessionActor
    ? "session"
    : overrideActor
      ? "override"
      : actor.role === "viewer" && !actor.teamId && !actor.regionId
        ? "anonymous"
        : "bootstrap";

  return {
    actor,
    ownerTeamId,
    regionId,
    scope: {
      teamIds: ownerTeamId ? [ownerTeamId] : [],
      regionIds: regionId ? [regionId] : []
    },
    usedOverride: overrideActor !== null,
    source
  };
}

export function createCommandRequestId(prefix: string, seed = Date.now()) {
  return `${prefix}_${seed.toString(36)}`;
}
