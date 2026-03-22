import { redirect } from "next/navigation";
import { ZodError } from "zod";

import {
  WorkflowEntityConflictError,
  WorkflowCommandExecutionError,
  WorkflowEntityNotFoundError
} from "@openpolis/application";
import { logStructuredEvent } from "@openpolis/application/logging";
import { WorkflowTransitionError } from "@openpolis/domain";
import { GovernancePolicyError } from "@openpolis/governance";

import {
  OperatorAccountConflictError,
  OperatorSessionError
} from "../auth/errors";
import { CsrfValidationError } from "./trusted-action-origin";

export const actionErrorCodes = [
  "validation",
  "csrf",
  "auth",
  "forbidden",
  "not_found",
  "conflict",
  "system"
] as const;

export const actionStatusValues = ["created", "error"] as const;
export const actionStatusKeys = ["result", "response", "session"] as const;

export type ActionErrorCode = (typeof actionErrorCodes)[number];
export type ActionStatusValue = (typeof actionStatusValues)[number];
export type ActionStatusKey = (typeof actionStatusKeys)[number];
export type ActionErrorCopyField = "title" | "description";

function isActionErrorCode(value: string): value is ActionErrorCode {
  return actionErrorCodes.includes(value as ActionErrorCode);
}

function isActionStatusValue(value: string): value is ActionStatusValue {
  return actionStatusValues.includes(value as ActionStatusValue);
}

export function normalizeActionStatus(
  value: string | null | undefined
): ActionStatusValue | undefined {
  return value && isActionStatusValue(value) ? value : undefined;
}

export function normalizeActionErrorCode(
  value: string | null | undefined
): ActionErrorCode | undefined {
  return value && isActionErrorCode(value) ? value : undefined;
}

export function getActionErrorQueryKey(statusKey: ActionStatusKey) {
  switch (statusKey) {
    case "result":
      return "error";
    case "response":
      return "responseError";
    case "session":
      return "sessionError";
  }
}

export function getActionErrorTranslationKey(
  errorCode: ActionErrorCode,
  field: ActionErrorCopyField
) {
  return `actionErrors.${errorCode}.${field}`;
}

export function classifyActionError(error: unknown): ActionErrorCode {
  if (error instanceof ZodError) {
    return "validation";
  }

  if (error instanceof CsrfValidationError) {
    return "csrf";
  }

  if (error instanceof OperatorSessionError) {
    return "auth";
  }

  if (error instanceof OperatorAccountConflictError) {
    return "conflict";
  }

  if (error instanceof GovernancePolicyError) {
    return "forbidden";
  }

  if (error instanceof WorkflowEntityNotFoundError) {
    return "not_found";
  }

  if (error instanceof WorkflowTransitionError) {
    return "conflict";
  }

  if (error instanceof WorkflowEntityConflictError) {
    return "conflict";
  }

  if (error instanceof WorkflowCommandExecutionError) {
    return "system";
  }

  return "system";
}

export function logActionFailure(
  actionName: string,
  phase: "validation" | "execution",
  error: unknown,
  errorCode = classifyActionError(error)
) {
  const payload =
    error instanceof ZodError
      ? {
          errorCode,
          fieldErrors: error.flatten().fieldErrors,
          formErrors: error.flatten().formErrors
        }
      : {
          errorCode,
          error
        };

  logStructuredEvent(
    phase === "validation" || errorCode !== "system" ? "warn" : "error",
    "server-action.failed",
    {
      actionName,
      phase,
      ...payload
    }
  );
}

export function redirectWithActionStatus(options: {
  locale: string;
  path: string;
  status: string;
  statusKey?: ActionStatusKey;
  errorCode?: ActionErrorCode;
  extraQuery?: Record<string, string | undefined>;
}): never {
  const statusKey = options.statusKey ?? "result";
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(options.extraQuery ?? {})) {
    if (value) {
      query.set(key, value);
    }
  }

  query.set(statusKey, options.status);

  if (options.status === "error" && options.errorCode) {
    query.set(getActionErrorQueryKey(statusKey), options.errorCode);
  }

  redirect(`/${options.locale}/${options.path}?${query.toString()}`);
}
