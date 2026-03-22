import "server-only";

import { headers } from "next/headers";
import { betterAuth } from "better-auth";
import { isAPIError } from "better-auth/api";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { getMigrations } from "better-auth/db/migration";
import { nextCookies } from "better-auth/next-js";

import { getDrizzleDb } from "@openpolis/db/client";

import {
  resolveOperatorActorFromSessionUser,
  resolveOperatorProfileFromSessionUser as resolveProfileFromClaims
} from "./profiles";
import {
  getBetterAuthSecret,
  getBetterAuthUrl,
  isOperatorSessionConfigured
} from "./config";
import { OperatorSessionError } from "./errors";

const fallbackBetterAuthSecret =
  "openpolis-development-better-auth-secret-2026";
const fallbackBetterAuthUrl = "http://localhost:3000";

function resolveBetterAuthRuntimeConfig() {
  const secret = getBetterAuthSecret();
  const baseURL = getBetterAuthUrl();
  const isProduction = process.env.NODE_ENV === "production";

  if (isProduction && !secret) {
    throw new Error("BETTER_AUTH_SECRET is required in production");
  }

  if (isProduction && !baseURL) {
    throw new Error("BETTER_AUTH_URL is required in production");
  }

  return {
    secret: secret ?? fallbackBetterAuthSecret,
    baseURL: baseURL ?? fallbackBetterAuthUrl
  };
}

function createAuthInstance() {
  const config = resolveBetterAuthRuntimeConfig();

  return betterAuth({
    secret: config.secret,
    baseURL: config.baseURL,
    trustedOrigins: [config.baseURL],
    database: drizzleAdapter(getDrizzleDb(), {
      provider: "sqlite"
    }),
    user: {
      additionalFields: {
        operatorProfileId: {
          type: "string",
          required: false,
          input: false
        },
        operatorActorId: {
          type: "string",
          required: false,
          input: false
        },
        operatorRole: {
          type: "string",
          required: false,
          input: false
        },
        operatorTeamId: {
          type: "string",
          required: false,
          input: false
        },
        operatorRegionId: {
          type: "string",
          required: false,
          input: false
        }
      }
    },
    emailAndPassword: {
      enabled: true,
      disableSignUp: true,
      minPasswordLength: 8,
      maxPasswordLength: 200
    },
    rateLimit: {
      enabled: true
    },
    plugins: [nextCookies()]
  });
}

type AuthInstance = ReturnType<typeof createAuthInstance>;

let authInstance: AuthInstance | undefined;
let betterAuthReadyPromise: Promise<void> | null = null;

export function getAuth(): AuthInstance {
  if (authInstance) {
    return authInstance;
  }

  const instance = createAuthInstance();
  authInstance = instance;
  return instance;
}

export async function ensureBetterAuthReady() {
  if (!betterAuthReadyPromise) {
    betterAuthReadyPromise = (async () => {
      const auth = getAuth();
      const { runMigrations } = await getMigrations(auth.options);
      await runMigrations();
    })().catch((error) => {
      betterAuthReadyPromise = null;
      throw error;
    });
  }

  return betterAuthReadyPromise;
}

export async function getBetterAuthContext() {
  await ensureBetterAuthReady();
  const auth = getAuth();
  return auth.$context;
}

export async function readBetterAuthSession() {
  await ensureBetterAuthReady();
  const auth = getAuth();
  return auth.api.getSession({
    headers: await headers()
  });
}

export async function signInBetterAuthOperator(email: string, password: string) {
  await ensureBetterAuthReady();
  const auth = getAuth();

  try {
    return await auth.api.signInEmail({
      body: {
        email: email.trim().toLowerCase(),
        password,
        rememberMe: false
      },
      headers: await headers()
    });
  } catch (error) {
    if (isAPIError(error)) {
      throw new OperatorSessionError("Invalid operator email or password.");
    }

    throw error;
  }
}

export async function signOutBetterAuthOperator() {
  await ensureBetterAuthReady();
  const auth = getAuth();

  return auth.api.signOut({
    headers: await headers()
  });
}

export function resolveOperatorProfileFromSessionUser(
  user:
    | {
        email?: string | null | undefined;
      }
    | null
    | undefined
) {
  return resolveProfileFromClaims(user ? { ...user } : null);
}

export function resolveSessionActorFromSessionUser(
  user:
    | {
        email?: string | null | undefined;
      }
    | null
    | undefined
) {
  return resolveOperatorActorFromSessionUser(user ? { ...user } : null);
}

export { isOperatorSessionConfigured };
