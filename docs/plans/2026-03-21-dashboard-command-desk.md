# Dashboard Command Desk Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rebuild the dashboard into a command-desk layout with a dominant dark hero surface, hierarchical metrics, and de-emphasized secondary intelligence panels.

**Architecture:** Keep data loading in the existing dashboard view-model, but move presentation into dashboard-specific UI components so the redesign does not leak into the generic module pages. Introduce only the smallest shared theme additions needed for the dashboard command surface and display typography.

**Tech Stack:** Next.js 16 App Router, React 19, Tailwind CSS v4, next-intl, local workspace UI primitives

---

### Task 1: Add dashboard-specific visual foundations

**Files:**
- Modify: `apps/web/src/app/layout.tsx`
- Modify: `apps/web/src/app/globals.css`

**Steps:**
1. Add a dedicated display font variable for command-style headlines and numerals.
2. Add dashboard command-surface theme tokens and small utility classes for textured dark panels.
3. Keep the new tokens isolated so existing module pages do not shift unexpectedly.

### Task 2: Build dashboard presentation primitives

**Files:**
- Create: `apps/web/src/components/dashboard/dashboard-command-hero.tsx`
- Create: `apps/web/src/components/dashboard/dashboard-metric-card.tsx`
- Create: `apps/web/src/components/dashboard/dashboard-signal-card.tsx`

**Steps:**
1. Create a command hero with a dominant dark surface and structured supporting signals.
2. Create metric cards with clear hierarchy variants instead of equal weight.
3. Create signal cards for primary and compact intelligence sections using the existing record item shape.

### Task 3: Recompose the dashboard page

**Files:**
- Modify: `apps/web/src/app/[locale]/(app)/page.tsx`

**Steps:**
1. Replace the current generic hero and uniform grid layout with the command-desk composition.
2. Promote priorities to the primary intelligence area.
3. Move regions into a side rail and compress feedback and review into denser secondary cards.
4. Preserve existing localized data and navigation links.

### Task 4: Verify the redesign

**Files:**
- No source changes expected unless verification finds issues

**Steps:**
1. Run targeted typecheck for the web app.
2. Run a production build for the web app.
3. Fix any layout, import, or type issues discovered during verification.
