import type {
  AgentRun,
  Approval,
  Asset,
  Brief,
  CloseTaskInput,
  CommandContext,
  CreateAgentRunInput,
  CreateAssetDraftInput,
  CreateBriefInput,
  CreateFeedbackInput,
  CreateIssueInput,
  CreateTaskInput,
  EscalateFeedbackInput,
  FinalizeAgentRunInput,
  Feedback,
  Issue,
  PublishApprovalInput,
  RespondToAgentRunInput,
  RespondToApprovalInput,
  SubmitApprovalInput,
  Task,
  AssignTaskInput
} from "@openpolis/contracts";
import type { DomainEvent } from "@openpolis/domain";

export type CommandResult<TEntity> = {
  entity: TEntity;
  events: DomainEvent[];
};

export interface WorkflowCommandService {
  createIssue(
    context: CommandContext,
    input: CreateIssueInput
  ): Promise<CommandResult<Issue>>;
  createBrief(
    context: CommandContext,
    input: CreateBriefInput
  ): Promise<CommandResult<Brief>>;
  createAssetDraft(
    context: CommandContext,
    input: CreateAssetDraftInput
  ): Promise<CommandResult<Asset>>;
  submitApproval(
    context: CommandContext,
    input: SubmitApprovalInput
  ): Promise<CommandResult<Approval>>;
  respondToApproval(
    context: CommandContext,
    input: RespondToApprovalInput
  ): Promise<CommandResult<Approval>>;
  publishApproval(
    context: CommandContext,
    input: PublishApprovalInput
  ): Promise<CommandResult<Approval>>;
  createTask(
    context: CommandContext,
    input: CreateTaskInput
  ): Promise<CommandResult<Task>>;
  assignTask(
    context: CommandContext,
    input: AssignTaskInput
  ): Promise<CommandResult<Task>>;
  closeTask(
    context: CommandContext,
    input: CloseTaskInput
  ): Promise<CommandResult<Task>>;
  createFeedback(
    context: CommandContext,
    input: CreateFeedbackInput
  ): Promise<CommandResult<Feedback>>;
  escalateFeedback(
    context: CommandContext,
    input: EscalateFeedbackInput
  ): Promise<CommandResult<Feedback>>;
  createAgentRun(
    context: CommandContext,
    input: CreateAgentRunInput
  ): Promise<CommandResult<AgentRun>>;
  respondToAgentRun(
    context: CommandContext,
    input: RespondToAgentRunInput
  ): Promise<CommandResult<AgentRun>>;
  finalizeAgentRun(
    context: CommandContext,
    input: FinalizeAgentRunInput
  ): Promise<CommandResult<AgentRun>>;
}
