import { z } from "zod";

import {
  AuditFieldsSchema,
  EntityCodeSchema,
  EntityIdSchema,
  PrioritySchema,
  SensitivitySchema,
  SummarySchema,
  TimestampSchema,
  TitleSchema
} from "../primitives";

export const TaskStatusSchema = z.enum([
  "draft",
  "active",
  "in_review",
  "blocked",
  "completed",
  "cancelled"
]);

export const TaskSchema = z.object({
  id: EntityIdSchema,
  code: EntityCodeSchema,
  title: TitleSchema,
  summary: SummarySchema,
  status: TaskStatusSchema,
  priority: PrioritySchema,
  ownerTeamId: EntityIdSchema,
  assigneeTeamId: EntityIdSchema.optional(),
  regionId: EntityIdSchema.optional(),
  briefId: EntityIdSchema.optional(),
  issueId: EntityIdSchema.optional(),
  dueAt: TimestampSchema,
  workflowStep: z.string().min(1).max(64).optional(),
  sensitivity: SensitivitySchema,
  audit: AuditFieldsSchema
});

export type TaskStatus = z.infer<typeof TaskStatusSchema>;
export type Task = z.infer<typeof TaskSchema>;
