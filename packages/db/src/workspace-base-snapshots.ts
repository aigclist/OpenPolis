import type { CoreModuleId, ModuleSnapshot, PaginationParams } from "@openpolis/application";

import { createAssetsSnapshot } from "./workspace/assets-snapshots";
import { createBriefsSnapshot } from "./workspace/briefs-snapshots";
import { createCalendarSnapshot, createNetworkSnapshot, createReportsSnapshot } from "./workspace/secondary-snapshots";
import { createDashboardSnapshot } from "./workspace/dashboard-snapshot";
import { createFeedbackSnapshot } from "./workspace/feedback-snapshots";
import { createIssuesSnapshot } from "./workspace/issues-snapshots";
import { createOperationsSnapshot } from "./workspace/operations-snapshots";
import { createReviewSnapshot } from "./workspace/review-snapshots";
import {
  createAdminSnapshot,
  createSettingsSnapshot,
  createSkillProviderSnapshot
} from "./workspace/utility-snapshots";

export {
  createAdminSnapshot,
  createDashboardSnapshot,
  createSettingsSnapshot,
  createSkillProviderSnapshot
};

export function createModuleSnapshot(
  moduleId: CoreModuleId,
  pagination?: PaginationParams
): ModuleSnapshot {
  switch (moduleId) {
    case "issues":
      return createIssuesSnapshot(pagination);
    case "assets":
      return createAssetsSnapshot(pagination);
    case "briefs":
      return createBriefsSnapshot(pagination);
    case "operations":
      return createOperationsSnapshot(pagination);
    case "network":
      return createNetworkSnapshot();
    case "calendar":
      return createCalendarSnapshot();
    case "feedback":
      return createFeedbackSnapshot(pagination);
    case "review":
      return createReviewSnapshot(pagination);
    case "reports":
      return createReportsSnapshot();
  }
}
