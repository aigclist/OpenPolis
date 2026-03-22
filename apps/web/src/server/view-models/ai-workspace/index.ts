import { getTranslations } from "next-intl/server";

import { getServerWorkspaceReadService } from "../../workspace/read-service";
import {
  formatDate,
  getRecordSummary,
  getRecordTitle,
  humanizeCode
} from "../shared";
import { toActiveJobItem, toConfirmationItem, toResultItem } from "./mappers";
import { getRecentAgentRuns } from "./records";
import type { AiControlEvidenceItem } from "./types";

export async function getAiWorkspaceViewModel(locale: string) {
  const readServicePromise = getServerWorkspaceReadService();
  const recentAgentRunsPromise = Promise.resolve(getRecentAgentRuns(12));

  const [tModules, tCommon, tRecords, tAi, snapshot, recentAgentRuns] =
    await Promise.all([
      getTranslations({ locale, namespace: "modules" }),
      getTranslations({ locale, namespace: "common" }),
      getTranslations({ locale, namespace: "records" }),
      getTranslations({ locale, namespace: "aiWorkspace" }),
      readServicePromise.then((service) => service.getSkillProviderSnapshot()),
      recentAgentRunsPromise
    ]);

  const configuredProviders = snapshot.providers.filter(
    (provider) => provider.status === "configured"
  ).length;
  const enabledProviders = snapshot.providers.filter(
    (provider) => provider.status === "enabled"
  ).length;
  const restrictedProviders = snapshot.providers.filter(
    (provider) => provider.status === "restricted"
  ).length;
  const enabledSkills = snapshot.skills.filter(
    (skill) => skill.status === "enabled"
  ).length;

  const providerItems = snapshot.providers.slice(0, 3).map((row) => ({
    id: row.code,
    title: getRecordTitle("providers", row.code, row.title, tRecords),
    summary: getRecordSummary("providers", row.code, row.summary, tRecords),
    badges: [tCommon(`status.${row.status}`)],
    meta: [
      `${tCommon("labels.code")}: ${row.code}`,
      row.kind ? `${tCommon("labels.kind")}: ${humanizeCode(row.kind)}` : "",
      row.updatedAt
        ? `${tCommon("labels.updated")}: ${formatDate(locale, row.updatedAt)}`
        : ""
    ].filter(Boolean)
  }));

  const skillItems = snapshot.skills.slice(0, 4).map((row) => ({
    id: row.code,
    title: getRecordTitle("skills", row.code, row.title, tRecords),
    summary: getRecordSummary("skills", row.code, row.summary, tRecords),
    badges: [tCommon(`status.${row.status}`)],
    meta: [
      `${tCommon("labels.code")}: ${row.code}`,
      row.scope ? `${tCommon("labels.scope")}: ${humanizeCode(row.scope)}` : ""
    ].filter(Boolean)
  }));

  const activeJobs = recentAgentRuns
    .filter((run) => run.status === "pending" || run.status === "running")
    .slice(0, 6)
    .map((run) => toActiveJobItem(run, locale, tAi, tRecords));

  const confirmationItems = recentAgentRuns
    .filter(
      (run) =>
        run.status === "waiting_human_review" && run.approvalState === "pending"
    )
    .slice(0, 6)
    .map((run) => toConfirmationItem(run, locale, tAi, tRecords));

  const resultItems = recentAgentRuns
    .filter(
      (run) =>
        run.status === "completed" ||
        run.status === "failed" ||
        run.status === "cancelled"
    )
    .slice(0, 4)
    .map((run) => toResultItem(run, locale, tAi));

  const jobsInMotionCount = recentAgentRuns.filter(
    (run) =>
      run.status === "pending" ||
      run.status === "running" ||
      run.status === "waiting_human_review"
  ).length;

  const evidenceItems: AiControlEvidenceItem[] = [
    {
      id: "activity",
      title: tAi("evidence.activity.title"),
      summary: tAi("evidence.activity.summary"),
      href: `/${locale}/admin`
    },
    {
      id: "changes",
      title: tAi("evidence.changes.title"),
      summary: tAi("evidence.changes.summary"),
      href: `/${locale}/operations`
    },
    {
      id: "guardrails",
      title: tAi("evidence.guardrails.title"),
      summary: tAi("evidence.guardrails.summary"),
      href: `/${locale}/skills`
    }
  ];

  const quickActions = [
    {
      id: "today",
      label: tAi("quickActions.today.label"),
      prompt: tAi("quickActions.today.prompt")
    },
    {
      id: "materials",
      label: tAi("quickActions.materials.label"),
      prompt: tAi("quickActions.materials.prompt")
    },
    {
      id: "tasks",
      label: tAi("quickActions.tasks.label"),
      prompt: tAi("quickActions.tasks.prompt")
    },
    {
      id: "followUp",
      label: tAi("quickActions.followUp.label"),
      prompt: tAi("quickActions.followUp.prompt")
    }
  ];

  const agents = [
    {
      id: "intake",
      name: tAi("agents.intake.name"),
      role: tAi("agents.intake.role"),
      summary: tAi("agents.intake.summary"),
      status: tAi("agentStatus.busy"),
      load: "64%"
    },
    {
      id: "task",
      name: tAi("agents.task.name"),
      role: tAi("agents.task.role"),
      summary: tAi("agents.task.summary"),
      status: tAi("agentStatus.steady"),
      load: "47%"
    },
    {
      id: "drafting",
      name: tAi("agents.drafting.name"),
      role: tAi("agents.drafting.role"),
      summary: tAi("agents.drafting.summary"),
      status: tAi("agentStatus.busy"),
      load: "71%"
    },
    {
      id: "summary",
      name: tAi("agents.summary.name"),
      role: tAi("agents.summary.role"),
      summary: tAi("agents.summary.summary"),
      status: tAi("agentStatus.steady"),
      load: "52%"
    },
    {
      id: "risk",
      name: tAi("agents.risk.name"),
      role: tAi("agents.risk.role"),
      summary: tAi("agents.risk.summary"),
      status: tAi("agentStatus.watch"),
      load: "59%"
    },
    {
      id: "governance",
      name: tAi("agents.governance.name"),
      role: tAi("agents.governance.role"),
      summary: tAi("agents.governance.summary"),
      status: tAi("agentStatus.guarded"),
      load: "36%"
    }
  ];

  return {
    eyebrow: tModules("aiWorkspace.eyebrow"),
    title: tModules("aiWorkspace.title"),
    description: tModules("aiWorkspace.description"),
    hero: {
      inputTitle: tAi("inputTitle"),
      inputDescription: tAi("inputDescription"),
      promptPlaceholder: tAi("promptPlaceholder"),
      promptHelper: tAi("promptHelper"),
      submitLabel: tAi("submit"),
      quickActions,
      stats: [
        {
          label: tAi("stats.connectedProviders"),
          value: String(configuredProviders + enabledProviders),
          detail: tAi("stats.connectedProvidersDetail")
        },
        {
          label: tAi("stats.enabledSkills"),
          value: String(enabledSkills),
          detail: tAi("stats.enabledSkillsDetail")
        },
        {
          label: tAi("stats.guardedScopes"),
          value: String(restrictedProviders),
          detail: tAi("stats.guardedScopesDetail")
        },
        {
          label: tAi("stats.jobsInMotion"),
          value: String(jobsInMotionCount),
          detail: tAi("stats.jobsInMotionDetail")
        }
      ]
    },
    sections: {
      results: {
        title: tAi("sections.results.title"),
        description: tAi("sections.results.description")
      },
      activeWork: {
        title: tAi("sections.activeWork.title"),
        description: tAi("sections.activeWork.description")
      },
      confirmations: {
        title: tAi("sections.confirmations.title"),
        description: tAi("sections.confirmations.description")
      },
      evidence: {
        title: tAi("sections.evidence.title"),
        description: tAi("sections.evidence.description")
      },
      agents: {
        title: tAi("sections.agents.title"),
        description: tAi("sections.agents.description")
      },
      readiness: {
        title: tAi("sections.readiness.title"),
        description: tAi("sections.readiness.description")
      }
    },
    alerts: {
      created: {
        title: tAi("alerts.created.title"),
        description: tAi("alerts.created.description")
      },
      error: {
        title: tAi("alerts.error.title"),
        description: tAi("alerts.error.description")
      },
      responseCreated: {
        title: tAi("alerts.responseCreated.title"),
        description: tAi("alerts.responseCreated.description")
      },
      responseError: {
        title: tAi("alerts.responseError.title"),
        description: tAi("alerts.responseError.description")
      }
    },
    emptyStates: {
      results: {
        title: tAi("emptyStates.results.title"),
        description: tAi("emptyStates.results.description")
      },
      activeWork: {
        title: tAi("emptyStates.activeWork.title"),
        description: tAi("emptyStates.activeWork.description")
      },
      confirmations: {
        title: tAi("emptyStates.confirmations.title"),
        description: tAi("emptyStates.confirmations.description")
      }
    },
    actions: {
      open: tCommon("actions.open"),
      review: tCommon("actions.review"),
      inspect: tCommon("actions.inspect"),
      approve: tCommon("actions.approve"),
      reject: tCommon("actions.reject")
    },
    labels: {
      load: tAi("labels.load")
    },
    resultItems,
    activeJobs,
    confirmationItems,
    evidenceItems,
    agents,
    readiness: {
      providersTitle: tAi("readiness.providersTitle"),
      skillsTitle: tAi("readiness.skillsTitle"),
      providerItems,
      skillItems
    }
  };
}
