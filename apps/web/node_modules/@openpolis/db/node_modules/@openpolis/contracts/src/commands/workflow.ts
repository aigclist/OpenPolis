import { z } from "zod";

import {
  ActorRefSchema,
  EntityCodeSchema,
  EntityIdSchema,
  ObjectRefSchema,
  PrioritySchema,
  ScopeSchema,
  SensitivitySchema,
  SeveritySchema,
  SummarySchema,
  TimestampSchema,
  TitleSchema
} from "../primitives";
import { AssetKindSchema, AssetSourceSchema } from "../objects/asset";
import { FeedbackSourceSchema } from "../objects/feedback";
import { IssueKindSchema } from "../objects/issue";

export const CommandContextSchema = z.object({
  actor: ActorRefSchema,
  requestId: z.string().min(1).max(120),
  reason: z.string().min(1).max(500).optional()
});

export const CreateIssueInputSchema = z.object({
  code: EntityCodeSchema,
  title: TitleSchema,
  summary: SummarySchema,
  kind: IssueKindSchema,
  priority: PrioritySchema,
  ownerTeamId: EntityIdSchema,
  primaryRegionId: EntityIdSchema.optional(),
  targetScope: ScopeSchema,
  audienceTags: z.array(z.string().min(1).max(64)),
  sensitivity: SensitivitySchema
});

export const CreateBriefInputSchema = z.object({
  code: EntityCodeSchema,
  title: TitleSchema,
  summary: SummarySchema,
  goal: z.string().min(1).max(500),
  issueId: EntityIdSchema.optional(),
  ownerTeamId: EntityIdSchema,
  targetScope: ScopeSchema,
  outputKinds: z.array(z.string().min(1).max(64)),
  dueAt: TimestampSchema,
  approvalRequired: z.boolean(),
  sensitivity: SensitivitySchema
});

export const CreateAssetDraftInputSchema = z.object({
  code: EntityCodeSchema,
  title: TitleSchema,
  summary: SummarySchema,
  kind: AssetKindSchema,
  source: AssetSourceSchema,
  issueId: EntityIdSchema.optional(),
  briefId: EntityIdSchema.optional(),
  ownerTeamId: EntityIdSchema,
  locale: z.string().min(2).max(16),
  intendedScope: ScopeSchema,
  versionLabel: z.string().min(1).max(32),
  sensitivity: SensitivitySchema
});

export const SubmitApprovalInputSchema = z.object({
  code: EntityCodeSchema,
  title: TitleSchema,
  subject: ObjectRefSchema,
  requestedByTeamId: EntityIdSchema,
  reviewerTeamId: EntityIdSchema,
  dueAt: TimestampSchema,
  checklist: z.array(z.string().min(1).max(120)),
  sensitivity: SensitivitySchema
});

export const RespondToApprovalInputSchema = z.object({
  approvalId: EntityIdSchema,
  decision: z.enum(["changes_requested", "approved", "rejected"]),
  comment: z.string().min(1).max(500).optional()
});

export const PublishApprovalInputSchema = z.object({
  approvalId: EntityIdSchema,
  comment: z.string().min(1).max(500).optional()
});

export const CreateTaskInputSchema = z.object({
  code: EntityCodeSchema,
  title: TitleSchema,
  summary: SummarySchema,
  ownerTeamId: EntityIdSchema,
  assigneeTeamId: EntityIdSchema.optional(),
  regionId: EntityIdSchema.optional(),
  briefId: EntityIdSchema.optional(),
  issueId: EntityIdSchema.optional(),
  priority: PrioritySchema,
  dueAt: TimestampSchema,
  workflowStep: z.string().min(1).max(64).optional(),
  sensitivity: SensitivitySchema
});

export const AssignTaskInputSchema = z.object({
  taskId: EntityIdSchema,
  assigneeTeamId: EntityIdSchema.optional(),
  regionId: EntityIdSchema.optional()
});

export const CloseTaskInputSchema = z.object({
  taskId: EntityIdSchema,
  resolution: z.enum(["completed", "cancelled"]),
  summary: z.string().min(1).max(500).optional()
});

export const CreateFeedbackInputSchema = z.object({
  code: EntityCodeSchema,
  title: TitleSchema,
  summary: SummarySchema,
  severity: SeveritySchema,
  source: FeedbackSourceSchema,
  issueId: EntityIdSchema.optional(),
  taskId: EntityIdSchema.optional(),
  regionId: EntityIdSchema.optional(),
  ownerTeamId: EntityIdSchema.optional(),
  sensitivity: SensitivitySchema
});

export const EscalateFeedbackInputSchema = z.object({
  feedbackId: EntityIdSchema,
  issueId: EntityIdSchema.optional(),
  createTask: z.boolean(),
  escalationReason: z.string().min(1).max(500)
});

export type CommandContext = z.infer<typeof CommandContextSchema>;
export type CreateIssueInput = z.infer<typeof CreateIssueInputSchema>;
export type CreateBriefInput = z.infer<typeof CreateBriefInputSchema>;
export type CreateAssetDraftInput = z.infer<typeof CreateAssetDraftInputSchema>;
export type SubmitApprovalInput = z.infer<typeof SubmitApprovalInputSchema>;
export type RespondToApprovalInput = z.infer<typeof RespondToApprovalInputSchema>;
export type PublishApprovalInput = z.infer<typeof PublishApprovalInputSchema>;
export type CreateTaskInput = z.infer<typeof CreateTaskInputSchema>;
export type AssignTaskInput = z.infer<typeof AssignTaskInputSchema>;
export type CloseTaskInput = z.infer<typeof CloseTaskInputSchema>;
export type CreateFeedbackInput = z.infer<typeof CreateFeedbackInputSchema>;
export type EscalateFeedbackInput = z.infer<typeof EscalateFeedbackInputSchema>;
