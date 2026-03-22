import assert from "node:assert/strict";
import test from "node:test";

import {
  applySecurityHeaders,
  createContentSecurityPolicy,
  getSecurityHeaders
} from "../src/lib/security/headers";

test("createContentSecurityPolicy keeps production defaults strict", () => {
  const policy = createContentSecurityPolicy({ isDevelopment: false });

  assert.match(policy, /default-src 'self'/);
  assert.match(policy, /script-src 'self' 'unsafe-inline'/);
  assert.doesNotMatch(policy, /unsafe-eval/);
  assert.match(policy, /frame-ancestors 'none'/);
});

test("createContentSecurityPolicy allows development websocket and eval hooks", () => {
  const policy = createContentSecurityPolicy({ isDevelopment: true });

  assert.match(policy, /unsafe-eval/);
  assert.match(policy, /connect-src 'self' https: http: ws: wss:/);
});

test("applySecurityHeaders writes the expected baseline headers", () => {
  const headers = new Headers();

  applySecurityHeaders(headers, { isDevelopment: false });

  const pairs = Object.fromEntries(getSecurityHeaders({ isDevelopment: false }));

  for (const [name, value] of Object.entries(pairs)) {
    assert.equal(headers.get(name), value);
  }
});
