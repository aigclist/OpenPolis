import type {
  AgentRunStatus,
  ApprovalStatus,
  BriefStatus,
  IssueStatus,
  TaskStatus
} from "@openpolis/contracts";

const issueTransitions: Record<IssueStatus, readonly IssueStatus[]> = {
  monitoring: ["active", "closed"],
  active: ["response_needed", "closed"],
  response_needed: ["active", "closed"],
  closed: []
};

const briefTransitions: Record<BriefStatus, readonly BriefStatus[]> = {
  draft: ["queued", "closed"],
  queued: ["in_review", "closed"],
  in_review: ["scheduled", "draft", "closed"],
  scheduled: ["active", "closed"],
  active: ["closed"],
  closed: []
};

const taskTransitions: Record<TaskStatus, readonly TaskStatus[]> = {
  draft: ["active", "cancelled"],
  active: ["in_review", "blocked", "completed", "cancelled"],
  in_review: ["active", "blocked", "completed", "cancelled"],
  blocked: ["active", "cancelled"],
  completed: [],
  cancelled: []
};

const approvalTransitions: Record<ApprovalStatus, readonly ApprovalStatus[]> = {
  draft: ["in_review", "archived"],
  in_review: ["changes_requested", "approved", "rejected", "archived"],
  changes_requested: ["in_review", "archived"],
  approved: ["published", "archived"],
  published: ["archived"],
  rejected: ["archived"],
  archived: []
};

const agentRunTransitions: Record<AgentRunStatus, readonly AgentRunStatus[]> = {
  pending: ["running", "cancelled"],
  running: ["waiting_human_review", "completed", "failed", "cancelled"],
  waiting_human_review: ["running", "completed", "failed", "cancelled"],
  completed: [],
  failed: [],
  cancelled: []
};

export class WorkflowTransitionError extends Error {
  constructor(
    public readonly workflow: string,
    public readonly from: string,
    public readonly to: string
  ) {
    super(`Invalid ${workflow} transition: ${from} -> ${to}`);
  }
}

function assertAllowedTransition<TStatus extends string>(
  workflow: string,
  transitions: Record<TStatus, readonly TStatus[]>,
  from: TStatus,
  to: TStatus
) {
  if (!transitions[from]?.includes(to)) {
    throw new WorkflowTransitionError(workflow, from, to);
  }
}

export function assertIssueTransition(from: IssueStatus, to: IssueStatus) {
  assertAllowedTransition("issue", issueTransitions, from, to);
}

export function assertBriefTransition(from: BriefStatus, to: BriefStatus) {
  assertAllowedTransition("brief", briefTransitions, from, to);
}

export function assertTaskTransition(from: TaskStatus, to: TaskStatus) {
  assertAllowedTransition("task", taskTransitions, from, to);
}

export function assertApprovalTransition(
  from: ApprovalStatus,
  to: ApprovalStatus
) {
  assertAllowedTransition("approval", approvalTransitions, from, to);
}

export function assertAgentRunTransition(
  from: AgentRunStatus,
  to: AgentRunStatus
) {
  assertAllowedTransition("agent_run", agentRunTransitions, from, to);
}
