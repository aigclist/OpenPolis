import assert from "node:assert/strict";
import test from "node:test";

import {
  OptionalEntityCodeInputSchema,
  RequiredEntityCodeInputSchema,
  parsePaginationParams,
  parseOptionalEntityCode
} from "../src/server/security/input-validation";

test("RequiredEntityCodeInputSchema trims and lowercases valid codes", () => {
  assert.equal(
    RequiredEntityCodeInputSchema.parse(" ISSUE_ONE "),
    "issue_one"
  );
});

test("RequiredEntityCodeInputSchema rejects invalid code characters", () => {
  const result = RequiredEntityCodeInputSchema.safeParse(" BAD-CODE ");

  assert.equal(result.success, false);
});

test("OptionalEntityCodeInputSchema returns undefined for blank input", () => {
  assert.equal(OptionalEntityCodeInputSchema.parse("   "), undefined);
});

test("parseOptionalEntityCode returns undefined for invalid codes", () => {
  assert.equal(parseOptionalEntityCode(" BAD-CODE "), undefined);
});

test("parseOptionalEntityCode normalizes valid codes", () => {
  assert.equal(parseOptionalEntityCode(" ISSUE_ONE "), "issue_one");
});

test("parsePaginationParams sanitizes page and pageSize query values", () => {
  assert.deepEqual(parsePaginationParams(" 2 ", "500"), {
    page: 2,
    pageSize: 200
  });
  assert.deepEqual(parsePaginationParams("abc", "10"), {
    page: 1,
    pageSize: 10
  });
  assert.equal(parsePaginationParams(undefined, undefined), undefined);
});
