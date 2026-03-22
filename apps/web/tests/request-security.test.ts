import assert from "node:assert/strict";
import test from "node:test";

import {
  assertTrustedActionRequest,
  CsrfValidationError
} from "../src/server/security/trusted-action-origin";

type EnvOverrides = Record<string, string | undefined>;

function withEnvironment(overrides: EnvOverrides, callback: () => void) {
  const previousValues = Object.fromEntries(
    Object.keys(overrides).map((key) => [key, process.env[key]])
  );

  try {
    for (const [key, value] of Object.entries(overrides)) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }

    callback();
  } finally {
    for (const [key, value] of Object.entries(previousValues)) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  }
}

test("assertTrustedActionRequest allows same-host requests", () => {
  withEnvironment(
    {
      NODE_ENV: "test",
      OPENPOLIS_ALLOWED_ORIGIN_HOSTS: undefined,
      OPENPOLIS_APP_URL: undefined,
      NEXT_PUBLIC_APP_URL: undefined,
      BETTER_AUTH_URL: undefined
    },
    () => {
      assert.doesNotThrow(() =>
        assertTrustedActionRequest(
          new Headers({
            origin: "https://workspace.example.com",
            host: "workspace.example.com"
          })
        )
      );
    }
  );
});

test("assertTrustedActionRequest allows configured wildcard origin hosts", () => {
  withEnvironment(
    {
      NODE_ENV: "production",
      OPENPOLIS_ALLOWED_ORIGIN_HOSTS: "*.example.com",
      OPENPOLIS_APP_URL: undefined,
      NEXT_PUBLIC_APP_URL: undefined,
      BETTER_AUTH_URL: undefined
    },
    () => {
      assert.doesNotThrow(() =>
        assertTrustedActionRequest(
          new Headers({
            origin: "https://regional.example.com",
            host: "workspace.internal"
          })
        )
      );
    }
  );
});

test("assertTrustedActionRequest rejects explicit cross-site fetches", () => {
  withEnvironment(
    {
      NODE_ENV: "test"
    },
    () => {
      assert.throws(
        () =>
          assertTrustedActionRequest(
            new Headers({
              origin: "https://workspace.example.com",
              host: "workspace.example.com",
              "sec-fetch-site": "cross-site"
            })
          ),
        (error: unknown) => {
          assert.ok(error instanceof CsrfValidationError);
          return true;
        }
      );
    }
  );
});

test("assertTrustedActionRequest rejects requests without origin or referer", () => {
  withEnvironment(
    {
      NODE_ENV: "test"
    },
    () => {
      assert.throws(
        () =>
          assertTrustedActionRequest(
            new Headers({
              host: "workspace.example.com"
            })
          ),
        (error: unknown) => {
          assert.ok(error instanceof CsrfValidationError);
          return true;
        }
      );
    }
  );
});

test("assertTrustedActionRequest rejects untrusted origin hosts", () => {
  withEnvironment(
    {
      NODE_ENV: "production",
      OPENPOLIS_ALLOWED_ORIGIN_HOSTS: "workspace.example.com",
      OPENPOLIS_APP_URL: undefined,
      NEXT_PUBLIC_APP_URL: undefined,
      BETTER_AUTH_URL: undefined
    },
    () => {
      assert.throws(
        () =>
          assertTrustedActionRequest(
            new Headers({
              origin: "https://attacker.example.net",
              host: "workspace.example.com"
            })
          ),
        (error: unknown) => {
          assert.ok(error instanceof CsrfValidationError);
          return true;
        }
      );
    }
  );
});
