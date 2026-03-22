import { mkdirSync } from "node:fs";
import { join } from "node:path";

import { ensureLegacyForeignKeys } from "./workspace-legacy-migrations";
import { seedDatabase } from "./workspace-seed";
import {
  BetterSqlite3,
  escapeIdentifier,
  isSafeIdentifier,
  isSupportedColumnType,
  type SqliteDatabase
} from "./workspace-sqlite";

declare global {
  var __openPolisDb: SqliteDatabase | undefined;
}

function ensureColumn(
  database: SqliteDatabase,
  table: string,
  definition: string
) {
  const [columnName, columnType, ...unexpected] = definition.trim().split(/\s+/);

  if (
    !isSafeIdentifier(table) ||
    !isSafeIdentifier(columnName) ||
    unexpected.length > 0 ||
    !isSupportedColumnType(columnType)
  ) {
    throw new Error(`Unsafe column migration: ${table}.${definition}`);
  }

  const columns = database
    .prepare(`PRAGMA table_info(${escapeIdentifier(table)})`)
    .all() as Array<{
      name: string;
    }>;

  if (columns.some((column) => column.name === columnName)) {
    return;
  }

  database.exec(
    `ALTER TABLE ${escapeIdentifier(table)} ADD COLUMN ${escapeIdentifier(columnName)} ${columnType}`
  );
}

function backfillUpdatedAtFromDueDate(
  database: SqliteDatabase,
  table: "briefs" | "tasks" | "reviews"
) {
  database.exec(`
    UPDATE ${escapeIdentifier(table)}
    SET "updated_at" = "due_date"
    WHERE "updated_at" IS NULL OR "updated_at" = ''
  `);
}

function ensureIndexes(database: SqliteDatabase) {
  const statements = [
    "CREATE INDEX IF NOT EXISTS idx_workflow_objects_code ON workflow_objects(object_code)",
    "CREATE INDEX IF NOT EXISTS idx_audit_log_subject_id ON audit_log(subject_id)",
    "CREATE INDEX IF NOT EXISTS idx_issues_owner_team ON issues(owner_team)",
    "CREATE INDEX IF NOT EXISTS idx_issues_region_code ON issues(region_code)",
    "CREATE INDEX IF NOT EXISTS idx_issues_sensitivity ON issues(sensitivity)",
    "CREATE INDEX IF NOT EXISTS idx_issues_updated_at ON issues(updated_at)",
    "CREATE INDEX IF NOT EXISTS idx_briefs_issue_id ON briefs(issue_id)",
    "CREATE INDEX IF NOT EXISTS idx_briefs_owner_team ON briefs(owner_team)",
    "CREATE INDEX IF NOT EXISTS idx_briefs_sensitivity ON briefs(sensitivity)",
    "CREATE INDEX IF NOT EXISTS idx_briefs_due_date ON briefs(due_date)",
    "CREATE INDEX IF NOT EXISTS idx_assets_issue_id ON assets(issue_id)",
    "CREATE INDEX IF NOT EXISTS idx_assets_brief_id ON assets(brief_id)",
    "CREATE INDEX IF NOT EXISTS idx_assets_approval_id ON assets(approval_id)",
    "CREATE INDEX IF NOT EXISTS idx_assets_owner_team ON assets(owner_team)",
    "CREATE INDEX IF NOT EXISTS idx_assets_sensitivity ON assets(sensitivity)",
    "CREATE INDEX IF NOT EXISTS idx_assets_updated_at ON assets(updated_at)",
    "CREATE INDEX IF NOT EXISTS idx_tasks_issue_id ON tasks(issue_id)",
    "CREATE INDEX IF NOT EXISTS idx_tasks_brief_id ON tasks(brief_id)",
    "CREATE INDEX IF NOT EXISTS idx_tasks_owner_team ON tasks(owner_team)",
    "CREATE INDEX IF NOT EXISTS idx_tasks_assignee_team ON tasks(assignee_team)",
    "CREATE INDEX IF NOT EXISTS idx_tasks_region_code ON tasks(region_code)",
    "CREATE INDEX IF NOT EXISTS idx_tasks_sensitivity ON tasks(sensitivity)",
    "CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date)",
    "CREATE INDEX IF NOT EXISTS idx_feedback_issue_id ON feedback(issue_id)",
    "CREATE INDEX IF NOT EXISTS idx_feedback_task_id ON feedback(task_id)",
    "CREATE INDEX IF NOT EXISTS idx_feedback_owner_team ON feedback(owner_team)",
    "CREATE INDEX IF NOT EXISTS idx_feedback_region_code ON feedback(region_code)",
    "CREATE INDEX IF NOT EXISTS idx_feedback_sensitivity ON feedback(sensitivity)",
    "CREATE INDEX IF NOT EXISTS idx_feedback_updated_at ON feedback(updated_at)",
    "CREATE INDEX IF NOT EXISTS idx_reviews_subject_id ON reviews(subject_id)",
    "CREATE INDEX IF NOT EXISTS idx_reviews_owner_team ON reviews(owner_team)",
    "CREATE INDEX IF NOT EXISTS idx_reviews_requested_by_team ON reviews(requested_by_team)",
    "CREATE INDEX IF NOT EXISTS idx_reviews_sensitivity ON reviews(sensitivity)",
    "CREATE INDEX IF NOT EXISTS idx_reviews_due_date ON reviews(due_date)"
  ];

  for (const statement of statements) {
    database.exec(statement);
  }
}

function createDatabase() {
  const dataDir = join(process.cwd(), "data");
  const databasePath = join(dataDir, "openpolis.sqlite");

  mkdirSync(dataDir, { recursive: true });

  const database = new BetterSqlite3(databasePath);
  database.exec("PRAGMA foreign_keys = ON");

  database.exec(`
    CREATE TABLE IF NOT EXISTS workflow_objects (
      object_id TEXT PRIMARY KEY,
      object_type TEXT NOT NULL,
      object_code TEXT NOT NULL,
      payload TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS audit_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      action TEXT NOT NULL,
      occurred_at TEXT NOT NULL,
      actor_type TEXT NOT NULL,
      actor_id TEXT NOT NULL,
      subject_type TEXT NOT NULL,
      subject_id TEXT NOT NULL,
      subject_code TEXT,
      metadata TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS issues (
      id TEXT PRIMARY KEY,
      code TEXT NOT NULL UNIQUE,
      title TEXT,
      summary TEXT,
      kind TEXT,
      status TEXT NOT NULL,
      priority TEXT NOT NULL,
      owner_team TEXT NOT NULL,
      primary_region_id TEXT,
      target_team_ids TEXT,
      target_region_ids TEXT,
      audience_tags TEXT,
      key_messages TEXT,
      risk_notes TEXT,
      linked_brief_ids TEXT,
      linked_asset_ids TEXT,
      sensitivity TEXT,
      updated_at TEXT NOT NULL,
      region_code TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS assets (
      id TEXT PRIMARY KEY,
      code TEXT NOT NULL UNIQUE,
      title TEXT,
      summary TEXT,
      status TEXT NOT NULL,
      issue_code TEXT NOT NULL,
      kind TEXT,
      source TEXT,
      issue_id TEXT REFERENCES issues(id),
      brief_id TEXT REFERENCES briefs(id),
      approval_id TEXT REFERENCES reviews(id),
      owner_team TEXT,
      locale TEXT,
      scope_team_ids TEXT,
      scope_region_ids TEXT,
      version_label TEXT,
      sensitivity TEXT,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS briefs (
      id TEXT PRIMARY KEY,
      code TEXT NOT NULL UNIQUE,
      title TEXT,
      summary TEXT,
      goal TEXT,
      issue_id TEXT REFERENCES issues(id),
      status TEXT NOT NULL,
      owner_team TEXT NOT NULL,
      target_team_ids TEXT,
      target_region_ids TEXT,
      output_kinds TEXT,
      approval_required INTEGER,
      linked_task_ids TEXT,
      sensitivity TEXT,
      due_date TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      code TEXT NOT NULL UNIQUE,
      title TEXT,
      summary TEXT,
      status TEXT NOT NULL,
      priority TEXT NOT NULL,
      owner_team TEXT NOT NULL,
      assignee_team TEXT,
      issue_id TEXT REFERENCES issues(id),
      brief_id TEXT REFERENCES briefs(id),
      workflow_step TEXT,
      sensitivity TEXT,
      due_date TEXT NOT NULL,
      region_code TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS regions (
      id TEXT PRIMARY KEY,
      code TEXT NOT NULL UNIQUE,
      status TEXT NOT NULL,
      completion_rate REAL NOT NULL,
      blocked_count INTEGER NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      code TEXT NOT NULL UNIQUE,
      title TEXT,
      summary TEXT,
      status TEXT NOT NULL,
      region_code TEXT NOT NULL,
      starts_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS feedback (
      id TEXT PRIMARY KEY,
      code TEXT NOT NULL UNIQUE,
      title TEXT,
      summary TEXT,
      status TEXT NOT NULL,
      severity TEXT NOT NULL,
      source TEXT,
      issue_id TEXT REFERENCES issues(id),
      task_id TEXT REFERENCES tasks(id),
      owner_team TEXT,
      sensitivity TEXT,
      region_code TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      code TEXT NOT NULL UNIQUE,
      title TEXT,
      summary TEXT,
      status TEXT NOT NULL,
      owner_team TEXT NOT NULL,
      subject_type TEXT,
      subject_id TEXT,
      subject_code TEXT,
      requested_by_team TEXT,
      checklist TEXT,
      latest_comment TEXT,
      sensitivity TEXT,
      due_date TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS reports (
      id TEXT PRIMARY KEY,
      code TEXT NOT NULL UNIQUE,
      title TEXT,
      summary TEXT,
      status TEXT NOT NULL,
      kind TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS skills (
      id TEXT PRIMARY KEY,
      code TEXT NOT NULL UNIQUE,
      title TEXT,
      summary TEXT,
      status TEXT NOT NULL,
      scope TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS providers (
      id TEXT PRIMARY KEY,
      code TEXT NOT NULL UNIQUE,
      title TEXT,
      summary TEXT,
      status TEXT NOT NULL,
      kind TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  ensureColumn(database, "issues", "title TEXT");
  ensureColumn(database, "issues", "summary TEXT");
  ensureColumn(database, "issues", "kind TEXT");
  ensureColumn(database, "issues", "primary_region_id TEXT");
  ensureColumn(database, "issues", "target_team_ids TEXT");
  ensureColumn(database, "issues", "target_region_ids TEXT");
  ensureColumn(database, "issues", "audience_tags TEXT");
  ensureColumn(database, "issues", "key_messages TEXT");
  ensureColumn(database, "issues", "risk_notes TEXT");
  ensureColumn(database, "issues", "linked_brief_ids TEXT");
  ensureColumn(database, "issues", "linked_asset_ids TEXT");
  ensureColumn(database, "issues", "sensitivity TEXT");
  ensureColumn(database, "assets", "title TEXT");
  ensureColumn(database, "assets", "summary TEXT");
  ensureColumn(database, "assets", "kind TEXT");
  ensureColumn(database, "assets", "source TEXT");
  ensureColumn(database, "assets", "issue_id TEXT");
  ensureColumn(database, "assets", "brief_id TEXT");
  ensureColumn(database, "assets", "approval_id TEXT");
  ensureColumn(database, "assets", "owner_team TEXT");
  ensureColumn(database, "assets", "locale TEXT");
  ensureColumn(database, "assets", "scope_team_ids TEXT");
  ensureColumn(database, "assets", "scope_region_ids TEXT");
  ensureColumn(database, "assets", "version_label TEXT");
  ensureColumn(database, "assets", "sensitivity TEXT");
  ensureColumn(database, "briefs", "title TEXT");
  ensureColumn(database, "briefs", "summary TEXT");
  ensureColumn(database, "briefs", "goal TEXT");
  ensureColumn(database, "briefs", "issue_id TEXT");
  ensureColumn(database, "briefs", "target_team_ids TEXT");
  ensureColumn(database, "briefs", "target_region_ids TEXT");
  ensureColumn(database, "briefs", "output_kinds TEXT");
  ensureColumn(database, "briefs", "approval_required INTEGER");
  ensureColumn(database, "briefs", "linked_task_ids TEXT");
  ensureColumn(database, "briefs", "sensitivity TEXT");
  ensureColumn(database, "briefs", "updated_at TEXT");
  ensureColumn(database, "tasks", "title TEXT");
  ensureColumn(database, "tasks", "summary TEXT");
  ensureColumn(database, "tasks", "assignee_team TEXT");
  ensureColumn(database, "tasks", "issue_id TEXT");
  ensureColumn(database, "tasks", "brief_id TEXT");
  ensureColumn(database, "tasks", "workflow_step TEXT");
  ensureColumn(database, "tasks", "sensitivity TEXT");
  ensureColumn(database, "tasks", "updated_at TEXT");
  ensureColumn(database, "events", "title TEXT");
  ensureColumn(database, "events", "summary TEXT");
  ensureColumn(database, "feedback", "title TEXT");
  ensureColumn(database, "feedback", "summary TEXT");
  ensureColumn(database, "feedback", "source TEXT");
  ensureColumn(database, "feedback", "issue_id TEXT");
  ensureColumn(database, "feedback", "task_id TEXT");
  ensureColumn(database, "feedback", "owner_team TEXT");
  ensureColumn(database, "feedback", "sensitivity TEXT");
  ensureColumn(database, "reviews", "title TEXT");
  ensureColumn(database, "reviews", "summary TEXT");
  ensureColumn(database, "reviews", "subject_type TEXT");
  ensureColumn(database, "reviews", "subject_id TEXT");
  ensureColumn(database, "reviews", "subject_code TEXT");
  ensureColumn(database, "reviews", "requested_by_team TEXT");
  ensureColumn(database, "reviews", "checklist TEXT");
  ensureColumn(database, "reviews", "latest_comment TEXT");
  ensureColumn(database, "reviews", "sensitivity TEXT");
  ensureColumn(database, "reviews", "updated_at TEXT");
  ensureColumn(database, "reports", "title TEXT");
  ensureColumn(database, "reports", "summary TEXT");
  ensureColumn(database, "skills", "title TEXT");
  ensureColumn(database, "skills", "summary TEXT");
  ensureColumn(database, "providers", "title TEXT");
  ensureColumn(database, "providers", "summary TEXT");
  backfillUpdatedAtFromDueDate(database, "briefs");
  backfillUpdatedAtFromDueDate(database, "tasks");
  backfillUpdatedAtFromDueDate(database, "reviews");
  ensureLegacyForeignKeys(database);
  ensureIndexes(database);
  seedDatabase(database);

  return database;
}

export function getDatabase() {
  if (!globalThis.__openPolisDb) {
    globalThis.__openPolisDb = createDatabase();
  }

  return globalThis.__openPolisDb;
}
