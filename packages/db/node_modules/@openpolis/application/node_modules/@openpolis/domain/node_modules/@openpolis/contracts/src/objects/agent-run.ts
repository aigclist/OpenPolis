import { z } from "zod";

import {
  AuditFieldsSchema,
  EntityCodeSchema,
  EntityIdSchema,
  ObjectRefSchema,
  ScopeSchema,
  TimestampSchema,
  TitleSchema
} from "../primitives";

export const AgentRunModeSchema = z.enum([
  "advisory",
  "drafting",
  "state_changing"
]);

export const AgentRunStatusSchema = z.enum([
  "pending",
  "running",
  "waiting_human_review",
  "completed",
  "failed",
  "cancelled"
]);

export const AgentApprovalStateSchema = z.enum([
  "not_required",
  "required",
  "pending",
  "approved",
  "rejected"
]);

export const AgentRunSchema = z.object({
  id: EntityIdSchema,
  code: EntityCodeSchema,
  title: TitleSchema,
  instruction: z.string().min(1).max(4000),
  skillCode: EntityCodeSchema,
  providerCode: EntityCodeSchema,
  mode: AgentRunModeSchema,
  status: AgentRunStatusSchema,
  approvalState: AgentApprovalStateSchema,
  latestSummary: z.string().min(1).max(2000).optional(),
  reviewReason: z.string().min(1).max(500).optional(),
  target: ObjectRefSchema,
  visibleScope: ScopeSchema,
  startedAt: TimestampSchema,
  finishedAt: TimestampSchema.optional(),
  audit: AuditFieldsSchema
});

export type AgentRunMode = z.infer<typeof AgentRunModeSchema>;
export type AgentRunStatus = z.infer<typeof AgentRunStatusSchema>;
export type AgentApprovalState = z.infer<typeof AgentApprovalStateSchema>;
export type AgentRun = z.infer<typeof AgentRunSchema>;
