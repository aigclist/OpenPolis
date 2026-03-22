import type { AgentRunMode, ObjectRef } from "@openpolis/contracts";

type PlannedAgentRun = {
  instruction: string;
  title: string;
  mode: AgentRunMode;
  skillCode: string;
  providerCode: string;
  requiresHumanApproval: boolean;
  reviewReason?: string;
};

const stateChangingPattern =
  /(publish|send|dispatch|apply|grant|change|update|close|execute|release|export|permission|approve and send|发布|发送|下发|执行|调整权限|修改|更新|导出|发出)/iu;
const draftingPattern =
  /(draft|write|prepare|summarize|brief|report|notice|memo|organize|turn .* into|起草|拟写|整理|汇总|总结|简报|报告|通知|形成)/iu;
const approvalPattern =
  /(publish|send|dispatch|release|external|permission|grant access|export|发布|发送|下发|对外|权限|授权|导出)/iu;
const governancePattern =
  /(review|approval|permission|guard|risk|compliance|审查|审批|权限|风险|边界)/iu;
const draftingSkillPattern =
  /(draft|brief|notice|report|summary|materials|memo|起草|简报|通知|报告|材料|摘要)/iu;

export function planAgentRun(prompt: string): PlannedAgentRun {
  const instruction = collapseWhitespace(prompt);
  const title = createAgentRunTitle(instruction);
  const mode = inferAgentRunMode(instruction);
  const requiresHumanApproval =
    mode === "state_changing" || approvalPattern.test(instruction);

  return {
    instruction,
    title,
    mode,
    skillCode: selectSkillCode(instruction, mode),
    providerCode: "custom_gateway",
    requiresHumanApproval,
    reviewReason: requiresHumanApproval
      ? createReviewReason(instruction, mode)
      : undefined
  };
}

export function createAgentRunTarget(options: {
  ownerTeamId: string;
  regionId?: string;
}): ObjectRef {
  if (options.regionId) {
    return {
      objectType: "region",
      objectId: options.regionId,
      objectCode: options.regionId
    };
  }

  return {
    objectType: "team",
    objectId: options.ownerTeamId,
    objectCode: options.ownerTeamId
  };
}

function collapseWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function createAgentRunTitle(prompt: string) {
  const firstSentence =
    prompt.split(/(?<=[.!?。！？])\s+/u).find((segment) => segment.length > 0) ??
    prompt;

  if (firstSentence.length <= 160) {
    return firstSentence;
  }

  return `${firstSentence.slice(0, 157).trimEnd()}...`;
}

function inferAgentRunMode(prompt: string): AgentRunMode {
  if (stateChangingPattern.test(prompt)) {
    return "state_changing";
  }

  if (draftingPattern.test(prompt)) {
    return "drafting";
  }

  return "advisory";
}

function selectSkillCode(prompt: string, mode: AgentRunMode) {
  if (mode === "state_changing" || governancePattern.test(prompt)) {
    return "approval_guard";
  }

  if (mode === "drafting" || draftingSkillPattern.test(prompt)) {
    return "brief_drafter";
  }

  return "issue_summarizer";
}

function createReviewReason(prompt: string, mode: AgentRunMode) {
  if (/(permission|grant access|权限|授权)/iu.test(prompt)) {
    return "This task changes permissions or access scope.";
  }

  if (/(publish|release|external|发布|对外|发出)/iu.test(prompt)) {
    return "This task can trigger an outward-facing release.";
  }

  if (mode === "state_changing") {
    return "This task can change live records or operational state.";
  }

  return "This task crossed a review rule and needs explicit human approval.";
}

export type { PlannedAgentRun };
