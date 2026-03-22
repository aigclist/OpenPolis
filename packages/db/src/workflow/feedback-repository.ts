import type { RepositoryBundle } from "@openpolis/application";
import type { Feedback } from "@openpolis/contracts";
import { eq, or } from "drizzle-orm";

import { getDrizzleDb } from "../client";
import { feedback as feedbackTable } from "../schema";
import {
  createAudit,
  createSummary,
  createTitle,
  getCodeCandidate,
  getStoredObject,
  saveStoredObject,
  toReferenceCode
} from "./shared";

type FeedbackTableRow = typeof feedbackTable.$inferSelect;

export function createFeedbackRepository() {
  return {
    async getById(id: string) {
      const stored = getStoredObject<Feedback>(id);

      if (stored) {
        return stored;
      }

      const code = getCodeCandidate(id, "feedback");
      const row = getDrizzleDb()
        .select()
        .from(feedbackTable)
        .where(or(eq(feedbackTable.id, id), eq(feedbackTable.code, code)))
        .limit(1)
        .get() as FeedbackTableRow | undefined;

      if (!row) {
        return null;
      }

      return {
        id: row.id,
        code: row.code,
        title: createTitle(row.code, row.title),
        summary: createSummary(
          row.summary,
          "Feedback record recovered from the workspace snapshot."
        ),
        status: row.status,
        severity: row.severity,
        source: row.source ?? "internal",
        issueId: row.issueId ?? undefined,
        taskId: row.taskId ?? undefined,
        regionId: row.regionCode,
        ownerTeamId: row.ownerTeam ?? "team_central_ops",
        sensitivity: row.sensitivity ?? "internal",
        audit: createAudit(row.updatedAt)
      };
    },
    async save(feedback: Feedback) {
      saveStoredObject(
        "feedback",
        feedback.id,
        feedback.code,
        feedback,
        feedback.audit.updatedAt
      );

      getDrizzleDb()
        .insert(feedbackTable)
        .values({
          id: feedback.id,
          code: feedback.code,
          title: feedback.title,
          summary: feedback.summary,
          status: feedback.status,
          severity: feedback.severity,
          source: feedback.source,
          issueId: feedback.issueId ?? null,
          taskId: feedback.taskId ?? null,
          ownerTeam: feedback.ownerTeamId ?? null,
          sensitivity: feedback.sensitivity,
          regionCode:
            toReferenceCode(feedback.regionId, "region") ?? "north_network",
          updatedAt: feedback.audit.updatedAt
        })
        .onConflictDoUpdate({
          target: feedbackTable.id,
          set: {
            code: feedback.code,
            title: feedback.title,
            summary: feedback.summary,
            status: feedback.status,
            severity: feedback.severity,
            source: feedback.source,
            issueId: feedback.issueId ?? null,
            taskId: feedback.taskId ?? null,
            ownerTeam: feedback.ownerTeamId ?? null,
            sensitivity: feedback.sensitivity,
            regionCode:
              toReferenceCode(feedback.regionId, "region") ?? "north_network",
            updatedAt: feedback.audit.updatedAt
          }
        })
        .run();
    }
  } satisfies RepositoryBundle["feedback"];
}
