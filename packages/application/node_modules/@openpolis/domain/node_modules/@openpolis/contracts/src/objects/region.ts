import { z } from "zod";

import {
  AuditFieldsSchema,
  EntityCodeSchema,
  EntityIdSchema,
  SummarySchema,
  TitleSchema
} from "../primitives";

export const RegionStatusSchema = z.enum([
  "active",
  "attention",
  "ready",
  "inactive"
]);

export const RegionSchema = z.object({
  id: EntityIdSchema,
  code: EntityCodeSchema,
  name: TitleSchema,
  summary: SummarySchema,
  status: RegionStatusSchema,
  completionRate: z.number().min(0).max(1),
  blockedCount: z.number().int().min(0),
  audit: AuditFieldsSchema
});

export type RegionStatus = z.infer<typeof RegionStatusSchema>;
export type Region = z.infer<typeof RegionSchema>;
