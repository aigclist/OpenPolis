import type { SqliteDatabase } from "./workspace-sqlite";

export function seedDatabase(database: SqliteDatabase) {
  const seeded = database
    .prepare("SELECT COUNT(*) as count FROM issues")
    .get() as { count: number };

  if (seeded.count > 0) {
    return;
  }

  database.exec(`
    INSERT INTO issues (id, code, title, summary, status, priority, owner_team, updated_at, region_code) VALUES
      ('issue_1', 'housing_transparency', NULL, NULL, 'active', 'critical', 'central_ops', '2026-03-19T08:15:00Z', 'north_network'),
      ('issue_2', 'youth_participation', NULL, NULL, 'monitoring', 'high', 'field_comms', '2026-03-18T16:40:00Z', 'coastal_district'),
      ('issue_3', 'budget_oversight', NULL, NULL, 'response_needed', 'high', 'policy_review', '2026-03-19T05:20:00Z', 'inland_coalition');

    INSERT INTO assets (id, code, title, summary, status, issue_code, kind, updated_at) VALUES
      ('asset_1', 'rapid_response_pack', NULL, NULL, 'approved', 'housing_transparency', NULL, '2026-03-19T07:10:00Z'),
      ('asset_2', 'regional_video_template', NULL, NULL, 'localized', 'youth_participation', NULL, '2026-03-18T18:30:00Z'),
      ('asset_3', 'candidate_brief_card', NULL, NULL, 'draft', 'budget_oversight', NULL, '2026-03-19T06:00:00Z');

    INSERT INTO briefs (id, code, title, summary, status, owner_team, due_date, updated_at) VALUES
      ('brief_1', 'municipal_listening_tour', NULL, NULL, 'queued', 'regional_ops', '2026-03-20T09:00:00Z', '2026-03-20T09:00:00Z'),
      ('brief_2', 'housing_response_brief', NULL, NULL, 'in_review', 'communications', '2026-03-19T12:00:00Z', '2026-03-19T12:00:00Z'),
      ('brief_3', 'volunteer_onboarding_wave', NULL, NULL, 'scheduled', 'field_training', '2026-03-21T08:30:00Z', '2026-03-21T08:30:00Z');

    INSERT INTO tasks (id, code, title, summary, status, priority, owner_team, due_date, region_code, updated_at) VALUES
      ('task_1', 'review_publish_cycle', NULL, NULL, 'active', 'critical', 'central_ops', '2026-03-19T10:00:00Z', 'north_network', '2026-03-19T10:00:00Z'),
      ('task_2', 'field_training_pack', NULL, NULL, 'in_review', 'high', 'field_training', '2026-03-19T15:00:00Z', 'coastal_district', '2026-03-19T15:00:00Z'),
      ('task_3', 'volunteer_route_sync', NULL, NULL, 'blocked', 'medium', 'regional_ops', '2026-03-20T11:00:00Z', 'inland_coalition', '2026-03-20T11:00:00Z');

    INSERT INTO regions VALUES
      ('region_1', 'north_network', 'active', 0.82, 1, '2026-03-19T08:45:00Z'),
      ('region_2', 'coastal_district', 'attention', 0.61, 2, '2026-03-19T07:30:00Z'),
      ('region_3', 'inland_coalition', 'ready', 0.74, 1, '2026-03-19T06:55:00Z');

    INSERT INTO events (id, code, title, summary, status, region_code, starts_at) VALUES
      ('event_1', 'policy_townhall', NULL, NULL, 'scheduled', 'north_network', '2026-03-20T18:00:00Z'),
      ('event_2', 'regional_press_window', NULL, NULL, 'active', 'coastal_district', '2026-03-19T11:30:00Z'),
      ('event_3', 'volunteer_orientation', NULL, NULL, 'queued', 'inland_coalition', '2026-03-21T09:30:00Z');

    INSERT INTO feedback (id, code, title, summary, status, severity, region_code, updated_at) VALUES
      ('feedback_1', 'media_question_queue', NULL, NULL, 'attention', 'critical', 'north_network', '2026-03-19T09:10:00Z'),
      ('feedback_2', 'local_office_blocker', NULL, NULL, 'active', 'high', 'coastal_district', '2026-03-19T08:05:00Z'),
      ('feedback_3', 'volunteer_signal_cluster', NULL, NULL, 'resolved', 'medium', 'inland_coalition', '2026-03-18T20:00:00Z');

    INSERT INTO reviews (id, code, title, summary, status, owner_team, due_date, updated_at) VALUES
      ('review_1', 'candidate_talking_points', NULL, NULL, 'in_review', 'communications', '2026-03-19T13:00:00Z', '2026-03-19T13:00:00Z'),
      ('review_2', 'regional_asset_bundle', NULL, NULL, 'changes_requested', 'regional_ops', '2026-03-19T16:00:00Z', '2026-03-19T16:00:00Z'),
      ('review_3', 'crisis_response_note', NULL, NULL, 'approved', 'policy_review', '2026-03-18T19:00:00Z', '2026-03-18T19:00:00Z');

    INSERT INTO reports (id, code, title, summary, status, kind, updated_at) VALUES
      ('report_1', 'daily_command_digest', NULL, NULL, 'generated', 'daily', '2026-03-19T08:50:00Z'),
      ('report_2', 'weekly_region_score', NULL, NULL, 'draft', 'weekly', '2026-03-18T21:30:00Z'),
      ('report_3', 'audit_trail_export', NULL, NULL, 'archived', 'export', '2026-03-17T14:00:00Z');

    INSERT INTO skills (id, code, title, summary, status, scope, updated_at) VALUES
      ('skill_1', 'issue_summarizer', NULL, NULL, 'enabled', 'issues', '2026-03-19T08:00:00Z'),
      ('skill_2', 'brief_drafter', NULL, NULL, 'enabled', 'briefs', '2026-03-19T07:45:00Z'),
      ('skill_3', 'approval_guard', NULL, NULL, 'ready', 'review', '2026-03-19T07:15:00Z');

    INSERT INTO providers (id, code, title, summary, status, kind, updated_at) VALUES
      ('provider_1', 'custom_gateway', NULL, NULL, 'configured', 'openai_compatible', '2026-03-19T07:50:00Z'),
      ('provider_2', 'anthropic_bridge', NULL, NULL, 'enabled', 'anthropic_sdk', '2026-03-19T06:20:00Z'),
      ('provider_3', 'local_fallback', NULL, NULL, 'restricted', 'local_runtime', '2026-03-18T22:10:00Z');
  `);
}
