import type { AgentRun } from "@openpolis/contracts";

type AgentRunExecutionResult = {
  outcome: "completed" | "failed";
  summary: string;
};

const failurePattern = /(fail|failure|error|broken|测试失败|失败|报错)/iu;

export function executeAgentRun(run: AgentRun): AgentRunExecutionResult {
  if (failurePattern.test(run.instruction)) {
    return {
      outcome: "failed",
      summary:
        "The run stopped during automatic processing and needs operator inspection."
    };
  }

  switch (run.skillCode) {
    case "approval_guard":
      return {
        outcome: "completed",
        summary: createApprovalGuardSummary(run)
      };
    case "brief_drafter":
      return {
        outcome: "completed",
        summary: createDraftingSummary(run)
      };
    case "issue_summarizer":
    default:
      return {
        outcome: "completed",
        summary: createAdvisorySummary(run)
      };
  }
}

function createAdvisorySummary(run: AgentRun) {
  return summarizeInstruction(
    `Prepared a short operating summary for ${getTargetLabel(run)} and marked the main follow-up points.`
  );
}

function createDraftingSummary(run: AgentRun) {
  return summarizeInstruction(
    `Prepared a draft package for ${getTargetLabel(run)} with the main points already organized for review or reuse.`
  );
}

function createApprovalGuardSummary(run: AgentRun) {
  if (run.mode === "state_changing") {
    return summarizeInstruction(
      `Checked the requested change for ${getTargetLabel(run)} and recorded the governed execution outcome.`
    );
  }

  return summarizeInstruction(
    `Reviewed the assignment for ${getTargetLabel(run)} and recorded the guarded next step.`
  );
}

function summarizeInstruction(summary: string) {
  return summary.slice(0, 2000);
}

function getTargetLabel(run: AgentRun) {
  return run.target.objectCode ?? run.target.objectId;
}

export type { AgentRunExecutionResult };
