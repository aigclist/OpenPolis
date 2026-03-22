import type {
  AdminSnapshot,
  GenericRecordRow,
  SettingsSnapshot,
  SkillProviderSnapshot
} from "@openpolis/application";

import { all } from "../workspace-read-utils";

export function createSkillProviderSnapshot(): SkillProviderSnapshot {
  return {
    providers: all<GenericRecordRow>(`
      SELECT
        code,
        title,
        summary,
        status,
        NULL AS priority,
        NULL AS ownerTeam,
        NULL AS assigneeTeam,
        NULL AS requestedByTeam,
        NULL AS dueDate,
        updated_at AS updatedAt,
        NULL AS regionCode,
        kind,
        NULL AS scope,
        NULL AS issueCode,
        NULL AS briefCode,
        NULL AS taskCode,
        NULL AS approvalCode,
        NULL AS subjectCode,
        NULL AS subjectType,
        NULL AS source,
        NULL AS locale,
        NULL AS sensitivity
      FROM providers
      ORDER BY updated_at DESC
    `),
    skills: all<GenericRecordRow>(`
      SELECT
        code,
        title,
        summary,
        status,
        NULL AS priority,
        NULL AS ownerTeam,
        NULL AS assigneeTeam,
        NULL AS requestedByTeam,
        NULL AS dueDate,
        updated_at AS updatedAt,
        NULL AS regionCode,
        NULL AS kind,
        scope,
        NULL AS issueCode,
        NULL AS briefCode,
        NULL AS taskCode,
        NULL AS approvalCode,
        NULL AS subjectCode,
        NULL AS subjectType,
        NULL AS source,
        NULL AS locale,
        NULL AS sensitivity
      FROM skills
      ORDER BY updated_at DESC
    `)
  };
}

export function createSettingsSnapshot(): SettingsSnapshot {
  return {
    locales: 2,
    retention: 30,
    exports: 3
  };
}

export function createAdminSnapshot(): AdminSnapshot {
  return {
    roles: 8,
    audit: 24,
    sensitive: 4
  };
}
