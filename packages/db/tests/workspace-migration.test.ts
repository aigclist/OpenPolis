import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, rmSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

type LegacyStatement = {
  get(...parameters: unknown[]): unknown;
  all(...parameters: unknown[]): unknown[];
};

type LegacyDatabase = {
  exec(sql: string): void;
  prepare(sql: string): LegacyStatement;
  close(): void;
};

type GlobalDbState = typeof globalThis & {
  __openPolisDb?: {
    close?: () => void;
  };
  __openPolisDrizzle?: unknown;
};

const require = createRequire(import.meta.url);
const BetterSqlite3 = require("better-sqlite3") as new (
  path: string
) => LegacyDatabase;

test("workspace bootstrapping migrates legacy tables to foreign-key-safe schemas", async () => {
  const tempDir = mkdtempSync(join(tmpdir(), "openpolis-workspace-migration-"));
  const originalCwd = process.cwd();

  try {
    process.chdir(tempDir);
    mkdirSync(join(tempDir, "data"), { recursive: true });

    const legacyDatabase = new BetterSqlite3(
      join(tempDir, "data", "openpolis.sqlite")
    );

    legacyDatabase.exec(`
      PRAGMA foreign_keys = OFF;

      CREATE TABLE issues (
        id TEXT PRIMARY KEY,
        code TEXT NOT NULL UNIQUE,
        status TEXT NOT NULL,
        priority TEXT NOT NULL,
        owner_team TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        region_code TEXT NOT NULL
      );

      CREATE TABLE briefs (
        id TEXT PRIMARY KEY,
        code TEXT NOT NULL UNIQUE,
        status TEXT NOT NULL,
        owner_team TEXT NOT NULL,
        due_date TEXT NOT NULL,
        issue_id TEXT
      );

      CREATE TABLE reviews (
        id TEXT PRIMARY KEY,
        code TEXT NOT NULL UNIQUE,
        status TEXT NOT NULL,
        owner_team TEXT NOT NULL,
        due_date TEXT NOT NULL
      );

      CREATE TABLE assets (
        id TEXT PRIMARY KEY,
        code TEXT NOT NULL UNIQUE,
        status TEXT NOT NULL,
        issue_code TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        issue_id TEXT,
        brief_id TEXT,
        approval_id TEXT
      );

      CREATE TABLE tasks (
        id TEXT PRIMARY KEY,
        code TEXT NOT NULL UNIQUE,
        status TEXT NOT NULL,
        priority TEXT NOT NULL,
        owner_team TEXT NOT NULL,
        due_date TEXT NOT NULL,
        region_code TEXT NOT NULL,
        issue_id TEXT,
        brief_id TEXT
      );

      CREATE TABLE feedback (
        id TEXT PRIMARY KEY,
        code TEXT NOT NULL UNIQUE,
        status TEXT NOT NULL,
        severity TEXT NOT NULL,
        region_code TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        issue_id TEXT,
        task_id TEXT
      );

      INSERT INTO issues (id, code, status, priority, owner_team, updated_at, region_code)
      VALUES ('issue_valid', 'valid_issue', 'active', 'high', 'team_central_ops', '2026-03-19T09:00:00.000Z', 'north_network');

      INSERT INTO briefs (id, code, status, owner_team, due_date, issue_id)
      VALUES ('brief_orphan', 'orphan_brief', 'queued', 'team_central_ops', '2026-03-20T09:00:00.000Z', 'issue_missing');

      INSERT INTO reviews (id, code, status, owner_team, due_date)
      VALUES ('approval_valid', 'approval_valid', 'approved', 'team_review', '2026-03-20T09:00:00.000Z');

      INSERT INTO assets (id, code, status, issue_code, updated_at, issue_id, brief_id, approval_id)
      VALUES ('asset_orphan', 'orphan_asset', 'draft', 'unlinked', '2026-03-19T09:00:00.000Z', 'issue_missing', 'brief_missing', 'approval_missing');

      INSERT INTO tasks (id, code, status, priority, owner_team, due_date, region_code, issue_id, brief_id)
      VALUES ('task_orphan', 'orphan_task', 'active', 'high', 'team_central_ops', '2026-03-20T09:00:00.000Z', 'north_network', 'issue_missing', 'brief_missing');

      INSERT INTO feedback (id, code, status, severity, region_code, updated_at, issue_id, task_id)
      VALUES ('feedback_orphan', 'orphan_feedback', 'active', 'high', 'north_network', '2026-03-19T09:00:00.000Z', 'issue_missing', 'task_missing');
    `);

    legacyDatabase.close();

    const { getDatabase } = await import("@openpolis/db/workspace");
    const migratedDatabase = getDatabase();

    const briefsForeignKeys = migratedDatabase
      .prepare('PRAGMA foreign_key_list("briefs")')
      .all() as Array<{ from: string; table: string; to: string }>;
    const assetsForeignKeys = migratedDatabase
      .prepare('PRAGMA foreign_key_list("assets")')
      .all() as Array<{ from: string; table: string; to: string }>;
    const tasksForeignKeys = migratedDatabase
      .prepare('PRAGMA foreign_key_list("tasks")')
      .all() as Array<{ from: string; table: string; to: string }>;
    const feedbackForeignKeys = migratedDatabase
      .prepare('PRAGMA foreign_key_list("feedback")')
      .all() as Array<{ from: string; table: string; to: string }>;

    assert.ok(
      briefsForeignKeys.some(
        (foreignKey) =>
          foreignKey.from === "issue_id" &&
          foreignKey.table === "issues" &&
          foreignKey.to === "id"
      )
    );
    assert.ok(
      assetsForeignKeys.some(
        (foreignKey) =>
          foreignKey.from === "issue_id" &&
          foreignKey.table === "issues" &&
          foreignKey.to === "id"
      )
    );
    assert.ok(
      assetsForeignKeys.some(
        (foreignKey) =>
          foreignKey.from === "brief_id" &&
          foreignKey.table === "briefs" &&
          foreignKey.to === "id"
      )
    );
    assert.ok(
      tasksForeignKeys.some(
        (foreignKey) =>
          foreignKey.from === "brief_id" &&
          foreignKey.table === "briefs" &&
          foreignKey.to === "id"
      )
    );
    assert.ok(
      feedbackForeignKeys.some(
        (foreignKey) =>
          foreignKey.from === "task_id" &&
          foreignKey.table === "tasks" &&
          foreignKey.to === "id"
      )
    );

    const migratedBrief = migratedDatabase
      .prepare('SELECT issue_id AS issueId FROM briefs WHERE id = ?')
      .get("brief_orphan") as { issueId: string | null } | undefined;
    const migratedAsset = migratedDatabase
      .prepare(
        "SELECT issue_id AS issueId, brief_id AS briefId, approval_id AS approvalId FROM assets WHERE id = ?"
      )
      .get("asset_orphan") as
      | {
          issueId: string | null;
          briefId: string | null;
          approvalId: string | null;
        }
      | undefined;
    const migratedTask = migratedDatabase
      .prepare("SELECT issue_id AS issueId, brief_id AS briefId FROM tasks WHERE id = ?")
      .get("task_orphan") as
      | {
          issueId: string | null;
          briefId: string | null;
        }
      | undefined;
    const migratedFeedback = migratedDatabase
      .prepare("SELECT issue_id AS issueId, task_id AS taskId FROM feedback WHERE id = ?")
      .get("feedback_orphan") as
      | {
          issueId: string | null;
          taskId: string | null;
        }
      | undefined;
    const migratedBriefTimestamps = migratedDatabase
      .prepare("SELECT due_date AS dueDate, updated_at AS updatedAt FROM briefs WHERE id = ?")
      .get("brief_orphan") as
      | {
          dueDate: string;
          updatedAt: string;
        }
      | undefined;
    const migratedTaskTimestamps = migratedDatabase
      .prepare("SELECT due_date AS dueDate, updated_at AS updatedAt FROM tasks WHERE id = ?")
      .get("task_orphan") as
      | {
          dueDate: string;
          updatedAt: string;
        }
      | undefined;
    const migratedReviewTimestamps = migratedDatabase
      .prepare("SELECT due_date AS dueDate, updated_at AS updatedAt FROM reviews WHERE id = ?")
      .get("approval_valid") as
      | {
          dueDate: string;
          updatedAt: string;
        }
      | undefined;

    assert.ok(migratedBrief);
    assert.equal(migratedBrief.issueId, null);

    assert.ok(migratedAsset);
    assert.equal(migratedAsset.issueId, null);
    assert.equal(migratedAsset.briefId, null);
    assert.equal(migratedAsset.approvalId, null);

    assert.ok(migratedTask);
    assert.equal(migratedTask.issueId, null);
    assert.equal(migratedTask.briefId, null);

    assert.ok(migratedFeedback);
    assert.equal(migratedFeedback.issueId, null);
    assert.equal(migratedFeedback.taskId, null);

    assert.ok(migratedBriefTimestamps);
    assert.equal(migratedBriefTimestamps.updatedAt, migratedBriefTimestamps.dueDate);

    assert.ok(migratedTaskTimestamps);
    assert.equal(migratedTaskTimestamps.updatedAt, migratedTaskTimestamps.dueDate);

    assert.ok(migratedReviewTimestamps);
    assert.equal(migratedReviewTimestamps.updatedAt, migratedReviewTimestamps.dueDate);
  } finally {
    const globalDbState = globalThis as GlobalDbState;
    globalDbState.__openPolisDb?.close?.();
    globalDbState.__openPolisDb = undefined;
    globalDbState.__openPolisDrizzle = undefined;
    process.chdir(originalCwd);
    rmSync(tempDir, { recursive: true, force: true });
  }
});
