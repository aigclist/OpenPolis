type BetterAuthEnvironment = Partial<
  Record<"BETTER_AUTH_SECRET" | "BETTER_AUTH_URL", string | undefined>
>;

function normalizeEnvValue(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function resolveAuthEnvironment(env?: BetterAuthEnvironment) {
  return env ?? (process.env as BetterAuthEnvironment);
}

export function isOperatorSessionConfigured(env?: BetterAuthEnvironment) {
  const source = resolveAuthEnvironment(env);

  return Boolean(
    normalizeEnvValue(source.BETTER_AUTH_SECRET) &&
    normalizeEnvValue(source.BETTER_AUTH_URL)
  );
}

export function getBetterAuthSecret(env?: BetterAuthEnvironment) {
  const source = resolveAuthEnvironment(env);
  return normalizeEnvValue(source.BETTER_AUTH_SECRET);
}

export function getBetterAuthUrl(env?: BetterAuthEnvironment) {
  const source = resolveAuthEnvironment(env);
  return normalizeEnvValue(source.BETTER_AUTH_URL);
}

export type { BetterAuthEnvironment };
