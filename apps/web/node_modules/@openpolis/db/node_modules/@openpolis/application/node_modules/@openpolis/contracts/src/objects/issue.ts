import { z } from "zod";

import {
  AuditFieldsSchema,
  EntityCodeSchema,
  EntityIdSchema,
  PrioritySchema,
  ScopeSchema,
  SensitivitySchema,
  SummarySchema,
  TitleSchema
} from "../primitives";

export const IssueKindSchema = z.enum([
  "policy",
  "response",
  "advocacy",
  "crisis",
  "campaign"
]);

export const IssueStatusSchema = z.enum([
  "monitoring",
  "active",
  "response_needed",
  "closed"
]);

export const IssueSchema = z.object({
  id: EntityIdSchema,
  code: EntityCodeSchema,
  title: TitleSchema,
  summary: SummarySchema,
  kind: IssueKindSchema,
  status: IssueStatusSchema,
  priority: PrioritySchema,
  ownerTeamId: EntityIdSchema,
  primaryRegionId: EntityIdSchema.optional(),
  targetScope: ScopeSchema,
  audienceTags: z.array(z.string().min(1).max(64)),
  keyMessages: z.array(z.string().min(1).max(280)),
  riskNotes: z.array(z.string().min(1).max(280)),
  linkedBriefIds: z.array(EntityIdSchema),
  linkedAssetIds: z.array(EntityIdSchema),
  sensitivity: SensitivitySchema,
  audit: AuditFieldsSchema
});

export type IssueKind = z.infer<typeof IssueKindSchema>;
export type IssueStatus = z.infer<typeof IssueStatusSchema>;
export type Issue = z.infer<typeof IssueSchema>;
