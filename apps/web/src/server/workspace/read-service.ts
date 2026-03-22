import type {
  AdminSnapshot,
  CoreModuleId,
  DashboardSnapshot,
  ModuleSnapshot,
  PaginationParams,
  SettingsSnapshot,
  SkillProviderSnapshot
} from "@openpolis/application";
import {
  WorkspaceReadModelError,
  workspaceReadService as baseWorkspaceReadService
} from "@openpolis/runtime/workspace";
import { logStructuredEvent } from "@openpolis/application/logging";

import { createGovernedWorkspaceReadService } from "./read-governance";
import { resolveServerActorContext } from "./command-context";

async function readWorkspaceSnapshot<T>(
  operation: string,
  reader: () => T | Promise<T>
): Promise<T> {
  try {
    return await reader();
  } catch (error) {
    logStructuredEvent("error", "workspace-read.failed", {
      operation,
      error
    });
    throw new WorkspaceReadModelError(operation, error);
  }
}

export { WorkspaceReadModelError } from "@openpolis/runtime/workspace";

export async function getServerWorkspaceReadService(): Promise<{
  getDashboardSnapshot(): Promise<DashboardSnapshot>;
  getCoreModuleSnapshot(
    moduleId: CoreModuleId,
    pagination?: PaginationParams
  ): Promise<ModuleSnapshot>;
  getSkillProviderSnapshot(): Promise<SkillProviderSnapshot>;
  getSettingsSnapshot(): Promise<SettingsSnapshot>;
  getAdminSnapshot(): Promise<AdminSnapshot>;
}> {
  const resolvedActor = await resolveServerActorContext();
  const governedReadService = createGovernedWorkspaceReadService(
    baseWorkspaceReadService,
    resolvedActor.actor
  );

  return {
    getDashboardSnapshot(): Promise<DashboardSnapshot> {
      return readWorkspaceSnapshot("dashboard", () =>
        governedReadService.getDashboardSnapshot()
      );
    },
    getCoreModuleSnapshot(
      moduleId: CoreModuleId,
      pagination?: PaginationParams
    ): Promise<ModuleSnapshot> {
      return readWorkspaceSnapshot(`module:${moduleId}`, () =>
        governedReadService.getCoreModuleSnapshot(moduleId, pagination)
      );
    },
    getSkillProviderSnapshot(): Promise<SkillProviderSnapshot> {
      return readWorkspaceSnapshot("skills", () =>
        governedReadService.getSkillProviderSnapshot()
      );
    },
    getSettingsSnapshot(): Promise<SettingsSnapshot> {
      return readWorkspaceSnapshot("settings", () =>
        governedReadService.getSettingsSnapshot()
      );
    },
    getAdminSnapshot(): Promise<AdminSnapshot> {
      return readWorkspaceSnapshot("admin", () =>
        governedReadService.getAdminSnapshot()
      );
    }
  };
}
