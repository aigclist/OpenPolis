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
import { createTaskAction } from "@/server/workflow/actions";

type OperationsPageProps = {
  params: Promise<{
    locale: string;
  }>;
  searchParams: Promise<{
    result?: string;
    error?: string;
    record?: string;
    issueCode?: string;
    briefCode?: string;
    title?: string;
    summary?: string;
    page?: string;
    pageSize?: string;
  }>;
};

export default async function OperationsPage({
  params,
  searchParams
}: OperationsPageProps) {
  const { locale } = await params;
  const { result, error, record, issueCode, briefCode, title, summary, page, pageSize } =
    await searchParams;
  const pagination = parsePaginationParams(page, pageSize);
  const [viewModel, tTaskIntake, tCommon, issueOptions, briefOptions] =
    await Promise.all([
    getCoreModuleViewModel(locale, "operations", {
      recordCode: record,
      basePath: `/${locale}/operations`,
      pagination
    }),
    getTranslations({ locale, namespace: "taskIntake" }),
    getTranslations({ locale, namespace: "common" }),
    getModuleCommandOptions(locale, "issues"),
    getModuleCommandOptions(locale, "briefs")
  ]);
  const taskAction = createTaskAction.bind(null, locale);
  const status = normalizeActionStatus(result);
  const errorCode =
    status === "error" ? normalizeActionErrorCode(error) : undefined;
  const issueDefaultValue = resolveOptionDefault(issueCode, issueOptions, "none");
  const briefDefaultValue = resolveOptionDefault(briefCode, briefOptions, "none");

  return (
    <ModulePageTemplate
      {...viewModel}
      topContent={
        <WorkflowCommandCard
          action={taskAction}
          description={tTaskIntake("description")}
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
          errorDescription={tTaskIntake("alerts.error.description")}
          errorTitle={tTaskIntake("alerts.error.title")}
          fields={[
            {
              kind: "text",
              name: "title",
              label: tTaskIntake("fields.title.label"),
              placeholder: tTaskIntake("fields.title.placeholder"),
              defaultValue: resolveTextDefault(title)
            },
            {
              kind: "textarea",
              name: "summary",
              label: tTaskIntake("fields.summary.label"),
              placeholder: tTaskIntake("fields.summary.placeholder"),
              defaultValue: resolveTextDefault(summary)
            },
            {
              kind: "select",
              name: "issueCode",
              label: tTaskIntake("fields.issueCode.label"),
              defaultValue: issueDefaultValue,
              options: [
                { value: "none", label: tCommon("options.none") },
                ...issueOptions
              ]
            },
            {
              kind: "select",
              name: "briefCode",
              label: tTaskIntake("fields.briefCode.label"),
              defaultValue: briefDefaultValue,
              options: [
                { value: "none", label: tCommon("options.none") },
                ...briefOptions
              ]
            },
            {
              kind: "select",
              name: "priority",
              label: tTaskIntake("fields.priority.label"),
              defaultValue: "steady",
              options: [
                {
                  value: "critical",
                  label: tTaskIntake("options.priority.critical")
                },
                { value: "high", label: tTaskIntake("options.priority.high") },
                {
                  value: "medium",
                  label: tTaskIntake("options.priority.medium")
                },
                {
                  value: "steady",
                  label: tTaskIntake("options.priority.steady")
                }
              ]
            }
          ]}
          status={status}
          submitLabel={tTaskIntake("submit")}
          successDescription={tTaskIntake("alerts.created.description")}
          successTitle={tTaskIntake("alerts.created.title")}
          title={tTaskIntake("title")}
        />
      }
    />
  );
}
