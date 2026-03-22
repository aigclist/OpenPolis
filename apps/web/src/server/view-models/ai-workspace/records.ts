import { desc, eq } from "drizzle-orm";
import { AgentRunSchema } from "@openpolis/contracts";
import { getDrizzleDb } from "@openpolis/db/client";
import { workflowObjects } from "@openpolis/db/schema";

export function getRecentAgentRuns(limit: number) {
  const rows = getDrizzleDb()
    .select({
      payload: workflowObjects.payload
    })
    .from(workflowObjects)
    .where(eq(workflowObjects.objectType, "agent_run"))
    .orderBy(desc(workflowObjects.updatedAt))
    .limit(limit)
    .all();

  return rows.flatMap((row) => {
    try {
      const parsed = AgentRunSchema.safeParse(JSON.parse(row.payload));
      return parsed.success ? [parsed.data] : [];
    } catch {
      return [];
    }
  });
}
