import { getTranslations } from "next-intl/server";
import type { AgentApprovalState, AgentRun } from "@openpolis/contracts";

import {
  getRecordTitle,
  humanizeCode
} from "../shared";
import type {
  AiControlConfirmationItem,
  AiControlJobItem,
  AiControlResultItem
} from "./types";

export function toActiveJobItem(
  run: AgentRun,
  locale: string,
  tAi: Awaited<ReturnType<typeof getTranslations>>,
  tRecords: Awaited<ReturnType<typeof getTranslations>>
): AiControlJobItem {
  const skillTitle = getRecordTitle("skills", run.skillCode, null, tRecords);
  const providerTitle = getRecordTitle("providers", run.providerCode, null, tRecords);
  const profile = getAgentProfile(run.skillCode, tAi);

  return {
    id: run.id,
    title: run.title,
    summary: run.latestSummary
      ? run.latestSummary
      : run.status === "pending"
        ? tAi("dynamic.pendingSummary", {
            skill: skillTitle,
            provider: providerTitle
          })
        : tAi("dynamic.runningSummary", {
            skill: skillTitle,
            provider: providerTitle
          }),
    status: getStatusLabel(run.status, tAi),
    progress: getProgressValue(run),
    leadAgent: profile.leadAgent,
    supportingAgents: profile.supportingAgents,
    meta: tAi("dynamic.activeMeta", {
      target: getTargetLabel(run, tRecords),
      updated: formatDateTime(locale, run.audit.updatedAt)
    })
  };
}

export function toConfirmationItem(
  run: AgentRun,
  locale: string,
  tAi: Awaited<ReturnType<typeof getTranslations>>,
  tRecords: Awaited<ReturnType<typeof getTranslations>>
): AiControlConfirmationItem {
  const skillTitle = getRecordTitle("skills", run.skillCode, null, tRecords);
  const providerTitle = getRecordTitle("providers", run.providerCode, null, tRecords);

  return {
    id: run.id,
    title: run.title,
    summary:
      run.latestSummary ??
      tAi("dynamic.waitingSummary", {
        skill: skillTitle,
        provider: providerTitle
      }),
    reason:
      run.reviewReason ??
      tAi("dynamic.requiresApproval", {
        mode: getModeLabel(run.mode, tAi)
      }),
    owner: tAi("dynamic.confirmationOwner", {
      target: getTargetLabel(run, tRecords),
      updated: formatDateTime(locale, run.audit.updatedAt)
    }),
    agentRunId: run.id
  };
}

export function toResultItem(
  run: AgentRun,
  locale: string,
  tAi: Awaited<ReturnType<typeof getTranslations>>
): AiControlResultItem {
  return {
    id: run.id,
    title: run.title,
    summary: run.latestSummary ?? getFallbackResultSummary(run, tAi),
    badges: [getStatusLabel(run.status, tAi), getModeLabel(run.mode, tAi)],
    meta: tAi("dynamic.resultMeta", {
      approval: getApprovalStateLabel(run.approvalState, tAi),
      finished: formatDateTime(locale, run.finishedAt ?? run.audit.updatedAt)
    })
  };
}

function getAgentProfile(
  skillCode: string,
  tAi: Awaited<ReturnType<typeof getTranslations>>
) {
  switch (skillCode) {
    case "brief_drafter":
      return {
        leadAgent: tAi("agents.drafting.name"),
        supportingAgents: [tAi("agents.summary.name"), tAi("agents.task.name")]
      };
    case "approval_guard":
      return {
        leadAgent: tAi("agents.governance.name"),
        supportingAgents: [tAi("agents.risk.name"), tAi("agents.task.name")]
      };
    case "issue_summarizer":
    default:
      return {
        leadAgent: tAi("agents.summary.name"),
        supportingAgents: [
          tAi("agents.intake.name"),
          tAi("agents.governance.name")
        ]
      };
  }
}

function getFallbackResultSummary(
  run: AgentRun,
  tAi: Awaited<ReturnType<typeof getTranslations>>
) {
  switch (run.status) {
    case "completed":
      return tAi("dynamic.completedSummary", { skill: humanizeCode(run.skillCode) });
    case "failed":
      return tAi("dynamic.failedSummary", { skill: humanizeCode(run.skillCode) });
    case "cancelled":
      return tAi("dynamic.cancelledSummary");
    default:
      return tAi("dynamic.completedSummary", { skill: humanizeCode(run.skillCode) });
  }
}

function getStatusLabel(
  status: AgentRun["status"],
  tAi: Awaited<ReturnType<typeof getTranslations>>
) {
  switch (status) {
    case "pending":
      return tAi("runStatus.pending");
    case "running":
      return tAi("runStatus.running");
    case "waiting_human_review":
      return tAi("runStatus.waitingHumanReview");
    case "completed":
      return tAi("runStatus.completed");
    case "failed":
      return tAi("runStatus.failed");
    case "cancelled":
      return tAi("runStatus.cancelled");
  }
}

function getModeLabel(
  mode: AgentRun["mode"],
  tAi: Awaited<ReturnType<typeof getTranslations>>
) {
  switch (mode) {
    case "advisory":
      return tAi("runMode.advisory");
    case "drafting":
      return tAi("runMode.drafting");
    case "state_changing":
      return tAi("runMode.stateChanging");
  }
}

function getApprovalStateLabel(
  approvalState: AgentApprovalState,
  tAi: Awaited<ReturnType<typeof getTranslations>>
) {
  switch (approvalState) {
    case "required":
      return tAi("approval.required");
    case "pending":
      return tAi("approval.pending");
    case "approved":
      return tAi("approval.approved");
    case "rejected":
      return tAi("approval.rejected");
    case "not_required":
    default:
      return tAi("approval.notRequired");
  }
}

function getProgressValue(run: AgentRun) {
  switch (run.status) {
    case "pending":
      return 16;
    case "running":
      switch (run.mode) {
        case "advisory":
          return 42;
        case "drafting":
          return 61;
        case "state_changing":
          return 74;
      }
    case "waiting_human_review":
      return 92;
    case "completed":
    case "failed":
    case "cancelled":
      return 100;
  }
}

function getTargetLabel(
  run: AgentRun,
  tRecords: Awaited<ReturnType<typeof getTranslations>>
) {
  const targetCode = run.target.objectCode ?? run.target.objectId;

  if (run.target.objectType === "region" && run.target.objectCode) {
    return getRecordTitle("regions", run.target.objectCode, null, tRecords);
  }

  return humanizeCode(targetCode);
}

function formatDateTime(locale: string, value: string) {
  return new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));
}
