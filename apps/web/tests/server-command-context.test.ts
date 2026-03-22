import assert from "node:assert/strict";
import test from "node:test";

import { assertAuthenticatedCommandAccess } from "../src/server/auth/command-access";
import { OperatorSessionError } from "../src/server/auth/errors";

test("assertAuthenticatedCommandAccess allows bootstrap mode when auth is not configured", () => {
  assert.doesNotThrow(() =>
    assertAuthenticatedCommandAccess({
      sessionConfigured: false,
      session: null
    })
  );
});

test("assertAuthenticatedCommandAccess rejects missing sessions when auth is configured", () => {
  assert.throws(
    () =>
      assertAuthenticatedCommandAccess({
        sessionConfigured: true,
        session: null
      }),
    (error: unknown) => {
      assert.ok(error instanceof OperatorSessionError);
      assert.equal(
        error.message,
        "Authenticated operator session required for workflow commands."
      );
      return true;
    }
  );
});

test("assertAuthenticatedCommandAccess allows authenticated sessions when auth is configured", () => {
  assert.doesNotThrow(() =>
    assertAuthenticatedCommandAccess({
      sessionConfigured: true,
      session: {
        profileId: "central_ops",
        actor: {
          actorType: "human",
          actorId: "operator_central",
          role: "central_ops",
          teamId: "team_central_ops",
          regionId: "north_network"
        },
        issuedAt: "2026-03-19T09:00:00.000Z",
        expiresAt: "2026-03-19T10:00:00.000Z",
        userId: "user_test",
        userEmail: "central_ops@openpolis.local",
        userName: "Central Ops"
      }
    })
  );
});
