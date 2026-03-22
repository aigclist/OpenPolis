"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { sanitizeOperatorReturnTo } from "@/lib/operator-route-guard";
import {
  classifyActionError,
  logActionFailure,
  redirectWithActionStatus
} from "../security/action-errors";
import {
  assertCanManageOperatorAccounts,
  createInitialOperatorAccount,
  createOperatorAccount
} from "./accounts";
import { isOperatorSessionConfigured } from "./config";
import {
  clearOperatorSession,
  createOperatorSession,
  operatorProfileIds,
  readOperatorSession
} from "./session";
import { OperatorSessionError } from "./errors";
import { assertTrustedServerActionRequest } from "../security/server-actions";

const OperatorSessionSignInSchema = z.object({
  email: z.string().trim().email().max(320),
  password: z.string().trim().min(1).max(200),
  returnTo: z.string().trim().max(2048).optional()
});

const OperatorOnboardingSchema = z
  .object({
    name: z.string().trim().min(1).max(255),
    email: z.string().trim().email().max(320),
    password: z.string().min(8).max(200),
    confirmPassword: z.string().min(8).max(200),
    returnTo: z.string().trim().max(2048).optional()
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "Passwords must match.",
    path: ["confirmPassword"]
  });

const OperatorAccountCreateSchema = z
  .object({
    name: z.string().trim().min(1).max(255),
    email: z.string().trim().email().max(320),
    password: z.string().min(8).max(200),
    confirmPassword: z.string().min(8).max(200),
    profileId: z.enum(operatorProfileIds)
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "Passwords must match.",
    path: ["confirmPassword"]
  });

function readSanitizedReturnTo(formData: FormData) {
  const rawReturnToEntry = formData.get("returnTo");
  const rawReturnTo =
    typeof rawReturnToEntry === "string" ? rawReturnToEntry : undefined;

  return {
    rawReturnTo,
    returnTo: sanitizeOperatorReturnTo(rawReturnTo)
  };
}

function redirectWithSessionStatus(
  locale: string,
  status: "signed_in" | "initialized" | "signed_out" | "error",
  errorCode?: ReturnType<typeof classifyActionError>,
  returnTo?: string
): never {
  return redirectWithActionStatus({
    locale,
    path: "settings",
    statusKey: "session",
    status,
    errorCode,
    extraQuery: returnTo
      ? {
          returnTo
        }
      : undefined
  });
}

function redirectWithAdminStatus(
  locale: string,
  status: "created" | "error",
  errorCode?: ReturnType<typeof classifyActionError>
): never {
  return redirectWithActionStatus({
    locale,
    path: "admin",
    statusKey: "result",
    status,
    errorCode
  });
}

export async function initializeOperatorAccountAction(
  locale: string,
  formData: FormData
) {
  try {
    await assertTrustedServerActionRequest();
  } catch (error) {
    const errorCode = classifyActionError(error);
    logActionFailure("operatorSession.initialize", "execution", error, errorCode);
    redirectWithSessionStatus(locale, "error", errorCode);
  }

  const { rawReturnTo, returnTo } = readSanitizedReturnTo(formData);
  const parsed = OperatorOnboardingSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    returnTo: rawReturnTo
  });

  if (!parsed.success) {
    logActionFailure(
      "operatorSession.initialize",
      "validation",
      parsed.error,
      "validation"
    );
    redirectWithSessionStatus(locale, "error", "validation", returnTo);
  }

  try {
    if (!isOperatorSessionConfigured()) {
      throw new OperatorSessionError("Operator session is not configured.");
    }

    await createInitialOperatorAccount({
      name: parsed.data.name,
      email: parsed.data.email,
      password: parsed.data.password
    });
    await createOperatorSession(parsed.data.email, parsed.data.password);
  } catch (error) {
    const errorCode = classifyActionError(error);
    logActionFailure("operatorSession.initialize", "execution", error, errorCode);
    redirectWithSessionStatus(locale, "error", errorCode, returnTo);
  }

  if (returnTo) {
    redirect(returnTo);
  }

  redirectWithSessionStatus(locale, "initialized");
}

export async function signInOperatorSessionAction(
  locale: string,
  formData: FormData
) {
  try {
    await assertTrustedServerActionRequest();
  } catch (error) {
    const errorCode = classifyActionError(error);
    logActionFailure("operatorSession.signIn", "execution", error, errorCode);
    redirectWithSessionStatus(locale, "error", errorCode);
  }

  const { rawReturnTo, returnTo } = readSanitizedReturnTo(formData);
  const parsed = OperatorSessionSignInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    returnTo: rawReturnTo
  });

  if (!parsed.success) {
    logActionFailure(
      "operatorSession.signIn",
      "validation",
      parsed.error,
      "validation"
    );
    redirectWithSessionStatus(locale, "error", "validation", returnTo);
  }

  try {
    await createOperatorSession(parsed.data.email, parsed.data.password);
  } catch (error) {
    const errorCode = classifyActionError(error);
    logActionFailure("operatorSession.signIn", "execution", error, errorCode);
    redirectWithSessionStatus(locale, "error", errorCode, returnTo);
  }

  if (returnTo) {
    redirect(returnTo);
  }

  redirectWithSessionStatus(locale, "signed_in");
}

export async function createOperatorAccountAction(
  locale: string,
  formData: FormData
) {
  try {
    await assertTrustedServerActionRequest();
  } catch (error) {
    const errorCode = classifyActionError(error);
    logActionFailure("operatorAccounts.create", "execution", error, errorCode);
    redirectWithAdminStatus(locale, "error", errorCode);
  }

  const parsed = OperatorAccountCreateSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    profileId: formData.get("profileId")
  });

  if (!parsed.success) {
    logActionFailure(
      "operatorAccounts.create",
      "validation",
      parsed.error,
      "validation"
    );
    redirectWithAdminStatus(locale, "error", "validation");
  }

  try {
    if (!isOperatorSessionConfigured()) {
      throw new OperatorSessionError("Operator session is not configured.");
    }

    const session = await readOperatorSession();

    if (!session) {
      throw new OperatorSessionError(
        "Authenticated operator session required for operator management."
      );
    }

    assertCanManageOperatorAccounts(session.actor);
    await createOperatorAccount({
      name: parsed.data.name,
      email: parsed.data.email,
      password: parsed.data.password,
      profileId: parsed.data.profileId
    });
  } catch (error) {
    const errorCode = classifyActionError(error);
    logActionFailure("operatorAccounts.create", "execution", error, errorCode);
    redirectWithAdminStatus(locale, "error", errorCode);
  }

  redirectWithAdminStatus(locale, "created");
}

export async function signOutOperatorSessionAction(locale: string) {
  try {
    await assertTrustedServerActionRequest();
  } catch (error) {
    const errorCode = classifyActionError(error);
    logActionFailure("operatorSession.signOut", "execution", error, errorCode);
    redirectWithSessionStatus(locale, "error", errorCode);
  }

  try {
    await clearOperatorSession();
  } catch (error) {
    const errorCode = classifyActionError(error);
    logActionFailure("operatorSession.signOut", "execution", error, errorCode);
    redirectWithSessionStatus(locale, "error", errorCode);
  }

  redirectWithSessionStatus(locale, "signed_out");
}
