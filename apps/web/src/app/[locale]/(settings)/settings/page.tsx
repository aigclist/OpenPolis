import { getTranslations } from "next-intl/server";

import { SessionSubmitButton } from "@/components/settings/session-submit-button";
import { PageHero } from "@/components/shared/page-hero";
import { SummaryCard } from "@/components/shared/summary-card";
import { Badge } from "@/components/ui/badge";
import {
  Alert,
  AlertDescription,
  AlertTitle
} from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  getActionErrorTranslationKey,
  normalizeActionErrorCode
} from "@/server/security/action-errors";
import {
  getOperatorSessionSummary
} from "@/server/auth/session";
import {
  initializeOperatorAccountAction,
  signInOperatorSessionAction,
  signOutOperatorSessionAction
} from "@/server/auth/session-actions";
import { resolveServerActorContext } from "@/server/workspace/command-context";
import { getSettingsViewModel } from "@/server/view-models";

type SettingsPageProps = {
  params: Promise<{
    locale: string;
  }>;
  searchParams: Promise<{
    session?: string;
    sessionError?: string;
    returnTo?: string;
  }>;
};

function formatTimestamp(locale: string, value: string) {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

function humanizeIdentifier(value: string | undefined) {
  if (!value) {
    return undefined;
  }

  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (segment) => segment.toUpperCase());
}

export default async function SettingsPage({ params, searchParams }: SettingsPageProps) {
  const { locale } = await params;
  const { session: sessionStatus, sessionError, returnTo } = await searchParams;
  const [viewModel, tSession, tCommon, actorContext, sessionSummary] = await Promise.all([
    getSettingsViewModel(locale),
    getTranslations({ locale, namespace: "operatorSession" }),
    getTranslations({ locale, namespace: "common" }),
    resolveServerActorContext(),
    getOperatorSessionSummary()
  ]);
  const initializeAction = initializeOperatorAccountAction.bind(null, locale);
  const signInAction = signInOperatorSessionAction.bind(null, locale);
  const signOutAction = signOutOperatorSessionAction.bind(null, locale);
  const currentSession = sessionSummary.session;
  const sessionSourceLabel = tSession(`status.sources.${actorContext.source}`);
  const sessionErrorCode =
    sessionStatus === "error"
      ? normalizeActionErrorCode(sessionError)
      : undefined;
  const sessionAlertKey =
    sessionStatus === "signed_in" ||
    sessionStatus === "initialized" ||
    sessionStatus === "signed_out" ||
    sessionStatus === "error"
      ? sessionStatus
      : null;
  const isOnboardingMode = sessionSummary.configured && !sessionSummary.hasUsers;

  return (
    <>
      <PageHero
        description={viewModel.description}
        eyebrow={viewModel.eyebrow}
        title={viewModel.title}
      />
      <section className="grid gap-4 md:grid-cols-3">
        {viewModel.summaryCards.map((card) => (
          <SummaryCard
            key={card.label}
            label={card.label}
            value={card.value}
          />
        ))}
      </section>
      {sessionAlertKey ? (
        <Alert
          className="border-border/70 bg-card/90 shadow-sm"
          variant={sessionAlertKey === "error" ? "destructive" : "default"}
        >
          <AlertTitle>
            {sessionAlertKey === "error" && sessionErrorCode
              ? tCommon(getActionErrorTranslationKey(sessionErrorCode, "title"))
              : tSession(`alerts.${sessionAlertKey}.title`)}
          </AlertTitle>
          <AlertDescription>
            {sessionAlertKey === "error" && sessionErrorCode
              ? tCommon(
                  getActionErrorTranslationKey(sessionErrorCode, "description")
                )
              : tSession(`alerts.${sessionAlertKey}.description`)}
          </AlertDescription>
        </Alert>
      ) : null}
      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,1fr)]">
        <Card className="border-border/70 bg-card/90 shadow-sm">
          <CardHeader>
            <CardTitle>
              {isOnboardingMode
                ? tSession("onboarding.title")
                : tSession("signIn.title")}
            </CardTitle>
            <CardDescription>
              {isOnboardingMode
                ? tSession("onboarding.description")
                : tSession("signIn.description")}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {!sessionSummary.configured ? (
              <Alert>
                <AlertTitle>{tSession("signIn.notConfigured.title")}</AlertTitle>
                <AlertDescription>
                  {tSession("signIn.notConfigured.description")}
                </AlertDescription>
              </Alert>
            ) : isOnboardingMode ? (
              <>
                <Alert>
                  <AlertTitle>{tSession("onboarding.initialRole.title")}</AlertTitle>
                  <AlertDescription className="flex flex-col gap-2">
                    <span>{tSession("onboarding.initialRole.description")}</span>
                    <span>
                      <Badge variant="secondary">
                        {tSession("profiles.central_ops")}
                      </Badge>
                    </span>
                  </AlertDescription>
                </Alert>
                <form action={initializeAction} className="grid gap-4">
                  {returnTo ? (
                    <input name="returnTo" type="hidden" value={returnTo} />
                  ) : null}
                  <div className="grid gap-2">
                    <label className="text-sm font-medium" htmlFor="operator-name">
                      {tSession("onboarding.fields.name.label")}
                    </label>
                    <Input
                      aria-label={tSession("onboarding.fields.name.label")}
                      id="operator-name"
                      name="name"
                      placeholder={tSession("onboarding.fields.name.placeholder")}
                      required
                      type="text"
                    />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium" htmlFor="operator-email">
                      {tSession("onboarding.fields.email.label")}
                    </label>
                    <Input
                      aria-label={tSession("onboarding.fields.email.label")}
                      autoComplete="email"
                      id="operator-email"
                      name="email"
                      placeholder={tSession("onboarding.fields.email.placeholder")}
                      required
                      type="email"
                    />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium" htmlFor="operator-password">
                      {tSession("onboarding.fields.password.label")}
                    </label>
                    <Input
                      aria-label={tSession("onboarding.fields.password.label")}
                      autoComplete="new-password"
                      id="operator-password"
                      name="password"
                      placeholder={tSession("onboarding.fields.password.placeholder")}
                      required
                      type="password"
                    />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium" htmlFor="operator-confirm-password">
                      {tSession("onboarding.fields.confirmPassword.label")}
                    </label>
                    <Input
                      aria-label={tSession("onboarding.fields.confirmPassword.label")}
                      autoComplete="new-password"
                      id="operator-confirm-password"
                      name="confirmPassword"
                      placeholder={tSession("onboarding.fields.confirmPassword.placeholder")}
                      required
                      type="password"
                    />
                  </div>
                  <div className="flex justify-end">
                    <SessionSubmitButton label={tSession("onboarding.submit")} />
                  </div>
                </form>
              </>
            ) : (
              <form action={signInAction} className="grid gap-4">
                {returnTo ? (
                  <input name="returnTo" type="hidden" value={returnTo} />
                ) : null}
                <div className="grid gap-2">
                  <label className="text-sm font-medium" htmlFor="operator-sign-in-email">
                    {tSession("signIn.fields.email.label")}
                  </label>
                  <Input
                    aria-label={tSession("signIn.fields.email.label")}
                    autoComplete="email"
                    id="operator-sign-in-email"
                    name="email"
                    placeholder={tSession("signIn.fields.email.placeholder")}
                    required
                    type="email"
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium" htmlFor="operator-sign-in-password">
                    {tSession("signIn.fields.password.label")}
                  </label>
                  <Input
                    aria-label={tSession("signIn.fields.password.label")}
                    autoComplete="current-password"
                    id="operator-sign-in-password"
                    name="password"
                    placeholder={tSession("signIn.fields.password.placeholder")}
                    required
                    type="password"
                  />
                </div>
                <div className="flex justify-end">
                  <SessionSubmitButton label={tSession("signIn.submit")} />
                </div>
              </form>
            )}
          </CardContent>
        </Card>
        <Card className="border-border/70 bg-card/90 shadow-sm">
          <CardHeader>
            <CardTitle>{tSession("status.title")}</CardTitle>
            <CardDescription>{tSession("status.description")}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Alert>
              <AlertTitle>
                {currentSession
                  ? tSession("status.active.title")
                  : tSession("status.inactive.title")}
              </AlertTitle>
              <AlertDescription>
                {currentSession
                  ? tSession("status.active.description")
                  : !sessionSummary.configured
                    ? tSession("status.inactive.bootstrapDescription")
                    : isOnboardingMode
                      ? tSession("status.inactive.onboardingDescription")
                      : tSession("status.inactive.enforcedDescription")}
              </AlertDescription>
            </Alert>
            <dl className="grid gap-3 text-sm">
              <div className="grid gap-1">
                <dt className="font-medium text-muted-foreground">
                  {tSession("status.fields.source")}
                </dt>
                <dd>{sessionSourceLabel}</dd>
              </div>
              <div className="grid gap-1">
                <dt className="font-medium text-muted-foreground">
                  {tSession("status.fields.userName")}
                </dt>
                <dd>{currentSession?.userName ?? tSession("status.emptyValue")}</dd>
              </div>
              <div className="grid gap-1">
                <dt className="font-medium text-muted-foreground">
                  {tSession("status.fields.userEmail")}
                </dt>
                <dd>{currentSession?.userEmail ?? tSession("status.emptyValue")}</dd>
              </div>
              <div className="grid gap-1">
                <dt className="font-medium text-muted-foreground">
                  {tSession("status.fields.actorId")}
                </dt>
                <dd>{actorContext.actor.actorId}</dd>
              </div>
              <div className="grid gap-1">
                <dt className="font-medium text-muted-foreground">
                  {tSession("status.fields.role")}
                </dt>
                <dd>{humanizeIdentifier(actorContext.actor.role)}</dd>
              </div>
              <div className="grid gap-1">
                <dt className="font-medium text-muted-foreground">
                  {tSession("status.fields.team")}
                </dt>
                <dd>{actorContext.actor.teamId ?? tSession("status.emptyValue")}</dd>
              </div>
              <div className="grid gap-1">
                <dt className="font-medium text-muted-foreground">
                  {tSession("status.fields.region")}
                </dt>
                <dd>{actorContext.actor.regionId ?? tSession("status.emptyValue")}</dd>
              </div>
              <div className="grid gap-1">
                <dt className="font-medium text-muted-foreground">
                  {tSession("status.fields.profile")}
                </dt>
                <dd>
                  {currentSession
                    ? tSession(`profiles.${currentSession.profileId}`)
                    : tSession("status.emptyValue")}
                </dd>
              </div>
              <div className="grid gap-1">
                <dt className="font-medium text-muted-foreground">
                  {tSession("status.fields.expiresAt")}
                </dt>
                <dd>
                  {currentSession
                    ? formatTimestamp(locale, currentSession.expiresAt)
                    : tSession("status.emptyValue")}
                </dd>
              </div>
            </dl>
            {currentSession ? (
              <form action={signOutAction} className="flex justify-end">
                <SessionSubmitButton
                  label={tSession("status.signOut")}
                  variant="outline"
                />
              </form>
            ) : null}
          </CardContent>
        </Card>
      </section>
    </>
  );
}
