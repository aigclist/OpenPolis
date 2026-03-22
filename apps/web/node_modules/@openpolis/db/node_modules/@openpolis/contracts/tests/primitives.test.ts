import assert from "node:assert/strict";
import test from "node:test";

import { TimestampSchema } from "@openpolis/contracts";

test("TimestampSchema accepts ISO 8601 timestamps with timezone information", () => {
  const parsed = TimestampSchema.parse("2026-03-19T09:00:00.000Z");
  assert.equal(parsed, "2026-03-19T09:00:00.000Z");
});

test("TimestampSchema rejects non-ISO timestamps", () => {
  assert.throws(() => TimestampSchema.parse("March 19, 2026 09:00:00"));
  assert.throws(() => TimestampSchema.parse("2026-03-19"));
});
