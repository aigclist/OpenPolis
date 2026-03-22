import { z } from "zod";

import {
  AuditFieldsSchema,
  EntityCodeSchema,
  EntityIdSchema,
  LocaleCodeSchema,
  ScopeSchema,
  SensitivitySchema,
  SummarySchema,
  TitleSchema
} from "../primitives";

export const AssetKindSchema = z.enum([
  "image",
  "video",
  "speech",
  "social_post",
  "faq",
  "pdf",
  "template",
  "briefing_note"
]);

export const AssetStatusSchema = z.enum([
  "draft",
  "approved",
  "localized",
  "archived"
]);

export const AssetSourceSchema = z.enum([
  "human",
  "ai_assisted",
  "external"
]);

export const AssetSchema = z.object({
  id: EntityIdSchema,
  code: EntityCodeSchema,
  title: TitleSchema,
  summary: SummarySchema,
  kind: AssetKindSchema,
  status: AssetStatusSchema,
  source: AssetSourceSchema,
  issueId: EntityIdSchema.optional(),
  briefId: EntityIdSchema.optional(),
  approvalId: EntityIdSchema.optional(),
  ownerTeamId: EntityIdSchema,
  locale: LocaleCodeSchema,
  intendedScope: ScopeSchema,
  versionLabel: z.string().min(1).max(32),
  sensitivity: SensitivitySchema,
  audit: AuditFieldsSchema
});

export type AssetKind = z.infer<typeof AssetKindSchema>;
export type AssetStatus = z.infer<typeof AssetStatusSchema>;
export type AssetSource = z.infer<typeof AssetSourceSchema>;
export type Asset = z.infer<typeof AssetSchema>;
