import type {
  Approval as ApprovalEntity,
  Asset as AssetEntity,
  Brief as BriefEntity,
  Feedback as FeedbackEntity,
  Issue as IssueEntity,
  Task as TaskEntity
} from "@openpolis/contracts";
import {
  customType,
  integer,
  sqliteTable,
  text
} from "drizzle-orm/sqlite-core";

function parseJsonStringArray(value: string | null) {
  if (value === null) {
    return null;
  }

  const parsed = JSON.parse(value) as unknown;

  if (!Array.isArray(parsed) || parsed.some((item) => typeof item !== "string")) {
    throw new Error("Invalid JSON string array");
  }

  return parsed;
}

const jsonStringArray = customType<{
  data: string[] | null;
  driverData: string | null;
}>({
  dataType() {
    return "text";
  },
  fromDriver(value) {
    return parseJsonStringArray(value);
  },
  toDriver(value) {
    return value === null ? null : JSON.stringify(value);
  }
});

export const workflowObjects = sqliteTable("workflow_objects", {
  objectId: text("object_id").primaryKey(),
  objectType: text("object_type").notNull(),
  objectCode: text("object_code").notNull(),
  payload: text("payload").notNull(),
  updatedAt: text("updated_at").notNull()
});

export const auditLog = sqliteTable("audit_log", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  action: text("action").notNull(),
  occurredAt: text("occurred_at").notNull(),
  actorType: text("actor_type").notNull(),
  actorId: text("actor_id").notNull(),
  subjectType: text("subject_type").notNull(),
  subjectId: text("subject_id").notNull(),
  subjectCode: text("subject_code"),
  metadata: text("metadata").notNull()
});

export const issues = sqliteTable("issues", {
  id: text("id").primaryKey(),
  code: text("code").notNull().unique(),
  title: text("title"),
  summary: text("summary"),
  kind: text("kind").$type<IssueEntity["kind"] | null>(),
  status: text("status").$type<IssueEntity["status"]>().notNull(),
  priority: text("priority").$type<IssueEntity["priority"]>().notNull(),
  ownerTeam: text("owner_team").notNull(),
  primaryRegionId: text("primary_region_id"),
  targetTeamIds: jsonStringArray("target_team_ids"),
  targetRegionIds: jsonStringArray("target_region_ids"),
  audienceTags: jsonStringArray("audience_tags"),
  keyMessages: jsonStringArray("key_messages"),
  riskNotes: jsonStringArray("risk_notes"),
  linkedBriefIds: jsonStringArray("linked_brief_ids"),
  linkedAssetIds: jsonStringArray("linked_asset_ids"),
  sensitivity: text("sensitivity").$type<IssueEntity["sensitivity"] | null>(),
  updatedAt: text("updated_at").notNull(),
  regionCode: text("region_code").notNull()
});

export const briefs = sqliteTable("briefs", {
  id: text("id").primaryKey(),
  code: text("code").notNull().unique(),
  title: text("title"),
  summary: text("summary"),
  goal: text("goal"),
  issueId: text("issue_id").references(() => issues.id),
  status: text("status").$type<BriefEntity["status"]>().notNull(),
  ownerTeam: text("owner_team").notNull(),
  targetTeamIds: jsonStringArray("target_team_ids"),
  targetRegionIds: jsonStringArray("target_region_ids"),
  outputKinds: jsonStringArray("output_kinds"),
  approvalRequired: integer("approval_required", { mode: "boolean" }),
  linkedTaskIds: jsonStringArray("linked_task_ids"),
  sensitivity: text("sensitivity").$type<BriefEntity["sensitivity"] | null>(),
  dueDate: text("due_date").notNull(),
  updatedAt: text("updated_at").notNull()
});

export const assets = sqliteTable("assets", {
  id: text("id").primaryKey(),
  code: text("code").notNull().unique(),
  title: text("title"),
  summary: text("summary"),
  status: text("status").$type<AssetEntity["status"]>().notNull(),
  issueCode: text("issue_code").notNull(),
  kind: text("kind").$type<AssetEntity["kind"] | null>(),
  source: text("source").$type<AssetEntity["source"] | null>(),
  issueId: text("issue_id").references(() => issues.id),
  briefId: text("brief_id").references(() => briefs.id),
  approvalId: text("approval_id").references(() => reviews.id),
  ownerTeam: text("owner_team"),
  locale: text("locale"),
  scopeTeamIds: jsonStringArray("scope_team_ids"),
  scopeRegionIds: jsonStringArray("scope_region_ids"),
  versionLabel: text("version_label"),
  sensitivity: text("sensitivity").$type<AssetEntity["sensitivity"] | null>(),
  updatedAt: text("updated_at").notNull()
});

export const tasks = sqliteTable("tasks", {
  id: text("id").primaryKey(),
  code: text("code").notNull().unique(),
  title: text("title"),
  summary: text("summary"),
  status: text("status").$type<TaskEntity["status"]>().notNull(),
  priority: text("priority").$type<TaskEntity["priority"]>().notNull(),
  ownerTeam: text("owner_team").notNull(),
  assigneeTeam: text("assignee_team"),
  issueId: text("issue_id").references(() => issues.id),
  briefId: text("brief_id").references(() => briefs.id),
  workflowStep: text("workflow_step"),
  sensitivity: text("sensitivity").$type<TaskEntity["sensitivity"] | null>(),
  dueDate: text("due_date").notNull(),
  regionCode: text("region_code").notNull(),
  updatedAt: text("updated_at").notNull()
});

export const feedback = sqliteTable("feedback", {
  id: text("id").primaryKey(),
  code: text("code").notNull().unique(),
  title: text("title"),
  summary: text("summary"),
  status: text("status").$type<FeedbackEntity["status"]>().notNull(),
  severity: text("severity").$type<FeedbackEntity["severity"]>().notNull(),
  source: text("source").$type<FeedbackEntity["source"] | null>(),
  issueId: text("issue_id").references(() => issues.id),
  taskId: text("task_id").references(() => tasks.id),
  ownerTeam: text("owner_team"),
  sensitivity: text("sensitivity").$type<FeedbackEntity["sensitivity"] | null>(),
  regionCode: text("region_code").notNull(),
  updatedAt: text("updated_at").notNull()
});

export const reviews = sqliteTable("reviews", {
  id: text("id").primaryKey(),
  code: text("code").notNull().unique(),
  title: text("title"),
  summary: text("summary"),
  status: text("status").$type<ApprovalEntity["status"]>().notNull(),
  ownerTeam: text("owner_team").notNull(),
  subjectType: text("subject_type"),
  subjectId: text("subject_id"),
  subjectCode: text("subject_code"),
  requestedByTeam: text("requested_by_team"),
  checklist: jsonStringArray("checklist"),
  latestComment: text("latest_comment"),
  sensitivity: text("sensitivity").$type<ApprovalEntity["sensitivity"] | null>(),
  dueDate: text("due_date").notNull(),
  updatedAt: text("updated_at").notNull()
});
