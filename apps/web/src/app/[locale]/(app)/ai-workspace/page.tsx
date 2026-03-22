import { getTranslations } from "next-intl/server";

import { AiControlActiveWorkPanel } from "@/components/ai/ai-control-active-work-panel";
import { AiControlAgentsPanel } from "@/components/ai/ai-control-agents-panel";
import { AiControlConfirmationsPanel } from "@/components/ai/ai-control-confirmations-panel";
import { AiControlEvidencePanel } from "@/components/ai/ai-control-evidence-panel";
import { AiControlHero } from "@/components/ai/ai-control-hero";
import { AiControlReadinessPanel } from "@/components/ai/ai-control-readiness-panel";
import { AiControlResultsPanel } from "@/components/ai/ai-control-results-panel";
import {
  getActionErrorTranslationKey,
  normalizeActionErrorCode,
  normalizeActionStatus
} from "@/server/security/action-errors";
import { getAiWorkspaceViewModel } from "@/server/view-models";
import {
  createAgentRunAction,
  respondToAgentRunAction
} from "@/server/workflow/actions";

type AiWorkspacePageProps = {
  params: Promise<{
    locale: string;
  }>;
  searchParams: Promise<{
    result?: string;
    error?: string;
    response?: string;
    responseError?: string;
  }>;
};

export default async function AiWorkspacePage({
  params,
  searchParams
}: AiWorkspacePageProps) {
  const { locale } = await params;
  const { result, error, response, responseError } = await searchParams;
  const [viewModel, tCommon] = await Promise.all([
    getAiWorkspaceViewModel(locale),
    getTranslations({ locale, namespace: "common" })
  ]);

  const createAgentRunFormAction = createAgentRunAction.bind(null, locale);
  const respondToAgentRunFormAction = respondToAgentRunAction.bind(null, locale);
  const status = normalizeActionStatus(result);
  const errorCode =
    status === "error" ? normalizeActionErrorCode(error) : undefined;
  const responseStatus = normalizeActionStatus(response);
  const responseErrorCode =
    responseStatus === "error"
      ? normalizeActionErrorCode(responseError)
      : undefined;

  return (
    <div className="flex flex-col gap-6">
      <AiControlHero
        action={createAgentRunFormAction}
        description={viewModel.description}
        eyebrow={viewModel.eyebrow}
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
        errorDescription={viewModel.alerts.error.description}
        errorTitle={viewModel.alerts.error.title}
        inputDescription={viewModel.hero.inputDescription}
        inputTitle={viewModel.hero.inputTitle}
        promptHelper={viewModel.hero.promptHelper}
        promptPlaceholder={viewModel.hero.promptPlaceholder}
        quickActions={viewModel.hero.quickActions}
        stats={viewModel.hero.stats}
        status={status}
        submitLabel={viewModel.hero.submitLabel}
        successDescription={viewModel.alerts.created.description}
        successTitle={viewModel.alerts.created.title}
        title={viewModel.title}
      />

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.9fr)]">
        <div className="grid gap-6">
          <AiControlResultsPanel
            description={viewModel.sections.results.description}
            emptyState={viewModel.emptyStates.results}
            items={viewModel.resultItems}
            title={viewModel.sections.results.title}
          />

          <AiControlActiveWorkPanel
            description={viewModel.sections.activeWork.description}
            emptyState={viewModel.emptyStates.activeWork}
            items={viewModel.activeJobs}
            title={viewModel.sections.activeWork.title}
          />

          <AiControlAgentsPanel
            agents={viewModel.agents}
            description={viewModel.sections.agents.description}
            loadLabel={viewModel.labels.load}
            title={viewModel.sections.agents.title}
          />
        </div>

        <div className="grid gap-6">
          <AiControlConfirmationsPanel
            action={respondToAgentRunFormAction}
            actions={viewModel.actions}
            alerts={{
              responseCreated: viewModel.alerts.responseCreated,
              responseError: viewModel.alerts.responseError
            }}
            description={viewModel.sections.confirmations.description}
            emptyState={viewModel.emptyStates.confirmations}
            items={viewModel.confirmationItems}
            responseErrorAlert={
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
            responseStatus={responseStatus}
            title={viewModel.sections.confirmations.title}
          />

          <AiControlEvidencePanel
            description={viewModel.sections.evidence.description}
            items={viewModel.evidenceItems}
            title={viewModel.sections.evidence.title}
          />

          <AiControlReadinessPanel
            description={viewModel.sections.readiness.description}
            providerItems={viewModel.readiness.providerItems}
            providersTitle={viewModel.readiness.providersTitle}
            skillItems={viewModel.readiness.skillItems}
            skillsTitle={viewModel.readiness.skillsTitle}
            title={viewModel.sections.readiness.title}
          />
        </div>
      </section>
    </div>
  );
}
