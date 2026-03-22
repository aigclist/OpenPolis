"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  RequiredEntityCodeInputSchema,
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
  workspaceCommandService
} from "./shared";

const ApprovalSchema = z.object({
  title: RequiredTitleInputSchema,
  assetCode: RequiredEntityCodeInputSchema
});

const ApprovalResponseSchema = z.object({
  approvalCode: RequiredEntityCodeInputSchema,
  decision: z.enum(["changes_requested", "approved", "rejected"])
});

export async function submitApprovalAction(locale: string, formData: FormData) {
  try {
    await assertTrustedServerActionRequest();
  } catch (error) {
    failExecution(locale, "review", "submitApproval", error);
  }

  const parsed = ApprovalSchema.safeParse({
    title: getValue(formData, "title"),
    assetCode: getValue(formData, "assetCode")
  });

  if (!parsed.success) {
    failValidation(locale, "review", "submitApproval", parsed.error);
  }

  const data = parsed.data;
  const assetCode = data.assetCode;

  try {
    const actionContext = await createServerCommandContext(
      "approval_submit",
      "review_submission"
    );
    await workspaceCommandService.submitApproval(actionContext.command, {
      code: createCode("approval", `${data.title}_${assetCode}`),
      title: data.title,
      subject: {
        objectType: "asset",
        objectId: `asset_${assetCode}`,
        objectCode: assetCode
      },
      requestedByTeamId: actionContext.ownerTeamId,
      reviewerTeamId: "team_review",
      dueAt: afterHours(24),
      checklist: ["message_consistency", "human_review_required"],
      sensitivity: "internal"
    });
  } catch (error) {
    failExecution(locale, "review", "submitApproval", error);
  }

  revalidatePath(`/${locale}/review`);
  finishAction(locale, "review", "created");
}

export async function respondToApprovalAction(
  locale: string,
  formData: FormData
) {
  try {
    await assertTrustedServerActionRequest();
  } catch (error) {
    failExecution(locale, "review", "respondToApproval", error, "response");
  }

  const parsed = ApprovalResponseSchema.safeParse({
    approvalCode: getValue(formData, "approvalCode"),
    decision: getValue(formData, "decision")
  });

  if (!parsed.success) {
    failValidation(
      locale,
      "review",
      "respondToApproval",
      parsed.error,
      "response"
    );
  }

  const data = parsed.data;

  try {
    const actionContext = await createServerCommandContext(
      "approval_response",
      "review_response"
    );
    await workspaceCommandService.respondToApproval(actionContext.command, {
      approvalId: `approval_${data.approvalCode}`,
      decision: data.decision,
      comment: "review_response_recorded"
    });
  } catch (error) {
    failExecution(locale, "review", "respondToApproval", error, "response");
  }

  revalidatePath(`/${locale}/review`);
  finishAction(locale, "review", "created", "response");
}
