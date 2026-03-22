import { z } from "zod";

import {
  AuditFieldsSchema,
  EntityCodeSchema,
  EntityIdSchema,
  SensitivitySchema,
  SeveritySchema,
  SummarySchema,
  TitleSchema
} from "../primitives";

export const FeedbackStatusSchema = z.enum([
  "attention",
  "active",
  "resolved",
  "archived"
]);

export const FeedbackSourceSchema = z.enum([
  "field",
  "media",
  "volunteer",
  "internal",
  "event"
]);

export const FeedbackSchema = z.object({
  id: EntityIdSchema,
  code: EntityCodeSchema,
  title: TitleSchema,
  summary: SummarySchema,
  status: FeedbackStatusSchema,
  severity: SeveritySchema,
  source: FeedbackSourceSchema,
  issueId: EntityIdSchema.optional(),
  taskId: EntityIdSchema.optional(),
  regionId: EntityIdSchema.optional(),
  ownerTeamId: EntityIdSchema.optional(),
  sensitivity: SensitivitySchema,
  audit: AuditFieldsSchema
});

export type FeedbackStatus = z.infer<typeof FeedbackStatusSchema>;
export type FeedbackSource = z.infer<typeof FeedbackSourceSchema>;
export type Feedback = z.infer<typeof FeedbackSchema>;
