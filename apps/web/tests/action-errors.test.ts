import assert from "node:assert/strict";
import test from "node:test";

import {
  WorkflowCommandExecutionError,
  WorkflowEntityConflictError,
  WorkflowEntityNotFoundError
} from "@openpolis/application";
import { WorkflowTransitionError } from "@openpolis/domain";
import { GovernancePolicyError } from "@openpolis/governance";
import { z } from "zod";

import {
  classifyActionError,
  getActionErrorQueryKey,
  getActionErrorTranslationKey,
  normalizeActionErrorCode,
  normalizeActionStatus
} from "../src/server/security/action-errors";
import { OperatorSessionError } from "../src/server/auth/errors";
import { CsrfValidationError } from "../src/server/security/trusted-action-origin";

test("normalizeActionStatus only accepts workflow form result states", () => {
  assert.equal(normalizeActionStatus("created"), "created");
  assert.equal(normalizeActionStatus("error"), "error");
  assert.equal(normalizeActionStatus("signed_in"), undefined);
  assert.equal(normalizeActionStatus(null), undefined);
});

test("normalizeActionErrorCode only accepts registered action error codes", () => {
  assert.equal(normalizeActionErrorCode("auth"), "auth");
  assert.equal(normalizeActionErrorCode("csrf"), "csrf");
  assert.equal(normalizeActionErrorCode("conflict"), "conflict");
  assert.equal(normalizeActionErrorCode("unknown"), undefined);
  assert.equal(normalizeActionErrorCode(undefined), undefined);
});

test("action error helpers expose stable query and translation keys", () => {
  assert.equal(getActionErrorQueryKey("result"), "error");
  assert.equal(getActionErrorQueryKey("response"), "responseError");
  assert.equal(getActionErrorQueryKey("session"), "sessionError");

  assert.equal(
    getActionErrorTranslationKey("validation", "title"),
    "actionErrors.validation.title"
  );
  assert.equal(
    getActionErrorTranslationKey("system", "description"),
    "actionErrors.system.description"
  );
});

test("classifyActionError maps known failures to stable user-facing error codes", () => {
  let validationError: z.ZodError | null = null;

  try {
    z.object({
      title: z.string().min(1)
    }).parse({
      title: ""
    });
  } catch (error) {
    validationError = error as z.ZodError;
  }

  assert.ok(validationError);
  assert.equal(classifyActionError(validationError), "validation");
  assert.equal(
    classifyActionError(new CsrfValidationError("cross-site request blocked")),
    "csrf"
  );
  assert.equal(classifyActionError(new OperatorSessionError("auth_failed")), "auth");
  assert.equal(
    classifyActionError(new GovernancePolicyError("scope_denied")),
    "forbidden"
  );
  assert.equal(
    classifyActionError(new WorkflowEntityNotFoundError("issue", "issue_missing")),
    "not_found"
  );
  assert.equal(
    classifyActionError(new WorkflowTransitionError("approval", "published", "approved")),
    "conflict"
  );
  assert.equal(
    classifyActionError(
      new WorkflowEntityConflictError("issue", "issue_conflicting")
    ),
    "conflict"
  );
  assert.equal(
    classifyActionError(
      new WorkflowCommandExecutionError("createIssue", new Error("sqlite_failed"))
    ),
    "system"
  );
  assert.equal(classifyActionError(new Error("unexpected")), "system");
});
