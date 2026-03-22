import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import { filterModuleSnapshotForActor } from "../src/server/workspace/read-governance";

type GlobalDbState = typeof globalThis & {
  __openPolisDb?: {
    close?: () => void;
    prepare: (
      sql: string
    ) => {
      get: (...parameters: unknown[]) => unknown;
      run: (...parameters: unknown[]) => unknown;
    };
  };
  __openPolisDrizzle?: unknown;
};

function parseStringArray(value: unknown) {
  if (typeof value !== "string") {
    return [];
  }

  return JSON.parse(value) as string[];
}

function assertTimestampWithinRange(
  value: string | null | undefined,
  minimum: number,
  maximum: number
) {
  assert.ok(value);

  const timestamp = Date.parse(value);
  assert.ok(Number.isFinite(timestamp));
  assert.ok(timestamp >= minimum);
  assert.ok(timestamp <= maximum);
}

test("workflow commands update read snapshots through SQLite projections", async () => {
  const tempDir = mkdtempSync(join(tmpdir(), "openpolis-workflow-"));
  const originalCwd = process.cwd();

  try {
    process.chdir(tempDir);

    const { getWorkspaceCommandService } = await import("@openpolis/db/workflow");
    const { getDatabase, getWorkspaceReadService } = await import(
      "@openpolis/db/workspace"
    );

    const commandService = getWorkspaceCommandService();
    const readService = getWorkspaceReadService();
    const database = getDatabase();
    const timestampSeed = Date.now().toString(36);
    const issueCode = `issue_smoke_${timestampSeed}`;
    const briefCode = `brief_smoke_${timestampSeed}`;
    const assetCode = `asset_smoke_${timestampSeed}`;
    const approvalCode = `approval_smoke_${timestampSeed}`;
    const taskCode = `task_smoke_${timestampSeed}`;
    const feedbackCode = `feedback_smoke_${timestampSeed}`;
    const issueId = `issue_${issueCode}`;
    const briefId = `brief_${briefCode}`;
    const assetId = `asset_${assetCode}`;
    const taskId = `task_${taskCode}`;
    const context = {
      actor: {
        actorType: "human" as const,
        actorId: "operator_smoke",
        teamId: "team_central_ops",
        regionId: "north_network"
      },
      requestId: `req_${timestampSeed}`,
      reason: "workflow_smoke_test"
    };
    const scope = {
      teamIds: ["team_central_ops"],
      regionIds: ["north_network"]
    };
    const deleteStoredObject = (objectId: string) => {
      database
        .prepare("DELETE FROM workflow_objects WHERE object_id = ?")
        .run(objectId);
    };
    const auditWindowStart = Date.now();

    await commandService.createIssue(context, {
      code: issueCode,
      title: "Smoke Issue",
      summary: "Smoke issue summary",
      kind: "response",
      priority: "high",
      ownerTeamId: "team_central_ops",
      primaryRegionId: "north_network",
      targetScope: scope,
      audienceTags: [],
      sensitivity: "internal"
    });
    deleteStoredObject(issueId);

    await commandService.createBrief(context, {
      code: briefCode,
      title: "Smoke Brief",
      summary: "Smoke brief summary",
      goal: "Smoke brief goal",
      issueId,
      ownerTeamId: "team_central_ops",
      targetScope: scope,
      outputKinds: ["briefing_note"],
      dueAt: "2026-03-22T09:00:00.000Z",
      approvalRequired: true,
      sensitivity: "internal"
    });
    deleteStoredObject(issueId);

    await commandService.createAssetDraft(context, {
      code: assetCode,
      title: "Smoke Asset",
      summary: "Smoke asset summary",
      kind: "template",
      source: "human",
      issueId,
      briefId,
      ownerTeamId: "team_central_ops",
      locale: "en",
      intendedScope: scope,
      versionLabel: "v1",
      sensitivity: "internal"
    });
    deleteStoredObject(assetId);

    const approvalResult = await commandService.submitApproval(context, {
      code: approvalCode,
      title: "Smoke Approval",
      subject: {
        objectType: "asset",
        objectId: assetId,
        objectCode: assetCode
      },
      requestedByTeamId: "team_central_ops",
      reviewerTeamId: "team_review",
      dueAt: "2026-03-21T09:00:00.000Z",
      checklist: ["message_consistency", "human_review_required"],
      sensitivity: "internal"
    });
    deleteStoredObject(approvalResult.entity.id);
    deleteStoredObject(assetId);

    await commandService.respondToApproval(context, {
      approvalId: approvalResult.entity.id,
      decision: "approved",
      comment: "smoke_approved"
    });
    deleteStoredObject(briefId);

    await commandService.createTask(context, {
      code: taskCode,
      title: "Smoke Task",
      summary: "Smoke task summary",
      ownerTeamId: "team_central_ops",
      assigneeTeamId: "team_field_ops",
      regionId: "north_network",
      briefId,
      issueId,
      priority: "critical",
      dueAt: "2026-03-23T09:00:00.000Z",
      workflowStep: "queued_execution",
      sensitivity: "internal"
    });

    await commandService.createFeedback(context, {
      code: feedbackCode,
      title: "Smoke Feedback",
      summary: "Smoke feedback summary",
      severity: "critical",
      source: "internal",
      issueId,
      taskId,
      regionId: "north_network",
      ownerTeamId: "team_central_ops",
      sensitivity: "internal"
    });
    const auditWindowEnd = Date.now();

    const issuesSnapshot = readService.getCoreModuleSnapshot("issues");
    const pagedIssuesSnapshot = readService.getCoreModuleSnapshot("issues", {
      page: 1,
      pageSize: 2
    });
    const assetsSnapshot = readService.getCoreModuleSnapshot("assets");
    const briefsSnapshot = readService.getCoreModuleSnapshot("briefs");
    const reviewSnapshot = readService.getCoreModuleSnapshot("review");
    const operationsSnapshot = readService.getCoreModuleSnapshot("operations");
    const feedbackSnapshot = readService.getCoreModuleSnapshot("feedback");
    const reportsSnapshot = readService.getCoreModuleSnapshot("reports");
    const regionalActor = {
      actorType: "human" as const,
      actorId: "regional_manager_smoke",
      role: "regional_manager" as const,
      teamId: "team_region_north",
      regionId: "north_network"
    };
    const viewerActor = {
      actorType: "human" as const,
      actorId: "viewer_smoke",
      role: "viewer" as const
    };
    const actorScopedOperationsSnapshot = readService.getCoreModuleSnapshotForActor(
      "operations",
      regionalActor,
      {
        page: 1,
        pageSize: 2
      }
    );
    const actorScopedReportsSnapshot = readService.getCoreModuleSnapshotForActor(
      "reports",
      viewerActor
    );

    const createdIssue = issuesSnapshot.records.find((row) => row.code === issueCode);
    const createdBrief = briefsSnapshot.records.find((row) => row.code === briefCode);
    const createdAsset = assetsSnapshot.records.find((row) => row.code === assetCode);
    const createdApproval = reviewSnapshot.records.find(
      (row) => row.code === approvalCode
    );
    const createdTask = operationsSnapshot.records.find((row) => row.code === taskCode);
    const createdFeedback = feedbackSnapshot.records.find(
      (row) => row.code === feedbackCode
    );

    assert.ok(pagedIssuesSnapshot.pagination);
    assert.equal(pagedIssuesSnapshot.pagination.page, 1);
    assert.equal(pagedIssuesSnapshot.pagination.pageSize, 2);
    assert.equal(
      pagedIssuesSnapshot.pagination.totalCount,
      issuesSnapshot.records.length
    );
    assert.equal(
      pagedIssuesSnapshot.records.length,
      Math.min(2, issuesSnapshot.records.length)
    );

    const expectedRegionalOperations = filterModuleSnapshotForActor(
      regionalActor,
      "operations",
      operationsSnapshot
    );
    const expectedViewerReports = filterModuleSnapshotForActor(
      viewerActor,
      "reports",
      reportsSnapshot
    );

    assert.deepEqual(
      actorScopedOperationsSnapshot.records.map((row) => row.code),
      expectedRegionalOperations.records.slice(0, 2).map((row) => row.code)
    );
    assert.deepEqual(
      actorScopedOperationsSnapshot.metrics,
      expectedRegionalOperations.metrics
    );
    assert.deepEqual(actorScopedOperationsSnapshot.pagination, {
      page: 1,
      pageSize: 2,
      totalCount: expectedRegionalOperations.records.length,
      totalPages: Math.max(1, Math.ceil(expectedRegionalOperations.records.length / 2)),
      hasNextPage: expectedRegionalOperations.records.length > 2,
      hasPreviousPage: false
    });
    assert.deepEqual(
      actorScopedReportsSnapshot.records.map((row) => row.code),
      expectedViewerReports.records.map((row) => row.code)
    );
    assert.equal(actorScopedReportsSnapshot.records.length, 0);

    assert.ok(createdIssue);
    assert.equal(createdIssue.status, "active");
    assert.equal(createdIssue.priority, "high");

    assert.ok(createdBrief);
    assert.equal(createdBrief.status, "queued");
    assert.equal(createdBrief.issueCode, issueCode);
    assert.equal(createdBrief.sensitivity, "internal");
    assertTimestampWithinRange(
      createdBrief.updatedAt,
      auditWindowStart,
      auditWindowEnd
    );
    assert.notEqual(createdBrief.updatedAt, createdBrief.dueDate);

    assert.ok(createdAsset);
    assert.equal(createdAsset.status, "approved");
    assert.equal(createdAsset.ownerTeam, "team_central_ops");
    assert.equal(createdAsset.issueCode, issueCode);
    assert.equal(createdAsset.briefCode, briefCode);
    assert.equal(createdAsset.approvalCode, approvalCode);
    assert.equal(createdAsset.source, "human");
    assert.equal(createdAsset.locale, "en");
    assert.equal(createdAsset.sensitivity, "internal");

    assert.ok(createdApproval);
    assert.equal(createdApproval.status, "approved");
    assert.equal(createdApproval.ownerTeam, "team_review");
    assert.equal(createdApproval.requestedByTeam, "team_central_ops");
    assert.equal(createdApproval.subjectCode, assetCode);
    assert.equal(createdApproval.subjectType, "asset");
    assert.equal(createdApproval.sensitivity, "internal");
    assertTimestampWithinRange(
      createdApproval.updatedAt,
      auditWindowStart,
      auditWindowEnd
    );
    assert.notEqual(createdApproval.updatedAt, createdApproval.dueDate);

    assert.ok(createdTask);
    assert.equal(createdTask.status, "active");
    assert.equal(createdTask.priority, "critical");
    assert.equal(createdTask.ownerTeam, "team_central_ops");
    assert.equal(createdTask.assigneeTeam, "team_field_ops");
    assert.equal(createdTask.issueCode, issueCode);
    assert.equal(createdTask.briefCode, briefCode);
    assert.equal(createdTask.sensitivity, "internal");
    assertTimestampWithinRange(
      createdTask.updatedAt,
      auditWindowStart,
      auditWindowEnd
    );
    assert.notEqual(createdTask.updatedAt, createdTask.dueDate);

    assert.ok(createdFeedback);
    assert.equal(createdFeedback.status, "attention");
    assert.equal(createdFeedback.priority, "critical");
    assert.equal(createdFeedback.ownerTeam, "team_central_ops");
    assert.equal(createdFeedback.issueCode, issueCode);
    assert.equal(createdFeedback.taskCode, taskCode);
    assert.equal(createdFeedback.source, "internal");
    assert.equal(createdFeedback.sensitivity, "internal");

    const issueProjection = database
      .prepare(
        `
          SELECT
            kind,
            primary_region_id AS primaryRegionId,
            target_team_ids AS targetTeamIds,
            target_region_ids AS targetRegionIds,
            linked_brief_ids AS linkedBriefIds,
            linked_asset_ids AS linkedAssetIds,
            sensitivity
          FROM issues
          WHERE id = ?
        `
      )
      .get(issueId) as
      | {
          kind: string;
          primaryRegionId: string;
          targetTeamIds: string;
          targetRegionIds: string;
          linkedBriefIds: string;
          linkedAssetIds: string;
          sensitivity: string;
        }
      | undefined;
    const briefProjection = database
      .prepare(
        `
          SELECT
            goal,
            issue_id AS issueId,
            target_team_ids AS targetTeamIds,
            target_region_ids AS targetRegionIds,
            output_kinds AS outputKinds,
            approval_required AS approvalRequired,
            linked_task_ids AS linkedTaskIds,
            sensitivity,
            due_date AS dueDate,
            updated_at AS updatedAt
          FROM briefs
          WHERE id = ?
        `
      )
      .get(briefId) as
      | {
          goal: string;
          issueId: string;
          targetTeamIds: string;
          targetRegionIds: string;
          outputKinds: string;
          approvalRequired: number | boolean;
          linkedTaskIds: string;
          sensitivity: string;
          dueDate: string;
          updatedAt: string;
        }
      | undefined;
    const assetProjection = database
      .prepare(
        `
          SELECT
            source,
            issue_id AS issueId,
            brief_id AS briefId,
            approval_id AS approvalId,
            owner_team AS ownerTeam,
            locale,
            scope_team_ids AS scopeTeamIds,
            scope_region_ids AS scopeRegionIds,
            version_label AS versionLabel,
            sensitivity
          FROM assets
          WHERE id = ?
        `
      )
      .get(assetId) as
      | {
          source: string;
          issueId: string;
          briefId: string;
          approvalId: string;
          ownerTeam: string;
          locale: string;
          scopeTeamIds: string;
          scopeRegionIds: string;
          versionLabel: string;
          sensitivity: string;
        }
      | undefined;
    const approvalProjection = database
      .prepare(
        `
          SELECT
            subject_type AS subjectType,
            subject_id AS subjectId,
            subject_code AS subjectCode,
            requested_by_team AS requestedByTeam,
            checklist,
            latest_comment AS latestComment,
            sensitivity,
            due_date AS dueDate,
            updated_at AS updatedAt
          FROM reviews
          WHERE id = ?
        `
      )
      .get(approvalResult.entity.id) as
      | {
          subjectType: string;
          subjectId: string;
          subjectCode: string;
          requestedByTeam: string;
          checklist: string;
          latestComment: string;
          sensitivity: string;
          dueDate: string;
          updatedAt: string;
        }
      | undefined;
    const taskProjection = database
      .prepare(
        `
          SELECT
            assignee_team AS assigneeTeam,
            issue_id AS issueId,
            brief_id AS briefId,
            workflow_step AS workflowStep,
            sensitivity,
            due_date AS dueDate,
            updated_at AS updatedAt
          FROM tasks
          WHERE id = ?
        `
      )
      .get(taskId) as
      | {
          assigneeTeam: string;
          issueId: string;
          briefId: string;
          workflowStep: string;
          sensitivity: string;
          dueDate: string;
          updatedAt: string;
        }
      | undefined;
    const feedbackProjection = database
      .prepare(
        `
          SELECT
            source,
            issue_id AS issueId,
            task_id AS taskId,
            owner_team AS ownerTeam,
            sensitivity
          FROM feedback
          WHERE id = ?
        `
      )
      .get(`feedback_${feedbackCode}`) as
      | {
          source: string;
          issueId: string;
          taskId: string;
          ownerTeam: string;
          sensitivity: string;
        }
      | undefined;

    assert.ok(issueProjection);
    assert.equal(issueProjection.kind, "response");
    assert.equal(issueProjection.primaryRegionId, "north_network");
    assert.deepEqual(parseStringArray(issueProjection.targetTeamIds), scope.teamIds);
    assert.deepEqual(parseStringArray(issueProjection.targetRegionIds), scope.regionIds);
    assert.deepEqual(parseStringArray(issueProjection.linkedBriefIds), [briefId]);
    assert.deepEqual(parseStringArray(issueProjection.linkedAssetIds), [assetId]);
    assert.equal(issueProjection.sensitivity, "internal");

    assert.ok(briefProjection);
    assert.equal(briefProjection.goal, "Smoke brief goal");
    assert.equal(briefProjection.issueId, issueId);
    assert.deepEqual(parseStringArray(briefProjection.targetTeamIds), scope.teamIds);
    assert.deepEqual(parseStringArray(briefProjection.targetRegionIds), scope.regionIds);
    assert.deepEqual(parseStringArray(briefProjection.outputKinds), ["briefing_note"]);
    assert.ok(
      briefProjection.approvalRequired === true ||
        briefProjection.approvalRequired === 1
    );
    assert.deepEqual(parseStringArray(briefProjection.linkedTaskIds), [taskId]);
    assert.equal(briefProjection.sensitivity, "internal");
    assertTimestampWithinRange(
      briefProjection.updatedAt,
      auditWindowStart,
      auditWindowEnd
    );
    assert.notEqual(briefProjection.updatedAt, briefProjection.dueDate);

    assert.ok(assetProjection);
    assert.equal(assetProjection.source, "human");
    assert.equal(assetProjection.issueId, issueId);
    assert.equal(assetProjection.briefId, briefId);
    assert.equal(assetProjection.approvalId, approvalResult.entity.id);
    assert.equal(assetProjection.ownerTeam, "team_central_ops");
    assert.equal(assetProjection.locale, "en");
    assert.deepEqual(parseStringArray(assetProjection.scopeTeamIds), scope.teamIds);
    assert.deepEqual(parseStringArray(assetProjection.scopeRegionIds), scope.regionIds);
    assert.equal(assetProjection.versionLabel, "v1");
    assert.equal(assetProjection.sensitivity, "internal");

    assert.ok(approvalProjection);
    assert.equal(approvalProjection.subjectType, "asset");
    assert.equal(approvalProjection.subjectId, assetId);
    assert.equal(approvalProjection.subjectCode, assetCode);
    assert.equal(approvalProjection.requestedByTeam, "team_central_ops");
    assert.deepEqual(parseStringArray(approvalProjection.checklist), [
      "message_consistency",
      "human_review_required"
    ]);
    assert.equal(approvalProjection.latestComment, "smoke_approved");
    assert.equal(approvalProjection.sensitivity, "internal");
    assertTimestampWithinRange(
      approvalProjection.updatedAt,
      auditWindowStart,
      auditWindowEnd
    );
    assert.notEqual(approvalProjection.updatedAt, approvalProjection.dueDate);

    assert.ok(taskProjection);
    assert.equal(taskProjection.assigneeTeam, "team_field_ops");
    assert.equal(taskProjection.issueId, issueId);
    assert.equal(taskProjection.briefId, briefId);
    assert.equal(taskProjection.workflowStep, "queued_execution");
    assert.equal(taskProjection.sensitivity, "internal");
    assertTimestampWithinRange(
      taskProjection.updatedAt,
      auditWindowStart,
      auditWindowEnd
    );
    assert.notEqual(taskProjection.updatedAt, taskProjection.dueDate);

    assert.ok(feedbackProjection);
    assert.equal(feedbackProjection.source, "internal");
    assert.equal(feedbackProjection.issueId, issueId);
    assert.equal(feedbackProjection.taskId, taskId);
    assert.equal(feedbackProjection.ownerTeam, "team_central_ops");
    assert.equal(feedbackProjection.sensitivity, "internal");
  } finally {
    const globalDbState = globalThis as GlobalDbState;
    globalDbState.__openPolisDb?.close?.();
    globalDbState.__openPolisDb = undefined;
    globalDbState.__openPolisDrizzle = undefined;
    process.chdir(originalCwd);
    rmSync(tempDir, { recursive: true, force: true });
  }
});
