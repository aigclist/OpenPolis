import type { RepositoryBundle } from "@openpolis/application";
import type { Approval } from "@openpolis/contracts";
import { eq, or } from "drizzle-orm";

import { getDrizzleDb } from "../client";
import { reviews } from "../schema";
import {
  createAudit,
  createTitle,
  getCodeCandidate,
  getStoredObject,
  parseStringArray,
  resolveApprovalSubject,
  saveStoredObject
} from "./shared";

type ReviewTableRow = typeof reviews.$inferSelect;

export function createApprovalRepository() {
  return {
    async getById(id: string) {
      const stored = getStoredObject<Approval>(id);

      if (stored) {
        return stored;
      }

      const code = getCodeCandidate(id, "approval");
      const row = getDrizzleDb()
        .select()
        .from(reviews)
        .where(or(eq(reviews.id, id), eq(reviews.code, code)))
        .limit(1)
        .get() as ReviewTableRow | undefined;

      if (!row || !row.code.startsWith("approval_")) {
        return null;
      }

      const subject = resolveApprovalSubject(
        {
          subjectType: row.subjectType,
          subjectId: row.subjectId,
          subjectCode: row.subjectCode,
          summary: row.summary
        },
        code
      );

      return {
        id: row.id,
        code: row.code,
        title: createTitle(row.code, row.title),
        subject: {
          objectType: subject.subjectType,
          objectId: subject.subjectId,
          objectCode: subject.subjectCode
        },
        status: row.status,
        requestedByTeamId: row.requestedByTeam ?? "team_central_ops",
        reviewerTeamId: row.ownerTeam,
        dueAt: row.dueDate,
        checklist: parseStringArray(row.checklist),
        latestComment: row.latestComment ?? row.summary ?? undefined,
        sensitivity: row.sensitivity ?? "internal",
        audit: createAudit(row.updatedAt)
      };
    },
    async save(approval: Approval) {
      saveStoredObject(
        "approval",
        approval.id,
        approval.code,
        approval,
        approval.audit.updatedAt
      );

      getDrizzleDb()
        .insert(reviews)
        .values({
          id: approval.id,
          code: approval.code,
          title: approval.title,
          summary:
            approval.latestComment ??
            approval.subject.objectCode ??
            approval.subject.objectId,
          status: approval.status,
          ownerTeam: approval.reviewerTeamId,
          subjectType: approval.subject.objectType,
          subjectId: approval.subject.objectId,
          subjectCode: approval.subject.objectCode ?? null,
          requestedByTeam: approval.requestedByTeamId,
          checklist: approval.checklist,
          latestComment: approval.latestComment ?? null,
          sensitivity: approval.sensitivity,
          dueDate: approval.dueAt,
          updatedAt: approval.audit.updatedAt
        })
        .onConflictDoUpdate({
          target: reviews.id,
          set: {
            code: approval.code,
            title: approval.title,
            summary:
              approval.latestComment ??
              approval.subject.objectCode ??
              approval.subject.objectId,
            status: approval.status,
            ownerTeam: approval.reviewerTeamId,
            subjectType: approval.subject.objectType,
            subjectId: approval.subject.objectId,
            subjectCode: approval.subject.objectCode ?? null,
            requestedByTeam: approval.requestedByTeamId,
            checklist: approval.checklist,
            latestComment: approval.latestComment ?? null,
            sensitivity: approval.sensitivity,
            dueDate: approval.dueAt,
            updatedAt: approval.audit.updatedAt
          }
        })
        .run();
    }
  } satisfies RepositoryBundle["approvals"];
}
