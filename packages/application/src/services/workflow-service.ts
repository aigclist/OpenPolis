import {
  AssignTaskInputSchema,
  AgentRunSchema,
  ApprovalSchema,
  AssetSchema,
  BriefSchema,
  CommandContextSchema,
  CloseTaskInputSchema,
  CreateAgentRunInputSchema,
  CreateAssetDraftInputSchema,
  CreateBriefInputSchema,
  CreateFeedbackInputSchema,
  CreateIssueInputSchema,
  CreateTaskInputSchema,
  EscalateFeedbackInputSchema,
  FeedbackSchema,
  FinalizeAgentRunInputSchema,
  IssueSchema,
  PublishApprovalInputSchema,
  RespondToAgentRunInputSchema,
  RespondToApprovalInputSchema,
  SubmitApprovalInputSchema,
  TaskSchema,
  type AgentRun,
  type AssignTaskInput,
  type Approval,
  type Asset,
  type Brief,
  type CloseTaskInput,
  type CommandContext,
  type CreateAgentRunInput,
  type CreateAssetDraftInput,
  type CreateBriefInput,
  type CreateFeedbackInput,
  type CreateIssueInput,
  type CreateTaskInput,
  type EscalateFeedbackInput,
  type FinalizeAgentRunInput,
  type Feedback,
  type Issue,
  type ObjectRef,
  type PublishApprovalInput,
  type RespondToAgentRunInput,
  type RespondToApprovalInput,
  type SubmitApprovalInput,
  type Task
} from "@openpolis/contracts";
import {
  assertAgentRunTransition,
  assertApprovalTransition,
  assertIssueTransition,
  assertTaskTransition,
  WorkflowTransitionError,
  type DomainEvent,
  type DomainEventMetadata,
  type DomainEventName
} from "@openpolis/domain";
import {
  assertCommandPermission,
  assertObjectAccess,
  GovernancePolicyError,
  type GovernanceCommandName,
  type GovernedResource
} from "@openpolis/governance";

import type { CommandResult, WorkflowCommandService } from "../commands/workflow";
import type { AuditAction, AuditSink } from "../ports/audit";
import type { Clock } from "../ports/clock";
import type { RepositoryBundle } from "../ports/repositories";

type WorkflowServiceDependencies = {
  repositories: RepositoryBundle;
  audit: AuditSink;
  clock: Clock;
};

export class WorkflowEntityNotFoundError extends Error {
  constructor(
    public readonly entityType: string,
    public readonly entityId: string
  ) {
    super(`Missing ${entityType}: ${entityId}`);
  }
}

export class WorkflowEntityConflictError extends Error {
  constructor(
    public readonly entityType: string,
    public readonly entityId: string
  ) {
    super(`Conflicting ${entityType}: ${entityId}`);
    this.name = "WorkflowEntityConflictError";
  }
}

export class WorkflowCommandExecutionError extends Error {
  public readonly cause?: unknown;

  constructor(
    public readonly commandName: string,
    cause: unknown
  ) {
    super(`Workflow command failed: ${commandName}`);
    this.name = "WorkflowCommandExecutionError";

    if (cause instanceof Error) {
      this.cause = cause;
    }
  }
}

export function createWorkflowCommandService(
  dependencies: WorkflowServiceDependencies
): WorkflowCommandService {
  return new DefaultWorkflowCommandService(dependencies);
}

class DefaultWorkflowCommandService implements WorkflowCommandService {
  constructor(
    private readonly dependencies: WorkflowServiceDependencies
  ) {}

  async createIssue(
    context: CommandContext,
    input: CreateIssueInput
  ): Promise<CommandResult<Issue>> {
    const command = CommandContextSchema.parse(context);
    const payload = CreateIssueInputSchema.parse(input);
    await this.authorizeCommand("createIssue", command);

    return this.executeCommand("createIssue", async () => {
      const occurredAt = this.dependencies.clock.now();
      const issue = IssueSchema.parse({
        id: createEntityId("issue", payload.code),
        code: payload.code,
        title: payload.title,
        summary: payload.summary,
        kind: payload.kind,
        status: "monitoring",
        priority: payload.priority,
        ownerTeamId: payload.ownerTeamId,
        primaryRegionId: payload.primaryRegionId,
        targetScope: payload.targetScope,
        audienceTags: payload.audienceTags,
        keyMessages: [],
        riskNotes: [],
        linkedBriefIds: [],
        linkedAssetIds: [],
        sensitivity: payload.sensitivity,
        audit: createAuditFields(command, occurredAt)
      });

      await this.assertEntityDoesNotExist(
        "issue",
        issue.id,
        this.dependencies.repositories.issues.getById(issue.id)
      );
      await this.dependencies.repositories.issues.save(issue);

      const subject = toObjectRef("issue", issue.id, issue.code);
      const event = createDomainEvent(
        "issue.created",
        occurredAt,
        command,
        subject,
        {
          priority: issue.priority,
          status: issue.status
        }
      );

      await this.appendAudit("command.accepted", occurredAt, command, subject, {
        command: "createIssue",
        priority: issue.priority,
        status: issue.status
      });

      return { entity: issue, events: [event] };
    });
  }

  async createBrief(
    context: CommandContext,
    input: CreateBriefInput
  ): Promise<CommandResult<Brief>> {
    const command = CommandContextSchema.parse(context);
    const payload = CreateBriefInputSchema.parse(input);
    await this.authorizeCommand("createBrief", command);

    return this.executeCommand("createBrief", async () => {
      const occurredAt = this.dependencies.clock.now();
      const brief = BriefSchema.parse({
        id: createEntityId("brief", payload.code),
        code: payload.code,
        title: payload.title,
        summary: payload.summary,
        goal: payload.goal,
        issueId: payload.issueId,
        ownerTeamId: payload.ownerTeamId,
        targetScope: payload.targetScope,
        outputKinds: payload.outputKinds,
        status: payload.approvalRequired ? "queued" : "draft",
        dueAt: payload.dueAt,
        approvalRequired: payload.approvalRequired,
        linkedTaskIds: [],
        sensitivity: payload.sensitivity,
        audit: createAuditFields(command, occurredAt)
      });

      const events: DomainEvent[] = [];
      await this.assertEntityDoesNotExist(
        "brief",
        brief.id,
        this.dependencies.repositories.briefs.getById(brief.id)
      );
      await this.dependencies.repositories.briefs.save(brief);

      if (payload.issueId) {
        const issue = await this.requireIssue(payload.issueId);
        await this.authorizeResourceAccess(
          "createBrief",
          command,
          issue,
          toObjectRef("issue", issue.id, issue.code)
        );
        const nextStatus =
          issue.status === "monitoring" ? "active" : issue.status;

        if (nextStatus !== issue.status) {
          assertIssueTransition(issue.status, nextStatus);
        }

        const nextIssue = IssueSchema.parse({
          ...issue,
          status: nextStatus,
          linkedBriefIds: appendUnique(issue.linkedBriefIds, brief.id),
          audit: touchAuditFields(issue.audit, command, occurredAt)
        });

        await this.dependencies.repositories.issues.save(nextIssue);

        if (nextStatus !== issue.status) {
          events.push(
            createDomainEvent(
              "issue.status_changed",
              occurredAt,
              command,
              toObjectRef("issue", nextIssue.id, nextIssue.code),
              { from: issue.status, to: nextStatus }
            )
          );

          await this.appendAudit(
            "workflow.transitioned",
            occurredAt,
            command,
            toObjectRef("issue", nextIssue.id, nextIssue.code),
            { from: issue.status, to: nextStatus }
          );
        }
      }

      const subject = toObjectRef("brief", brief.id, brief.code);
      events.unshift(
        createDomainEvent("brief.created", occurredAt, command, subject, {
          status: brief.status,
          approvalRequired: String(brief.approvalRequired)
        })
      );

      await this.appendAudit("command.accepted", occurredAt, command, subject, {
        command: "createBrief",
        status: brief.status,
        approvalRequired: String(brief.approvalRequired)
      });

      return { entity: brief, events };
    });
  }

  async createAssetDraft(
    context: CommandContext,
    input: CreateAssetDraftInput
  ): Promise<CommandResult<Asset>> {
    const command = CommandContextSchema.parse(context);
    const payload = CreateAssetDraftInputSchema.parse(input);
    await this.authorizeCommand("createAssetDraft", command);

    return this.executeCommand("createAssetDraft", async () => {
      const issue = payload.issueId
        ? await this.requireIssue(payload.issueId)
        : null;

      if (issue) {
        await this.authorizeResourceAccess(
          "createAssetDraft",
          command,
          issue,
          toObjectRef("issue", issue.id, issue.code)
        );
      }

      if (payload.briefId) {
        const brief = await this.requireBrief(payload.briefId);
        await this.authorizeResourceAccess(
          "createAssetDraft",
          command,
          brief,
          toObjectRef("brief", brief.id, brief.code)
        );
      }

      const occurredAt = this.dependencies.clock.now();
      const asset = AssetSchema.parse({
        id: createEntityId("asset", payload.code),
        code: payload.code,
        title: payload.title,
        summary: payload.summary,
        kind: payload.kind,
        status: "draft",
        source: payload.source,
        issueId: payload.issueId,
        briefId: payload.briefId,
        ownerTeamId: payload.ownerTeamId,
        locale: payload.locale,
        intendedScope: payload.intendedScope,
        versionLabel: payload.versionLabel,
        sensitivity: payload.sensitivity,
        audit: createAuditFields(command, occurredAt)
      });

      await this.assertEntityDoesNotExist(
        "asset",
        asset.id,
        this.dependencies.repositories.assets.getById(asset.id)
      );
      await this.dependencies.repositories.assets.save(asset);

      if (issue) {
        const nextIssue = IssueSchema.parse({
          ...issue,
          linkedAssetIds: appendUnique(issue.linkedAssetIds, asset.id),
          audit: touchAuditFields(issue.audit, command, occurredAt)
        });

        await this.dependencies.repositories.issues.save(nextIssue);
      }

      const subject = toObjectRef("asset", asset.id, asset.code);
      const event = createDomainEvent(
        "asset.drafted",
        occurredAt,
        command,
        subject,
        {
          kind: asset.kind,
          source: asset.source
        }
      );

      await this.appendAudit("command.accepted", occurredAt, command, subject, {
        command: "createAssetDraft",
        kind: asset.kind,
        source: asset.source
      });

      return { entity: asset, events: [event] };
    });
  }

  async submitApproval(
    context: CommandContext,
    input: SubmitApprovalInput
  ): Promise<CommandResult<Approval>> {
    const command = CommandContextSchema.parse(context);
    const payload = SubmitApprovalInputSchema.parse(input);
    await this.authorizeCommand("submitApproval", command);

    return this.executeCommand("submitApproval", async () => {
      const occurredAt = this.dependencies.clock.now();
      const approval = ApprovalSchema.parse({
        id: createEntityId("approval", payload.code),
        code: payload.code,
        title: payload.title,
        subject: payload.subject,
        status: "in_review",
        requestedByTeamId: payload.requestedByTeamId,
        reviewerTeamId: payload.reviewerTeamId,
        dueAt: payload.dueAt,
        checklist: payload.checklist,
        sensitivity: payload.sensitivity,
        audit: createAuditFields(command, occurredAt)
      });

      await this.assertEntityDoesNotExist(
        "approval",
        approval.id,
        this.dependencies.repositories.approvals.getById(approval.id)
      );
      await this.dependencies.repositories.approvals.save(approval);

      if (payload.subject.objectType === "asset") {
        const asset = await this.requireAsset(payload.subject.objectId);
        await this.authorizeResourceAccess(
          "submitApproval",
          command,
          asset,
          toObjectRef("asset", asset.id, asset.code)
        );
        const nextAsset = AssetSchema.parse({
          ...asset,
          approvalId: approval.id,
          audit: touchAuditFields(asset.audit, command, occurredAt)
        });

        await this.dependencies.repositories.assets.save(nextAsset);
      }

      const subject = toObjectRef("approval", approval.id, approval.code);
      const event = createDomainEvent(
        "approval.submitted",
        occurredAt,
        command,
        subject,
        { reviewStatus: approval.status }
      );

      await this.appendAudit("approval.requested", occurredAt, command, subject, {
        command: "submitApproval",
        reviewStatus: approval.status
      });

      return { entity: approval, events: [event] };
    });
  }

  async respondToApproval(
    context: CommandContext,
    input: RespondToApprovalInput
  ): Promise<CommandResult<Approval>> {
    const command = CommandContextSchema.parse(context);
    const payload = RespondToApprovalInputSchema.parse(input);
    await this.authorizeCommand("respondToApproval", command);

    return this.executeCommand("respondToApproval", async () => {
      const approval = await this.requireApproval(payload.approvalId);
      await this.authorizeResourceAccess(
        "respondToApproval",
        command,
        approval,
        toObjectRef("approval", approval.id, approval.code)
      );
      const occurredAt = this.dependencies.clock.now();

      assertApprovalTransition(approval.status, payload.decision);

      const nextApproval = ApprovalSchema.parse({
        ...approval,
        status: payload.decision,
        latestComment: payload.comment,
        audit: touchAuditFields(approval.audit, command, occurredAt)
      });

      await this.dependencies.repositories.approvals.save(nextApproval);

      if (
        nextApproval.subject.objectType === "asset" &&
        payload.decision === "approved"
      ) {
        const asset = await this.requireAsset(nextApproval.subject.objectId);
        const nextAsset = AssetSchema.parse({
          ...asset,
          status: "approved",
          approvalId: nextApproval.id,
          audit: touchAuditFields(asset.audit, command, occurredAt)
        });

        await this.dependencies.repositories.assets.save(nextAsset);
      }

      const subject = toObjectRef("approval", nextApproval.id, nextApproval.code);
      const event = createDomainEvent(
        "approval.responded",
        occurredAt,
        command,
        subject,
        { decision: payload.decision }
      );

      await this.appendAudit(
        "approval.responded",
        occurredAt,
        command,
        subject,
        {
          command: "respondToApproval",
          decision: payload.decision
        }
      );

      return { entity: nextApproval, events: [event] };
    });
  }

  async publishApproval(
    context: CommandContext,
    input: PublishApprovalInput
  ): Promise<CommandResult<Approval>> {
    const command = CommandContextSchema.parse(context);
    const payload = PublishApprovalInputSchema.parse(input);
    await this.authorizeCommand("publishApproval", command);

    return this.executeCommand("publishApproval", async () => {
      const approval = await this.requireApproval(payload.approvalId);
      await this.authorizeResourceAccess(
        "publishApproval",
        command,
        approval,
        toObjectRef("approval", approval.id, approval.code)
      );
      const occurredAt = this.dependencies.clock.now();

      assertApprovalTransition(approval.status, "published");

      const nextApproval = ApprovalSchema.parse({
        ...approval,
        status: "published",
        latestComment: payload.comment ?? approval.latestComment,
        audit: touchAuditFields(approval.audit, command, occurredAt)
      });

      await this.dependencies.repositories.approvals.save(nextApproval);

      const subject = toObjectRef("approval", nextApproval.id, nextApproval.code);
      const event = createDomainEvent(
        "approval.published",
        occurredAt,
        command,
        subject,
        {
          from: approval.status,
          to: nextApproval.status
        }
      );

      await this.appendAudit(
        "workflow.transitioned",
        occurredAt,
        command,
        subject,
        {
          command: "publishApproval",
          from: approval.status,
          to: nextApproval.status
        }
      );

      return { entity: nextApproval, events: [event] };
    });
  }

  async createTask(
    context: CommandContext,
    input: CreateTaskInput
  ): Promise<CommandResult<Task>> {
    const command = CommandContextSchema.parse(context);
    const payload = CreateTaskInputSchema.parse(input);
    await this.authorizeCommand("createTask", command);

    return this.executeCommand("createTask", async () => {
      if (payload.issueId) {
        const issue = await this.requireIssue(payload.issueId);
        await this.authorizeResourceAccess(
          "createTask",
          command,
          issue,
          toObjectRef("issue", issue.id, issue.code)
        );
      }

      const brief = payload.briefId
        ? await this.requireBrief(payload.briefId)
        : null;

      if (brief) {
        await this.authorizeResourceAccess(
          "createTask",
          command,
          brief,
          toObjectRef("brief", brief.id, brief.code)
        );
      }

      const occurredAt = this.dependencies.clock.now();
      const task = TaskSchema.parse({
        id: createEntityId("task", payload.code),
        code: payload.code,
        title: payload.title,
        summary: payload.summary,
        status: "active",
        priority: payload.priority,
        ownerTeamId: payload.ownerTeamId,
        assigneeTeamId: payload.assigneeTeamId,
        regionId: payload.regionId,
        briefId: payload.briefId,
        issueId: payload.issueId,
        dueAt: payload.dueAt,
        workflowStep: payload.workflowStep,
        sensitivity: payload.sensitivity,
        audit: createAuditFields(command, occurredAt)
      });

      await this.assertEntityDoesNotExist(
        "task",
        task.id,
        this.dependencies.repositories.tasks.getById(task.id)
      );
      await this.dependencies.repositories.tasks.save(task);

      if (brief) {
        const nextBrief = BriefSchema.parse({
          ...brief,
          linkedTaskIds: appendUnique(brief.linkedTaskIds, task.id),
          audit: touchAuditFields(brief.audit, command, occurredAt)
        });

        await this.dependencies.repositories.briefs.save(nextBrief);
      }

      const subject = toObjectRef("task", task.id, task.code);
      const event = createDomainEvent(
        "task.created",
        occurredAt,
        command,
        subject,
        {
          priority: task.priority,
          status: task.status
        }
      );

      await this.appendAudit("command.accepted", occurredAt, command, subject, {
        command: "createTask",
        priority: task.priority,
        status: task.status
      });

      return { entity: task, events: [event] };
    });
  }

  async assignTask(
    context: CommandContext,
    input: AssignTaskInput
  ): Promise<CommandResult<Task>> {
    const command = CommandContextSchema.parse(context);
    const payload = AssignTaskInputSchema.parse(input);
    await this.authorizeCommand("assignTask", command);

    return this.executeCommand("assignTask", async () => {
      const task = await this.requireTask(payload.taskId);
      await this.authorizeResourceAccess(
        "assignTask",
        command,
        task,
        toObjectRef("task", task.id, task.code)
      );
      const occurredAt = this.dependencies.clock.now();
      const nextStatus = task.status === "draft" ? "active" : task.status;

      if (nextStatus !== task.status) {
        assertTaskTransition(task.status, nextStatus);
      }

      const nextTask = TaskSchema.parse({
        ...task,
        status: nextStatus,
        assigneeTeamId: payload.assigneeTeamId ?? task.assigneeTeamId,
        regionId: payload.regionId ?? task.regionId,
        audit: touchAuditFields(task.audit, command, occurredAt)
      });

      await this.dependencies.repositories.tasks.save(nextTask);

      const subject = toObjectRef("task", nextTask.id, nextTask.code);
      const event = createDomainEvent(
        "task.assigned",
        occurredAt,
        command,
        subject,
        {
          assigneeTeamId: nextTask.assigneeTeamId ?? null,
          regionId: nextTask.regionId ?? null
        }
      );

      await this.appendAudit("command.accepted", occurredAt, command, subject, {
        command: "assignTask",
        assigneeTeamId: nextTask.assigneeTeamId ?? null,
        regionId: nextTask.regionId ?? null
      });

      return { entity: nextTask, events: [event] };
    });
  }

  async closeTask(
    context: CommandContext,
    input: CloseTaskInput
  ): Promise<CommandResult<Task>> {
    const command = CommandContextSchema.parse(context);
    const payload = CloseTaskInputSchema.parse(input);
    await this.authorizeCommand("closeTask", command);

    return this.executeCommand("closeTask", async () => {
      const task = await this.requireTask(payload.taskId);
      await this.authorizeResourceAccess(
        "closeTask",
        command,
        task,
        toObjectRef("task", task.id, task.code)
      );
      const occurredAt = this.dependencies.clock.now();
      const nextStatus = payload.resolution === "completed"
        ? "completed"
        : "cancelled";

      assertTaskTransition(task.status, nextStatus);

      const nextTask = TaskSchema.parse({
        ...task,
        status: nextStatus,
        summary: payload.summary ?? task.summary,
        audit: touchAuditFields(task.audit, command, occurredAt)
      });

      await this.dependencies.repositories.tasks.save(nextTask);

      const subject = toObjectRef("task", nextTask.id, nextTask.code);
      const event = createDomainEvent(
        "task.closed",
        occurredAt,
        command,
        subject,
        { resolution: payload.resolution }
      );

      await this.appendAudit("command.accepted", occurredAt, command, subject, {
        command: "closeTask",
        resolution: payload.resolution
      });

      return { entity: nextTask, events: [event] };
    });
  }

  async createFeedback(
    context: CommandContext,
    input: CreateFeedbackInput
  ): Promise<CommandResult<Feedback>> {
    const command = CommandContextSchema.parse(context);
    const payload = CreateFeedbackInputSchema.parse(input);
    await this.authorizeCommand("createFeedback", command);

    return this.executeCommand("createFeedback", async () => {
      if (payload.issueId) {
        const issue = await this.requireIssue(payload.issueId);
        await this.authorizeResourceAccess(
          "createFeedback",
          command,
          issue,
          toObjectRef("issue", issue.id, issue.code)
        );
      }

      if (payload.taskId) {
        const task = await this.requireTask(payload.taskId);
        await this.authorizeResourceAccess(
          "createFeedback",
          command,
          task,
          toObjectRef("task", task.id, task.code)
        );
      }

      const occurredAt = this.dependencies.clock.now();
      const feedback = FeedbackSchema.parse({
        id: createEntityId("feedback", payload.code),
        code: payload.code,
        title: payload.title,
        summary: payload.summary,
        status:
          payload.severity === "critical" || payload.severity === "high"
            ? "attention"
            : "active",
        severity: payload.severity,
        source: payload.source,
        issueId: payload.issueId,
        taskId: payload.taskId,
        regionId: payload.regionId,
        ownerTeamId: payload.ownerTeamId,
        sensitivity: payload.sensitivity,
        audit: createAuditFields(command, occurredAt)
      });

      await this.assertEntityDoesNotExist(
        "feedback",
        feedback.id,
        this.dependencies.repositories.feedback.getById(feedback.id)
      );
      await this.dependencies.repositories.feedback.save(feedback);

      const subject = toObjectRef("feedback", feedback.id, feedback.code);
      const event = createDomainEvent(
        "feedback.created",
        occurredAt,
        command,
        subject,
        { severity: feedback.severity, status: feedback.status }
      );

      await this.appendAudit("command.accepted", occurredAt, command, subject, {
        command: "createFeedback",
        severity: feedback.severity,
        status: feedback.status
      });

      return { entity: feedback, events: [event] };
    });
  }

  async escalateFeedback(
    context: CommandContext,
    input: EscalateFeedbackInput
  ): Promise<CommandResult<Feedback>> {
    const command = CommandContextSchema.parse(context);
    const payload = EscalateFeedbackInputSchema.parse(input);
    await this.authorizeCommand("escalateFeedback", command);

    return this.executeCommand("escalateFeedback", async () => {
      const feedback = await this.requireFeedback(payload.feedbackId);
      await this.authorizeResourceAccess(
        "escalateFeedback",
        command,
        feedback,
        toObjectRef("feedback", feedback.id, feedback.code)
      );
      const linkedIssueId = payload.issueId ?? feedback.issueId;

      if (payload.issueId) {
        const issue = await this.requireIssue(payload.issueId);
        await this.authorizeResourceAccess(
          "escalateFeedback",
          command,
          issue,
          toObjectRef("issue", issue.id, issue.code)
        );
      }

      const occurredAt = this.dependencies.clock.now();
      let createdTask: Task | null = null;

      if (payload.createTask) {
        createdTask = TaskSchema.parse({
          id: createEntityId(
            "task",
            createDerivedCode("feedback_escalation", feedback.code, occurredAt)
          ),
          code: createDerivedCode("feedback_escalation", feedback.code, occurredAt),
          title: feedback.title,
          summary: payload.escalationReason,
          status: "active",
          priority: mapSeverityToPriority(feedback.severity),
          ownerTeamId:
            feedback.ownerTeamId ??
            command.actor.teamId ??
            "team_central_ops",
          assigneeTeamId: feedback.ownerTeamId ?? command.actor.teamId,
          regionId: feedback.regionId,
          briefId: undefined,
          issueId: linkedIssueId,
          dueAt: addHours(occurredAt, 24),
          workflowStep: "feedback_escalation",
          sensitivity: feedback.sensitivity,
          audit: createAuditFields(command, occurredAt)
        });

        await this.dependencies.repositories.tasks.save(createdTask);
      }

      const nextFeedback = FeedbackSchema.parse({
        ...feedback,
        status: "attention",
        issueId: linkedIssueId,
        taskId: createdTask?.id ?? feedback.taskId,
        summary: payload.escalationReason,
        audit: touchAuditFields(feedback.audit, command, occurredAt)
      });

      await this.dependencies.repositories.feedback.save(nextFeedback);

      const subject = toObjectRef(
        "feedback",
        nextFeedback.id,
        nextFeedback.code
      );
      const event = createDomainEvent(
        "feedback.escalated",
        occurredAt,
        command,
        subject,
        {
          issueId: linkedIssueId ?? null,
          taskCreated: Boolean(createdTask),
          severity: nextFeedback.severity
        }
      );

      await this.appendAudit("command.accepted", occurredAt, command, subject, {
        command: "escalateFeedback",
        issueId: linkedIssueId ?? null,
        taskCreated: Boolean(createdTask)
      });

      return { entity: nextFeedback, events: [event] };
    });
  }

  async createAgentRun(
    context: CommandContext,
    input: CreateAgentRunInput
  ): Promise<CommandResult<AgentRun>> {
    const command = CommandContextSchema.parse(context);
    const payload = CreateAgentRunInputSchema.parse(input);
    await this.authorizeCommand("createAgentRun", command);

    return this.executeCommand("createAgentRun", async () => {
      const occurredAt = this.dependencies.clock.now();
      const requiresHumanApproval = payload.requiresHumanApproval;
      const agentRun = AgentRunSchema.parse({
        id: createEntityId("agent_run", payload.code),
        code: payload.code,
        title: payload.title,
        instruction: payload.instruction,
        skillCode: payload.skillCode,
        providerCode: payload.providerCode,
        mode: payload.mode,
        status: requiresHumanApproval ? "waiting_human_review" : "running",
        approvalState: requiresHumanApproval ? "pending" : "not_required",
        reviewReason: payload.reviewReason,
        target: payload.target,
        visibleScope: createVisibleScope(command),
        startedAt: occurredAt,
        audit: createAuditFields(command, occurredAt)
      });

      await this.assertEntityDoesNotExist(
        "agent_run",
        agentRun.id,
        this.dependencies.repositories.agentRuns.getById(agentRun.id)
      );
      await this.dependencies.repositories.agentRuns.save(agentRun);

      const subject = toObjectRef("agent_run", agentRun.id, agentRun.code);
      const event = createDomainEvent(
        "agent_run.created",
        occurredAt,
        command,
        subject,
        {
          mode: agentRun.mode,
          approvalState: agentRun.approvalState
        }
      );

      await this.appendAudit("agent.run.created", occurredAt, command, subject, {
        mode: agentRun.mode,
        approvalState: agentRun.approvalState
      });

      return { entity: agentRun, events: [event] };
    });
  }

  async respondToAgentRun(
    context: CommandContext,
    input: RespondToAgentRunInput
  ): Promise<CommandResult<AgentRun>> {
    const command = CommandContextSchema.parse(context);
    const payload = RespondToAgentRunInputSchema.parse(input);
    await this.authorizeCommand("respondToAgentRun", command);

    return this.executeCommand("respondToAgentRun", async () => {
      const agentRun = await this.requireAgentRun(payload.agentRunId);
      await this.authorizeResourceAccess(
        "respondToAgentRun",
        command,
        agentRun,
        toObjectRef("agent_run", agentRun.id, agentRun.code)
      );
      const occurredAt = this.dependencies.clock.now();
      const nextStatus = payload.decision === "approved" ? "running" : "cancelled";

      assertAgentRunTransition(agentRun.status, nextStatus);

      const nextAgentRun = AgentRunSchema.parse({
        ...agentRun,
        status: nextStatus,
        approvalState:
          payload.decision === "approved" ? "approved" : "rejected",
        reviewReason:
          payload.decision === "approved" ? undefined : agentRun.reviewReason,
        finishedAt: payload.decision === "rejected" ? occurredAt : undefined,
        audit: touchAuditFields(agentRun.audit, command, occurredAt)
      });

      await this.dependencies.repositories.agentRuns.save(nextAgentRun);

      const subject = toObjectRef(
        "agent_run",
        nextAgentRun.id,
        nextAgentRun.code
      );
      const event = createDomainEvent(
        "agent_run.responded",
        occurredAt,
        command,
        subject,
        {
          decision: payload.decision,
          status: nextAgentRun.status
        }
      );

      await this.appendAudit(
        "agent.run.responded",
        occurredAt,
        command,
        subject,
        {
          decision: payload.decision,
          status: nextAgentRun.status
        }
      );

      return { entity: nextAgentRun, events: [event] };
    });
  }

  async finalizeAgentRun(
    context: CommandContext,
    input: FinalizeAgentRunInput
  ): Promise<CommandResult<AgentRun>> {
    const command = CommandContextSchema.parse(context);
    const payload = FinalizeAgentRunInputSchema.parse(input);
    await this.authorizeCommand("finalizeAgentRun", command);

    return this.executeCommand("finalizeAgentRun", async () => {
      const agentRun = await this.requireAgentRun(payload.agentRunId);
      await this.authorizeResourceAccess(
        "finalizeAgentRun",
        command,
        agentRun,
        toObjectRef("agent_run", agentRun.id, agentRun.code)
      );
      const occurredAt = this.dependencies.clock.now();

      assertAgentRunTransition(agentRun.status, payload.outcome);

      const nextAgentRun = AgentRunSchema.parse({
        ...agentRun,
        status: payload.outcome,
        latestSummary: payload.summary,
        reviewReason: undefined,
        finishedAt: occurredAt,
        audit: touchAuditFields(agentRun.audit, command, occurredAt)
      });

      await this.dependencies.repositories.agentRuns.save(nextAgentRun);

      const subject = toObjectRef(
        "agent_run",
        nextAgentRun.id,
        nextAgentRun.code
      );
      const event = createDomainEvent(
        "agent_run.finalized",
        occurredAt,
        command,
        subject,
        {
          outcome: nextAgentRun.status,
          approvalState: nextAgentRun.approvalState
        }
      );

      await this.appendAudit(
        "agent.run.finalized",
        occurredAt,
        command,
        subject,
        {
          outcome: nextAgentRun.status,
          approvalState: nextAgentRun.approvalState
        }
      );

      return { entity: nextAgentRun, events: [event] };
    });
  }

  private async executeCommand<T>(
    commandName: string,
    operation: () => Promise<T>
  ) {
    try {
      return await this.dependencies.repositories.runInTransaction(operation);
    } catch (error) {
      if (
        error instanceof WorkflowEntityNotFoundError ||
        error instanceof WorkflowEntityConflictError ||
        error instanceof GovernancePolicyError ||
        error instanceof WorkflowTransitionError
      ) {
        throw error;
      }

      throw new WorkflowCommandExecutionError(commandName, error);
    }
  }

  private async requireIssue(issueId: string) {
    const issue = await this.dependencies.repositories.issues.getById(issueId);

    if (!issue) {
      throw new WorkflowEntityNotFoundError("issue", issueId);
    }

    return issue;
  }

  private async requireBrief(briefId: string) {
    const brief = await this.dependencies.repositories.briefs.getById(briefId);

    if (!brief) {
      throw new WorkflowEntityNotFoundError("brief", briefId);
    }

    return brief;
  }

  private async requireAsset(assetId: string) {
    const asset = await this.dependencies.repositories.assets.getById(assetId);

    if (!asset) {
      throw new WorkflowEntityNotFoundError("asset", assetId);
    }

    return asset;
  }

  private async requireApproval(approvalId: string) {
    const approval = await this.dependencies.repositories.approvals.getById(
      approvalId
    );

    if (!approval) {
      throw new WorkflowEntityNotFoundError("approval", approvalId);
    }

    return approval;
  }

  private async requireTask(taskId: string) {
    const task = await this.dependencies.repositories.tasks.getById(taskId);

    if (!task) {
      throw new WorkflowEntityNotFoundError("task", taskId);
    }

    return task;
  }

  private async requireFeedback(feedbackId: string) {
    const feedback = await this.dependencies.repositories.feedback.getById(
      feedbackId
    );

    if (!feedback) {
      throw new WorkflowEntityNotFoundError("feedback", feedbackId);
    }

    return feedback;
  }

  private async requireAgentRun(agentRunId: string) {
    const agentRun = await this.dependencies.repositories.agentRuns.getById(
      agentRunId
    );

    if (!agentRun) {
      throw new WorkflowEntityNotFoundError("agent_run", agentRunId);
    }

    return agentRun;
  }

  private async assertEntityDoesNotExist(
    entityType: string,
    entityId: string,
    lookup: Promise<unknown>
  ) {
    const existing = await lookup;

    if (existing) {
      throw new WorkflowEntityConflictError(entityType, entityId);
    }
  }

  private async authorizeCommand(
    commandName: GovernanceCommandName,
    context: CommandContext
  ) {
    try {
      assertCommandPermission(context.actor, commandName);
    } catch (error) {
      await this.appendAudit(
        "command.rejected",
        this.dependencies.clock.now(),
        context,
        createGovernanceAuditSubject(context),
        {
          command: commandName,
          reason:
            error instanceof Error ? error.message : "governance_command_denied"
        }
      );
      throw error;
    }
  }

  private async authorizeResourceAccess(
    commandName: GovernanceCommandName,
    context: CommandContext,
    resource: GovernedResource,
    subject: ObjectRef
  ) {
    try {
      assertObjectAccess(context.actor, resource);
    } catch (error) {
      await this.appendAudit(
        "command.rejected",
        this.dependencies.clock.now(),
        context,
        subject,
        {
          command: commandName,
          reason:
            error instanceof Error ? error.message : "governance_scope_denied"
        }
      );
      throw error;
    }
  }

  private async appendAudit(
    action: AuditAction,
    occurredAt: string,
    context: CommandContext,
    subject: ObjectRef,
    metadata: DomainEventMetadata
  ) {
    await this.dependencies.audit.append({
      action,
      occurredAt,
      actor: context.actor,
      subject,
      metadata
    });
  }
}

function createEntityId(prefix: string, code: string) {
  const maxCodeLength = Math.max(1, 120 - prefix.length - 1);
  return `${prefix}_${code.slice(0, maxCodeLength)}`;
}

function createAuditFields(context: CommandContext, occurredAt: string) {
  return {
    createdAt: occurredAt,
    updatedAt: occurredAt,
    createdBy: context.actor.actorId,
    updatedBy: context.actor.actorId
  };
}

function touchAuditFields(
  audit:
    | Issue["audit"]
    | Brief["audit"]
    | Asset["audit"]
    | Approval["audit"]
    | Task["audit"]
    | Feedback["audit"]
    | AgentRun["audit"],
  context: CommandContext,
  occurredAt: string
) {
  return {
    ...audit,
    updatedAt: occurredAt,
    updatedBy: context.actor.actorId
  };
}

function createDomainEvent(
  name: DomainEventName,
  occurredAt: string,
  context: CommandContext,
  subject: ObjectRef,
  metadata: DomainEventMetadata
): DomainEvent {
  return {
    name,
    occurredAt,
    actor: context.actor,
    subject,
    metadata
  };
}

function toObjectRef(
  objectType: ObjectRef["objectType"],
  objectId: string,
  objectCode: string
): ObjectRef {
  return {
    objectType,
    objectId,
    objectCode
  };
}

function createGovernanceAuditSubject(context: CommandContext): ObjectRef {
  return {
    objectType: "team",
    objectId: context.actor.teamId ?? context.actor.actorId,
    objectCode: context.actor.teamId
  };
}

function appendUnique(values: string[], value: string) {
  return values.includes(value) ? values : [...values, value];
}

function addHours(timestamp: string, hours: number) {
  return new Date(new Date(timestamp).getTime() + hours * 60 * 60 * 1000)
    .toISOString();
}

function mapSeverityToPriority(severity: Feedback["severity"]): Task["priority"] {
  switch (severity) {
    case "critical":
      return "critical";
    case "high":
      return "high";
    case "medium":
      return "medium";
    default:
      return "steady";
  }
}

function sanitizeCodeSegment(value: string) {
  const normalized = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

  return normalized || "record";
}

function createDerivedCode(prefix: string, seed: string, timestamp: string) {
  return [prefix, seed, timestamp]
    .map(sanitizeCodeSegment)
    .join("_")
    .slice(0, 120);
}

function createVisibleScope(context: CommandContext) {
  return {
    teamIds: context.actor.teamId ? [context.actor.teamId] : [],
    regionIds: context.actor.regionId ? [context.actor.regionId] : []
  };
}
