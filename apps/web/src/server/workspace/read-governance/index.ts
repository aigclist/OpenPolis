import type {
  CoreModuleId,
  DashboardPriorityRow,
  DashboardSnapshot,
  ModuleSnapshot,
  PaginationParams,
  RegionRow,
  SkillProviderSnapshot,
  SettingsSnapshot,
  AdminSnapshot
} from "@openpolis/application";
import type { ActorRef } from "@openpolis/contracts";
import { canAccessObject } from "@openpolis/governance";

import {
  canAccessWorkspaceAdmin,
  canAccessWorkspaceSkills,
  createDashboardPriorityRow,
  createRegionRow,
  sortByDueAsc,
  sortByUpdatedDesc,
  sortPriorities
} from "./dashboard";
import { paginateModuleSnapshot } from "./pagination";
import {
  filterModuleSnapshot,
  toDashboardGovernedResource,
  toRegionGovernedResource
} from "./resource-filter";
import type { GovernableWorkspaceReadService } from "./types";

export function filterModuleSnapshotForActor(
  actor: ActorRef,
  moduleId: CoreModuleId,
  snapshot: ModuleSnapshot
) {
  return filterModuleSnapshot(actor, moduleId, snapshot);
}

async function getActorScopedModuleSnapshot(
  baseReadService: GovernableWorkspaceReadService,
  actor: ActorRef,
  moduleId: CoreModuleId,
  pagination?: PaginationParams
) {
  if (typeof baseReadService.getCoreModuleSnapshotForActor === "function") {
    return await baseReadService.getCoreModuleSnapshotForActor(
      moduleId,
      actor,
      pagination
    );
  }

  const filteredSnapshot = filterModuleSnapshot(
    actor,
    moduleId,
    await baseReadService.getCoreModuleSnapshot(moduleId)
  );

  return paginateModuleSnapshot(filteredSnapshot, pagination);
}

export function createGovernedWorkspaceReadService(
  baseReadService: GovernableWorkspaceReadService,
  actor: ActorRef
): GovernableWorkspaceReadService {
  return {
    async getDashboardSnapshot(): Promise<DashboardSnapshot> {
      const [
        issuesSnapshot,
        networkSnapshot,
        feedbackSnapshot,
        reviewSnapshot,
        operationsSnapshot
      ] = await Promise.all([
        getActorScopedModuleSnapshot(baseReadService, actor, "issues"),
        getActorScopedModuleSnapshot(baseReadService, actor, "network"),
        getActorScopedModuleSnapshot(baseReadService, actor, "feedback"),
        getActorScopedModuleSnapshot(baseReadService, actor, "review"),
        getActorScopedModuleSnapshot(baseReadService, actor, "operations")
      ]);

      return {
        priorities: sortPriorities(issuesSnapshot.records)
          .map(createDashboardPriorityRow)
          .filter((row): row is DashboardPriorityRow => row !== null)
          .filter((row) => canAccessObject(actor, toDashboardGovernedResource(row)))
          .slice(0, 3),
        regions: networkSnapshot.records
          .map(createRegionRow)
          .filter((row): row is RegionRow => row !== null)
          .filter((row) => canAccessObject(actor, toRegionGovernedResource(row))),
        feedback: sortByUpdatedDesc(feedbackSnapshot.records).slice(0, 3),
        reviews: sortByDueAsc(reviewSnapshot.records).slice(0, 3),
        metrics: {
          openTasks: operationsSnapshot.records.filter((row) =>
            ["active", "in_review", "blocked"].includes(row.status)
          ).length,
          inReview: reviewSnapshot.records.filter((row) => row.status === "in_review").length,
          blocked: operationsSnapshot.records.filter((row) => row.status === "blocked").length,
          urgentFeedback: feedbackSnapshot.records.filter((row) =>
            ["critical", "high"].includes(row.priority ?? "")
          ).length
        }
      };
    },
    async getCoreModuleSnapshot(
      moduleId: CoreModuleId,
      pagination?: PaginationParams
    ): Promise<ModuleSnapshot> {
      return await getActorScopedModuleSnapshot(
        baseReadService,
        actor,
        moduleId,
        pagination
      );
    },
    async getSkillProviderSnapshot(): Promise<SkillProviderSnapshot> {
      if (!canAccessWorkspaceSkills(actor)) {
        return {
          providers: [],
          skills: []
        };
      }

      return await baseReadService.getSkillProviderSnapshot();
    },
    async getSettingsSnapshot(): Promise<SettingsSnapshot> {
      if (!canAccessWorkspaceAdmin(actor)) {
        return {
          locales: 0,
          retention: 0,
          exports: 0
        };
      }

      return await baseReadService.getSettingsSnapshot();
    },
    async getAdminSnapshot(): Promise<AdminSnapshot> {
      if (!canAccessWorkspaceAdmin(actor)) {
        return {
          roles: 0,
          audit: 0,
          sensitive: 0
        };
      }

      return await baseReadService.getAdminSnapshot();
    }
  };
}
