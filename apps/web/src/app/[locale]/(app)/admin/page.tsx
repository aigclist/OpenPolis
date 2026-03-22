import { getTranslations } from "next-intl/server";
import { logStructuredEvent } from "@openpolis/application/logging";

import { SessionSubmitButton } from "@/components/settings/session-submit-button";
import { PageHero } from "@/components/shared/page-hero";
import { SummaryCard } from "@/components/shared/summary-card";
import {
  Alert,
  AlertDescription,
  AlertTitle
} from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  getActionErrorTranslationKey,
  normalizeActionErrorCode,
  normalizeActionStatus
} from "@/server/security/action-errors";
import {
  canManageOperatorAccounts,
  listOperatorAccounts,
  type OperatorAccount
} from "@/server/auth/accounts";
import { getOperatorSessionSummary } from "@/server/auth/session";
import { createOperatorAccountAction } from "@/server/auth/session-actions";
import { getAdminViewModel } from "@/server/view-models";

type AdminPageProps = {
  params: Promise<{
    locale: string;
  }>;
  searchParams: Promise<{
    result?: string;
    error?: string;
  }>;
};

function formatTimestamp(locale: string, value: string | undefined) {
  if (!value) {
    return undefined;
  }

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

export default async function AdminPage({ params, searchParams }: AdminPageProps) {
  const { locale } = await params;
  const { result, error } = await searchParams;
  const [viewModel, sessionSummary, tAdmin, tSession, tCommon] = await Promise.all([
    getAdminViewModel(locale),
    getOperatorSessionSummary(),
    getTranslations({ locale, namespace: "admin" }),
    getTranslations({ locale, namespace: "operatorSession" }),
    getTranslations({ locale, namespace: "common" })
  ]);
  const actionStatus = normalizeActionStatus(result);
  const actionErrorCode =
    actionStatus === "error" ? normalizeActionErrorCode(error) : undefined;
  const currentSession = sessionSummary.session;
  const canManage = currentSession
    ? canManageOperatorAccounts(currentSession.actor)
    : false;
  let operatorAccounts: OperatorAccount[] = [];
  let accountsLoadError = false;

  if (sessionSummary.configured) {
    try {
      operatorAccounts = await listOperatorAccounts();
    } catch (loadError) {
      accountsLoadError = true;
      logStructuredEvent("error", "admin.operator-accounts-load.failed", {
        error: loadError
      });
    }
  }

  const createAccountFormAction = createOperatorAccountAction.bind(null, locale);

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
      {actionStatus ? (
        <Alert
          className="border-border/70 bg-card/90 shadow-sm"
          variant={actionStatus === "error" ? "destructive" : "default"}
        >
          <AlertTitle>
            {actionStatus === "error" && actionErrorCode
              ? tCommon(getActionErrorTranslationKey(actionErrorCode, "title"))
              : tAdmin("alerts.created.title")}
          </AlertTitle>
          <AlertDescription>
            {actionStatus === "error" && actionErrorCode
              ? tCommon(getActionErrorTranslationKey(actionErrorCode, "description"))
              : tAdmin("alerts.created.description")}
          </AlertDescription>
        </Alert>
      ) : null}
      {!sessionSummary.configured ? (
        <Alert>
          <AlertTitle>{tAdmin("notConfigured.title")}</AlertTitle>
          <AlertDescription>{tAdmin("notConfigured.description")}</AlertDescription>
        </Alert>
      ) : (
        <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
          <Card className="border-border/70 bg-card/90 shadow-sm">
            <CardHeader>
              <CardTitle>{tAdmin("create.title")}</CardTitle>
              <CardDescription>{tAdmin("create.description")}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {!canManage ? (
                <Alert variant="destructive">
                  <AlertTitle>{tAdmin("access.denied.title")}</AlertTitle>
                  <AlertDescription>
                    {tAdmin("access.denied.description")}
                  </AlertDescription>
                </Alert>
              ) : (
                <form action={createAccountFormAction} className="grid gap-4">
                  <div className="grid gap-2">
                    <label className="text-sm font-medium" htmlFor="admin-operator-name">
                      {tAdmin("create.fields.name.label")}
                    </label>
                    <Input
                      aria-label={tAdmin("create.fields.name.label")}
                      id="admin-operator-name"
                      name="name"
                      placeholder={tAdmin("create.fields.name.placeholder")}
                      required
                      type="text"
                    />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium" htmlFor="admin-operator-email">
                      {tAdmin("create.fields.email.label")}
                    </label>
                    <Input
                      aria-label={tAdmin("create.fields.email.label")}
                      autoComplete="email"
                      id="admin-operator-email"
                      name="email"
                      placeholder={tAdmin("create.fields.email.placeholder")}
                      required
                      type="email"
                    />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium" htmlFor="admin-operator-password">
                      {tAdmin("create.fields.password.label")}
                    </label>
                    <Input
                      aria-label={tAdmin("create.fields.password.label")}
                      autoComplete="new-password"
                      id="admin-operator-password"
                      name="password"
                      placeholder={tAdmin("create.fields.password.placeholder")}
                      required
                      type="password"
                    />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium" htmlFor="admin-operator-confirm-password">
                      {tAdmin("create.fields.confirmPassword.label")}
                    </label>
                    <Input
                      aria-label={tAdmin("create.fields.confirmPassword.label")}
                      autoComplete="new-password"
                      id="admin-operator-confirm-password"
                      name="confirmPassword"
                      placeholder={tAdmin("create.fields.confirmPassword.placeholder")}
                      required
                      type="password"
                    />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium" htmlFor="admin-operator-profile">
                      {tAdmin("create.fields.profile.label")}
                    </label>
                    <Select defaultValue="reviewer" name="profileId">
                      <SelectTrigger
                        aria-label={tAdmin("create.fields.profile.label")}
                        className="w-full"
                        id="admin-operator-profile"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {sessionSummary.profiles.map((profile) => (
                          <SelectItem key={profile.id} value={profile.id}>
                            {tSession(`profiles.${profile.id}`)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end">
                    <SessionSubmitButton label={tAdmin("create.submit")} />
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
          <Card className="border-border/70 bg-card/90 shadow-sm">
            <CardHeader>
              <CardTitle>{tAdmin("accounts.title")}</CardTitle>
              <CardDescription>{tAdmin("accounts.description")}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {accountsLoadError ? (
                <Alert variant="destructive">
                  <AlertTitle>{tAdmin("accounts.loadError.title")}</AlertTitle>
                  <AlertDescription>
                    {tAdmin("accounts.loadError.description")}
                  </AlertDescription>
                </Alert>
              ) : operatorAccounts.length === 0 ? (
                <Alert>
                  <AlertTitle>{tAdmin("accounts.empty.title")}</AlertTitle>
                  <AlertDescription>{tAdmin("accounts.empty.description")}</AlertDescription>
                </Alert>
              ) : (
                operatorAccounts.map((account) => (
                  <div
                    key={account.id}
                    className="grid gap-3 rounded-lg border border-border/70 p-4"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="font-medium">{account.name ?? account.email}</div>
                      <Badge variant="secondary">
                        {tSession(`profiles.${account.profileId}`)}
                      </Badge>
                      <Badge variant="outline">
                        {humanizeIdentifier(account.role)}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {account.email}
                    </div>
                    <dl className="grid gap-2 text-sm sm:grid-cols-2">
                      <div className="grid gap-1">
                        <dt className="font-medium text-muted-foreground">
                          {tAdmin("accounts.fields.actorId")}
                        </dt>
                        <dd>{account.actorId}</dd>
                      </div>
                      <div className="grid gap-1">
                        <dt className="font-medium text-muted-foreground">
                          {tAdmin("accounts.fields.createdAt")}
                        </dt>
                        <dd>
                          {formatTimestamp(locale, account.createdAt) ??
                            tSession("status.emptyValue")}
                        </dd>
                      </div>
                      <div className="grid gap-1">
                        <dt className="font-medium text-muted-foreground">
                          {tAdmin("accounts.fields.team")}
                        </dt>
                        <dd>{account.teamId ?? tSession("status.emptyValue")}</dd>
                      </div>
                      <div className="grid gap-1">
                        <dt className="font-medium text-muted-foreground">
                          {tAdmin("accounts.fields.region")}
                        </dt>
                        <dd>{account.regionId ?? tSession("status.emptyValue")}</dd>
                      </div>
                    </dl>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </section>
      )}
    </>
  );
}
