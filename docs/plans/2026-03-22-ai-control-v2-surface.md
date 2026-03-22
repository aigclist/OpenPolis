# AI Control V2 Surface Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Ship the first visible v2 surface by turning the existing AI workspace route into an AI control desk and reorganizing the app shell navigation into plain-language work groups.

**Architecture:** Keep the current route structure and backend data sources intact. Build the new experience by adding a richer AI control view-model, dedicated presentation components, and a grouped shell navigation layer that sits on top of the existing module paths.

**Tech Stack:** Next.js 16 App Router, React 19 Server Components, next-intl, Tailwind CSS v4, local UI primitives

---

### Task 1: Add grouped workspace navigation

**Files:**
- Modify: `packages/ui/src/namespaces.ts`
- Modify: `apps/web/src/components/shell/app-shell.tsx`

**Steps:**
1. Add a grouped navigation export that maps existing routes into plain-language sections.
2. Keep the existing flat navigation exports for route guards and sitemap compatibility.
3. Update the shell to render the new grouped structure with the correct icon and translation source for each item.

### Task 2: Rebuild the AI workspace view-model as AI control

**Files:**
- Modify: `apps/web/src/server/view-models/ai-workspace.ts`

**Steps:**
1. Replace the current provider/skills list-first shape with an AI control desk shape.
2. Reuse provider and skill snapshot data where it helps the page feel grounded.
3. Add page data for quick actions, active jobs, result cards, confirmations, evidence links, and agent roster.

### Task 3: Build AI control presentation components

**Files:**
- Create: `apps/web/src/components/ai/ai-control-hero.tsx`
- Create: `apps/web/src/components/ai/ai-control-section-card.tsx`
- Create: `apps/web/src/components/ai/ai-control-job-card.tsx`

**Steps:**
1. Create a command-style hero with one-line assignment input styling and quick starts.
2. Create reusable cards for active work, results, confirmation queue, evidence, and agent seats.
3. Keep the page mostly server-rendered and avoid promoting large route sections to client components.

### Task 4: Recompose the AI route

**Files:**
- Modify: `apps/web/src/app/[locale]/(app)/ai-workspace/page.tsx`

**Steps:**
1. Replace the old summary/list preview layout with the new AI control desk composition.
2. Make the result area dominant, with smaller confirmation and evidence rails.
3. Keep the output fully responsive for desktop and mobile.

### Task 5: Refresh plain-language labels and copy

**Files:**
- Modify: `packages/i18n/messages/en.json`
- Modify: `packages/i18n/messages/zh-CN.json`

**Steps:**
1. Update shell group labels and item labels to match the new work-oriented navigation.
2. Rename module-facing copy toward plain operational language where it materially improves clarity.
3. Add the new AI control page copy without widening the translation surface more than necessary.

### Task 6: Verify the v2 surface

**Files:**
- No source changes expected unless verification finds issues

**Steps:**
1. Run targeted typecheck for the web app.
2. Run a production build.
3. Fix any client/server boundary, translation, or import errors found during verification.
