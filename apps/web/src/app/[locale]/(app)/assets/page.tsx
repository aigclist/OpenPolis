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
import { createAssetDraftAction } from "@/server/workflow/actions";

type AssetsPageProps = {
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

export default async function AssetsPage({
  params,
  searchParams
}: AssetsPageProps) {
  const { locale } = await params;
  const { result, error, record, issueCode, briefCode, title, summary, page, pageSize } =
    await searchParams;
  const pagination = parsePaginationParams(page, pageSize);
  const [viewModel, tAssetDraft, tCommon, issueOptions, briefOptions] =
    await Promise.all([
    getCoreModuleViewModel(locale, "assets", {
      recordCode: record,
      basePath: `/${locale}/assets`,
      pagination
    }),
    getTranslations({ locale, namespace: "assetDraft" }),
    getTranslations({ locale, namespace: "common" }),
    getModuleCommandOptions(locale, "issues"),
    getModuleCommandOptions(locale, "briefs")
  ]);
  const assetAction = createAssetDraftAction.bind(null, locale);
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
          action={assetAction}
          description={tAssetDraft("description")}
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
          errorDescription={tAssetDraft("alerts.error.description")}
          errorTitle={tAssetDraft("alerts.error.title")}
          fields={[
            {
              kind: "text",
              name: "title",
              label: tAssetDraft("fields.title.label"),
              placeholder: tAssetDraft("fields.title.placeholder"),
              defaultValue: resolveTextDefault(title)
            },
            {
              kind: "textarea",
              name: "summary",
              label: tAssetDraft("fields.summary.label"),
              placeholder: tAssetDraft("fields.summary.placeholder"),
              defaultValue: resolveTextDefault(summary)
            },
            {
              kind: "select",
              name: "issueCode",
              label: tAssetDraft("fields.issueCode.label"),
              defaultValue: issueDefaultValue,
              options: [
                { value: "none", label: tCommon("options.none") },
                ...issueOptions
              ]
            },
            {
              kind: "select",
              name: "briefCode",
              label: tAssetDraft("fields.briefCode.label"),
              defaultValue: briefDefaultValue,
              options: [
                { value: "none", label: tCommon("options.none") },
                ...briefOptions
              ]
            },
            {
              kind: "select",
              name: "kind",
              label: tAssetDraft("fields.kind.label"),
              defaultValue: "social_post",
              options: [
                { value: "image", label: tAssetDraft("options.kind.image") },
                { value: "video", label: tAssetDraft("options.kind.video") },
                { value: "speech", label: tAssetDraft("options.kind.speech") },
                {
                  value: "social_post",
                  label: tAssetDraft("options.kind.social_post")
                },
                { value: "faq", label: tAssetDraft("options.kind.faq") },
                { value: "pdf", label: tAssetDraft("options.kind.pdf") },
                {
                  value: "template",
                  label: tAssetDraft("options.kind.template")
                },
                {
                  value: "briefing_note",
                  label: tAssetDraft("options.kind.briefing_note")
                }
              ]
            }
          ]}
          status={status}
          submitLabel={tAssetDraft("submit")}
          successDescription={tAssetDraft("alerts.created.description")}
          successTitle={tAssetDraft("alerts.created.title")}
          title={tAssetDraft("title")}
        />
      }
    />
  );
}
