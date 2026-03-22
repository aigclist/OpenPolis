import { z } from "zod";

import {
  classifyActionError,
  logActionFailure,
  redirectWithActionStatus,
  type ActionStatusKey
} from "../../security/action-errors";
import { assertTrustedServerActionRequest } from "../../security/server-actions";
import { createServerCommandContext } from "../../workspace/command-context";
import { workspaceCommandService } from "@openpolis/runtime/workspace";

export {
  assertTrustedServerActionRequest,
  createServerCommandContext,
  workspaceCommandService
};

function normalizeCode(value: string) {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 48);

  return slug.length > 0 ? slug : "captured";
}

export function createCode(prefix: string, seed: string) {
  return `${prefix}_${normalizeCode(seed)}_${Date.now().toString(36)}`;
}

export function afterHours(hours: number) {
  return new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
}

export function finishAction(
  locale: string,
  path: string,
  result: "created" | "error",
  key: ActionStatusKey = "result",
  errorCode?: ReturnType<typeof classifyActionError>
): never {
  return redirectWithActionStatus({
    locale,
    path,
    status: result,
    statusKey: key,
    errorCode
  });
}

export function getValue(formData: FormData, key: string) {
  return formData.get(key);
}

export function optionalObjectId(prefix: string, code?: string) {
  if (!code || code === "none") {
    return undefined;
  }

  return `${prefix}_${code}`;
}

export function failValidation(
  locale: string,
  path: string,
  actionName: string,
  error: z.ZodError,
  key: ActionStatusKey = "result"
): never {
  logActionFailure(actionName, "validation", error, "validation");
  return finishAction(locale, path, "error", key, "validation");
}

export function failExecution(
  locale: string,
  path: string,
  actionName: string,
  error: unknown,
  key: ActionStatusKey = "result"
): never {
  const errorCode = classifyActionError(error);
  logActionFailure(actionName, "execution", error, errorCode);
  return finishAction(locale, path, "error", key, errorCode);
}
