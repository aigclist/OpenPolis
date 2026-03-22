import {
  createWorkflowCommandService,
  type Clock,
  type RepositoryBundle,
  type WorkflowCommandService
} from "@openpolis/application";

import { createAgentRunRepository } from "./agent-runs-repository";
import { createApprovalRepository } from "./approvals-repository";
import { createAssetRepository } from "./assets-repository";
import { createAuditSink } from "./audit-sink";
import { createBriefRepository } from "./briefs-repository";
import { createFeedbackRepository } from "./feedback-repository";
import { createIssueRepository } from "./issues-repository";
import { runInSqliteTransaction } from "./shared";
import { createTaskRepository } from "./tasks-repository";

export function createClock(): Clock {
  return {
    now() {
      return new Date().toISOString();
    }
  };
}

export function createRepositoryBundle(): RepositoryBundle {
  const issues = createIssueRepository();
  const briefs = createBriefRepository();
  const assets = createAssetRepository();
  const tasks = createTaskRepository();
  const feedback = createFeedbackRepository();
  const approvals = createApprovalRepository();
  const agentRuns = createAgentRunRepository();

  return {
    issues,
    assets,
    briefs,
    tasks,
    teams: {
      async getById() {
        return null;
      }
    },
    regions: {
      async getById() {
        return null;
      }
    },
    events: {
      async getById() {
        return null;
      },
      async save() {}
    },
    feedback,
    approvals,
    agentRuns,
    runInTransaction: runInSqliteTransaction
  };
}

let workspaceCommandService: WorkflowCommandService | null = null;

export function getWorkspaceCommandService(): WorkflowCommandService {
  if (!workspaceCommandService) {
    workspaceCommandService = createWorkflowCommandService({
      repositories: createRepositoryBundle(),
      audit: createAuditSink(),
      clock: createClock()
    });
  }

  return workspaceCommandService;
}
