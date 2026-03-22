import { getTranslations } from "next-intl/server";

import { ModulePageTemplate } from "@/components/modules/module-page-template";
import { WorkflowCommandCard } from "@/components/modules/workflow-command-card";
import {
  getActionErrorTranslationKey,
  normalizeActionErrorCode,
  normalizeActionStatus
} from "@/server/security/action-errors";
import { parsePaginationParams } from "@/server/security/input-validation";
import {
  resolveOptionDefault,
  resolveTextDefault
} from "@/server/workflow/prefill";
import {
  getCoreModuleViewModel,
  getModuleCommandOptions
} from "@/server/view-models";
import { createFeedbackAction } from "@/server/workflow/actions";

type FeedbackPageProps = {
  params: Promise<{
    locale: string;
  }>;
  searchParams: Promise<{
    result?: string;
    error?: string;
    record?: string;
    issueCode?: string;
    taskCode?: string;
    title?: string;
    summary?: string;
    page?: string;
    pageSize?: string;
  }>;
};

export default async function FeedbackPage({
  params,
  searchParams
}: FeedbackPageProps) {
  const { locale } = await params;
  const { result, error, record, issueCode, taskCode, title, summary, page, pageSize } =
    await searchParams;
  const pagination = parsePaginationParams(page, pageSize);
  const [viewModel, tFeedbackIntake, tCommon, issueOptions, taskOptions] =
    await Promise.all([
    getCoreModuleViewModel(locale, "feedback", {
      recordCode: record,
      basePath: `/${locale}/feedback`,
      pagination
    }),
    getTranslations({ locale, namespace: "feedbackIntake" }),
    getTranslations({ locale, namespace: "common" }),
    getModuleCommandOptions(locale, "issues"),
    getModuleCommandOptions(locale, "operations")
  ]);
  const feedbackAction = createFeedbackAction.bind(null, locale);
  const status = normalizeActionStatus(result);
  const errorCode =
    status === "error" ? normalizeActionErrorCode(error) : undefined;
  const issueDefaultValue = resolveOptionDefault(issueCode, issueOptions, "none");
  const taskDefaultValue = resolveOptionDefault(taskCode, taskOptions, "none");

  return (
    <ModulePageTemplate
      {...viewModel}
      topContent={
        <WorkflowCommandCard
          action={feedbackAction}
          description={tFeedbackIntake("description")}
          errorAlert={
            errorCode
              ? {
                  title: tCommon(getActionErrorTranslationKey(errorCode, "title")),
                  description: tCommon(
                    getActionErrorTranslationKey(errorCode, "description")
                  )
                }
              : undefined
          }
          errorDescription={tFeedbackIntake("alerts.error.description")}
          errorTitle={tFeedbackIntake("alerts.error.title")}
          fields={[
            {
              kind: "text",
              name: "title",
              label: tFeedbackIntake("fields.title.label"),
              placeholder: tFeedbackIntake("fields.title.placeholder"),
              defaultValue: resolveTextDefault(title)
            },
            {
              kind: "textarea",
              name: "summary",
              label: tFeedbackIntake("fields.summary.label"),
              placeholder: tFeedbackIntake("fields.summary.placeholder"),
              defaultValue: resolveTextDefault(summary)
            },
            {
              kind: "select",
              name: "issueCode",
              label: tFeedbackIntake("fields.issueCode.label"),
              defaultValue: issueDefaultValue,
              options: [
                { value: "none", label: tCommon("options.none") },
                ...issueOptions
              ]
            },
            {
              kind: "select",
              name: "taskCode",
              label: tFeedbackIntake("fields.taskCode.label"),
              defaultValue: taskDefaultValue,
              options: [
                { value: "none", label: tCommon("options.none") },
                ...taskOptions
              ]
            },
            {
              kind: "select",
              name: "severity",
              label: tFeedbackIntake("fields.severity.label"),
              defaultValue: "medium",
              options: [
                {
                  value: "critical",
                  label: tFeedbackIntake("options.severity.critical")
                },
                {
                  value: "high",
                  label: tFeedbackIntake("options.severity.high")
                },
                {
                  value: "medium",
                  label: tFeedbackIntake("options.severity.medium")
                },
                { value: "low", label: tFeedbackIntake("options.severity.low") }
              ]
            }
          ]}
          status={status}
          submitLabel={tFeedbackIntake("submit")}
          successDescription={tFeedbackIntake("alerts.created.description")}
          successTitle={tFeedbackIntake("alerts.created.title")}
          title={tFeedbackIntake("title")}
        />
      }
    />
  );
}
