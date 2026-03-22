import { z } from "zod";

import {
  AuditFieldsSchema,
  EntityCodeSchema,
  EntityIdSchema,
  ScopeSchema,
  SensitivitySchema,
  SummarySchema,
  TimestampSchema,
  TitleSchema
} from "../primitives";

export const BriefStatusSchema = z.enum([
  "draft",
  "queued",
  "in_review",
  "scheduled",
  "active",
  "closed"
]);

export const BriefSchema = z.object({
  id: EntityIdSchema,
  code: EntityCodeSchema,
  title: TitleSchema,
  summary: SummarySchema,
  goal: z.string().min(1).max(500),
  issueId: EntityIdSchema.optional(),
  ownerTeamId: EntityIdSchema,
  targetScope: ScopeSchema,
  outputKinds: z.array(z.string().min(1).max(64)),
  status: BriefStatusSchema,
  dueAt: TimestampSchema,
  approvalRequired: z.boolean(),
  linkedTaskIds: z.array(EntityIdSchema),
  sensitivity: SensitivitySchema,
  audit: AuditFieldsSchema
});

export type BriefStatus = z.infer<typeof BriefStatusSchema>;
export type Brief = z.infer<typeof BriefSchema>;
