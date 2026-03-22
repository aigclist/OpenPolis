import { z } from "zod";

import {
  EntityCodeSchema,
  EntityIdSchema,
  ObjectRefSchema
} from "../primitives";
import { AgentRunModeSchema } from "../objects/agent-run";

export const CreateAgentRunInputSchema = z.object({
  code: EntityCodeSchema,
  title: z.string().min(1).max(160),
  instruction: z.string().min(1).max(4000),
  skillCode: EntityCodeSchema,
  providerCode: EntityCodeSchema,
  mode: AgentRunModeSchema,
  target: ObjectRefSchema,
  requiresHumanApproval: z.boolean(),
  reviewReason: z.string().min(1).max(500).optional()
});

export const RespondToAgentRunInputSchema = z.object({
  agentRunId: EntityIdSchema,
  decision: z.enum(["approved", "rejected"]),
  comment: z.string().min(1).max(500).optional()
});

export const FinalizeAgentRunInputSchema = z.object({
  agentRunId: EntityIdSchema,
  outcome: z.enum(["completed", "failed"]),
  summary: z.string().min(1).max(2000)
});

export type CreateAgentRunInput = z.infer<typeof CreateAgentRunInputSchema>;
export type RespondToAgentRunInput = z.infer<
  typeof RespondToAgentRunInputSchema
>;
export type FinalizeAgentRunInput = z.infer<
  typeof FinalizeAgentRunInputSchema
>;
