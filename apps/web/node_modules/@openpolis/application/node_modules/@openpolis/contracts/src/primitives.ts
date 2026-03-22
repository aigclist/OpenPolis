import { z } from "zod";

export const EntityIdSchema = z.string().min(1).max(120);

export const EntityCodeSchema = z
  .string()
  .min(1)
  .max(120)
  .regex(/^[a-z0-9_]+$/);

export const TitleSchema = z.string().min(1).max(160);

export const SummarySchema = z.string().min(1).max(2000);

const isoTimestampPattern =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/;

export const TimestampSchema = z
  .string()
  .min(1)
  .max(64)
  .regex(isoTimestampPattern);

export const LocaleCodeSchema = z.string().min(2).max(16);

export const PrioritySchema = z.enum([
  "critical",
  "high",
  "medium",
  "steady"
]);

export const SeveritySchema = z.enum(["critical", "high", "medium", "low"]);

export const SensitivitySchema = z.enum([
  "public",
  "internal",
  "restricted",
  "confidential"
]);

export const ObjectTypeSchema = z.enum([
  "issue",
  "asset",
  "brief",
  "task",
  "team",
  "region",
  "event",
  "feedback",
  "approval",
  "agent_run"
]);

export const ActorTypeSchema = z.enum(["human", "agent", "system"]);

export const ActorRoleSchema = z.enum([
  "super_admin",
  "central_ops",
  "communications_lead",
  "regional_manager",
  "candidate_team",
  "volunteer_coordinator",
  "reviewer",
  "viewer"
]);

export const ActorRefSchema = z.object({
  actorType: ActorTypeSchema,
  actorId: EntityIdSchema,
  role: ActorRoleSchema.optional(),
  teamId: EntityIdSchema.optional(),
  regionId: EntityIdSchema.optional()
});

export const ObjectRefSchema = z.object({
  objectType: ObjectTypeSchema,
  objectId: EntityIdSchema,
  objectCode: EntityCodeSchema.optional()
});

export const ScopeSchema = z.object({
  teamIds: z.array(EntityIdSchema),
  regionIds: z.array(EntityIdSchema)
});

export const AuditFieldsSchema = z.object({
  createdAt: TimestampSchema,
  updatedAt: TimestampSchema,
  createdBy: EntityIdSchema.optional(),
  updatedBy: EntityIdSchema.optional()
});

export type EntityId = z.infer<typeof EntityIdSchema>;
export type EntityCode = z.infer<typeof EntityCodeSchema>;
export type Title = z.infer<typeof TitleSchema>;
export type Summary = z.infer<typeof SummarySchema>;
export type Timestamp = z.infer<typeof TimestampSchema>;
export type LocaleCode = z.infer<typeof LocaleCodeSchema>;
export type Priority = z.infer<typeof PrioritySchema>;
export type Severity = z.infer<typeof SeveritySchema>;
export type Sensitivity = z.infer<typeof SensitivitySchema>;
export type ObjectType = z.infer<typeof ObjectTypeSchema>;
export type ActorType = z.infer<typeof ActorTypeSchema>;
export type ActorRole = z.infer<typeof ActorRoleSchema>;
export type ActorRef = z.infer<typeof ActorRefSchema>;
export type ObjectRef = z.infer<typeof ObjectRefSchema>;
export type Scope = z.infer<typeof ScopeSchema>;
export type AuditFields = z.infer<typeof AuditFieldsSchema>;
