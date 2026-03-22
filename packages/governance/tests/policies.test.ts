import assert from "node:assert/strict";
import test from "node:test";

import {
  canAccessObject,
  canRunCommand,
  resolveActorRole
} from "@openpolis/governance";

test("resolveActorRole infers central ops from the default ops team", () => {
  assert.equal(
    resolveActorRole({
      actorType: "human",
      actorId: "operator_central",
      teamId: "team_central_ops"
    }),
    "central_ops"
  );
});

test("viewer actors cannot execute workflow commands", () => {
  assert.equal(
    canRunCommand(
      {
        actorType: "human",
        actorId: "viewer_test",
        role: "viewer"
      },
      "createIssue"
    ),
    false
  );
});

test("regional managers need matching scope and allowed sensitivity", () => {
  const actor = {
    actorType: "human" as const,
    actorId: "regional_manager_1",
    role: "regional_manager" as const,
    teamId: "team_region_north",
    regionId: "north_network"
  };

  assert.equal(
    canAccessObject(actor, {
      id: "task_1",
      code: "task_1",
      title: "North task",
      summary: "Scoped to the north network",
      status: "active",
      priority: "high",
      ownerTeamId: "team_region_north",
      assigneeTeamId: "team_region_north",
      regionId: "north_network",
      dueAt: "2026-03-20T09:00:00.000Z",
      workflowStep: "regional_execution",
      sensitivity: "restricted",
      audit: {
        createdAt: "2026-03-19T09:00:00.000Z",
        updatedAt: "2026-03-19T09:00:00.000Z"
      }
    }),
    true
  );

  assert.equal(
    canAccessObject(actor, {
      id: "task_2",
      code: "task_2",
      title: "Confidential task",
      summary: "Too sensitive for regional access",
      status: "active",
      priority: "high",
      ownerTeamId: "team_region_north",
      assigneeTeamId: "team_region_north",
      regionId: "north_network",
      dueAt: "2026-03-20T09:00:00.000Z",
      workflowStep: "regional_execution",
      sensitivity: "confidential",
      audit: {
        createdAt: "2026-03-19T09:00:00.000Z",
        updatedAt: "2026-03-19T09:00:00.000Z"
      }
    }),
    false
  );
});
