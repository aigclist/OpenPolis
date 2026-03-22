import type { RepositoryBundle } from "@openpolis/application";
import type { Task } from "@openpolis/contracts";
import { eq, or } from "drizzle-orm";

import { getDrizzleDb } from "../client";
import { tasks } from "../schema";
import {
  createAudit,
  createSummary,
  createTitle,
  getCodeCandidate,
  getStoredObject,
  saveStoredObject,
  toReferenceCode
} from "./shared";

type TaskTableRow = typeof tasks.$inferSelect;

export function createTaskRepository() {
  return {
    async getById(id: string) {
      const stored = getStoredObject<Task>(id);

      if (stored) {
        return stored;
      }

      const code = getCodeCandidate(id, "task");
      const row = getDrizzleDb()
        .select()
        .from(tasks)
        .where(or(eq(tasks.id, id), eq(tasks.code, code)))
        .limit(1)
        .get() as TaskTableRow | undefined;

      if (!row) {
        return null;
      }

      return {
        id: row.id,
        code: row.code,
        title: createTitle(row.code, row.title),
        summary: createSummary(
          row.summary,
          "Execution task recovered from the workspace snapshot."
        ),
        status: row.status,
        priority: row.priority,
        ownerTeamId: row.ownerTeam,
        assigneeTeamId: row.assigneeTeam ?? undefined,
        regionId: row.regionCode,
        briefId: row.briefId ?? undefined,
        issueId: row.issueId ?? undefined,
        dueAt: row.dueDate,
        workflowStep: row.workflowStep ?? undefined,
        sensitivity: row.sensitivity ?? "internal",
        audit: createAudit(row.updatedAt)
      };
    },
    async save(task: Task) {
      saveStoredObject("task", task.id, task.code, task, task.audit.updatedAt);

      getDrizzleDb()
        .insert(tasks)
        .values({
          id: task.id,
          code: task.code,
          title: task.title,
          summary: task.summary,
          status: task.status,
          priority: task.priority,
          ownerTeam: task.ownerTeamId,
          assigneeTeam: task.assigneeTeamId ?? null,
          issueId: task.issueId ?? null,
          briefId: task.briefId ?? null,
          workflowStep: task.workflowStep ?? null,
          sensitivity: task.sensitivity,
          dueDate: task.dueAt,
          regionCode: toReferenceCode(task.regionId, "region") ?? "north_network",
          updatedAt: task.audit.updatedAt
        })
        .onConflictDoUpdate({
          target: tasks.id,
          set: {
            code: task.code,
            title: task.title,
            summary: task.summary,
            status: task.status,
            priority: task.priority,
            ownerTeam: task.ownerTeamId,
            assigneeTeam: task.assigneeTeamId ?? null,
            issueId: task.issueId ?? null,
            briefId: task.briefId ?? null,
            workflowStep: task.workflowStep ?? null,
            sensitivity: task.sensitivity,
            dueDate: task.dueAt,
            regionCode:
              toReferenceCode(task.regionId, "region") ?? "north_network",
            updatedAt: task.audit.updatedAt
          }
        })
        .run();
    }
  } satisfies RepositoryBundle["tasks"];
}
