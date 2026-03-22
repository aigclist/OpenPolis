import type { Asset } from "@openpolis/contracts";
import type { RepositoryBundle } from "@openpolis/application";
import { eq, or } from "drizzle-orm";

import { getDrizzleDb } from "../client";
import { assets } from "../schema";
import {
  createAudit,
  createScope,
  createSummary,
  createTitle,
  getCodeCandidate,
  getStoredObject,
  saveStoredObject,
  toReferenceCode,
  toReferenceId
} from "./shared";

type AssetTableRow = typeof assets.$inferSelect;

export function createAssetRepository() {
  return {
    async getById(id: string) {
      const stored = getStoredObject<Asset>(id);

      if (stored) {
        return stored;
      }

      const code = getCodeCandidate(id, "asset");
      const row = getDrizzleDb()
        .select()
        .from(assets)
        .where(or(eq(assets.id, id), eq(assets.code, code)))
        .limit(1)
        .get() as AssetTableRow | undefined;

      if (!row) {
        return null;
      }

      return {
        id: row.id,
        code: row.code,
        title: createTitle(row.code, row.title),
        summary: createSummary(
          row.summary,
          "Reusable asset recovered from the workspace snapshot."
        ),
        kind: row.kind ?? "template",
        status: row.status,
        source: row.source ?? "human",
        issueId: row.issueId ?? toReferenceId(row.issueCode, "issue"),
        briefId: row.briefId ?? undefined,
        approvalId: row.approvalId ?? undefined,
        ownerTeamId: row.ownerTeam ?? "team_central_ops",
        locale: row.locale ?? "en",
        intendedScope: createScope(
          row.scopeTeamIds,
          row.scopeRegionIds,
          row.ownerTeam ?? "team_central_ops",
          "north_network"
        ),
        versionLabel: row.versionLabel ?? "seed",
        sensitivity: row.sensitivity ?? "internal",
        audit: createAudit(row.updatedAt)
      };
    },
    async save(asset: Asset) {
      saveStoredObject("asset", asset.id, asset.code, asset, asset.audit.updatedAt);

      getDrizzleDb()
        .insert(assets)
        .values({
          id: asset.id,
          code: asset.code,
          title: asset.title,
          summary: asset.summary,
          status: asset.status,
          issueCode: toReferenceCode(asset.issueId, "issue") ?? "unlinked",
          kind: asset.kind,
          source: asset.source,
          issueId: asset.issueId ?? null,
          briefId: asset.briefId ?? null,
          approvalId: asset.approvalId ?? null,
          ownerTeam: asset.ownerTeamId,
          locale: asset.locale,
          scopeTeamIds: asset.intendedScope.teamIds,
          scopeRegionIds: asset.intendedScope.regionIds,
          versionLabel: asset.versionLabel,
          sensitivity: asset.sensitivity,
          updatedAt: asset.audit.updatedAt
        })
        .onConflictDoUpdate({
          target: assets.id,
          set: {
            code: asset.code,
            title: asset.title,
            summary: asset.summary,
            status: asset.status,
            issueCode: toReferenceCode(asset.issueId, "issue") ?? "unlinked",
            kind: asset.kind,
            source: asset.source,
            issueId: asset.issueId ?? null,
            briefId: asset.briefId ?? null,
            approvalId: asset.approvalId ?? null,
            ownerTeam: asset.ownerTeamId,
            locale: asset.locale,
            scopeTeamIds: asset.intendedScope.teamIds,
            scopeRegionIds: asset.intendedScope.regionIds,
            versionLabel: asset.versionLabel,
            sensitivity: asset.sensitivity,
            updatedAt: asset.audit.updatedAt
          }
        })
        .run();
    }
  } satisfies RepositoryBundle["assets"];
}
