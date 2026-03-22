# ADR: Runtime Composition Root For Web

- Date: 2026-03-19
- Status: Accepted

## Context

`apps/web` was directly importing `@openpolis/db` adapters to construct both the workspace read service and the workflow command service. That violated the intended frontstage boundary in the workspace plan: the web app should render routes and coordinate request entrypoints, but it should not depend on database adapters directly.

At the same time, pushing composition into `@openpolis/application` would reverse the dependency direction and contaminate the application layer with infrastructure knowledge.

## Decision

Create a thin `@openpolis/runtime` package that composes application-facing services from database-backed adapters.

- `@openpolis/application` keeps ports, read-model contracts, and workflow services.
- `@openpolis/db` keeps SQLite/Drizzle adapters and storage concerns.
- `@openpolis/runtime` becomes the composition root for server-side consumers such as `apps/web`.

The web app may import `workspaceReadService` and `workspaceCommandService` from `@openpolis/runtime`, but it must not import `@openpolis/db` from application code.

## Consequences

Positive:

- The dependency direction becomes cleaner without over-engineering into networked services.
- Future adapter swaps such as SQLite to Postgres/D1 stay behind the runtime composition layer.
- The composition root is explicit and testable.

Negative:

- One additional package must be transpiled and typechecked.
- Test code may still depend on `@openpolis/db` until test composition is moved behind runtime as well.

## Follow-up

- Move any remaining web-runtime construction into `@openpolis/runtime`.
- If auth, queue, storage, or provider adapters are added later, compose them in runtime or a dedicated backend package rather than wiring them directly from `apps/web`.
