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

export const EventStatusSchema = z.enum([
  "queued",
  "scheduled",
  "active",
  "completed",
  "cancelled"
]);

export const EventSchema = z.object({
  id: EntityIdSchema,
  code: EntityCodeSchema,
  title: TitleSchema,
  summary: SummarySchema,
  status: EventStatusSchema,
  startsAt: TimestampSchema,
  endsAt: TimestampSchema.optional(),
  ownerTeamId: EntityIdSchema,
  regionId: EntityIdSchema.optional(),
  briefId: EntityIdSchema.optional(),
  targetScope: ScopeSchema,
  sensitivity: SensitivitySchema,
  audit: AuditFieldsSchema
});

export type EventStatus = z.infer<typeof EventStatusSchema>;
export type Event = z.infer<typeof EventSchema>;
