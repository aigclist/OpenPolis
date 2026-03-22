import { z } from "zod";

import {
  ActorRefSchema,
  ObjectRefSchema,
  TimestampSchema
} from "@openpolis/contracts";

export const DomainEventNameSchema = z.enum([
  "issue.created",
  "issue.status_changed",
  "brief.created",
  "brief.status_changed",
  "asset.drafted",
  "approval.submitted",
  "approval.responded",
  "approval.published",
  "task.created",
  "task.assigned",
  "task.closed",
  "feedback.created",
  "feedback.escalated",
  "agent_run.created",
  "agent_run.responded",
  "agent_run.finalized"
]);

export const DomainEventMetadataValueSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.null()
]);

export const DomainEventMetadataSchema = z.record(
  z.string(),
  DomainEventMetadataValueSchema
);

export const DomainEventSchema = z.object({
  name: DomainEventNameSchema,
  occurredAt: TimestampSchema,
  actor: ActorRefSchema,
  subject: ObjectRefSchema,
  metadata: DomainEventMetadataSchema
});

export type DomainEventName = z.infer<typeof DomainEventNameSchema>;
export type DomainEventMetadataValue = z.infer<
  typeof DomainEventMetadataValueSchema
>;
export type DomainEventMetadata = z.infer<typeof DomainEventMetadataSchema>;
export type DomainEvent = z.infer<typeof DomainEventSchema>;
