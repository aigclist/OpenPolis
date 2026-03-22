import assert from "node:assert/strict";
import test from "node:test";

import type { ActorRef } from "@openpolis/contracts";
import type {
  AdminSnapshot,
  CoreModuleId,
  ModuleSnapshot,
  SettingsSnapshot,
  SkillProviderSnapshot,
  WorkspaceReadService
} from "@openpolis/application";

import {
  createGovernedWorkspaceReadService,
  filterModuleSnapshotForActor
} from "../src/server/workspace/read-governance";

function createRegionalActor(): ActorRef {
  return {
    actorType: "human",
    actorId: "regional_manager_1",
    role: "regional_manager",
    teamId: "team_region_north",
    regionId: "north_network"
  };
}

function createViewerActor(): ActorRef {
  return {
    actorType: "human",
    actorId: "viewer_1",
    role: "viewer"
  };
}

test("filterModuleSnapshotForActor removes records outside role scope and sensitivity", () => {
  const snapshot: ModuleSnapshot = {
    metrics: [
      { key: "active", value: 3 },
      { key: "blocked", value: 1 }
    ],
    records: [
      {
        code: "north_task",
        title: "North Task",
        summary: "Visible regional task",
        status: "active",
        priority: "high",
        ownerTeam: "team_region_north",
        assigneeTeam: "team_region_north",
        requestedByTeam: null,
        dueDate: "2026-03-21T09:00:00.000Z",
        updatedAt: "2026-03-19T09:00:00.000Z",
        regionCode: "north_network",
        kind: null,
        scope: null,
        issueCode: null,
        briefCode: null,
        taskCode: null,
        approvalCode: null,
        subjectCode: null,
        subjectType: null,
        source: null,
        locale: null,
        sensitivity: "restricted"
      },
      {
        code: "south_task",
        title: "South Task",
        summary: "Different region",
        status: "blocked",
        priority: "critical",
        ownerTeam: "team_region_south",
        assigneeTeam: "team_region_south",
        requestedByTeam: null,
        dueDate: "2026-03-21T11:00:00.000Z",
        updatedAt: "2026-03-19T08:00:00.000Z",
        regionCode: "south_network",
        kind: null,
        scope: null,
        issueCode: null,
        briefCode: null,
        taskCode: null,
        approvalCode: null,
        subjectCode: null,
        subjectType: null,
        source: null,
        locale: null,
        sensitivity: "restricted"
      },
      {
        code: "confidential_task",
        title: "Confidential Task",
        summary: "Too sensitive",
        status: "active",
        priority: "high",
        ownerTeam: "team_region_north",
        assigneeTeam: "team_region_north",
        requestedByTeam: null,
        dueDate: "2026-03-21T12:00:00.000Z",
        updatedAt: "2026-03-19T10:00:00.000Z",
        regionCode: "north_network",
        kind: null,
        scope: null,
        issueCode: null,
        briefCode: null,
        taskCode: null,
        approvalCode: null,
        subjectCode: null,
        subjectType: null,
        source: null,
        locale: null,
        sensitivity: "confidential"
      }
    ]
  };

  const filtered = filterModuleSnapshotForActor(
    createRegionalActor(),
    "operations",
    snapshot
  );

  assert.deepEqual(
    filtered.records.map((row) => row.code),
    ["north_task"]
  );
  assert.deepEqual(filtered.metrics, [
    { key: "active", value: 1 },
    { key: "blocked", value: 0 }
  ]);
});

test("createGovernedWorkspaceReadService recomputes dashboard from filtered module snapshots", async () => {
  const baseService: WorkspaceReadService = {
    getDashboardSnapshot() {
      throw new Error("dashboard should be recomputed from modules");
    },
    getCoreModuleSnapshot(moduleId) {
      switch (moduleId) {
        case "issues":
          return {
            metrics: [{ key: "active", value: 2 }],
            records: [
              {
                code: "north_issue",
                title: "North Issue",
                summary: "Visible issue",
                status: "active",
                priority: "high",
                ownerTeam: "team_region_north",
                assigneeTeam: null,
                requestedByTeam: null,
                dueDate: null,
                updatedAt: "2026-03-19T09:30:00.000Z",
                regionCode: "north_network",
                kind: "response",
                scope: null,
                issueCode: null,
                briefCode: null,
                taskCode: null,
                approvalCode: null,
                subjectCode: null,
                subjectType: null,
                source: null,
                locale: null,
                sensitivity: "restricted"
              },
              {
                code: "south_issue",
                title: "South Issue",
                summary: "Hidden issue",
                status: "active",
                priority: "critical",
                ownerTeam: "team_region_south",
                assigneeTeam: null,
                requestedByTeam: null,
                dueDate: null,
                updatedAt: "2026-03-19T10:30:00.000Z",
                regionCode: "south_network",
                kind: "response",
                scope: null,
                issueCode: null,
                briefCode: null,
                taskCode: null,
                approvalCode: null,
                subjectCode: null,
                subjectType: null,
                source: null,
                locale: null,
                sensitivity: "restricted"
              }
            ]
          };
        case "network":
          return {
            metrics: [{ key: "active", value: 2 }],
            records: [
              {
                code: "north_network",
                title: null,
                summary: null,
                status: "active",
                priority: null,
                ownerTeam: null,
                assigneeTeam: null,
                requestedByTeam: null,
                dueDate: null,
                updatedAt: "2026-03-19T08:00:00.000Z",
                regionCode: null,
                kind: "2",
                scope: "0.82",
                issueCode: null,
                briefCode: null,
                taskCode: null,
                approvalCode: null,
                subjectCode: null,
                subjectType: null,
                source: null,
                locale: null,
                sensitivity: null
              },
              {
                code: "south_network",
                title: null,
                summary: null,
                status: "active",
                priority: null,
                ownerTeam: null,
                assigneeTeam: null,
                requestedByTeam: null,
                dueDate: null,
                updatedAt: "2026-03-19T07:00:00.000Z",
                regionCode: null,
                kind: "1",
                scope: "0.61",
                issueCode: null,
                briefCode: null,
                taskCode: null,
                approvalCode: null,
                subjectCode: null,
                subjectType: null,
                source: null,
                locale: null,
                sensitivity: null
              }
            ]
          };
        case "feedback":
          return {
            metrics: [{ key: "attention", value: 1 }],
            records: [
              {
                code: "north_feedback",
                title: "North Feedback",
                summary: "Visible feedback",
                status: "attention",
                priority: "critical",
                ownerTeam: "team_region_north",
                assigneeTeam: null,
                requestedByTeam: null,
                dueDate: null,
                updatedAt: "2026-03-19T11:00:00.000Z",
                regionCode: "north_network",
                kind: null,
                scope: null,
                issueCode: "north_issue",
                briefCode: null,
                taskCode: "north_task",
                approvalCode: null,
                subjectCode: null,
                subjectType: null,
                source: "internal",
                locale: null,
                sensitivity: "restricted"
              }
            ]
          };
        case "review":
          return {
            metrics: [{ key: "in_review", value: 1 }],
            records: [
              {
                code: "north_review",
                title: "North Review",
                summary: "Visible review",
                status: "in_review",
                priority: null,
                ownerTeam: "team_review",
                assigneeTeam: null,
                requestedByTeam: "team_region_north",
                dueDate: "2026-03-20T09:00:00.000Z",
                updatedAt: null,
                regionCode: null,
                kind: null,
                scope: null,
                issueCode: null,
                briefCode: null,
                taskCode: null,
                approvalCode: null,
                subjectCode: "north_asset",
                subjectType: "asset",
                source: null,
                locale: null,
                sensitivity: "restricted"
              }
            ]
          };
        case "operations":
          return {
            metrics: [
              { key: "active", value: 1 },
              { key: "blocked", value: 1 }
            ],
            records: [
              {
                code: "north_task",
                title: "North Task",
                summary: "Visible task",
                status: "active",
                priority: "high",
                ownerTeam: "team_region_north",
                assigneeTeam: "team_region_north",
                requestedByTeam: null,
                dueDate: "2026-03-20T12:00:00.000Z",
                updatedAt: "2026-03-19T10:00:00.000Z",
                regionCode: "north_network",
                kind: null,
                scope: null,
                issueCode: "north_issue",
                briefCode: null,
                taskCode: null,
                approvalCode: null,
                subjectCode: null,
                subjectType: null,
                source: null,
                locale: null,
                sensitivity: "restricted"
              },
              {
                code: "south_task",
                title: "South Task",
                summary: "Hidden task",
                status: "blocked",
                priority: "high",
                ownerTeam: "team_region_south",
                assigneeTeam: "team_region_south",
                requestedByTeam: null,
                dueDate: "2026-03-20T13:00:00.000Z",
                updatedAt: "2026-03-19T09:00:00.000Z",
                regionCode: "south_network",
                kind: null,
                scope: null,
                issueCode: "south_issue",
                briefCode: null,
                taskCode: null,
                approvalCode: null,
                subjectCode: null,
                subjectType: null,
                source: null,
                locale: null,
                sensitivity: "restricted"
              }
            ]
          };
        case "assets":
        case "briefs":
        case "calendar":
        case "reports":
          return {
            metrics: [],
            records: []
          };
      }
    },
    getSkillProviderSnapshot(): SkillProviderSnapshot {
      return {
        providers: [],
        skills: []
      };
    },
    getSettingsSnapshot(): SettingsSnapshot {
      return {
        locales: 2,
        retention: 30,
        exports: 1
      };
    },
    getAdminSnapshot(): AdminSnapshot {
      return {
        roles: 8,
        audit: 24,
        sensitive: 4
      };
    }
  };

  const governed = createGovernedWorkspaceReadService(
    baseService,
    createRegionalActor()
  );
  const dashboard = await governed.getDashboardSnapshot();

  assert.deepEqual(
    dashboard.priorities.map((row) => row.code),
    ["north_issue"]
  );
  assert.deepEqual(
    dashboard.regions.map((row) => row.code),
    ["north_network"]
  );
  assert.deepEqual(
    dashboard.feedback.map((row) => row.code),
    ["north_feedback"]
  );
  assert.deepEqual(
    dashboard.reviews.map((row) => row.code),
    ["north_review"]
  );
  assert.deepEqual(dashboard.metrics, {
    openTasks: 1,
    inReview: 1,
    blocked: 0,
    urgentFeedback: 1
  });
});

test("createGovernedWorkspaceReadService hides utility surfaces from viewer actors", async () => {
  const baseService: WorkspaceReadService = {
    getDashboardSnapshot() {
      return {
        priorities: [],
        regions: [],
        feedback: [],
        reviews: [],
        metrics: {
          openTasks: 0,
          inReview: 0,
          blocked: 0,
          urgentFeedback: 0
        }
      };
    },
    getCoreModuleSnapshot() {
      return {
        metrics: [],
        records: []
      };
    },
    getSkillProviderSnapshot(): SkillProviderSnapshot {
      return {
        providers: [
          {
            code: "provider_1",
            title: null,
            summary: null,
            status: "enabled",
            priority: null,
            ownerTeam: null,
            assigneeTeam: null,
            requestedByTeam: null,
            dueDate: null,
            updatedAt: null,
            regionCode: null,
            kind: "openai_compatible",
            scope: null,
            issueCode: null,
            briefCode: null,
            taskCode: null,
            approvalCode: null,
            subjectCode: null,
            subjectType: null,
            source: null,
            locale: null,
            sensitivity: null
          }
        ],
        skills: [
          {
            code: "skill_1",
            title: null,
            summary: null,
            status: "enabled",
            priority: null,
            ownerTeam: null,
            assigneeTeam: null,
            requestedByTeam: null,
            dueDate: null,
            updatedAt: null,
            regionCode: null,
            kind: null,
            scope: "issues",
            issueCode: null,
            briefCode: null,
            taskCode: null,
            approvalCode: null,
            subjectCode: null,
            subjectType: null,
            source: null,
            locale: null,
            sensitivity: null
          }
        ]
      };
    },
    getSettingsSnapshot(): SettingsSnapshot {
      return {
        locales: 2,
        retention: 30,
        exports: 3
      };
    },
    getAdminSnapshot(): AdminSnapshot {
      return {
        roles: 8,
        audit: 24,
        sensitive: 4
      };
    }
  };

  const governed = createGovernedWorkspaceReadService(
    baseService,
    createViewerActor()
  );

  assert.deepEqual(await governed.getSkillProviderSnapshot(), {
    providers: [],
    skills: []
  });
  assert.deepEqual(await governed.getSettingsSnapshot(), {
    locales: 0,
    retention: 0,
    exports: 0
  });
  assert.deepEqual(await governed.getAdminSnapshot(), {
    roles: 0,
    audit: 0,
    sensitive: 0
  });
});

test("createGovernedWorkspaceReadService paginates after actor filtering", async () => {
  const baseService: WorkspaceReadService = {
    getDashboardSnapshot() {
      return {
        priorities: [],
        regions: [],
        feedback: [],
        reviews: [],
        metrics: {
          openTasks: 0,
          inReview: 0,
          blocked: 0,
          urgentFeedback: 0
        }
      };
    },
    getCoreModuleSnapshot(moduleId) {
      if (moduleId !== "operations") {
        return {
          metrics: [],
          records: []
        };
      }

      return {
        metrics: [
          { key: "active", value: 3 },
          { key: "blocked", value: 1 }
        ],
        records: [
          {
            code: "north_task_1",
            title: "North Task 1",
            summary: "Visible task",
            status: "active",
            priority: "high",
            ownerTeam: "team_region_north",
            assigneeTeam: "team_region_north",
            requestedByTeam: null,
            dueDate: "2026-03-20T09:00:00.000Z",
            updatedAt: "2026-03-19T09:00:00.000Z",
            regionCode: "north_network",
            kind: null,
            scope: null,
            issueCode: null,
            briefCode: null,
            taskCode: null,
            approvalCode: null,
            subjectCode: null,
            subjectType: null,
            source: null,
            locale: null,
            sensitivity: "restricted"
          },
          {
            code: "south_task_hidden",
            title: "South Task Hidden",
            summary: "Hidden task",
            status: "blocked",
            priority: "critical",
            ownerTeam: "team_region_south",
            assigneeTeam: "team_region_south",
            requestedByTeam: null,
            dueDate: "2026-03-20T10:00:00.000Z",
            updatedAt: "2026-03-19T08:00:00.000Z",
            regionCode: "south_network",
            kind: null,
            scope: null,
            issueCode: null,
            briefCode: null,
            taskCode: null,
            approvalCode: null,
            subjectCode: null,
            subjectType: null,
            source: null,
            locale: null,
            sensitivity: "restricted"
          },
          {
            code: "north_task_2",
            title: "North Task 2",
            summary: "Second visible task",
            status: "active",
            priority: "medium",
            ownerTeam: "team_region_north",
            assigneeTeam: "team_region_north",
            requestedByTeam: null,
            dueDate: "2026-03-20T11:00:00.000Z",
            updatedAt: "2026-03-19T07:00:00.000Z",
            regionCode: "north_network",
            kind: null,
            scope: null,
            issueCode: null,
            briefCode: null,
            taskCode: null,
            approvalCode: null,
            subjectCode: null,
            subjectType: null,
            source: null,
            locale: null,
            sensitivity: "restricted"
          }
        ]
      };
    },
    getSkillProviderSnapshot(): SkillProviderSnapshot {
      return {
        providers: [],
        skills: []
      };
    },
    getSettingsSnapshot(): SettingsSnapshot {
      return {
        locales: 2,
        retention: 30,
        exports: 1
      };
    },
    getAdminSnapshot(): AdminSnapshot {
      return {
        roles: 8,
        audit: 24,
        sensitive: 4
      };
    }
  };

  const governed = createGovernedWorkspaceReadService(
    baseService,
    createRegionalActor()
  );
  const snapshot = await governed.getCoreModuleSnapshot("operations", {
    page: 2,
    pageSize: 1
  });

  assert.deepEqual(
    snapshot.records.map((row) => row.code),
    ["north_task_2"]
  );
  assert.deepEqual(snapshot.metrics, [
    { key: "active", value: 2 },
    { key: "blocked", value: 0 }
  ]);
  assert.deepEqual(snapshot.pagination, {
    page: 2,
    pageSize: 1,
    totalCount: 2,
    totalPages: 2,
    hasNextPage: false,
    hasPreviousPage: true
  });
});

test("createGovernedWorkspaceReadService prefers actor-aware pushdown when available", async () => {
  let fallbackReads = 0;

  const baseService = {
    getDashboardSnapshot() {
      return {
        priorities: [],
        regions: [],
        feedback: [],
        reviews: [],
        metrics: {
          openTasks: 0,
          inReview: 0,
          blocked: 0,
          urgentFeedback: 0
        }
      };
    },
    getCoreModuleSnapshot() {
      fallbackReads += 1;
      throw new Error("fallback read path should not be used");
    },
    getCoreModuleSnapshotForActor(
      moduleId: CoreModuleId,
      actor: ActorRef,
      pagination?: { page?: number; pageSize?: number }
    ): ModuleSnapshot {
      assert.equal(moduleId, "operations");
      assert.equal(actor.actorId, createRegionalActor().actorId);
      assert.deepEqual(pagination, {
        page: 1,
        pageSize: 1
      });

      return {
        metrics: [
          { key: "active", value: 1 },
          { key: "blocked", value: 0 }
        ],
        records: [
          {
            code: "north_task",
            title: "North Task",
            summary: "SQL pushdown result",
            status: "active",
            priority: "high",
            ownerTeam: "team_region_north",
            assigneeTeam: "team_region_north",
            requestedByTeam: null,
            dueDate: "2026-03-20T10:00:00.000Z",
            updatedAt: "2026-03-19T10:00:00.000Z",
            regionCode: "north_network",
            kind: null,
            scope: null,
            issueCode: null,
            briefCode: null,
            taskCode: null,
            approvalCode: null,
            subjectCode: null,
            subjectType: null,
            source: null,
            locale: null,
            sensitivity: "restricted"
          }
        ],
        pagination: {
          page: 1,
          pageSize: 1,
          totalCount: 1,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false
        }
      };
    },
    getSkillProviderSnapshot(): SkillProviderSnapshot {
      return {
        providers: [],
        skills: []
      };
    },
    getSettingsSnapshot(): SettingsSnapshot {
      return {
        locales: 2,
        retention: 30,
        exports: 1
      };
    },
    getAdminSnapshot(): AdminSnapshot {
      return {
        roles: 8,
        audit: 24,
        sensitive: 4
      };
    }
  };

  const governed = createGovernedWorkspaceReadService(
    baseService,
    createRegionalActor()
  );
  const snapshot = await governed.getCoreModuleSnapshot("operations", {
    page: 1,
    pageSize: 1
  });

  assert.equal(fallbackReads, 0);
  assert.deepEqual(
    snapshot.records.map((row) => row.code),
    ["north_task"]
  );
  assert.deepEqual(snapshot.metrics, [
    { key: "active", value: 1 },
    { key: "blocked", value: 0 }
  ]);
  assert.deepEqual(snapshot.pagination, {
    page: 1,
    pageSize: 1,
    totalCount: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false
  });
});
