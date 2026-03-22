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
import { createBriefAction } from "@/server/workflow/actions";

type BriefsPageProps = {
  params: Promise<{
    locale: string;
  }>;
  searchParams: Promise<{
    result?: string;
    error?: string;
    record?: string;
    issueCode?: string;
    title?: string;
    summary?: string;
    page?: string;
    pageSize?: string;
  }>;
};

export default async function BriefsPage({
  params,
  searchParams
}: BriefsPageProps) {
  const { locale } = await params;
  const { result, error, record, issueCode, title, summary, page, pageSize } =
    await searchParams;
  const pagination = parsePaginationParams(page, pageSize);
  const [viewModel, tBriefIntake, tCommon, issueOptions] = await Promise.all([
    getCoreModuleViewModel(locale, "briefs", {
      recordCode: record,
      basePath: `/${locale}/briefs`,
      pagination
    }),
    getTranslations({ locale, namespace: "briefIntake" }),
    getTranslations({ locale, namespace: "common" }),
    getModuleCommandOptions(locale, "issues")
  ]);
  const briefAction = createBriefAction.bind(null, locale);
  const status = normalizeActionStatus(result);
  const errorCode =
    status === "error" ? normalizeActionErrorCode(error) : undefined;
  const issueDefaultValue = resolveOptionDefault(issueCode, issueOptions, "none");

  return (
    <ModulePageTemplate
      {...viewModel}
      topContent={
        <WorkflowCommandCard
          action={briefAction}
          description={tBriefIntake("description")}
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
          errorDescription={tBriefIntake("alerts.error.description")}
          errorTitle={tBriefIntake("alerts.error.title")}
          fields={[
            {
              kind: "text",
              name: "title",
              label: tBriefIntake("fields.title.label"),
              placeholder: tBriefIntake("fields.title.placeholder"),
              defaultValue: resolveTextDefault(title)
            },
            {
              kind: "textarea",
              name: "summary",
              label: tBriefIntake("fields.summary.label"),
              placeholder: tBriefIntake("fields.summary.placeholder"),
              defaultValue: resolveTextDefault(summary)
            },
            {
              kind: "select",
              name: "issueCode",
              label: tBriefIntake("fields.issueCode.label"),
              defaultValue: issueDefaultValue,
              options: [
                { value: "none", label: tCommon("options.none") },
                ...issueOptions
              ]
            }
          ]}
          status={status}
          submitLabel={tBriefIntake("submit")}
          successDescription={tBriefIntake("alerts.created.description")}
          successTitle={tBriefIntake("alerts.created.title")}
          title={tBriefIntake("title")}
        />
      }
    />
  );
}
