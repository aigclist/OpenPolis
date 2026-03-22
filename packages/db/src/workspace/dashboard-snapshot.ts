import type {
  DashboardSnapshot,
  DashboardPriorityRow,
  GenericRecordRow,
  RegionRow
} from "@openpolis/application";

import { all, count } from "../workspace-read-utils";

export function createDashboardSnapshot(): DashboardSnapshot {
  return {
    priorities: all<DashboardPriorityRow>(`
      SELECT
        code,
        title,
        summary,
        status,
        priority,
        owner_team AS ownerTeam,
        updated_at AS updatedAt,
        region_code AS regionCode
      FROM issues
      ORDER BY
        CASE priority
          WHEN 'critical' THEN 0
          WHEN 'high' THEN 1
          WHEN 'medium' THEN 2
          ELSE 3
        END,
        updated_at DESC
      LIMIT 3
    `),
    regions: all<RegionRow>(`
      SELECT
        code,
        status,
        completion_rate AS completionRate,
        blocked_count AS blockedCount,
        updated_at AS updatedAt
      FROM regions
      ORDER BY completion_rate ASC
    `),
    feedback: all<GenericRecordRow>(`
      SELECT
        code,
        title,
        summary,
        status,
        severity AS priority,
        NULL AS ownerTeam,
        NULL AS assigneeTeam,
        NULL AS requestedByTeam,
        NULL AS dueDate,
        updated_at AS updatedAt,
        region_code AS regionCode,
        NULL AS kind,
        NULL AS scope,
        CASE
          WHEN issue_id LIKE 'issue_%' THEN substr(issue_id, 7)
          ELSE issue_id
        END AS issueCode,
        NULL AS briefCode,
        CASE
          WHEN task_id LIKE 'task_%' THEN substr(task_id, 6)
          ELSE task_id
        END AS taskCode,
        NULL AS approvalCode,
        NULL AS subjectCode,
        NULL AS subjectType,
        source,
        NULL AS locale,
        sensitivity
      FROM feedback
      ORDER BY updated_at DESC
      LIMIT 3
    `),
    reviews: all<GenericRecordRow>(`
      SELECT
        code,
        title,
        summary,
        status,
        NULL AS priority,
        owner_team AS ownerTeam,
        NULL AS assigneeTeam,
        requested_by_team AS requestedByTeam,
        due_date AS dueDate,
        updated_at AS updatedAt,
        NULL AS regionCode,
        NULL AS kind,
        NULL AS scope,
        NULL AS issueCode,
        NULL AS briefCode,
        NULL AS taskCode,
        NULL AS approvalCode,
        subject_code AS subjectCode,
        subject_type AS subjectType,
        NULL AS source,
        NULL AS locale,
        sensitivity
      FROM reviews
      ORDER BY due_date ASC
      LIMIT 3
    `),
    metrics: {
      openTasks: count(
        "SELECT COUNT(*) as count FROM tasks WHERE status IN ('active', 'in_review', 'blocked')"
      ),
      inReview: count(
        "SELECT COUNT(*) as count FROM reviews WHERE status = 'in_review'"
      ),
      blocked: count(
        "SELECT COUNT(*) as count FROM tasks WHERE status = 'blocked'"
      ),
      urgentFeedback: count(
        "SELECT COUNT(*) as count FROM feedback WHERE severity IN ('critical', 'high')"
      )
    }
  };
}
