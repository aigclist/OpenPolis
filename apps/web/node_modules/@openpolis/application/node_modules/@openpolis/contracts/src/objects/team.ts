import { z } from "zod";

import {
  AuditFieldsSchema,
  EntityCodeSchema,
  EntityIdSchema,
  ScopeSchema,
  SummarySchema,
  TitleSchema
} from "../primitives";

export const TeamKindSchema = z.enum([
  "central_ops",
  "communications",
  "regional_ops",
  "field",
  "review",
  "admin",
  "candidate",
  "volunteer"
]);

export const TeamStatusSchema = z.enum(["active", "inactive"]);

export const TeamSchema = z.object({
  id: EntityIdSchema,
  code: EntityCodeSchema,
  name: TitleSchema,
  summary: SummarySchema,
  kind: TeamKindSchema,
  status: TeamStatusSchema,
  defaultScope: ScopeSchema,
  audit: AuditFieldsSchema
});

export type TeamKind = z.infer<typeof TeamKindSchema>;
export type TeamStatus = z.infer<typeof TeamStatusSchema>;
export type Team = z.infer<typeof TeamSchema>;
