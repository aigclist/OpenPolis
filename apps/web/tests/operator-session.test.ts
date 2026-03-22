import assert from "node:assert/strict";
import test from "node:test";

import { isOperatorSessionConfigured } from "../src/server/auth/config";
import {
  createOperatorActorId,
  createOperatorUserClaims,
  getOperatorProfile,
  getOperatorProfiles,
  resolveOperatorActorFromSessionUser,
  resolveOperatorClaimsFromSessionUser,
  resolveOperatorProfileFromSessionUser
} from "../src/server/auth/profiles";

test("getOperatorProfiles exposes the supported operator assignment presets", () => {
  assert.deepEqual(
    getOperatorProfiles().map((profile) => profile.id),
    ["central_ops", "reviewer", "regional_manager_north", "viewer"]
  );
  const reviewerProfile = getOperatorProfile("reviewer");

  assert.ok(reviewerProfile);
  if (!("teamId" in reviewerProfile.actor)) {
    assert.fail("Reviewer profile is missing teamId");
  }

  assert.equal(reviewerProfile.actor.teamId, "team_review");
});

test("createOperatorActorId is deterministic per email and normalized across casing", () => {
  const first = createOperatorActorId("Central.Ops@example.com");
  const same = createOperatorActorId("central.ops@example.com");
  const different = createOperatorActorId("reviewer@example.com");

  assert.equal(first, same);
  assert.notEqual(first, different);
  assert.match(first, /^operator_[a-z0-9_]+_[a-f0-9]{10}$/);
});

test("createOperatorUserClaims applies preset governance fields to a unique actor id", () => {
  assert.deepEqual(
    createOperatorUserClaims(
      "regional_manager_north",
      "operator_regional_manager_north_a1b2c3d4e5"
    ),
    {
      operatorProfileId: "regional_manager_north",
      operatorActorId: "operator_regional_manager_north_a1b2c3d4e5",
      operatorRole: "regional_manager",
      operatorTeamId: "team_region_north",
      operatorRegionId: "north_network"
    }
  );
});

test("session user claims resolve actor and profile from explicit Better Auth fields", () => {
  const sessionUser = {
    email: "central.ops@example.com",
    operatorProfileId: "central_ops",
    operatorActorId: "operator_central_12345abcde",
    operatorRole: "central_ops",
    operatorTeamId: "team_central_ops",
    operatorRegionId: "north_network"
  };

  assert.deepEqual(resolveOperatorClaimsFromSessionUser(sessionUser), {
    operatorProfileId: "central_ops",
    operatorActorId: "operator_central_12345abcde",
    operatorRole: "central_ops",
    operatorTeamId: "team_central_ops",
    operatorRegionId: "north_network"
  });
  assert.deepEqual(resolveOperatorActorFromSessionUser(sessionUser), {
    actorType: "human",
    actorId: "operator_central_12345abcde",
    role: "central_ops",
    teamId: "team_central_ops",
    regionId: "north_network"
  });
  assert.equal(resolveOperatorProfileFromSessionUser(sessionUser)?.id, "central_ops");
});

test("session users without explicit operator claims do not resolve to a preset", () => {
  assert.equal(
    resolveOperatorProfileFromSessionUser({
      email: "central_ops@openpolis.local"
    }),
    null
  );
});

test("isOperatorSessionConfigured requires better auth secret and url only", () => {
  assert.equal(
    isOperatorSessionConfigured({
      BETTER_AUTH_SECRET: "secret_only"
    }),
    false
  );
  assert.equal(
    isOperatorSessionConfigured({
      BETTER_AUTH_URL: "http://localhost:3000"
    }),
    false
  );
  assert.equal(
    isOperatorSessionConfigured({
      BETTER_AUTH_SECRET: "secret",
      BETTER_AUTH_URL: "http://localhost:3000"
    }),
    true
  );
});
