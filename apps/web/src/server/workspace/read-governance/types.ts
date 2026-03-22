import type {
  ActorRef
} from "@openpolis/contracts";
import type {
  AdminSnapshot,
  CoreModuleId,
  DashboardSnapshot,
  ModuleSnapshot,
  PaginationParams,
  SettingsSnapshot,
  SkillProviderSnapshot
} from "@openpolis/application";

export type MaybePromise<T> = T | Promise<T>;

export type GovernableWorkspaceReadService = {
  getDashboardSnapshot(): MaybePromise<DashboardSnapshot>;
  getCoreModuleSnapshot(
    moduleId: CoreModuleId,
    pagination?: PaginationParams
  ): MaybePromise<ModuleSnapshot>;
  getCoreModuleSnapshotForActor?(
    moduleId: CoreModuleId,
    actor: ActorRef,
    pagination?: PaginationParams
  ): MaybePromise<ModuleSnapshot>;
  getSkillProviderSnapshot(): MaybePromise<SkillProviderSnapshot>;
  getSettingsSnapshot(): MaybePromise<SettingsSnapshot>;
  getAdminSnapshot(): MaybePromise<AdminSnapshot>;
};
