import type {
  AdminSnapshot,
  CoreModuleId,
  DashboardSnapshot,
  ModuleSnapshot,
  PaginationParams,
  SettingsSnapshot,
  SkillProviderSnapshot,
  WorkspaceReadService
} from "@openpolis/application";
import { logStructuredEvent } from "@openpolis/application/logging";
import type { ActorRef } from "@openpolis/contracts";
import { getWorkspaceCommandService } from "@openpolis/db/workflow";
import { getWorkspaceReadService } from "@openpolis/db/workspace";

export class WorkspaceReadModelError extends Error {
  cause?: unknown;

  constructor(operation: string, cause?: unknown) {
    super(`Failed to load workspace read model for ${operation}.`);
    this.name = "WorkspaceReadModelError";
    this.cause = cause;
  }
}

type ActorAwareWorkspaceReadService = WorkspaceReadService & {
  getCoreModuleSnapshotForActor?(
    moduleId: CoreModuleId,
    actor: ActorRef,
    pagination?: PaginationParams
  ): ModuleSnapshot;
};

const baseReadService: ActorAwareWorkspaceReadService = getWorkspaceReadService();

async function readWorkspaceSnapshot<T>(
  operation: string,
  reader: () => T | Promise<T>
): Promise<T> {
  try {
    return await reader();
  } catch (error) {
    logStructuredEvent("error", "runtime.workspace-read.failed", {
      operation,
      error
    });
    throw new WorkspaceReadModelError(operation, error);
  }
}

export const workspaceCommandService = getWorkspaceCommandService();

export const workspaceReadService = {
  getDashboardSnapshot(): Promise<DashboardSnapshot> {
    return readWorkspaceSnapshot("dashboard", () =>
      baseReadService.getDashboardSnapshot()
    );
  },
  getCoreModuleSnapshot(
    moduleId: CoreModuleId,
    pagination?: PaginationParams
  ): Promise<ModuleSnapshot> {
    return readWorkspaceSnapshot(`module:${moduleId}`, () =>
      baseReadService.getCoreModuleSnapshot(moduleId, pagination)
    );
  },
  getCoreModuleSnapshotForActor(
    moduleId: CoreModuleId,
    actor: ActorRef,
    pagination?: PaginationParams
  ): Promise<ModuleSnapshot> {
    return readWorkspaceSnapshot(`module:${moduleId}:actor`, () => {
      if (typeof baseReadService.getCoreModuleSnapshotForActor === "function") {
        return baseReadService.getCoreModuleSnapshotForActor(
          moduleId,
          actor,
          pagination
        );
      }

      return baseReadService.getCoreModuleSnapshot(moduleId, pagination);
    });
  },
  getSkillProviderSnapshot(): Promise<SkillProviderSnapshot> {
    return readWorkspaceSnapshot("skills", () =>
      baseReadService.getSkillProviderSnapshot()
    );
  },
  getSettingsSnapshot(): Promise<SettingsSnapshot> {
    return readWorkspaceSnapshot("settings", () =>
      baseReadService.getSettingsSnapshot()
    );
  },
  getAdminSnapshot(): Promise<AdminSnapshot> {
    return readWorkspaceSnapshot("admin", () =>
      baseReadService.getAdminSnapshot()
    );
  }
};
