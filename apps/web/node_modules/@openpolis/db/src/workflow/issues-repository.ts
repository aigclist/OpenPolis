import type { Issue } from "@openpolis/contracts";
import type { RepositoryBundle } from "@openpolis/application";
import { eq, or } from "drizzle-orm";

import { getDrizzleDb } from "../client";
import { issues } from "../schema";
import {
  createAudit,
  createScope,
  createSummary,
  createTitle,
  getCodeCandidate,
  getStoredObject,
  saveStoredObject,
  parseStringArray,
  toReferenceCode
} from "./shared";

type IssueTableRow = typeof issues.$inferSelect;

export function createIssueRepository() {
  return {
    async getById(id: string) {
      const stored = getStoredObject<Issue>(id);

      if (stored) {
        return stored;
      }

      const code = getCodeCandidate(id, "issue");
      const row = getDrizzleDb()
        .select()
        .from(issues)
        .where(or(eq(issues.id, id), eq(issues.code, code)))
        .limit(1)
        .get() as IssueTableRow | undefined;

      if (!row) {
        return null;
      }

      return {
        id: row.id,
        code: row.code,
        title: createTitle(row.code, row.title),
        summary: createSummary(
          row.summary,
          "Task-structured issue record recovered from the workspace snapshot."
        ),
        kind: row.kind ?? "response",
        status: row.status,
        priority: row.priority,
        ownerTeamId: row.ownerTeam,
        primaryRegionId: row.primaryRegionId ?? row.regionCode,
        targetScope: createScope(
          row.targetTeamIds,
          row.targetRegionIds,
          row.ownerTeam,
          row.primaryRegionId ?? row.regionCode
        ),
        audienceTags: parseStringArray(row.audienceTags),
        keyMessages: parseStringArray(row.keyMessages),
        riskNotes: parseStringArray(row.riskNotes),
        linkedBriefIds: parseStringArray(row.linkedBriefIds),
        linkedAssetIds: parseStringArray(row.linkedAssetIds),
        sensitivity: row.sensitivity ?? "internal",
        audit: createAudit(row.updatedAt)
      };
    },
    async save(issue: Issue) {
      saveStoredObject("issue", issue.id, issue.code, issue, issue.audit.updatedAt);

      const regionCode =
        toReferenceCode(
          issue.primaryRegionId ?? issue.targetScope.regionIds[0],
          "region"
        ) ?? "north_network";

      getDrizzleDb()
        .insert(issues)
        .values({
          id: issue.id,
          code: issue.code,
          title: issue.title,
          summary: issue.summary,
          kind: issue.kind,
          status: issue.status,
          priority: issue.priority,
          ownerTeam: issue.ownerTeamId,
          primaryRegionId: issue.primaryRegionId ?? null,
          targetTeamIds: issue.targetScope.teamIds,
          targetRegionIds: issue.targetScope.regionIds,
          audienceTags: issue.audienceTags,
          keyMessages: issue.keyMessages,
          riskNotes: issue.riskNotes,
          linkedBriefIds: issue.linkedBriefIds,
          linkedAssetIds: issue.linkedAssetIds,
          sensitivity: issue.sensitivity,
          updatedAt: issue.audit.updatedAt,
          regionCode
        })
        .onConflictDoUpdate({
          target: issues.id,
          set: {
            code: issue.code,
            title: issue.title,
            summary: issue.summary,
            kind: issue.kind,
            status: issue.status,
            priority: issue.priority,
            ownerTeam: issue.ownerTeamId,
            primaryRegionId: issue.primaryRegionId ?? null,
            targetTeamIds: issue.targetScope.teamIds,
            targetRegionIds: issue.targetScope.regionIds,
            audienceTags: issue.audienceTags,
            keyMessages: issue.keyMessages,
            riskNotes: issue.riskNotes,
            linkedBriefIds: issue.linkedBriefIds,
            linkedAssetIds: issue.linkedAssetIds,
            sensitivity: issue.sensitivity,
            updatedAt: issue.audit.updatedAt,
            regionCode
          }
        })
        .run();
    }
  } satisfies RepositoryBundle["issues"];
}

