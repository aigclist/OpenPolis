import type { CoreModuleId, ModuleSnapshot, PaginationParams } from "@openpolis/application";
import type { ActorRef } from "@openpolis/contracts";

import { createActorScopedAssetsSnapshot } from "./workspace/assets-snapshots";
import { createActorScopedBriefsSnapshot } from "./workspace/briefs-snapshots";
import {
  createActorScopedCalendarSnapshot,
  createActorScopedNetworkSnapshot,
  createActorScopedReportsSnapshot
} from "./workspace/secondary-snapshots";
import { createActorScopedFeedbackSnapshot } from "./workspace/feedback-snapshots";
import { createActorScopedIssuesSnapshot } from "./workspace/issues-snapshots";
import { createActorScopedOperationsSnapshot } from "./workspace/operations-snapshots";
import { createActorScopedReviewSnapshot } from "./workspace/review-snapshots";

export function createActorScopedModuleSnapshot(
  moduleId: CoreModuleId,
  actor: ActorRef,
  pagination?: PaginationParams
): ModuleSnapshot {
  switch (moduleId) {
    case "issues":
      return createActorScopedIssuesSnapshot(actor, pagination);
    case "assets":
      return createActorScopedAssetsSnapshot(actor, pagination);
    case "briefs":
      return createActorScopedBriefsSnapshot(actor, pagination);
    case "operations":
      return createActorScopedOperationsSnapshot(actor, pagination);
    case "network":
      return createActorScopedNetworkSnapshot(actor);
    case "calendar":
      return createActorScopedCalendarSnapshot(actor);
    case "feedback":
      return createActorScopedFeedbackSnapshot(actor, pagination);
    case "review":
      return createActorScopedReviewSnapshot(actor, pagination);
    case "reports":
      return createActorScopedReportsSnapshot(actor);
  }
}
