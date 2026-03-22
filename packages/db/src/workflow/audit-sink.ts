import type { AuditSink } from "@openpolis/application";

import { getDrizzleDb } from "../client";
import { auditLog } from "../schema";

export function createAuditSink(): AuditSink {
  return {
    async append(record) {
      getDrizzleDb()
        .insert(auditLog)
        .values({
          action: record.action,
          occurredAt: record.occurredAt,
          actorType: record.actor.actorType,
          actorId: record.actor.actorId,
          subjectType: record.subject.objectType,
          subjectId: record.subject.objectId,
          subjectCode: record.subject.objectCode ?? null,
          metadata: JSON.stringify(record.metadata)
        })
        .run();
    }
  };
}
