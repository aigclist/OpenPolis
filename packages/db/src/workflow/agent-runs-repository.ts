import type { RepositoryBundle } from "@openpolis/application";
import type { AgentRun } from "@openpolis/contracts";

import { getStoredObject, saveStoredObject } from "./shared";

export function createAgentRunRepository() {
  return {
    async getById(id: string) {
      return getStoredObject<AgentRun>(id);
    },
    async save(agentRun: AgentRun) {
      saveStoredObject(
        "agent_run",
        agentRun.id,
        agentRun.code,
        agentRun,
        agentRun.audit.updatedAt
      );
    }
  } satisfies RepositoryBundle["agentRuns"];
}
