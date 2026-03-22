import { z } from "zod";

import {
  AuditFieldsSchema,
  EntityCodeSchema,
  EntityIdSchema,
  ObjectRefSchema,
  SensitivitySchema,
  TimestampSchema,
  TitleSchema
} from "../primitives";

export const ApprovalStatusSchema = z.enum([
  "draft",
  "in_review",
  "changes_requested",
  "approved",
  "published",
  "rejected",
  "archived"
]);

export const ApprovalSchema = z.object({
  id: EntityIdSchema,
  code: EntityCodeSchema,
  title: TitleSchema,
  subject: ObjectRefSchema,
  status: ApprovalStatusSchema,
  requestedByTeamId: EntityIdSchema,
  reviewerTeamId: EntityIdSchema,
  dueAt: TimestampSchema,
  checklist: z.array(z.string().min(1).max(120)),
  latestComment: z.string().min(1).max(500).optional(),
  sensitivity: SensitivitySchema,
  audit: AuditFieldsSchema
});

export type ApprovalStatus = z.infer<typeof ApprovalStatusSchema>;
export type Approval = z.infer<typeof ApprovalSchema>;
