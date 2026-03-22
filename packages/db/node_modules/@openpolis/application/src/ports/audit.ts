import type { ActorRef, ObjectRef, Timestamp } from "@openpolis/contracts";
import type { DomainEventMetadata } from "@openpolis/domain";

export type AuditAction =
  | "command.accepted"
  | "command.rejected"
  | "workflow.transitioned"
  | "approval.requested"
  | "approval.responded"
  | "agent.run.created"
  | "agent.run.responded"
  | "agent.run.finalized";

export type AuditRecord = {
  action: AuditAction;
  occurredAt: Timestamp;
  actor: ActorRef;
  subject: ObjectRef;
  metadata: DomainEventMetadata;
};

export interface AuditSink {
  append(record: AuditRecord): Promise<void>;
}
