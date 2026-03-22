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
import {
  respondToApprovalAction,
  submitApprovalAction
} from "@/server/workflow/actions";

type ReviewPageProps = {
  params: Promise<{
    locale: string;
  }>;
  searchParams: Promise<{
    result?: string;
    error?: string;
    response?: string;
    responseError?: string;
    record?: string;
    assetCode?: string;
    approvalCode?: string;
    title?: string;
    page?: string;
    pageSize?: string;
  }>;
};

export default async function ReviewPage({
  params,
  searchParams
}: ReviewPageProps) {
  const { locale } = await params;
  const {
    result,
    error,
    response,
    responseError,
    record,
    assetCode,
    approvalCode,
    title,
    page,
    pageSize
  } = await searchParams;
  const pagination = parsePaginationParams(page, pageSize);
  const [viewModel, tApprovalSubmit, tApprovalResponse, tCommon, assetOptions, reviewOptions] =
    await Promise.all([
    getCoreModuleViewModel(locale, "review", {
      recordCode: record,
      basePath: `/${locale}/review`,
      pagination
    }),
    getTranslations({ locale, namespace: "approvalSubmit" }),
    getTranslations({ locale, namespace: "approvalResponse" }),
    getTranslations({ locale, namespace: "common" }),
    getModuleCommandOptions(locale, "assets"),
    getModuleCommandOptions(locale, "review")
  ]);
  const reviewAction = submitApprovalAction.bind(null, locale);
  const responseAction = respondToApprovalAction.bind(null, locale);
  const status = normalizeActionStatus(result);
  const errorCode =
    status === "error" ? normalizeActionErrorCode(error) : undefined;
  const responseStatus = normalizeActionStatus(response);
  const responseErrorCode =
    responseStatus === "error"
      ? normalizeActionErrorCode(responseError)
      : undefined;
  const responseOptions = reviewOptions.filter((option) =>
    option.value.startsWith("approval_")
  );
  const assetDefaultValue = resolveOptionDefault(
    assetCode,
    assetOptions,
    assetOptions[0]?.value ?? "none"
  );
  const approvalDefaultValue = resolveOptionDefault(
    approvalCode,
    responseOptions,
    responseOptions[0]?.value ?? "none"
  );

  return (
    <ModulePageTemplate
      {...viewModel}
      topContent={
        <div className="grid gap-4 lg:grid-cols-2">
          <WorkflowCommandCard
            action={reviewAction}
            description={tApprovalSubmit("description")}
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
            errorDescription={tApprovalSubmit("alerts.error.description")}
            errorTitle={tApprovalSubmit("alerts.error.title")}
            fields={[
              {
                kind: "text",
                name: "title",
                label: tApprovalSubmit("fields.title.label"),
                placeholder: tApprovalSubmit("fields.title.placeholder"),
                defaultValue: resolveTextDefault(title)
              },
              {
                kind: "select",
                name: "assetCode",
                label: tApprovalSubmit("fields.assetCode.label"),
                defaultValue: assetDefaultValue,
                options: assetOptions
              }
            ]}
            status={status}
            submitLabel={tApprovalSubmit("submit")}
            successDescription={tApprovalSubmit("alerts.created.description")}
            successTitle={tApprovalSubmit("alerts.created.title")}
            title={tApprovalSubmit("title")}
          />
          {responseOptions.length > 0 ? (
            <WorkflowCommandCard
              action={responseAction}
              description={tApprovalResponse("description")}
              errorAlert={
                responseErrorCode
                  ? {
                      title: tCommon(
                        getActionErrorTranslationKey(responseErrorCode, "title")
                      ),
                      description: tCommon(
                        getActionErrorTranslationKey(
                          responseErrorCode,
                          "description"
                        )
                      )
                    }
                  : undefined
              }
              errorDescription={tApprovalResponse("alerts.error.description")}
              errorTitle={tApprovalResponse("alerts.error.title")}
              fields={[
                {
                  kind: "select",
                  name: "approvalCode",
                  label: tApprovalResponse("fields.approvalCode.label"),
                  defaultValue: approvalDefaultValue,
                  options: responseOptions
                },
                {
                  kind: "select",
                  name: "decision",
                  label: tApprovalResponse("fields.decision.label"),
                  defaultValue: "approved",
                  options: [
                    {
                      value: "approved",
                      label: tApprovalResponse("options.decision.approved")
                    },
                    {
                      value: "changes_requested",
                      label: tApprovalResponse(
                        "options.decision.changes_requested"
                      )
                    },
                    {
                      value: "rejected",
                      label: tApprovalResponse("options.decision.rejected")
                    }
                  ]
                }
              ]}
              status={responseStatus}
              submitLabel={tApprovalResponse("submit")}
              successDescription={tApprovalResponse("alerts.created.description")}
              successTitle={tApprovalResponse("alerts.created.title")}
              title={tApprovalResponse("title")}
            />
          ) : null}
        </div>
      }
    />
  );
}
