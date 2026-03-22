import { getTranslations } from "next-intl/server";

import { ModulePageTemplate } from "@/components/modules/module-page-template";
import { WorkflowCommandCard } from "@/components/modules/workflow-command-card";
import {
  getActionErrorTranslationKey,
  normalizeActionErrorCode,
  normalizeActionStatus
} from "@/server/security/action-errors";
import { parsePaginationParams } from "@/server/security/input-validation";
import { getCoreModuleViewModel } from "@/server/view-models";
import { createIssueAction } from "@/server/workflow/actions";

type IssuesPageProps = {
  params: Promise<{
    locale: string;
  }>;
  searchParams: Promise<{
    result?: string;
    error?: string;
    record?: string;
    page?: string;
    pageSize?: string;
  }>;
};

export default async function IssuesPage({
  params,
  searchParams
}: IssuesPageProps) {
  const { locale } = await params;
  const { result, error, record, page, pageSize } = await searchParams;
  const pagination = parsePaginationParams(page, pageSize);
  const [viewModel, tIssueIntake, tCommon] = await Promise.all([
    getCoreModuleViewModel(locale, "issues", {
      recordCode: record,
      basePath: `/${locale}/issues`,
      pagination
    }),
    getTranslations({ locale, namespace: "issueIntake" }),
    getTranslations({ locale, namespace: "common" })
  ]);

  const issueAction = createIssueAction.bind(null, locale);
  const status = normalizeActionStatus(result);
  const errorCode =
    status === "error" ? normalizeActionErrorCode(error) : undefined;

  return (
    <ModulePageTemplate
      {...viewModel}
      topContent={
        <WorkflowCommandCard
          action={issueAction}
          description={tIssueIntake("description")}
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
          errorDescription={tIssueIntake("alerts.error.description")}
          errorTitle={tIssueIntake("alerts.error.title")}
          fields={[
            {
              kind: "text",
              name: "title",
              label: tIssueIntake("fields.title.label"),
              placeholder: tIssueIntake("fields.title.placeholder")
            },
            {
              kind: "textarea",
              name: "summary",
              label: tIssueIntake("fields.summary.label"),
              placeholder: tIssueIntake("fields.summary.placeholder")
            }
          ]}
          status={status}
          submitLabel={tIssueIntake("submit")}
          successDescription={tIssueIntake("alerts.created.description")}
          successTitle={tIssueIntake("alerts.created.title")}
          title={tIssueIntake("title")}
        />
      }
    />
  );
}
