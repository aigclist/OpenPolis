import type { SqliteDatabase, SqliteForeignKeyRow } from "./workspace-sqlite";
import { escapeIdentifier } from "./workspace-sqlite";

type ForeignKeyExpectation = {
  from: string;
  table: string;
  to: string;
};

type LegacyForeignKeyMigration = {
  table: string;
  columns: string[];
  selectSql: string;
  expectedForeignKeys: ForeignKeyExpectation[];
  createTableSql: (tableName: string) => string;
};

function createBriefsTableSql(tableName: string) {
  return `
    CREATE TABLE ${escapeIdentifier(tableName)} (
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
      updated_at TEXT NOT NULL
    )
  `;
}

function createAssetsTableSql(tableName: string) {
  return `
    CREATE TABLE ${escapeIdentifier(tableName)} (
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
    )
  `;
}

function createTasksTableSql(tableName: string) {
  return `
    CREATE TABLE ${escapeIdentifier(tableName)} (
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
      updated_at TEXT NOT NULL
    )
  `;
}

function createFeedbackTableSql(tableName: string) {
  return `
    CREATE TABLE ${escapeIdentifier(tableName)} (
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
    )
  `;
}

const legacyForeignKeyMigrations: LegacyForeignKeyMigration[] = [
  {
    table: "briefs",
    columns: [
      "id",
      "code",
      "title",
      "summary",
      "goal",
      "issue_id",
      "status",
      "owner_team",
      "target_team_ids",
      "target_region_ids",
      "output_kinds",
      "approval_required",
      "linked_task_ids",
      "sensitivity",
      "due_date",
      "updated_at"
    ],
    selectSql: `
      id,
      code,
      title,
      summary,
      goal,
      CASE
        WHEN issue_id IS NULL OR EXISTS (SELECT 1 FROM issues WHERE id = issue_id) THEN issue_id
        ELSE NULL
      END,
      status,
      owner_team,
      target_team_ids,
      target_region_ids,
      output_kinds,
      approval_required,
      linked_task_ids,
      sensitivity,
      due_date,
      COALESCE(NULLIF(updated_at, ''), due_date)
    `,
    expectedForeignKeys: [{ from: "issue_id", table: "issues", to: "id" }],
    createTableSql: createBriefsTableSql
  },
  {
    table: "assets",
    columns: [
      "id",
      "code",
      "title",
      "summary",
      "status",
      "issue_code",
      "kind",
      "source",
      "issue_id",
      "brief_id",
      "approval_id",
      "owner_team",
      "locale",
      "scope_team_ids",
      "scope_region_ids",
      "version_label",
      "sensitivity",
      "updated_at"
    ],
    selectSql: `
      id,
      code,
      title,
      summary,
      status,
      issue_code,
      kind,
      source,
      CASE
        WHEN issue_id IS NULL OR EXISTS (SELECT 1 FROM issues WHERE id = issue_id) THEN issue_id
        ELSE NULL
      END,
      CASE
        WHEN brief_id IS NULL OR EXISTS (SELECT 1 FROM briefs WHERE id = brief_id) THEN brief_id
        ELSE NULL
      END,
      CASE
        WHEN approval_id IS NULL OR EXISTS (SELECT 1 FROM reviews WHERE id = approval_id) THEN approval_id
        ELSE NULL
      END,
      owner_team,
      locale,
      scope_team_ids,
      scope_region_ids,
      version_label,
      sensitivity,
      updated_at
    `,
    expectedForeignKeys: [
      { from: "issue_id", table: "issues", to: "id" },
      { from: "brief_id", table: "briefs", to: "id" },
      { from: "approval_id", table: "reviews", to: "id" }
    ],
    createTableSql: createAssetsTableSql
  },
  {
    table: "tasks",
    columns: [
      "id",
      "code",
      "title",
      "summary",
      "status",
      "priority",
      "owner_team",
      "assignee_team",
      "issue_id",
      "brief_id",
      "workflow_step",
      "sensitivity",
      "due_date",
      "region_code",
      "updated_at"
    ],
    selectSql: `
      id,
      code,
      title,
      summary,
      status,
      priority,
      owner_team,
      assignee_team,
      CASE
        WHEN issue_id IS NULL OR EXISTS (SELECT 1 FROM issues WHERE id = issue_id) THEN issue_id
        ELSE NULL
      END,
      CASE
        WHEN brief_id IS NULL OR EXISTS (SELECT 1 FROM briefs WHERE id = brief_id) THEN brief_id
        ELSE NULL
      END,
      workflow_step,
      sensitivity,
      due_date,
      region_code,
      COALESCE(NULLIF(updated_at, ''), due_date)
    `,
    expectedForeignKeys: [
      { from: "issue_id", table: "issues", to: "id" },
      { from: "brief_id", table: "briefs", to: "id" }
    ],
    createTableSql: createTasksTableSql
  },
  {
    table: "feedback",
    columns: [
      "id",
      "code",
      "title",
      "summary",
      "status",
      "severity",
      "source",
      "issue_id",
      "task_id",
      "owner_team",
      "sensitivity",
      "region_code",
      "updated_at"
    ],
    selectSql: `
      id,
      code,
      title,
      summary,
      status,
      severity,
      source,
      CASE
        WHEN issue_id IS NULL OR EXISTS (SELECT 1 FROM issues WHERE id = issue_id) THEN issue_id
        ELSE NULL
      END,
      CASE
        WHEN task_id IS NULL OR EXISTS (SELECT 1 FROM tasks WHERE id = task_id) THEN task_id
        ELSE NULL
      END,
      owner_team,
      sensitivity,
      region_code,
      updated_at
    `,
    expectedForeignKeys: [
      { from: "issue_id", table: "issues", to: "id" },
      { from: "task_id", table: "tasks", to: "id" }
    ],
    createTableSql: createFeedbackTableSql
  }
];

function hasExpectedForeignKeys(
  database: SqliteDatabase,
  migration: LegacyForeignKeyMigration
) {
  const foreignKeys = database
    .prepare(`PRAGMA foreign_key_list(${escapeIdentifier(migration.table)})`)
    .all() as SqliteForeignKeyRow[];

  return migration.expectedForeignKeys.every((expectedForeignKey) =>
    foreignKeys.some(
      (foreignKey) =>
        foreignKey.from === expectedForeignKey.from &&
        foreignKey.table === expectedForeignKey.table &&
        foreignKey.to === expectedForeignKey.to
    )
  );
}

function rebuildTableWithForeignKeys(
  database: SqliteDatabase,
  migration: LegacyForeignKeyMigration
) {
  const tempTable = `__openpolis_${migration.table}_migration`;
  const targetColumns = migration.columns.map(escapeIdentifier).join(", ");

  database.exec("PRAGMA foreign_keys = OFF");
  database.exec("BEGIN IMMEDIATE");

  try {
    database.exec(migration.createTableSql(tempTable));
    database.exec(`
      INSERT INTO ${escapeIdentifier(tempTable)} (${targetColumns})
      SELECT ${migration.selectSql}
      FROM ${escapeIdentifier(migration.table)}
    `);
    database.exec(`DROP TABLE ${escapeIdentifier(migration.table)}`);
    database.exec(
      `ALTER TABLE ${escapeIdentifier(tempTable)} RENAME TO ${escapeIdentifier(migration.table)}`
    );
    database.exec("COMMIT");
  } catch (error) {
    database.exec("ROLLBACK");
    throw error;
  } finally {
    database.exec("PRAGMA foreign_keys = ON");
  }
}

export function ensureLegacyForeignKeys(database: SqliteDatabase) {
  for (const migration of legacyForeignKeyMigrations) {
    if (hasExpectedForeignKeys(database, migration)) {
      continue;
    }

    rebuildTableWithForeignKeys(database, migration);
  }
}
