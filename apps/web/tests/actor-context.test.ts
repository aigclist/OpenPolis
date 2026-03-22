import assert from "node:assert/strict";
import test from "node:test";

import {
  anonymousViewerActor,
  createCommandRequestId,
  parseActorOverride,
  resolveBaseActor,
  resolveCommandActor
} from "../src/server/workspace/actor-context";

test("resolveBaseActor falls back to the demo-safe central ops actor", () => {
  const actor = resolveBaseActor({});

  assert.deepEqual(actor, {
    actorType: "human",
    actorId: "operator_central",
    role: "central_ops",
    teamId: "team_central_ops",
    regionId: "north_network"
  });
});

test("resolveBaseActor honors valid environment overrides", () => {
  const actor = resolveBaseActor({
    OPENPOLIS_ACTOR_TYPE: "human",
    OPENPOLIS_ACTOR_ID: "operator_regional",
    OPENPOLIS_ACTOR_ROLE: "regional_manager",
    OPENPOLIS_ACTOR_TEAM_ID: "team_region_north",
    OPENPOLIS_ACTOR_REGION_ID: "north_network"
  });

  assert.deepEqual(actor, {
    actorType: "human",
    actorId: "operator_regional",
    role: "regional_manager",
    teamId: "team_region_north",
    regionId: "north_network"
  });
});

test("parseActorOverride rejects malformed actor payloads", () => {
  assert.equal(parseActorOverride("{not-json"), null);
  assert.equal(
    parseActorOverride(
      JSON.stringify({
        actorType: "human",
        actorId: "viewer_override",
        role: "not_a_role"
      })
    ),
    null
  );
});

test("resolveCommandActor ignores overrides until explicitly enabled", () => {
  const resolved = resolveCommandActor({
    env: {
      OPENPOLIS_ACTOR_ID: "operator_env",
      OPENPOLIS_ACTOR_ROLE: "central_ops",
      OPENPOLIS_ACTOR_TEAM_ID: "team_central_ops",
      OPENPOLIS_ACTOR_REGION_ID: "north_network",
      OPENPOLIS_ALLOW_ACTOR_OVERRIDE: "false"
    },
    overrideValue: JSON.stringify({
      actorType: "human",
      actorId: "viewer_override",
      role: "viewer"
    })
  });

  assert.equal(resolved.actor.actorId, "operator_env");
  assert.equal(resolved.usedOverride, false);
  assert.equal(resolved.source, "bootstrap");
});

test("resolveCommandActor uses a valid override and preserves baseline scope defaults", () => {
  const resolved = resolveCommandActor({
    env: {
      OPENPOLIS_ACTOR_ID: "operator_env",
      OPENPOLIS_ACTOR_ROLE: "central_ops",
      OPENPOLIS_ACTOR_TEAM_ID: "team_central_ops",
      OPENPOLIS_ACTOR_REGION_ID: "north_network",
      OPENPOLIS_ALLOW_ACTOR_OVERRIDE: "true"
    },
    overrideValue: JSON.stringify({
      actorType: "human",
      actorId: "viewer_override",
      role: "viewer"
    })
  });

  assert.equal(resolved.actor.actorId, "viewer_override");
  assert.equal(resolved.actor.role, "viewer");
  assert.equal(resolved.ownerTeamId, "team_central_ops");
  assert.equal(resolved.regionId, "north_network");
  assert.deepEqual(resolved.scope, {
    teamIds: ["team_central_ops"],
    regionIds: ["north_network"]
  });
  assert.equal(resolved.usedOverride, true);
  assert.equal(resolved.source, "override");
});

test("resolveCommandActor prioritizes signed session actors over bootstrap state", () => {
  const resolved = resolveCommandActor({
    env: {
      OPENPOLIS_ACTOR_ID: "operator_env",
      OPENPOLIS_ACTOR_ROLE: "central_ops",
      OPENPOLIS_ACTOR_TEAM_ID: "team_central_ops",
      OPENPOLIS_ACTOR_REGION_ID: "north_network"
    },
    sessionActor: {
      actorType: "human",
      actorId: "reviewer_lead",
      role: "reviewer",
      teamId: "team_review"
    }
  });

  assert.equal(resolved.actor.actorId, "reviewer_lead");
  assert.equal(resolved.ownerTeamId, "team_review");
  assert.equal(resolved.source, "session");
});

test("resolveCommandActor can fall back to anonymous viewer when session enforcement is enabled", () => {
  const resolved = resolveCommandActor({
    fallbackActor: anonymousViewerActor
  });

  assert.equal(resolved.actor.role, "viewer");
  assert.equal(resolved.source, "anonymous");
});

test("createCommandRequestId produces stable prefixed identifiers", () => {
  assert.equal(
    createCommandRequestId("issue_intake", 1234567890),
    "issue_intake_kf12oi"
  );
});
