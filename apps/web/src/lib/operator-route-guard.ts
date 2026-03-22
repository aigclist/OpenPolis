import { locales } from "@openpolis/i18n/config";
import { mainNavigation, utilityNavigation } from "@openpolis/ui/namespaces";

type BetterAuthRoutingEnvironment = Partial<
  Record<"BETTER_AUTH_SECRET" | "BETTER_AUTH_URL", string | undefined>
>;

const betterAuthSessionCookiePrefix = "better-auth.session_token";
const operatorReturnToOrigin = "http://openpolis.local";

const protectedWorkspaceHrefs = [
  ...mainNavigation.map((item) => item.href),
  ...utilityNavigation
    .filter((item) => item.id !== "settings" && item.id !== "docs")
    .map((item) => item.href)
] as const;

function normalizeEnvValue(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function resolveLocalizedPathname(pathname: string) {
  for (const locale of locales) {
    const localePrefix = `/${locale}`;

    if (pathname === localePrefix) {
      return {
        locale,
        localePrefix,
        suffix: ""
      };
    }

    if (pathname.startsWith(`${localePrefix}/`)) {
      return {
        locale,
        localePrefix,
        suffix: pathname.slice(localePrefix.length)
      };
    }
  }

  return null;
}

export function isOperatorSessionConfiguredForRouting(
  env?: BetterAuthRoutingEnvironment
) {
  const source = env ?? (process.env as BetterAuthRoutingEnvironment);

  return Boolean(
    normalizeEnvValue(source.BETTER_AUTH_SECRET) &&
    normalizeEnvValue(source.BETTER_AUTH_URL)
  );
}

export function hasBetterAuthSessionCookie(cookieNames: Iterable<string>) {
  for (const cookieName of cookieNames) {
    if (
      cookieName === betterAuthSessionCookiePrefix ||
      cookieName.startsWith(`${betterAuthSessionCookiePrefix}.`)
    ) {
      return true;
    }
  }

  return false;
}

export function isProtectedWorkspacePath(pathname: string) {
  const localized = resolveLocalizedPathname(pathname);

  if (!localized) {
    return false;
  }

  return protectedWorkspaceHrefs.some((href) => {
    if (href === "/") {
      return localized.suffix === "";
    }

    return (
      localized.suffix === href || localized.suffix.startsWith(`${href}/`)
    );
  });
}

export function sanitizeOperatorReturnTo(value: string | null | undefined) {
  const trimmed = value?.trim();

  if (!trimmed) {
    return undefined;
  }

  try {
    const candidate = new URL(trimmed, operatorReturnToOrigin);

    if (candidate.origin !== operatorReturnToOrigin) {
      return undefined;
    }

    if (!resolveLocalizedPathname(candidate.pathname)) {
      return undefined;
    }

    return `${candidate.pathname}${candidate.search}`;
  } catch {
    return undefined;
  }
}

export function createOperatorSettingsHref(
  locale: string,
  options?: {
    session?: string;
    sessionError?: string;
    returnTo?: string;
  }
) {
  const query = new URLSearchParams();

  if (options?.session) {
    query.set("session", options.session);
  }

  if (options?.sessionError) {
    query.set("sessionError", options.sessionError);
  }

  if (options?.returnTo) {
    query.set("returnTo", options.returnTo);
  }

  const queryString = query.toString();
  const pathname = `/${locale}/settings`;

  return queryString ? `${pathname}?${queryString}` : pathname;
}

export function getOperatorSessionRedirectPath(options: {
  pathname: string;
  search?: string;
  cookieNames: Iterable<string>;
  env?: BetterAuthRoutingEnvironment;
}) {
  if (!isOperatorSessionConfiguredForRouting(options.env)) {
    return null;
  }

  if (hasBetterAuthSessionCookie(options.cookieNames)) {
    return null;
  }

  const localized = resolveLocalizedPathname(options.pathname);

  if (!localized || !isProtectedWorkspacePath(options.pathname)) {
    return null;
  }

  return createOperatorSettingsHref(localized.locale, {
    session: "error",
    sessionError: "auth",
    returnTo: sanitizeOperatorReturnTo(
      `${options.pathname}${options.search ?? ""}`
    )
  });
}
