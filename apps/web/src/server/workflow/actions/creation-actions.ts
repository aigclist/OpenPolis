"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  OptionalEntityCodeInputSchema,
  RequiredSummaryInputSchema,
  RequiredTitleInputSchema
} from "../../security/input-validation";

import {
  afterHours,
  assertTrustedServerActionRequest,
  createCode,
  createServerCommandContext,
  failExecution,
  failValidation,
  finishAction,
  getValue,
  optionalObjectId,
  workspaceCommandService
} from "./shared";

const IssueSchema = z.object({
  title: RequiredTitleInputSchema,
  summary: RequiredSummaryInputSchema
});

const BriefSchema = z.object({
  title: RequiredTitleInputSchema,
  summary: RequiredSummaryInputSchema,
  issueCode: OptionalEntityCodeInputSchema
});

const AssetSchema = z.object({
  title: RequiredTitleInputSchema,
  summary: RequiredSummaryInputSchema,
  issueCode: OptionalEntityCodeInputSchema,
  briefCode: OptionalEntityCodeInputSchema,
  kind: z.enum([
    "image",
    "video",
    "speech",
    "social_post",
    "faq",
    "pdf",
    "template",
    "briefing_note"
  ])
});

const TaskSchema = z.object({
  title: RequiredTitleInputSchema,
  summary: RequiredSummaryInputSchema,
  issueCode: OptionalEntityCodeInputSchema,
  briefCode: OptionalEntityCodeInputSchema,
  priority: z.enum(["critical", "high", "medium", "steady"])
});

const FeedbackSchema = z.object({
  title: RequiredTitleInputSchema,
  summary: RequiredSummaryInputSchema,
  issueCode: OptionalEntityCodeInputSchema,
  taskCode: OptionalEntityCodeInputSchema,
  severity: z.enum(["critical", "high", "medium", "low"])
});

export async function createIssueAction(locale: string, formData: FormData) {
  try {
    await assertTrustedServerActionRequest();
  } catch (error) {
    failExecution(locale, "issues", "createIssue", error);
  }

  const parsed = IssueSchema.safeParse({
    title: getValue(formData, "title"),
    summary: getValue(formData, "summary")
  });

  if (!parsed.success) {
    failValidation(locale, "issues", "createIssue", parsed.error);
  }

  const data = parsed.data;

  try {
    const actionContext = await createServerCommandContext(
      "issue_intake",
      "issues_quick_capture"
    );
    await workspaceCommandService.createIssue(actionContext.command, {
      code: createCode("issue", data.title),
      title: data.title,
      summary: data.summary,
      kind: "response",
      priority: "steady",
      ownerTeamId: actionContext.ownerTeamId,
      primaryRegionId: actionContext.regionId,
      targetScope: actionContext.defaultScope,
      audienceTags: [],
      sensitivity: "internal"
    });
  } catch (error) {
    failExecution(locale, "issues", "createIssue", error);
  }

  revalidatePath(`/${locale}/issues`);
  finishAction(locale, "issues", "created");
}

export async function createBriefAction(locale: string, formData: FormData) {
  try {
    await assertTrustedServerActionRequest();
  } catch (error) {
    failExecution(locale, "briefs", "createBrief", error);
  }

  const parsed = BriefSchema.safeParse({
    title: getValue(formData, "title"),
    summary: getValue(formData, "summary"),
    issueCode: getValue(formData, "issueCode")
  });

  if (!parsed.success) {
    failValidation(locale, "briefs", "createBrief", parsed.error);
  }

  const data = parsed.data;

  try {
    const actionContext = await createServerCommandContext(
      "brief_intake",
      "briefs_quick_capture"
    );
    await workspaceCommandService.createBrief(actionContext.command, {
      code: createCode("brief", data.title),
      title: data.title,
      summary: data.summary,
      goal: data.summary,
      issueId: optionalObjectId("issue", data.issueCode),
      ownerTeamId: actionContext.ownerTeamId,
      targetScope: actionContext.defaultScope,
      outputKinds: ["briefing_note"],
      dueAt: afterHours(48),
      approvalRequired: true,
      sensitivity: "internal"
    });
  } catch (error) {
    failExecution(locale, "briefs", "createBrief", error);
  }

  revalidatePath(`/${locale}/briefs`);
  finishAction(locale, "briefs", "created");
}

export async function createAssetDraftAction(locale: string, formData: FormData) {
  try {
    await assertTrustedServerActionRequest();
  } catch (error) {
    failExecution(locale, "assets", "createAssetDraft", error);
  }

  const parsed = AssetSchema.safeParse({
    title: getValue(formData, "title"),
    summary: getValue(formData, "summary"),
    issueCode: getValue(formData, "issueCode"),
    briefCode: getValue(formData, "briefCode"),
    kind: getValue(formData, "kind")
  });

  if (!parsed.success) {
    failValidation(locale, "assets", "createAssetDraft", parsed.error);
  }

  const data = parsed.data;

  try {
    const actionContext = await createServerCommandContext(
      "asset_draft",
      "assets_quick_capture"
    );
    await workspaceCommandService.createAssetDraft(actionContext.command, {
      code: createCode("asset", data.title),
      title: data.title,
      summary: data.summary,
      kind: data.kind,
      source: "human",
      issueId: optionalObjectId("issue", data.issueCode),
      briefId: optionalObjectId("brief", data.briefCode),
      ownerTeamId: actionContext.ownerTeamId,
      locale,
      intendedScope: actionContext.defaultScope,
      versionLabel: "v1",
      sensitivity: "internal"
    });
  } catch (error) {
    failExecution(locale, "assets", "createAssetDraft", error);
  }

  revalidatePath(`/${locale}/assets`);
  finishAction(locale, "assets", "created");
}

export async function createTaskAction(locale: string, formData: FormData) {
  try {
    await assertTrustedServerActionRequest();
  } catch (error) {
    failExecution(locale, "operations", "createTask", error);
  }

  const parsed = TaskSchema.safeParse({
    title: getValue(formData, "title"),
    summary: getValue(formData, "summary"),
    issueCode: getValue(formData, "issueCode"),
    briefCode: getValue(formData, "briefCode"),
    priority: getValue(formData, "priority")
  });

  if (!parsed.success) {
    failValidation(locale, "operations", "createTask", parsed.error);
  }

  const data = parsed.data;

  try {
    const actionContext = await createServerCommandContext(
      "task_intake",
      "operations_quick_capture"
    );
    await workspaceCommandService.createTask(actionContext.command, {
      code: createCode("task", data.title),
      title: data.title,
      summary: data.summary,
      ownerTeamId: actionContext.ownerTeamId,
      regionId: actionContext.regionId,
      briefId: optionalObjectId("brief", data.briefCode),
      issueId: optionalObjectId("issue", data.issueCode),
      priority: data.priority,
      dueAt: afterHours(48),
      workflowStep: "queued_execution",
      sensitivity: "internal"
    });
  } catch (error) {
    failExecution(locale, "operations", "createTask", error);
  }

  revalidatePath(`/${locale}/operations`);
  finishAction(locale, "operations", "created");
}

export async function createFeedbackAction(locale: string, formData: FormData) {
  try {
    await assertTrustedServerActionRequest();
  } catch (error) {
    failExecution(locale, "feedback", "createFeedback", error);
  }

  const parsed = FeedbackSchema.safeParse({
    title: getValue(formData, "title"),
    summary: getValue(formData, "summary"),
    issueCode: getValue(formData, "issueCode"),
    taskCode: getValue(formData, "taskCode"),
    severity: getValue(formData, "severity")
  });

  if (!parsed.success) {
    failValidation(locale, "feedback", "createFeedback", parsed.error);
  }

  const data = parsed.data;

  try {
    const actionContext = await createServerCommandContext(
      "feedback_intake",
      "feedback_quick_capture"
    );
    await workspaceCommandService.createFeedback(actionContext.command, {
      code: createCode("feedback", data.title),
      title: data.title,
      summary: data.summary,
      severity: data.severity,
      source: "internal",
      issueId: optionalObjectId("issue", data.issueCode),
      taskId: optionalObjectId("task", data.taskCode),
      regionId: actionContext.regionId,
      ownerTeamId: actionContext.ownerTeamId,
      sensitivity: "internal"
    });
  } catch (error) {
    failExecution(locale, "feedback", "createFeedback", error);
  }

  revalidatePath(`/${locale}/feedback`);
  finishAction(locale, "feedback", "created");
}
