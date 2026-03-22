import type { Brief } from "@openpolis/contracts";
import type { RepositoryBundle } from "@openpolis/application";
import { eq, or } from "drizzle-orm";

import { getDrizzleDb } from "../client";
import { briefs } from "../schema";
import {
  createAudit,
  createScope,
  createSummary,
  createTitle,
  getCodeCandidate,
  getStoredObject,
  parseStringArray,
  saveStoredObject
} from "./shared";

type BriefTableRow = typeof briefs.$inferSelect;

export function createBriefRepository() {
  return {
    async getById(id: string) {
      const stored = getStoredObject<Brief>(id);

      if (stored) {
        return stored;
      }

      const code = getCodeCandidate(id, "brief");
      const row = getDrizzleDb()
        .select()
        .from(briefs)
        .where(or(eq(briefs.id, id), eq(briefs.code, code)))
        .limit(1)
        .get() as BriefTableRow | undefined;

      if (!row) {
        return null;
      }

      const outputKinds = parseStringArray(row.outputKinds);

      return {
        id: row.id,
        code: row.code,
        title: createTitle(row.code, row.title),
        summary: createSummary(
          row.summary,
          "Structured brief recovered from the workspace snapshot."
        ),
        goal: row.goal ?? createSummary(row.summary, "Recovered brief goal"),
        issueId: row.issueId ?? undefined,
        ownerTeamId: row.ownerTeam,
        targetScope: createScope(
          row.targetTeamIds,
          row.targetRegionIds,
          row.ownerTeam,
          "north_network"
        ),
        outputKinds: outputKinds.length > 0 ? outputKinds : ["briefing_note"],
        status: row.status,
        dueAt: row.dueDate,
        approvalRequired: row.approvalRequired ?? true,
        linkedTaskIds: parseStringArray(row.linkedTaskIds),
        sensitivity: row.sensitivity ?? "internal",
        audit: createAudit(row.updatedAt)
      };
    },
    async save(brief: Brief) {
      saveStoredObject("brief", brief.id, brief.code, brief, brief.audit.updatedAt);

      getDrizzleDb()
        .insert(briefs)
        .values({
          id: brief.id,
          code: brief.code,
          title: brief.title,
          summary: brief.summary,
          goal: brief.goal,
          issueId: brief.issueId ?? null,
          status: brief.status,
          ownerTeam: brief.ownerTeamId,
          targetTeamIds: brief.targetScope.teamIds,
          targetRegionIds: brief.targetScope.regionIds,
          outputKinds: brief.outputKinds,
          approvalRequired: brief.approvalRequired,
          linkedTaskIds: brief.linkedTaskIds,
          sensitivity: brief.sensitivity,
          dueDate: brief.dueAt,
          updatedAt: brief.audit.updatedAt
        })
        .onConflictDoUpdate({
          target: briefs.id,
          set: {
            code: brief.code,
            title: brief.title,
            summary: brief.summary,
            goal: brief.goal,
            issueId: brief.issueId ?? null,
            status: brief.status,
            ownerTeam: brief.ownerTeamId,
            targetTeamIds: brief.targetScope.teamIds,
            targetRegionIds: brief.targetScope.regionIds,
            outputKinds: brief.outputKinds,
            approvalRequired: brief.approvalRequired,
            linkedTaskIds: brief.linkedTaskIds,
            sensitivity: brief.sensitivity,
            dueDate: brief.dueAt,
            updatedAt: brief.audit.updatedAt
          }
        })
        .run();
    }
  } satisfies RepositoryBundle["briefs"];
}

