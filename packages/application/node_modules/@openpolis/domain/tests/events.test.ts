import assert from "node:assert/strict";
import test from "node:test";

import { DomainEventSchema } from "@openpolis/domain";

test("DomainEventSchema accepts constrained primitive metadata values", () => {
  const parsed = DomainEventSchema.parse({
    name: "issue.created",
    occurredAt: "2026-03-19T09:00:00.000Z",
    actor: {
      actorType: "human",
      actorId: "operator_test"
    },
    subject: {
      objectType: "issue",
      objectId: "issue_test",
      objectCode: "issue_test"
    },
    metadata: {
      priority: "high",
      attempts: 2,
      humanReviewed: true,
      note: null
    }
  });

  assert.equal(parsed.metadata.priority, "high");
  assert.equal(parsed.metadata.attempts, 2);
  assert.equal(parsed.metadata.humanReviewed, true);
  assert.equal(parsed.metadata.note, null);
});

test("DomainEventSchema rejects nested metadata payloads", () => {
  assert.throws(() =>
    DomainEventSchema.parse({
      name: "issue.created",
      occurredAt: "2026-03-19T09:00:00.000Z",
      actor: {
        actorType: "human",
        actorId: "operator_test"
      },
      subject: {
        objectType: "issue",
        objectId: "issue_test",
        objectCode: "issue_test"
      },
      metadata: {
        invalid: {
          nested: true
        }
      }
    })
  );
});
