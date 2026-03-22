import assert from "node:assert/strict";
import test from "node:test";

import {
  createOperatorSettingsHref,
  getOperatorSessionRedirectPath,
  hasBetterAuthSessionCookie,
  isProtectedWorkspacePath,
  sanitizeOperatorReturnTo
} from "../src/lib/operator-route-guard";

const configuredAuthEnv = {
  BETTER_AUTH_SECRET: "secret",
  BETTER_AUTH_URL: "http://localhost:3000"
};

test("hasBetterAuthSessionCookie detects base and chunked Better Auth cookies", () => {
  assert.equal(hasBetterAuthSessionCookie([]), false);
  assert.equal(
    hasBetterAuthSessionCookie(["better-auth.session_token"]),
    true
  );
  assert.equal(
    hasBetterAuthSessionCookie(["better-auth.session_token.0"]),
    true
  );
  assert.equal(
    hasBetterAuthSessionCookie(["better-auth.session_data"]),
    false
  );
});

test("isProtectedWorkspacePath matches guarded app routes and excludes public routes", () => {
  assert.equal(isProtectedWorkspacePath("/en"), true);
  assert.equal(isProtectedWorkspacePath("/en/issues"), true);
  assert.equal(isProtectedWorkspacePath("/zh-CN/review/approval_test"), true);
  assert.equal(isProtectedWorkspacePath("/en/settings"), false);
  assert.equal(isProtectedWorkspacePath("/en/docs"), false);
  assert.equal(isProtectedWorkspacePath("/en/unknown"), false);
});

test("sanitizeOperatorReturnTo keeps localized relative paths and rejects external URLs", () => {
  assert.equal(
    sanitizeOperatorReturnTo("/en/issues?record=issue_test"),
    "/en/issues?record=issue_test"
  );
  assert.equal(
    sanitizeOperatorReturnTo("https://example.com/en/issues"),
    undefined
  );
  assert.equal(sanitizeOperatorReturnTo("//example.com/en/issues"), undefined);
  assert.equal(sanitizeOperatorReturnTo("/api/auth/session"), undefined);
});

test("createOperatorSettingsHref appends session state and return target", () => {
  assert.equal(
    createOperatorSettingsHref("en", {
      session: "error",
      sessionError: "auth",
      returnTo: "/en/issues"
    }),
    "/en/settings?session=error&sessionError=auth&returnTo=%2Fen%2Fissues"
  );
});

test("getOperatorSessionRedirectPath sends unauthenticated workspace requests to settings", () => {
  assert.equal(
    getOperatorSessionRedirectPath({
      pathname: "/en/issues",
      search: "?record=issue_test",
      cookieNames: [],
      env: configuredAuthEnv
    }),
    "/en/settings?session=error&sessionError=auth&returnTo=%2Fen%2Fissues%3Frecord%3Dissue_test"
  );
});

test("getOperatorSessionRedirectPath skips redirect for public routes or active session cookies", () => {
  assert.equal(
    getOperatorSessionRedirectPath({
      pathname: "/en/settings",
      cookieNames: [],
      env: configuredAuthEnv
    }),
    null
  );
  assert.equal(
    getOperatorSessionRedirectPath({
      pathname: "/en/issues",
      cookieNames: ["better-auth.session_token"],
      env: configuredAuthEnv
    }),
    null
  );
  assert.equal(
    getOperatorSessionRedirectPath({
      pathname: "/en/issues",
      cookieNames: [],
      env: {}
    }),
    null
  );
});
