# OpenPolis Agent Brain Governance Checkpoint

## What Has Been Decided

- OpenPolis should evolve into a lightweight governance operating system.
- The system is not only for national governments. It should work for states, provinces, cities, counties, autonomous local authorities, public institutions, and medium-sized political or civic organizations.
- The product should use plain operational language that politicians, civil servants, and office staff can understand immediately.
- The main user-facing model should center on:
  - `Area or Unit`
  - `Priority Item`
  - `Action Plan`
  - `Task`
  - `Material or Output`
  - `Feedback`
  - `Inspection and Review`

## Core AI Architecture

- The system should present one unified interface to humans.
- Behind that interface, one `central agent brain` should act as the control layer.
- The central brain should coordinate many `sub agents` that handle concrete work.
- The central brain should behave more like an OpenClaw-style orchestrator than a chat assistant.
- Humans should not need to manually choose which agent to use.

## Confirmed Sub Agents

- `Intake Agent`
- `Task Agent`
- `Drafting Agent`
- `Follow-up Agent`
- `Summary Agent`
- `Risk Agent`
- `Review Agent`
- `Governance Guard Agent`

These names may be refined later, but the role split is accepted.

## Automation Direction

- The system should give AI the maximum safe amount of automatic execution power.
- Human confirmation should be reduced to the smallest possible set of actions.
- Routine, repetitive, structured, and exhausting work should be handled by AI by default.
- The product should explicitly aim to remove low-value human labor such as summarizing, sorting, chasing, drafting, formatting, and consolidating.

## Human Confirmation Should Be Limited To

- external publication
- external distribution
- budget or resource reassignment
- disciplinary proposals
- permissions changes
- sensitive exports
- destructive deletion

Everything else should default toward automation, with strong logs and bounded permissions.

## Accountability Rules

- Logs are a first-class feature, not an afterthought.
- Every meaningful agent action must be traceable.
- The system must record:
  - who initiated the request
  - which agent acted
  - what materials and rules were used
  - what objects changed
  - whether the action was automatic or confirmed
  - who approved it, when approval was required
- The system must support rollback, correction, and after-action review.
- The design priority is clear accountability with high AI autonomy.

## Permission Direction

- The central agent brain must not have unlimited standing authority.
- Each action should be checked against:
  - who initiated it
  - where it is being applied
  - what action is being taken
  - how sensitive the subject is
- Agents act on behalf of humans or offices under delegated authority.

## Home Screen Direction

The home screen should center on:

- `What Matters Today`
- `What AI Already Handled`
- `Work In Progress`
- `Needs Your Confirmation`
- `Traceable Action Links`

The page should show that the system is actively working without turning into a cluttered audit screen.

## Central Agent UI Direction

The main control interface should include:

- a large one-sentence input area
- a visible work-in-progress area showing what the central brain and sub agents are doing
- a main results area showing finished outputs
- a very small confirmation area for the rare actions that require approval
- clear evidence links that explain why the system produced a result

## Existing Design Documents

- Main design doc:
  - [2026-03-22-openpolis-agent-brain-governance-system-design.md](/D:/Cloudflare%20Projects/openpolis.org/docs/plans/2026-03-22-openpolis-agent-brain-governance-system-design.md)
- Earlier dashboard redesign docs:
  - [2026-03-21-dashboard-command-desk-design.md](/D:/Cloudflare%20Projects/openpolis.org/docs/plans/2026-03-21-dashboard-command-desk-design.md)
  - [2026-03-21-dashboard-command-desk.md](/D:/Cloudflare%20Projects/openpolis.org/docs/plans/2026-03-21-dashboard-command-desk.md)

## Best Resume Point

The next design section should define the most common daily workflows through the central agent brain, using plain language and keeping the AI orchestration model front and center.
