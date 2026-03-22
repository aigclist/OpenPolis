"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { executeAgentRun } from "../../ai-workspace/run-execution";
import {
  createAgentRunTarget,
  planAgentRun
} from "../../ai-workspace/run-routing";
import { RequiredSummaryInputSchema } from "../../security/input-validation";
import {
  assertTrustedServerActionRequest,
  createCode,
  createServerCommandContext,
  failExecution,
  failValidation,
  finishAction,
  getValue,
  workspaceCommandService
} from "./shared";

const AgentRunSchema = z.object({
  prompt: RequiredSummaryInputSchema
});

const AgentRunResponseSchema = z.object({
  agentRunId: z.string().min(1).max(120),
  decision: z.enum(["approved", "rejected"])
});

export async function createAgentRunAction(locale: string, formData: FormData) {
  try {
    await assertTrustedServerActionRequest();
  } catch (error) {
    failExecution(locale, "ai-workspace", "createAgentRun", error);
  }

  const parsed = AgentRunSchema.safeParse({
    prompt: getValue(formData, "prompt")
  });

  if (!parsed.success) {
    failValidation(locale, "ai-workspace", "createAgentRun", parsed.error);
  }

  const plannedRun = planAgentRun(parsed.data.prompt);

  try {
    const actionContext = await createServerCommandContext(
      "agent_run_create",
      "ai_control_assignment"
    );
    const createdRun = await workspaceCommandService.createAgentRun(
      actionContext.command,
      {
        code: createCode("agent", plannedRun.title),
        title: plannedRun.title,
        instruction: plannedRun.instruction,
        skillCode: plannedRun.skillCode,
        providerCode: plannedRun.providerCode,
        mode: plannedRun.mode,
        target: createAgentRunTarget({
          ownerTeamId: actionContext.ownerTeamId,
          regionId: actionContext.regionId
        }),
        requiresHumanApproval: plannedRun.requiresHumanApproval,
        reviewReason: plannedRun.reviewReason
      }
    );

    if (!plannedRun.requiresHumanApproval) {
      const execution = executeAgentRun(createdRun.entity);
      await workspaceCommandService.finalizeAgentRun(actionContext.command, {
        agentRunId: createdRun.entity.id,
        outcome: execution.outcome,
        summary: execution.summary
      });
    }
  } catch (error) {
    failExecution(locale, "ai-workspace", "createAgentRun", error);
  }

  revalidatePath(`/${locale}/ai-workspace`);
  finishAction(locale, "ai-workspace", "created");
}

export async function respondToAgentRunAction(
  locale: string,
  formData: FormData
) {
  try {
    await assertTrustedServerActionRequest();
  } catch (error) {
    failExecution(locale, "ai-workspace", "respondToAgentRun", error, "response");
  }

  const parsed = AgentRunResponseSchema.safeParse({
    agentRunId: getValue(formData, "agentRunId"),
    decision: getValue(formData, "decision")
  });

  if (!parsed.success) {
    failValidation(
      locale,
      "ai-workspace",
      "respondToAgentRun",
      parsed.error,
      "response"
    );
  }

  try {
    const actionContext = await createServerCommandContext(
      "agent_run_response",
      "ai_control_review"
    );
    const respondedRun = await workspaceCommandService.respondToAgentRun(
      actionContext.command,
      {
        agentRunId: parsed.data.agentRunId,
        decision: parsed.data.decision,
        comment:
          parsed.data.decision === "approved"
            ? "ai_control_human_approval_recorded"
            : "ai_control_human_rejection_recorded"
      }
    );

    if (parsed.data.decision === "approved") {
      const execution = executeAgentRun(respondedRun.entity);
      await workspaceCommandService.finalizeAgentRun(actionContext.command, {
        agentRunId: respondedRun.entity.id,
        outcome: execution.outcome,
        summary: execution.summary
      });
    }
  } catch (error) {
    failExecution(
      locale,
      "ai-workspace",
      "respondToAgentRun",
      error,
      "response"
    );
  }

  revalidatePath(`/${locale}/ai-workspace`);
  finishAction(locale, "ai-workspace", "created", "response");
}
