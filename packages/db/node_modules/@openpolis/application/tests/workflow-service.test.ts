import assert from "node:assert/strict";
import test from "node:test";

import type {
  AgentRun,
  Approval,
  Asset,
  Brief,
  CommandContext,
  Event,
  Feedback,
  Issue,
  Region,
  Task,
  Team
} from "@openpolis/contracts";
import {
  createWorkflowCommandService,
  WorkflowCommandExecutionError,
  WorkflowEntityConflictError,
  WorkflowEntityNotFoundError,
  type AuditRecord,
  type RepositoryBundle
} from "@openpolis/application";
import { WorkflowTransitionError } from "@openpolis/domain";

type WorkflowState = {
  issues: Map<string, Issue>;
  assets: Map<string, Asset>;
  briefs: Map<string, Brief>;
  tasks: Map<string, Task>;
  feedback: Map<string, Feedback>;
  approvals: Map<string, Approval>;
  agentRuns: Map<string, AgentRun>;
  audits: AuditRecord[];
};

function cloneState(state: WorkflowState): WorkflowState {
  return {
    issues: new Map(state.issues),
    assets: new Map(state.assets),
    briefs: new Map(state.briefs),
    tasks: new Map(state.tasks),
    feedback: new Map(state.feedback),
    approvals: new Map(state.approvals),
    agentRuns: new Map(state.agentRuns),
    audits: [...state.audits]
  };
}

function createTestIssue(): Issue {
  return {
    id: "issue_issue_test",
    code: "issue_test",
    title: "Test Issue",
    summary: "Test issue summary",
    kind: "response",
    status: "monitoring",
    priority: "high",
    ownerTeamId: "team_central_ops",
    primaryRegionId: "north_network",
    targetScope: {
      teamIds: ["team_central_ops"],
      regionIds: ["north_network"]
    },
    audienceTags: [],
    keyMessages: [],
    riskNotes: [],
    linkedBriefIds: [],
    linkedAssetIds: [],
    sensitivity: "internal",
    audit: {
      createdAt: "2026-03-19T08:00:00.000Z",
      updatedAt: "2026-03-19T08:00:00.000Z",
      createdBy: "operator_test",
      updatedBy: "operator_test"
    }
  };
}

function createTestBrief(): Brief {
  return {
    id: "brief_brief_test",
    code: "brief_test",
    title: "Test Brief",
    summary: "Test brief summary",
    goal: "Test brief goal",
    issueId: "issue_issue_test",
    ownerTeamId: "team_central_ops",
    targetScope: {
      teamIds: ["team_central_ops"],
      regionIds: ["north_network"]
    },
    outputKinds: ["briefing_note"],
    status: "queued",
    dueAt: "2026-03-20T09:00:00.000Z",
    approvalRequired: true,
    linkedTaskIds: [],
    sensitivity: "internal",
    audit: {
      createdAt: "2026-03-19T08:00:00.000Z",
      updatedAt: "2026-03-19T08:00:00.000Z",
      createdBy: "operator_test",
      updatedBy: "operator_test"
    }
  };
}

function createTestApproval(): Approval {
  return {
    id: "approval_approval_test",
    code: "approval_test",
    title: "Test Approval",
    subject: {
      objectType: "asset",
      objectId: "asset_asset_test",
      objectCode: "asset_test"
    },
    status: "approved",
    requestedByTeamId: "team_central_ops",
    reviewerTeamId: "team_review",
    dueAt: "2026-03-20T09:00:00.000Z",
    checklist: ["message_consistency"],
    sensitivity: "internal",
    audit: {
      createdAt: "2026-03-19T08:00:00.000Z",
      updatedAt: "2026-03-19T08:00:00.000Z",
      createdBy: "operator_test",
      updatedBy: "operator_test"
    }
  };
}

function createRepositoryBundle(
  state: WorkflowState,
  options?: {
    failIssueSaveAfterLink?: boolean;
  }
): RepositoryBundle {
  const restore = (snapshot: WorkflowState) => {
    state.issues = snapshot.issues;
    state.assets = snapshot.assets;
    state.briefs = snapshot.briefs;
    state.tasks = snapshot.tasks;
    state.feedback = snapshot.feedback;
    state.approvals = snapshot.approvals;
    state.agentRuns = snapshot.agentRuns;
    state.audits = snapshot.audits;
  };

  return {
    issues: {
      async getById(id) {
        return state.issues.get(id) ?? null;
      },
      async save(issue) {
        if (options?.failIssueSaveAfterLink && issue.linkedBriefIds.length > 0) {
          throw new Error("issue_save_failed");
        }

        state.issues.set(issue.id, issue);
      }
    },
    assets: {
      async getById(id) {
        return state.assets.get(id) ?? null;
      },
      async save(asset) {
        state.assets.set(asset.id, asset);
      }
    },
    briefs: {
      async getById(id) {
        return state.briefs.get(id) ?? null;
      },
      async save(brief) {
        state.briefs.set(brief.id, brief);
      }
    },
    tasks: {
      async getById(id) {
        return state.tasks.get(id) ?? null;
      },
      async save(task) {
        state.tasks.set(task.id, task);
      }
    },
    teams: {
      async getById(_id: string): Promise<Team | null> {
        return null;
      }
    },
    regions: {
      async getById(_id: string): Promise<Region | null> {
        return null;
      }
    },
    events: {
      async getById(_id: string): Promise<Event | null> {
        return null;
      },
      async save(_event: Event) {}
    },
    feedback: {
      async getById(id) {
        return state.feedback.get(id) ?? null;
      },
      async save(feedback) {
        state.feedback.set(feedback.id, feedback);
      }
    },
    approvals: {
      async getById(id) {
        return state.approvals.get(id) ?? null;
      },
      async save(approval) {
        state.approvals.set(approval.id, approval);
      }
    },
    agentRuns: {
      async getById(id: string) {
        return state.agentRuns.get(id) ?? null;
      },
      async save(run: AgentRun) {
        state.agentRuns.set(run.id, run);
      }
    },
    async runInTransaction<T>(operation: () => Promise<T>) {
      const snapshot = cloneState(state);

      try {
        return await operation();
      } catch (error) {
        restore(snapshot);
        throw error;
      }
    }
  };
}

function createContext(): CommandContext {
  return {
    actor: {
      actorType: "human",
      actorId: "operator_test",
      role: "central_ops",
      teamId: "team_central_ops",
      regionId: "north_network"
    },
    requestId: "req_test",
    reason: "workflow_service_test"
  };
}

test("createBrief rolls back state when a repository write fails", async () => {
  const state: WorkflowState = {
    issues: new Map([["issue_issue_test", createTestIssue()]]),
    assets: new Map(),
    briefs: new Map(),
    tasks: new Map(),
    feedback: new Map(),
    approvals: new Map(),
    agentRuns: new Map(),
    audits: []
  };
  const service = createWorkflowCommandService({
    repositories: createRepositoryBundle(state, {
      failIssueSaveAfterLink: true
    }),
    audit: {
      async append(record) {
        state.audits.push(record);
      }
    },
    clock: {
      now() {
        return "2026-03-19T09:00:00.000Z";
      }
    }
  });

  await assert.rejects(
    () =>
      service.createBrief(createContext(), {
        code: "brief_test",
        title: "Test Brief",
        summary: "Brief summary",
        goal: "Brief goal",
        issueId: "issue_issue_test",
        ownerTeamId: "team_central_ops",
        targetScope: {
          teamIds: ["team_central_ops"],
          regionIds: ["north_network"]
        },
        outputKinds: ["briefing_note"],
        dueAt: "2026-03-20T09:00:00.000Z",
        approvalRequired: true,
        sensitivity: "internal"
      }),
    (error: unknown) => {
      assert.ok(error instanceof WorkflowCommandExecutionError);
      assert.equal(error.commandName, "createBrief");
      assert.equal((error.cause as Error | undefined)?.message, "issue_save_failed");
      return true;
    }
  );

  assert.equal(state.briefs.size, 0);
  assert.deepEqual(state.issues.get("issue_issue_test")?.linkedBriefIds, []);
  assert.equal(state.audits.length, 0);
});

test("createBrief preserves entity-not-found errors without wrapping", async () => {
  const state: WorkflowState = {
    issues: new Map(),
    assets: new Map(),
    briefs: new Map(),
    tasks: new Map(),
    feedback: new Map(),
    approvals: new Map(),
    agentRuns: new Map(),
    audits: []
  };
  const service = createWorkflowCommandService({
    repositories: createRepositoryBundle(state),
    audit: {
      async append(record) {
        state.audits.push(record);
      }
    },
    clock: {
      now() {
        return "2026-03-19T09:00:00.000Z";
      }
    }
  });

  await assert.rejects(
    () =>
      service.createBrief(createContext(), {
        code: "brief_missing_issue",
        title: "Missing Issue Brief",
        summary: "Brief summary",
        goal: "Brief goal",
        issueId: "issue_missing",
        ownerTeamId: "team_central_ops",
        targetScope: {
          teamIds: ["team_central_ops"],
          regionIds: ["north_network"]
        },
        outputKinds: ["briefing_note"],
        dueAt: "2026-03-20T09:00:00.000Z",
        approvalRequired: true,
        sensitivity: "internal"
      }),
    (error: unknown) => {
      assert.ok(error instanceof WorkflowEntityNotFoundError);
      assert.equal(error.entityType, "issue");
      return true;
    }
  );

  assert.equal(state.briefs.size, 0);
  assert.equal(state.audits.length, 0);
});

test("createIssue rolls back persisted state when audit append fails", async () => {
  const state: WorkflowState = {
    issues: new Map(),
    assets: new Map(),
    briefs: new Map(),
    tasks: new Map(),
    feedback: new Map(),
    approvals: new Map(),
    agentRuns: new Map(),
    audits: []
  };
  const service = createWorkflowCommandService({
    repositories: createRepositoryBundle(state),
    audit: {
      async append(record) {
        state.audits.push(record);
        throw new Error("audit_append_failed");
      }
    },
    clock: {
      now() {
        return "2026-03-19T09:00:00.000Z";
      }
    }
  });

  await assert.rejects(
    () =>
      service.createIssue(createContext(), {
        code: "issue_audit_failure",
        title: "Audit Failure Issue",
        summary: "Issue summary",
        kind: "response",
        priority: "high",
        ownerTeamId: "team_central_ops",
        primaryRegionId: "north_network",
        targetScope: {
          teamIds: ["team_central_ops"],
          regionIds: ["north_network"]
        },
        audienceTags: [],
        sensitivity: "internal"
      }),
    (error: unknown) => {
      assert.ok(error instanceof WorkflowCommandExecutionError);
      assert.equal(error.commandName, "createIssue");
      assert.equal((error.cause as Error | undefined)?.message, "audit_append_failed");
      return true;
    }
  );

  assert.equal(state.issues.size, 0);
  assert.equal(state.audits.length, 0);
});

test("respondToApproval preserves transition errors without wrapping", async () => {
  const state: WorkflowState = {
    issues: new Map(),
    assets: new Map(),
    briefs: new Map(),
    tasks: new Map(),
    feedback: new Map(),
    approvals: new Map([
      [
        "approval_approval_test",
        {
          ...createTestApproval(),
          status: "published"
        }
      ]
    ]),
    agentRuns: new Map(),
    audits: []
  };
  const service = createWorkflowCommandService({
    repositories: createRepositoryBundle(state),
    audit: {
      async append(record) {
        state.audits.push(record);
      }
    },
    clock: {
      now() {
        return "2026-03-19T09:00:00.000Z";
      }
    }
  });

  await assert.rejects(
    () =>
      service.respondToApproval(createContext(), {
        approvalId: "approval_approval_test",
        decision: "approved",
        comment: "This should fail because the approval is already published."
      }),
    (error: unknown) => {
      assert.ok(error instanceof WorkflowTransitionError);
      assert.equal(error.workflow, "approval");
      assert.equal(error.from, "published");
      assert.equal(error.to, "approved");
      return true;
    }
  );

  assert.equal(state.approvals.get("approval_approval_test")?.status, "published");
  assert.equal(state.audits.length, 0);
});

test("createAssetDraft rejects missing linked brief references", async () => {
  const state: WorkflowState = {
    issues: new Map([["issue_issue_test", createTestIssue()]]),
    assets: new Map(),
    briefs: new Map(),
    tasks: new Map(),
    feedback: new Map(),
    approvals: new Map(),
    agentRuns: new Map(),
    audits: []
  };
  const service = createWorkflowCommandService({
    repositories: createRepositoryBundle(state),
    audit: {
      async append(record) {
        state.audits.push(record);
      }
    },
    clock: {
      now() {
        return "2026-03-19T09:00:00.000Z";
      }
    }
  });

  await assert.rejects(
    () =>
      service.createAssetDraft(createContext(), {
        code: "asset_missing_brief",
        title: "Missing Brief Asset",
        summary: "Asset summary",
        kind: "template",
        source: "human",
        issueId: "issue_issue_test",
        briefId: "brief_missing",
        ownerTeamId: "team_central_ops",
        locale: "en",
        intendedScope: {
          teamIds: ["team_central_ops"],
          regionIds: ["north_network"]
        },
        versionLabel: "v1",
        sensitivity: "internal"
      }),
    (error: unknown) => {
      assert.ok(error instanceof WorkflowEntityNotFoundError);
      assert.equal(error.entityType, "brief");
      return true;
    }
  );

  assert.equal(state.assets.size, 0);
});

test("createTask rejects missing linked issue references", async () => {
  const state: WorkflowState = {
    issues: new Map(),
    assets: new Map(),
    briefs: new Map(),
    tasks: new Map(),
    feedback: new Map(),
    approvals: new Map(),
    agentRuns: new Map(),
    audits: []
  };
  const service = createWorkflowCommandService({
    repositories: createRepositoryBundle(state),
    audit: {
      async append(record) {
        state.audits.push(record);
      }
    },
    clock: {
      now() {
        return "2026-03-19T09:00:00.000Z";
      }
    }
  });

  await assert.rejects(
    () =>
      service.createTask(createContext(), {
        code: "task_missing_issue",
        title: "Missing Issue Task",
        summary: "Task summary",
        ownerTeamId: "team_central_ops",
        issueId: "issue_missing",
        priority: "high",
        dueAt: "2026-03-20T09:00:00.000Z",
        sensitivity: "internal"
      }),
    (error: unknown) => {
      assert.ok(error instanceof WorkflowEntityNotFoundError);
      assert.equal(error.entityType, "issue");
      return true;
    }
  );

  assert.equal(state.tasks.size, 0);
});

test("createIssue rejects duplicate entity ids instead of overwriting records", async () => {
  const existingIssue = createTestIssue();
  const state: WorkflowState = {
    issues: new Map([[existingIssue.id, existingIssue]]),
    assets: new Map(),
    briefs: new Map(),
    tasks: new Map(),
    feedback: new Map(),
    approvals: new Map(),
    agentRuns: new Map(),
    audits: []
  };
  const service = createWorkflowCommandService({
    repositories: createRepositoryBundle(state),
    audit: {
      async append(record) {
        state.audits.push(record);
      }
    },
    clock: {
      now() {
        return "2026-03-19T09:00:00.000Z";
      }
    }
  });

  await assert.rejects(
    () =>
      service.createIssue(createContext(), {
        code: "issue_test",
        title: "Replacement Issue",
        summary: "This should conflict with an existing issue id.",
        kind: "response",
        priority: "medium",
        ownerTeamId: "team_central_ops",
        primaryRegionId: "north_network",
        targetScope: {
          teamIds: ["team_central_ops"],
          regionIds: ["north_network"]
        },
        audienceTags: [],
        sensitivity: "internal"
      }),
    (error: unknown) => {
      assert.ok(error instanceof WorkflowEntityConflictError);
      assert.equal(error.entityType, "issue");
      assert.equal(error.entityId, existingIssue.id);
      return true;
    }
  );

  assert.equal(state.issues.size, 1);
  assert.equal(state.issues.get(existingIssue.id)?.title, existingIssue.title);
  assert.equal(state.audits.length, 0);
});

test("createAgentRun rejects duplicate entity ids instead of overwriting runs", async () => {
  const existingRun: AgentRun = {
    id: "agent_run_agent_run_test",
    code: "agent_run_test",
    title: "Existing Agent Run",
    instruction: "Review the existing assignment.",
    skillCode: "approval_guard",
    providerCode: "custom_gateway",
    mode: "drafting",
    status: "waiting_human_review",
    approvalState: "pending",
    target: {
      objectType: "brief",
      objectId: "brief_brief_test",
      objectCode: "brief_test"
    },
    visibleScope: {
      teamIds: ["team_central_ops"],
      regionIds: ["north_network"]
    },
    startedAt: "2026-03-19T08:00:00.000Z",
    audit: {
      createdAt: "2026-03-19T08:00:00.000Z",
      updatedAt: "2026-03-19T08:00:00.000Z",
      createdBy: "operator_test",
      updatedBy: "operator_test"
    }
  };
  const state: WorkflowState = {
    issues: new Map(),
    assets: new Map(),
    briefs: new Map(),
    tasks: new Map(),
    feedback: new Map(),
    approvals: new Map(),
    agentRuns: new Map([[existingRun.id, existingRun]]),
    audits: []
  };
  const service = createWorkflowCommandService({
    repositories: createRepositoryBundle(state),
    audit: {
      async append(record) {
        state.audits.push(record);
      }
    },
    clock: {
      now() {
        return "2026-03-19T09:00:00.000Z";
      }
    }
  });

  await assert.rejects(
    () =>
      service.createAgentRun(createContext(), {
        code: "agent_run_test",
        title: "Replacement Agent Run",
        instruction: "This should conflict with an existing agent run id.",
        skillCode: "approval_guard",
        providerCode: "custom_gateway",
        mode: "drafting",
        target: {
          objectType: "brief",
          objectId: "brief_brief_test",
          objectCode: "brief_test"
        },
        requiresHumanApproval: true
      }),
    (error: unknown) => {
      assert.ok(error instanceof WorkflowEntityConflictError);
      assert.equal(error.entityType, "agent_run");
      assert.equal(error.entityId, existingRun.id);
      return true;
    }
  );

  assert.equal(state.agentRuns.size, 1);
  assert.equal(state.agentRuns.get(existingRun.id)?.title, existingRun.title);
  assert.equal(state.audits.length, 0);
});

test("workflow commands cover assignment, escalation, agent review, and approval publication", async () => {
  const state: WorkflowState = {
    issues: new Map([["issue_issue_test", createTestIssue()]]),
    assets: new Map(),
    briefs: new Map([["brief_brief_test", createTestBrief()]]),
    tasks: new Map(),
    feedback: new Map(),
    approvals: new Map([["approval_approval_test", createTestApproval()]]),
    agentRuns: new Map(),
    audits: []
  };
  const service = createWorkflowCommandService({
    repositories: createRepositoryBundle(state),
    audit: {
      async append(record) {
        state.audits.push(record);
      }
    },
    clock: {
      now() {
        return "2026-03-19T09:00:00.000Z";
      }
    }
  });

  const createdTask = await service.createTask(createContext(), {
    code: "task_assignment_test",
    title: "Assignment Test Task",
    summary: "Task summary",
    ownerTeamId: "team_central_ops",
    briefId: "brief_brief_test",
    issueId: "issue_issue_test",
    priority: "high",
    dueAt: "2026-03-20T09:00:00.000Z",
    sensitivity: "internal"
  });

  const assignedTask = await service.assignTask(createContext(), {
    taskId: createdTask.entity.id,
    assigneeTeamId: "team_field_ops",
    regionId: "coastal_district"
  });

  assert.equal(assignedTask.entity.assigneeTeamId, "team_field_ops");
  assert.equal(assignedTask.entity.regionId, "coastal_district");

  const createdFeedback = await service.createFeedback(createContext(), {
    code: "feedback_escalation_test",
    title: "Escalation Test Feedback",
    summary: "Feedback summary",
    severity: "high",
    source: "internal",
    issueId: "issue_issue_test",
    taskId: createdTask.entity.id,
    regionId: "north_network",
    ownerTeamId: "team_central_ops",
    sensitivity: "internal"
  });

  const escalatedFeedback = await service.escalateFeedback(createContext(), {
    feedbackId: createdFeedback.entity.id,
    issueId: "issue_issue_test",
    createTask: true,
    escalationReason: "Escalate into the operations queue"
  });

  assert.equal(escalatedFeedback.entity.status, "attention");
  assert.ok(escalatedFeedback.entity.taskId);
  assert.equal(state.tasks.size, 2);

  const closedTask = await service.closeTask(createContext(), {
    taskId: createdTask.entity.id,
    resolution: "completed",
    summary: "Task completed"
  });

  assert.equal(closedTask.entity.status, "completed");
  assert.equal(closedTask.entity.summary, "Task completed");

  const createdAgentRun = await service.createAgentRun(createContext(), {
    code: "agent_run_test",
    title: "Agent Run Test",
    instruction: "Review this assignment and continue after human confirmation.",
    skillCode: "approval_guard",
    providerCode: "custom_gateway",
    mode: "drafting",
    target: {
      objectType: "brief",
      objectId: "brief_brief_test",
      objectCode: "brief_test"
    },
    requiresHumanApproval: true
  });

  assert.equal(createdAgentRun.entity.status, "waiting_human_review");
  assert.equal(createdAgentRun.entity.approvalState, "pending");

  const approvedAgentRun = await service.respondToAgentRun(createContext(), {
    agentRunId: createdAgentRun.entity.id,
    decision: "approved",
    comment: "Proceed"
  });

  assert.equal(approvedAgentRun.entity.status, "running");
  assert.equal(approvedAgentRun.entity.approvalState, "approved");

  const finalizedAgentRun = await service.finalizeAgentRun(createContext(), {
    agentRunId: createdAgentRun.entity.id,
    outcome: "completed",
    summary: "The agent run finished and stored a result summary."
  });

  assert.equal(finalizedAgentRun.entity.status, "completed");
  assert.equal(
    finalizedAgentRun.entity.latestSummary,
    "The agent run finished and stored a result summary."
  );

  const publishedApproval = await service.publishApproval(createContext(), {
    approvalId: "approval_approval_test",
    comment: "Published to governed release channel"
  });

  assert.equal(publishedApproval.entity.status, "published");
  assert.equal(
    publishedApproval.events[0]?.name,
    "approval.published"
  );
  assert.ok(
    state.audits.some((record) => record.action === "agent.run.created")
  );
  assert.ok(
    state.audits.some((record) => record.action === "agent.run.responded")
  );
  assert.ok(
    state.audits.some((record) => record.action === "agent.run.finalized")
  );
});

test("createIssue rejects viewer actors and records a rejected audit entry", async () => {
  const state: WorkflowState = {
    issues: new Map(),
    assets: new Map(),
    briefs: new Map(),
    tasks: new Map(),
    feedback: new Map(),
    approvals: new Map(),
    agentRuns: new Map(),
    audits: []
  };
  const service = createWorkflowCommandService({
    repositories: createRepositoryBundle(state),
    audit: {
      async append(record) {
        state.audits.push(record);
      }
    },
    clock: {
      now() {
        return "2026-03-19T09:00:00.000Z";
      }
    }
  });

  await assert.rejects(
    service.createIssue(
      {
        ...createContext(),
        actor: {
          actorType: "human",
          actorId: "viewer_test",
          role: "viewer"
        }
      },
      {
        code: "viewer_denied_issue",
        title: "Viewer denied issue",
        summary: "A viewer should not be able to create workflow records.",
        kind: "response",
        priority: "medium",
        ownerTeamId: "team_central_ops",
        primaryRegionId: "north_network",
        targetScope: {
          teamIds: ["team_central_ops"],
          regionIds: ["north_network"]
        },
        audienceTags: [],
        sensitivity: "internal"
      }
    ),
    (error) => {
      assert.equal((error as Error).name, "GovernancePolicyError");
      return true;
    }
  );

  assert.equal(state.issues.size, 0);
  assert.equal(state.audits[0]?.action, "command.rejected");
});
