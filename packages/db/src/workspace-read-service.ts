import type {
  CoreModuleId,
  ModuleSnapshot,
  PaginationParams,
  WorkspaceReadService
} from "@openpolis/application";
import type { ActorRef } from "@openpolis/contracts";

import {
  createAdminSnapshot,
  createDashboardSnapshot,
  createModuleSnapshot,
  createSettingsSnapshot,
  createSkillProviderSnapshot
} from "./workspace-base-snapshots";
import { createActorScopedModuleSnapshot } from "./workspace-governed-snapshots";

export type ActorAwareWorkspaceReadService = WorkspaceReadService & {
  getCoreModuleSnapshotForActor(
    moduleId: CoreModuleId,
    actor: ActorRef,
    pagination?: PaginationParams
  ): ModuleSnapshot;
};

class DemoWorkspaceReadService implements WorkspaceReadService {
  getDashboardSnapshot() {
    return createDashboardSnapshot();
  }

  getCoreModuleSnapshot(
    moduleId: CoreModuleId,
    pagination?: PaginationParams
  ): ModuleSnapshot {
    return createModuleSnapshot(moduleId, pagination);
  }

  getSkillProviderSnapshot() {
    return createSkillProviderSnapshot();
  }

  getSettingsSnapshot() {
    return createSettingsSnapshot();
  }

  getAdminSnapshot() {
    return createAdminSnapshot();
  }
}

class GovernedDemoWorkspaceReadService
  extends DemoWorkspaceReadService
  implements ActorAwareWorkspaceReadService {
  getCoreModuleSnapshotForActor(
    moduleId: CoreModuleId,
    actor: ActorRef,
    pagination?: PaginationParams
  ): ModuleSnapshot {
    return createActorScopedModuleSnapshot(moduleId, actor, pagination);
  }
}

let workspaceReadService: ActorAwareWorkspaceReadService | null = null;

export function getWorkspaceReadService(): ActorAwareWorkspaceReadService {
  if (!workspaceReadService) {
    workspaceReadService = new GovernedDemoWorkspaceReadService();
  }

  return workspaceReadService;
}
