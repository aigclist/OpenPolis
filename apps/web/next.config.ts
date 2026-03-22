import { createMDX } from "fumadocs-mdx/next";
import createNextIntlPlugin from "next-intl/plugin";
import type { NextConfig } from "next";

const withMDX = createMDX();
const withNextIntl = createNextIntlPlugin("../../packages/i18n/src/request.ts");

function normalizeAllowedOriginHost(value: string | undefined) {
  if (!value) {
    return undefined;
  }

  try {
    return new URL(value).host;
  } catch {
    return value.trim() || undefined;
  }
}

function resolveServerActionAllowedOrigins() {
  const hosts = new Set<string>();
  const candidates = [
    process.env.OPENPOLIS_ALLOWED_ORIGIN_HOSTS,
    process.env.OPENPOLIS_APP_URL,
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.BETTER_AUTH_URL
  ];

  for (const candidate of candidates) {
    if (!candidate) {
      continue;
    }

    for (const value of candidate.split(",")) {
      const normalized = normalizeAllowedOriginHost(value);

      if (normalized) {
        hosts.add(normalized);
      }
    }
  }

  if (process.env.NODE_ENV !== "production") {
    hosts.add("localhost:3000");
    hosts.add("127.0.0.1:3000");
  }

  return [...hosts];
}

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: resolveServerActionAllowedOrigins()
    }
  },
  reactCompiler: true,
  transpilePackages: [
    "@openpolis/application",
    "@openpolis/contracts",
    "@openpolis/db",
    "@openpolis/domain",
    "@openpolis/governance",
    "@openpolis/i18n",
    "@openpolis/runtime",
    "@openpolis/ui"
  ]
};

export default withNextIntl(withMDX(nextConfig));
