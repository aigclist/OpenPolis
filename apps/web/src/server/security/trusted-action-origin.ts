import { getBetterAuthUrl } from "../auth/config";

const localhostActionHosts = ["localhost:3000", "127.0.0.1:3000"];

type ActionOriginEnvironment = Partial<
  Record<
    | "BETTER_AUTH_SECRET"
    | "BETTER_AUTH_URL"
    | "NEXT_PUBLIC_APP_URL"
    | "NODE_ENV"
    | "OPENPOLIS_ALLOWED_ORIGIN_HOSTS"
    | "OPENPOLIS_APP_URL",
    string | undefined
  >
>;

export class CsrfValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CsrfValidationError";
  }
}

function normalizeOrigin(value: string | undefined | null) {
  if (!value) {
    return undefined;
  }

  try {
    return new URL(value).origin.toLowerCase();
  } catch {
    return undefined;
  }
}

function normalizeHostValue(value: string | undefined | null) {
  const candidate = value?.split(",")[0]?.trim().toLowerCase();
  return candidate ? candidate : undefined;
}

function normalizeConfiguredHost(value: string | undefined | null) {
  if (!value) {
    return undefined;
  }

  if (value.includes("://")) {
    try {
      return new URL(value).host.toLowerCase();
    } catch {
      return undefined;
    }
  }

  const normalized = value.trim().toLowerCase().replace(/\/+$/, "");
  return normalized.length > 0 ? normalized : undefined;
}

function matchesAllowedOriginHost(originHost: string, pattern: string) {
  if (originHost === pattern) {
    return true;
  }

  if (!pattern.startsWith("*.")) {
    return false;
  }

  const suffix = pattern.slice(1);
  return originHost.endsWith(suffix) && originHost.length > suffix.length;
}

export function resolveAllowedActionOriginHosts(
  env: ActionOriginEnvironment = process.env as ActionOriginEnvironment
) {
  const hosts = new Set<string>();
  const candidates = [
    env.OPENPOLIS_ALLOWED_ORIGIN_HOSTS,
    env.OPENPOLIS_APP_URL,
    env.NEXT_PUBLIC_APP_URL,
    getBetterAuthUrl(env)
  ];

  for (const candidate of candidates) {
    if (!candidate) {
      continue;
    }

    const values = candidate.split(",");

    for (const value of values) {
      const normalized = normalizeConfiguredHost(value);

      if (normalized) {
        hosts.add(normalized);
      }
    }
  }

  if (env.NODE_ENV !== "production") {
    for (const host of localhostActionHosts) {
      hosts.add(host);
    }
  }

  return [...hosts];
}

export function assertTrustedActionRequest(headersStore: Headers) {
  const secFetchSite = headersStore.get("sec-fetch-site")?.toLowerCase();

  if (secFetchSite === "cross-site") {
    throw new CsrfValidationError("Cross-site server action request blocked.");
  }

  const originHeader =
    headersStore.get("origin") ?? headersStore.get("referer") ?? undefined;
  const origin = normalizeOrigin(originHeader);

  if (!origin) {
    throw new CsrfValidationError(
      "Missing or invalid origin header for server action request."
    );
  }

  const originHost = normalizeHostValue(new URL(origin).host);

  if (!originHost) {
    throw new CsrfValidationError(
      "Missing origin host for server action request."
    );
  }

  const requestHost =
    normalizeHostValue(headersStore.get("x-forwarded-host")) ??
    normalizeHostValue(headersStore.get("host"));
  const allowedHosts = new Set(resolveAllowedActionOriginHosts());

  if (requestHost) {
    allowedHosts.add(requestHost);
  }

  const isAllowed = [...allowedHosts].some((hostPattern) =>
    matchesAllowedOriginHost(originHost, hostPattern)
  );

  if (!isAllowed) {
    throw new CsrfValidationError(
      `Untrusted origin host for server action request: ${originHost}.`
    );
  }
}
