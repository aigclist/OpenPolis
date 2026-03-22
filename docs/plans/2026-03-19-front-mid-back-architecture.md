# Front / Mid / Back Separation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Restructure OpenPolis from a single Next.js demo application into a separated frontstage, middle-platform, and backend architecture without losing the current working app shell, docs, or i18n baseline.

**Architecture:** Keep deployment simple at first by using a modular monolith in a pnpm workspace. Separate the codebase into frontstage UI, middle-platform domain/workflow/agent governance services, and backend persistence/integration adapters. Only after the middle-platform contracts stabilize should the API or workers be extracted into independent deployables.

**Tech Stack:** Next.js 16, next-intl, Tailwind v4, shadcn/ui, Fumadocs, better-sqlite3, Drizzle ORM, Zod, AI SDK, custom LLM provider adapters, pnpm workspace.

---

## Target Boundaries

### Frontstage

- `apps/web`
- Responsibility: routes, layouts, pages, view composition, forms, tables, dashboards, docs, localization wiring
- Can depend on: `packages/ui`, `packages/i18n`, `packages/contracts`, `packages/application-client`
- Must not depend on: database adapters, provider SDKs, raw SQL, workflow internals

### Middle Platform

- `packages/contracts`
- `packages/domain`
- `packages/application`
- `packages/governance`
- `packages/agent-runtime`
- Responsibility: object schemas, commands, queries, workflows, approval rules, skill registry, audit emission, policy evaluation
- Can depend on: backend ports/interfaces, Zod, domain primitives
- Must not depend on: Next.js route files, React components, database vendor specifics

### Backend

- `packages/db`
- `packages/auth`
- `packages/storage`
- `packages/queue`
- `packages/provider-adapters`
- Responsibility: Drizzle schema, migrations, repositories, auth/session, blob storage, provider integration, background jobs, export/retention execution
- Can depend on: Node runtime, database drivers, provider SDKs
- Must not depend on: page components, app shell, view models

## ADR Summary

### ADR-001: Start with modular separation, not microservices

- Decision: Split by package boundaries first, not by independent network services.
- Why: Current product maturity is too early for service sprawl; the real risk is weak domain boundaries, not lack of infra.
- Consequence: Faster iteration now, cheaper refactor path later, lower operational burden.

### ADR-002: Next.js remains frontstage and BFF edge, not business core

- Decision: Keep Next.js responsible for UI and request entrypoints only.
- Why: Business rules, workflow transitions, and agent permissions should be framework-agnostic and testable outside app routes.
- Consequence: Pages become thin; most logic moves into middle-platform packages.

### ADR-003: Agent actions must go through middle-platform commands

- Decision: Agents never mutate storage directly.
- Why: Governance, approval gates, and audit logging must remain consistent across humans and agents.
- Consequence: Every agent capability maps to explicit command/query contracts.

---

### Task 1: Convert the repo into a workspace shell

**Files:**
- Create: `pnpm-workspace.yaml`
- Create: `apps/web/package.json`
- Create: `packages/ui/package.json`
- Create: `packages/i18n/package.json`
- Create: `packages/contracts/package.json`
- Create: `packages/domain/package.json`
- Create: `packages/application/package.json`
- Create: `packages/governance/package.json`
- Create: `packages/agent-runtime/package.json`
- Create: `packages/db/package.json`
- Modify: `package.json`

**Step 1: Create the workspace manifest**

- Add `apps/*` and `packages/*` workspace globs.

**Step 2: Move the current Next.js app into `apps/web`**

- Preserve the existing working app.
- Do not change behavior in this step.

**Step 3: Add package stubs for the three layers**

- Frontstage package roots: `packages/ui`, `packages/i18n`
- Middle-platform package roots: `packages/contracts`, `packages/domain`, `packages/application`, `packages/governance`, `packages/agent-runtime`
- Backend package roots: `packages/db`

**Step 4: Rewire root scripts**

- `pnpm dev --filter web`
- `pnpm build --filter web`
- `pnpm lint --filter web`

**Step 5: Verify**

Run: `pnpm build`
Expected: the app still builds successfully from the workspace root.

**Step 6: Commit**

```bash
git add pnpm-workspace.yaml package.json apps packages
git commit -m "chore: convert repo to workspace layout"
```

---

### Task 2: Extract frontstage-only concerns

**Files:**
- Move: `src/components/ui/*` -> `packages/ui/src/*`
- Move: `src/lib/namespaces.ts` -> `packages/ui/src/namespaces.ts`
- Move: `messages/*.json` -> `packages/i18n/messages/*.json`
- Create: `packages/i18n/src/request.ts`
- Create: `packages/i18n/src/routing.ts`
- Create: `packages/i18n/src/navigation.ts`
- Modify: `apps/web/next.config.ts`
- Modify: `apps/web/src/app/[locale]/layout.tsx`
- Modify: `apps/web/src/components/*`

**Step 1: Extract the design system**

- Move all reusable UI primitives into `packages/ui`.
- Export `getUiNamespace` from the UI package.

**Step 2: Extract locale messages and next-intl helpers**

- Make `packages/i18n` the single owner of locale catalogs and locale routing helpers.

**Step 3: Make the app consume package exports only**

- Replace local relative imports with package-level imports.

**Step 4: Verify**

Run: `pnpm lint`
Expected: no import-cycle or path resolution failures.

**Step 5: Commit**

```bash
git add apps/web packages/ui packages/i18n
git commit -m "refactor: extract frontstage ui and i18n packages"
```

---

### Task 3: Define the middle-platform contracts

**Files:**
- Create: `packages/contracts/src/objects/issue.ts`
- Create: `packages/contracts/src/objects/asset.ts`
- Create: `packages/contracts/src/objects/brief.ts`
- Create: `packages/contracts/src/objects/task.ts`
- Create: `packages/contracts/src/objects/team.ts`
- Create: `packages/contracts/src/objects/region.ts`
- Create: `packages/contracts/src/objects/event.ts`
- Create: `packages/contracts/src/objects/feedback.ts`
- Create: `packages/contracts/src/objects/approval.ts`
- Create: `packages/contracts/src/objects/agent-run.ts`
- Create: `packages/contracts/src/index.ts`

**Step 1: Freeze the object vocabulary**

- Every object gets a Zod schema, status enum, ID type, and public DTO shape.

**Step 2: Add cross-object references**

- `Issue -> Brief`
- `Brief -> Asset`
- `Asset -> Approval`
- `Task -> Region/Team`
- `Feedback -> Issue/Task`
- `AgentRun -> Skill/Provider/Object`

**Step 3: Define command/query DTOs**

- Create commands for create, assign, submit, approve, request changes, close, escalate.

**Step 4: Verify**

Run: `pnpm exec tsc --noEmit`
Expected: all contracts compile without app imports.

**Step 5: Commit**

```bash
git add packages/contracts
git commit -m "feat: define middle-platform contracts"
```

---

### Task 4: Create the domain and workflow core

**Files:**
- Create: `packages/domain/src/status.ts`
- Create: `packages/domain/src/events.ts`
- Create: `packages/application/src/ports/repositories.ts`
- Create: `packages/application/src/ports/audit.ts`
- Create: `packages/application/src/ports/clock.ts`
- Create: `packages/application/src/commands/issues.ts`
- Create: `packages/application/src/commands/briefs.ts`
- Create: `packages/application/src/commands/assets.ts`
- Create: `packages/application/src/commands/reviews.ts`
- Create: `packages/application/src/commands/tasks.ts`
- Create: `packages/application/src/queries/dashboard.ts`
- Create: `packages/application/src/queries/modules.ts`

**Step 1: Replace ad hoc view-model logic with application queries**

- Move query construction out of `apps/web`.
- Frontstage should no longer assemble business state directly.

**Step 2: Implement one real workflow**

- `Issue -> Brief -> Asset -> Review -> Task -> Feedback`
- Enforce legal state transitions.

**Step 3: Emit audit events on every command**

- Human and agent mutations use the same command boundary.

**Step 4: Verify**

Run: `pnpm exec tsc --noEmit`
Expected: application package compiles without React or Next.js imports.

**Step 5: Commit**

```bash
git add packages/domain packages/application
git commit -m "feat: add workflow-oriented application core"
```

---

### Task 5: Replace the demo SQLite layer with backend persistence

**Files:**
- Create: `packages/db/src/schema/issues.ts`
- Create: `packages/db/src/schema/assets.ts`
- Create: `packages/db/src/schema/briefs.ts`
- Create: `packages/db/src/schema/tasks.ts`
- Create: `packages/db/src/schema/teams.ts`
- Create: `packages/db/src/schema/regions.ts`
- Create: `packages/db/src/schema/feedback.ts`
- Create: `packages/db/src/schema/approvals.ts`
- Create: `packages/db/src/schema/audit-events.ts`
- Create: `packages/db/src/schema/agent-runs.ts`
- Create: `packages/db/src/client.ts`
- Create: `packages/db/src/repositories/*.ts`
- Create: `drizzle.config.ts`
- Create: `drizzle/*.sql`
- Modify: `package.json`
- Remove later: `apps/web/src/server/demo-data.ts`

**Step 1: Switch from `node:sqlite` to `better-sqlite3 + Drizzle`**

- Keep SQLite for local/self-hosted-first development.
- Stop relying on experimental runtime APIs.

**Step 2: Implement repository adapters for the application ports**

- Repositories return contract/domain types, not SQL rows.

**Step 3: Add seed scripts**

- Replace boot-time ad hoc inserts with explicit seed commands.

**Step 4: Verify**

Run: `pnpm build`
Expected: no `node:sqlite` experimental warning and no app-level SQL access.

**Step 5: Commit**

```bash
git add packages/db drizzle.config.ts drizzle
git commit -m "feat: add backend persistence layer with drizzle"
```

---

### Task 6: Build governance as middle-platform policy, not UI copy

**Files:**
- Create: `packages/governance/src/roles.ts`
- Create: `packages/governance/src/policies/object-access.ts`
- Create: `packages/governance/src/policies/approval-gates.ts`
- Create: `packages/governance/src/policies/sensitive-fields.ts`
- Create: `packages/governance/src/policies/retention.ts`
- Create: `packages/governance/src/index.ts`
- Modify: `packages/application/src/commands/*.ts`
- Modify: `apps/web/src/app/[locale]/(app)/admin/page.tsx`
- Modify: `apps/web/src/app/[locale]/(app)/settings/page.tsx`

**Step 1: Define role and scope policy**

- Role
- Region scope
- Issue scope
- Approval scope
- Sensitive field scope

**Step 2: Enforce policy in commands**

- Command handlers reject unauthorized state changes.

**Step 3: Emit audit records for denied and approved actions**

- Governance is only real if it is observable.

**Step 4: Verify**

Run: `pnpm lint`
Expected: no frontstage imports inside governance.

**Step 5: Commit**

```bash
git add packages/governance packages/application apps/web/src/app
git commit -m "feat: add governance policy layer"
```

---

### Task 7: Implement the agent runtime as a middle-platform subsystem

**Files:**
- Create: `packages/agent-runtime/src/skills/manifest.ts`
- Create: `packages/agent-runtime/src/skills/registry.ts`
- Create: `packages/agent-runtime/src/providers/types.ts`
- Create: `packages/agent-runtime/src/providers/registry.ts`
- Create: `packages/agent-runtime/src/runs/create-run.ts`
- Create: `packages/agent-runtime/src/runs/approve-run.ts`
- Create: `packages/agent-runtime/src/runs/log-event.ts`
- Create: `packages/provider-adapters/src/openai-compatible.ts`
- Create: `packages/provider-adapters/src/anthropic.ts`
- Create: `packages/provider-adapters/src/local.ts`
- Modify: `apps/web/src/app/[locale]/(app)/ai-workspace/page.tsx`

**Step 1: Define a skill manifest format**

- Scope
- Readable objects
- Writable objects
- Advisory or state-changing
- Human confirmation requirements

**Step 2: Define a provider adapter contract**

- Model name
- Tool capability
- Streaming support
- Redaction hooks
- Failure mapping

**Step 3: Make agent actions call application commands**

- No direct repository access.
- No direct DB writes.

**Step 4: Add run and action logs**

- Every prompt, tool call, command proposal, and approval response gets logged.

**Step 5: Verify**

Run: `pnpm build`
Expected: the AI workspace reads real provider and skill registries instead of demo rows.

**Step 6: Commit**

```bash
git add packages/agent-runtime packages/provider-adapters apps/web/src/app
git commit -m "feat: add governed agent runtime"
```

---

### Task 8: Refactor frontstage pages to thin clients of the middle platform

**Files:**
- Modify: `apps/web/src/server/view-models.ts`
- Modify: `apps/web/src/app/[locale]/(app)/page.tsx`
- Modify: `apps/web/src/app/[locale]/(app)/issues/page.tsx`
- Modify: `apps/web/src/app/[locale]/(app)/assets/page.tsx`
- Modify: `apps/web/src/app/[locale]/(app)/briefs/page.tsx`
- Modify: `apps/web/src/app/[locale]/(app)/operations/page.tsx`
- Modify: `apps/web/src/app/[locale]/(app)/network/page.tsx`
- Modify: `apps/web/src/app/[locale]/(app)/calendar/page.tsx`
- Modify: `apps/web/src/app/[locale]/(app)/feedback/page.tsx`
- Modify: `apps/web/src/app/[locale]/(app)/review/page.tsx`
- Modify: `apps/web/src/app/[locale]/(app)/reports/page.tsx`

**Step 1: Remove direct snapshot building from the app**

- Replace with query handlers from `packages/application`.

**Step 2: Add real command entrypoints**

- Create issue
- create brief
- submit asset for review
- approve/reject review
- close task
- escalate feedback

**Step 3: Keep pages presentational**

- View composition only.
- No policy, workflow, or repository logic inside page files.

**Step 4: Verify**

Run: `pnpm lint`
Expected: `apps/web` imports middle-platform services only through public exports.

**Step 5: Commit**

```bash
git add apps/web/src
git commit -m "refactor: thin frontstage pages over application services"
```

---

### Task 9: Make the dashboard a real command surface

**Files:**
- Modify: `apps/web/src/app/[locale]/(app)/page.tsx`
- Modify: `apps/web/src/components/shared/record-list-card.tsx`
- Create: `apps/web/src/components/dashboard/priority-card.tsx`
- Create: `apps/web/src/components/dashboard/queue-list.tsx`
- Create: `apps/web/src/components/dashboard/region-grid.tsx`
- Create: `apps/web/src/components/dashboard/timeline-rail.tsx`
- Create: `apps/web/src/components/dashboard/action-bar.tsx`

**Step 1: Split dashboard widgets by purpose**

- Priorities
- Pending reviews
- urgent feedback
- regional execution
- upcoming timeline
- suggested actions

**Step 2: Add quick actions**

- Create brief
- request review
- escalate feedback
- assign task

**Step 3: Make role-based variants possible**

- Central ops
- regional manager
- reviewer
- candidate team

**Step 4: Verify**

Run: `pnpm build`
Expected: dashboard remains localized and fully typed.

**Step 5: Commit**

```bash
git add apps/web/src/components/dashboard apps/web/src/app/[locale]/(app)/page.tsx
git commit -m "feat: turn dashboard into command surface"
```

---

### Task 10: Finish self-hosted backend operations

**Files:**
- Create: `docker-compose.yml`
- Create: `.env.example`
- Create: `packages/storage/src/local.ts`
- Create: `packages/storage/src/s3.ts`
- Create: `packages/auth/src/session.ts`
- Create: `packages/queue/src/jobs/export.ts`
- Create: `packages/queue/src/jobs/retention.ts`
- Create: `scripts/seed.ts`
- Create: `scripts/backup.ts`
- Modify: `README.md`
- Modify: `content/docs/architecture.mdx`

**Step 1: Add deployment defaults**

- SQLite path
- object storage config
- provider keys
- app URL

**Step 2: Add operational scripts**

- migrate
- seed
- backup
- export
- retention

**Step 3: Document the self-host path**

- local development
- single-node deployment
- backup/restore
- provider setup

**Step 4: Verify**

Run: `pnpm build`
Expected: production build succeeds with documented env vars.

**Step 5: Commit**

```bash
git add docker-compose.yml .env.example packages scripts README.md content/docs/architecture.mdx
git commit -m "chore: add self-hosted backend operations"
```

---

## Completion Criteria

- Frontstage has no direct database or provider imports.
- Middle-platform owns object schemas, commands, queries, workflows, and policy checks.
- Backend owns Drizzle schema, repositories, adapters, jobs, and deployment plumbing.
- Agent runtime uses the same command boundary as humans.
- Dashboard, Issues, Assets, Operations, Review, and Feedback form one real writable workflow.
- `pnpm lint` and `pnpm build` pass from the workspace root.

## Recommended Execution Order

1. Task 1
2. Task 2
3. Task 3
4. Task 4
5. Task 5
6. Task 6
7. Task 7
8. Task 8
9. Task 9
10. Task 10

## What Not To Do

- Do not split into multiple network services before contracts stabilize.
- Do not let `apps/web` import DB clients or raw provider SDKs.
- Do not let agents bypass approval commands.
- Do not add CRM-style contact profiling before governance and sensitive-field policy exist.
- Do not keep growing demo data once repository adapters exist.
