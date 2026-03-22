# OpenPolis Agent Brain Governance System Design

## Goal

Evolve OpenPolis from a modular workflow application into a lightweight governance operating system driven by one central agent brain that coordinates many specialized sub agents.

The system should help small political organizations, local governments, public departments, civic coalitions, and other resource-constrained institutions run faster with less manual coordination work.

## Product Thesis

OpenPolis should not behave like a traditional dashboard product with optional AI helpers attached to the side.

It should behave like:

- one unified control interface for human users
- one central orchestrator agent that receives goals and requests
- many specialized sub agents that handle concrete work
- one shared operational memory that keeps all agents aligned

The core promise is simple:

1. a human states a need once
2. the central agent decides how to handle it
3. the right sub agents do the heavy lifting
4. the human reviews only the parts that require judgment, approval, coordination, or accountability

## Target Users

The system is not only for top decision-makers.

It is for every role in an operating organization:

- senior leaders
- chiefs of staff
- political organizers
- communications teams
- field coordinators
- inspectors and compliance staff
- research and policy staff
- operations staff
- local office workers

The design should work equally well for:

- a national administration
- a province or state
- a city or county
- an autonomous local authority
- a public service network
- a medium-sized political organization
- a coalition or movement with a formal operating structure

The basic unit is not a country. The basic unit is a governed organization with responsibilities, workflows, and reporting lines.

## Design Principles

- Use plain language before technical or academic language.
- Reduce human writing, sorting, summarizing, and chasing work as much as possible.
- Keep one public-facing interface even if many sub agents operate behind it.
- Give every agent a clear job, a clear boundary, and a clear handoff path.
- Preserve human approval for formal publication, external communication, sensitive escalation, resource allocation, and accountability decisions.
- Prefer shared standards and local flexibility over rigid top-down control.
- Support low-resource settings with simple deployment, low administrative overhead, and tolerance for weak connectivity.

## What To Borrow From OGAS And Cybernetics

The reusable lessons are structural, not ideological.

Useful ideas:

- one shared information space instead of fragmented local spreadsheets and chat threads
- hierarchical but federated coordination
- exception management instead of centralizing every action
- continuous feedback loops between planning, execution, and correction
- standard objects and common reporting logic across different organizational levels

What not to build:

- a system for coercive surveillance
- loyalty scoring or political control metrics
- mass behavioral monitoring
- a totalizing central command system that removes all local judgment

The correct modern translation is a federated governance nervous system, not a single all-powerful control room.

## Core Working Language

To keep the product legible to politicians, civil servants, and office staff, use common operational words.

Primary objects:

- `Area or Unit`: the place, office, department, or organization responsible for work
- `Priority Item`: the major issue, campaign, project, or situation that requires attention
- `Action Plan`: the structured plan for how a priority item will be handled
- `Task`: the concrete unit of work assigned to a person or team
- `Material or Output`: reports, notices, talking points, visual assets, plans, summaries, attachments
- `Feedback`: field reports, public input, complaints, local updates, media signals, incident notes
- `Inspection and Review`: checks, reminders, corrections, approvals, follow-up, and lessons learned

These concepts should stay legible in both product language and interface copy.

## Core Architecture

### One Front Door

Every human user interacts through one unified interface.

The user should not need to choose between multiple AI tools or think about which agent to use.

The front door is the central agent brain.

### One Central Agent Brain

The central agent brain acts as the command layer.

Its responsibilities:

- understand user intent
- decide whether the request is about planning, drafting, monitoring, review, feedback, or coordination
- pull the right context from shared memory
- delegate to the right sub agents
- merge results into one usable response
- decide whether a human approval step is required

The central agent brain is the only AI role most users need to see directly.

### Many Specialized Sub Agents

Sub agents do concrete work under the supervision of the central brain.

The first recommended set:

- `Intake Agent`: reads incoming messages, reports, notes, and meeting records; extracts structure
- `Task Agent`: breaks goals into tasks, owners, dates, dependencies, and reminders
- `Drafting Agent`: drafts notices, plans, summaries, briefings, and reports
- `Follow-up Agent`: tracks deadlines, delays, blockages, and missing responses
- `Summary Agent`: combines multi-source updates into daily, weekly, or topic-based summaries
- `Risk Agent`: detects warning signals, repeated failures, unusual delays, or concentrated complaints
- `Review Agent`: prepares review packs, checklists, rectification items, and follow-up records
- `Governance Guard Agent`: checks permissions, publication rules, approval requirements, and sensitivity constraints

More sub agents can be added later, but these cover the minimum useful operating loop.

### Shared Operational Memory

All agents use one shared memory layer.

This memory should include:

- organization structure
- areas and units
- active priority items
- plans
- tasks
- outputs and materials
- feedback and field signals
- review history
- templates and standard operating procedures
- role permissions
- prior actions and outcomes

This is what prevents the system from becoming a pile of disconnected AI tools.

## Human And Agent Division Of Labor

The system should push as much low-value text work as possible onto agents.

Agents should do first-pass work for:

- summarizing long materials
- extracting action items from meetings
- organizing incoming reports
- clustering repeated feedback
- drafting routine documents
- surfacing abnormal changes
- generating follow-up lists
- preparing review notes

Humans should remain responsible for:

- setting direction
- making trade-offs
- approving formal output
- assigning politically sensitive responsibility
- authorizing escalations
- deciding on resource shifts
- making final accountability decisions

## Automation Policy

The system should default toward automatic execution, not constant confirmation prompts.

Recommended action bands:

- `Auto Execute`: summarization, classification, clustering, drafting, reminders, task creation, routine updates, report generation, dashboard refresh, archiving
- `Auto Execute With Audit Trail`: priority changes, cross-module task generation, internal follow-up messages, risk tagging, rectification list generation, routine coordination actions
- `Human Confirmation Required`: external publication, external distribution, budget or resource reassignment, disciplinary proposals, permissions changes, sensitive exports, destructive deletion

The design target is to minimize human confirmation points while preserving safe boundaries around the small set of actions that carry organizational, legal, or public consequences.

## Audit And Traceability

Strong logs are a first-class requirement.

The system must make every meaningful agent action traceable and reviewable.

Each action record should capture:

- who initiated the request
- which agent handled it
- when it ran
- what source materials it used
- which rules or templates it relied on
- what objects it created, updated, escalated, sent, or archived
- what changed before and after the action
- whether it ran automatically or after human confirmation
- who approved it, if approval was required

This should support:

- one-click inspection of why something happened
- after-action review of agent behavior
- rollback and correction when an action was wrong
- clear accountability for both human and agent decisions

The product should treat traceability as part of daily workflow, not as a hidden compliance feature.

## Central Agent Workflow

The central agent should behave like an operational control desk rather than a chat-only assistant.

Recommended flow:

1. `Receive`: understand the user request and classify the job type
2. `Gather`: pull relevant records, templates, rules, and recent history
3. `Delegate`: assign concrete work to the right sub agents
4. `Merge`: combine outputs into one coherent result
5. `Check`: determine whether the result can execute automatically or requires human confirmation
6. `Write Back`: store decisions, generated materials, task updates, and review history in shared memory

The user should experience this as one continuous action, not as manual hopping between tools.

## Permission Model

The central agent must not hold unlimited standing authority.

Every action should be evaluated through four checks:

- who initiated the request
- where the action is being taken
- what exact action is being requested
- how sensitive the underlying subject is

This means the system needs both user permissions and delegated agent permissions.

Agents act on behalf of a user, office, or role under bounded authority. This keeps accountability clear and prevents the central brain from becoming an unrestricted super-admin.

## Dirty Work Principle

The system should explicitly optimize for removing low-value human labor.

By default, agents should absorb:

- document sorting
- note cleanup
- meeting-to-task conversion
- update consolidation
- repeated follow-up
- dashboard preparation
- draft writing
- issue clustering
- report formatting
- routine review preparation

The product value is not only that the system is intelligent.

The value is that it removes large amounts of repetitive, exhausting, low-status operational work from human staff.

## Home Screen Role Of Agents And Logs

The home screen should show agent work without becoming an audit console.

Recommended sections:

- `What Matters Today`
- `What AI Already Handled`
- `Work In Progress`
- `Needs Your Confirmation`
- `Traceable Action Links`

This keeps the page focused on action while preserving clear paths into deeper logs, reviews, and evidence chains when needed.

## Common Daily Workflows

The central agent brain should feel useful in ordinary daily work, not only in special situations.

The first five standard workflows should be:

### 1. Morning Situation Summary

A user asks for today's key situation.

The central brain gathers overnight changes, task movement, recent feedback, rising risks, and delayed items. It then asks the summary and risk agents to compress everything into a short operational brief.

The output should answer:

- what changed
- what is behind schedule
- what is new
- what needs attention today

### 2. Turn A Meeting Into Work

A user uploads notes, recordings, or a rough summary from a meeting.

The intake agent extracts decisions. The task agent converts them into assignments, deadlines, and follow-up items. The drafting agent prepares a clean meeting record and action list.

The human should not need to manually rewrite the meeting into a work plan.

### 3. Chase Delays Automatically

A user asks what is stuck, or the system runs this on its own.

The follow-up agent finds overdue tasks, missing responses, repeated delays, and blocked handoffs. The central brain then decides whether to send internal reminders, create a follow-up list, or raise the issue for review.

### 4. Draft Internal Instructions Fast

A user asks for a notice, reminder, talking points, a briefing note, or a correction request.

The drafting agent uses current records, previous materials, and approved templates to prepare a usable draft. The governance guard agent checks whether the result can be issued automatically or needs confirmation.

### 5. Consolidate Field Feedback

A user asks what local offices, public channels, or frontline staff are reporting.

The intake and summary agents cluster repeated themes, separate noise from signal, and identify what deserves escalation.

This should save large amounts of manual reading and reporting work every day.

## Primary Entry Actions

The main control screen should expose high-frequency actions directly under the main input area.

Recommended entry actions:

- `See Today's Situation`
- `Organize New Materials`
- `Create Tasks`
- `Follow Up Delays`
- `Draft A Document`
- `Summarize Field Feedback`
- `Check Risks`
- `View AI Activity`

These actions should help users start from what they need done, not from the internal module structure.

## Navigation Language

The product navigation should follow work logic rather than technical module names.

Recommended navigation groups:

### `Control`

- `Overview`
- `AI Control`
- `Today's Priorities`
- `Needs Confirmation`

### `Move Work Forward`

- `Priority Items`
- `Action Plans`
- `Task Follow-up`
- `Materials And Outputs`

### `Know What Is Happening`

- `Areas And Units`
- `Feedback`
- `Risks And Exceptions`
- `Inspection And Review`

### `System Management`

- `Agent Management`
- `Rules And Permissions`
- `Logs And Accountability`
- `System Settings`

The existing backend object model can remain more technical, but the primary interface language should stay plain and immediately understandable.

## Module-Level Agent Seats

The central agent brain should not be the only visible AI surface.

Each major module should include a local agent seat with a stable position, stable interaction pattern, and page-specific responsibilities.

The purpose is to make AI part of ordinary work inside each page, not a separate destination that users visit occasionally.

Recommended page-level agent roles:

### `Priority Items`

The local agent should:

- summarize the current situation of an item
- explain what is slowing progress
- assemble fragmented records into one coherent narrative
- suggest the next operational move

### `Action Plans`

The local agent should:

- turn goals into stages
- check whether key steps are missing
- fill in ownership, deadlines, and dependencies
- generate a cleaner execution version of the plan

### `Task Follow-up`

The local agent should:

- surface overdue items
- identify blocked handoffs
- prepare reminder lists
- draft follow-up messages
- explain which delays matter most

### `Materials And Outputs`

The local agent should:

- draft new materials
- shorten long materials
- rewrite into different internal formats
- reuse approved language from earlier outputs

### `Areas And Units`

The local agent should:

- compare performance across places or offices
- explain who is falling behind
- identify strong local practices worth spreading
- detect where coordination help is needed

### `Feedback`

The local agent should:

- cluster repeated reports
- separate noise from signal
- rank urgency
- flag items that may require escalation

### `Inspection And Review`

The local agent should:

- prepare inspection packs
- extract recurring weaknesses
- produce rectification lists
- turn completed work into reusable lessons

Each module seat should look and behave consistently, but its prompts, shortcuts, and default outputs should reflect the page context.

## Main AI Control Screen Layout

The `AI Control` page should be designed as a control desk, not as a generic chat screen.

Recommended fixed zones:

- `One-Line Assignment`
- `Active Work`
- `Main Results`
- `Needs Your Confirmation`
- `Evidence And Record`
- `Quick Starts`

The page must make the system feel operational:

- users can assign work immediately
- users can see what the system is currently doing
- users receive structured outputs, not raw chain-of-thought
- users can inspect the evidence behind any important result

## Agent Execution Model

The central agent should run requests as structured jobs rather than informal conversations.

Each job should move through a predictable lifecycle:

1. `Created`
2. `Classified`
3. `Context Loaded`
4. `Delegated`
5. `Sub Agents Running`
6. `Merged`
7. `Approval Check`
8. `Executed`
9. `Written Back`
10. `Closed`

This gives the system consistent monitoring, better failure recovery, and cleaner logs.

Every job should have:

- a clear owner
- a clear scope
- a clear execution history
- a clear final status

## Recommended Action Types

To keep the orchestrator legible and governable, every agent action should fit a known action type.

Recommended first set:

- `read`
- `summarize`
- `classify`
- `draft`
- `create`
- `update`
- `follow_up`
- `escalate`
- `review`
- `archive`
- `publish`
- `export`

This helps permissions, logging, metrics, and later analytics.

## Evidence And Logging Model

The logging system should support both daily operations and accountability review.

Recommended layers:

### `Job Log`

Tracks the whole user request:

- request text
- initiator
- assigned agents
- start and end time
- outcome status

### `Action Log`

Tracks each meaningful agent step:

- agent name
- action type
- target object
- rule path used
- template path used
- automatic or confirmed execution

### `Change Log`

Tracks object-level before and after state:

- changed fields
- prior values
- new values
- time of change
- cause of change

### `Evidence Log`

Tracks what justified the result:

- source records used
- source documents used
- policies and permissions consulted
- relevant historical objects

The default interface should show a short version, with drill-down available when needed.

## Shared Data And Memory Model

The shared memory layer should be treated as operational infrastructure.

Recommended core records:

- people
- roles
- areas and units
- priority items
- action plans
- tasks
- materials and outputs
- feedback items
- reviews
- permissions
- templates
- playbooks
- action logs
- job logs

Recommended memory principles:

- one source of truth for each operational object
- append strong history instead of overwriting meaningfully important changes
- preserve object links across modules
- keep agent memory attached to real records, not floating chat history alone

## Relationship To Existing OpenPolis Structure

The current OpenPolis data model already contains much of the necessary operating loop.

Existing mapping:

- `issues` -> `Priority Items`
- `briefs` -> `Action Plans`
- `tasks` / `operations` -> `Task Follow-up`
- `assets` -> `Materials And Outputs`
- `feedback` -> `Feedback`
- `review` -> `Inspection And Review`
- `network` -> `Areas And Units`

This means the next product generation should largely be an orchestration and interface evolution on top of the current foundation.

## Policy And Administrative Practices Worth Borrowing

The system can productively borrow a few proven organizational practices if they are translated into neutral operational mechanics.

Good patterns to adapt:

- layered transmission of priorities
- pilot first, then scale
- routine follow-up and rectification
- exception escalation instead of constant top-down micromanagement
- template-based work acceleration
- field feedback flowing back into planning
- recurring inspection and lesson capture
- standard operating packages that local units can adapt

These should be implemented as workflow patterns, not ideological controls.

## Low-Resource Deployment Principles

Because the system is intended for smaller organizations and resource-constrained environments, it should avoid infrastructure assumptions that only rich organizations can support.

Recommended principles:

- simple deployment
- low operator overhead
- graceful behavior under weak connectivity
- support for mobile-first and low-bandwidth usage
- limited dependency on expensive proprietary systems
- strong defaults so local administrators do not need to configure everything manually

The product should feel realistic for a county office, local party office, municipal department, or small public institution with limited IT capacity.

## Metrics For Success

The system should not measure success only through AI usage counts.

Better outcome metrics:

- time saved on routine coordination work
- reduction in manual summarization work
- reduction in missed follow-ups
- faster conversion of meetings into assigned work
- faster drafting of internal documents
- better visibility into delays and exceptions
- cleaner accountability trails
- shorter time from incoming signal to operational response

## Failure Modes To Watch

The design should actively defend against these failure modes:

- too many agent types too early
- central agent becoming a black box
- over-automation without clear rollback
- weak evidence chains behind outputs
- permission creep
- users falling back to chat apps and spreadsheets because the workflow is slower than informal work
- cluttered screens that hide priorities
- AI outputs that look polished but are poorly grounded in records

These risks should be treated as product and governance problems, not only engineering problems.

## Rollout Strategy

The safest path is staged rollout.

### Phase 1: Control Surface And Summaries

Build:

- central AI control page
- summary workflows
- task extraction from meetings
- basic agent activity logs

Goal:

- prove that the system can save real time quickly

### Phase 2: Follow-up And Drafting

Build:

- automated delay detection
- internal follow-up generation
- document drafting workflows
- module-level agent seats

Goal:

- move from analysis support into real operating support

### Phase 3: Strong Automation And Accountability

Build:

- action bands
- delegated permissions
- full evidence chains
- rollback and correction flows

Goal:

- safely increase automatic execution power

### Phase 4: Playbooks And Replication

Build:

- reusable operating templates
- local adaptation packs
- review-driven lessons
- cross-unit best-practice transfer

Goal:

- let successful working methods spread across areas and units

## Final Product Statement

OpenPolis should become a plain-language governance operating system where one central agent brain coordinates many specialized sub agents to absorb repetitive operational labor, accelerate routine execution, maintain strong accountability, and help human institutions move faster with less friction.

It should feel like a disciplined working system, not a generic AI chat product and not a traditional passive dashboard.

## Relationship To Current OpenPolis Modules

The current module structure already provides a useful skeleton:

- `dashboard`
- `issues`
- `briefs`
- `assets`
- `operations`
- `network`
- `feedback`
- `review`

The next phase should reinterpret these modules as part of one operating loop:

- `dashboard` becomes the main command overview
- `issues` becomes the home of priority items
- `briefs` becomes the home of action plans
- `assets` becomes the home of materials and outputs
- `operations` becomes the home of assigned work and follow-up
- `network` becomes the map of areas, units, capacities, and relationships
- `feedback` becomes the intake and field-signal layer
- `review` becomes the inspection, correction, and learning layer

This means the direction is evolutionary, not a ground-up reset.

## User Experience Direction

The interface should feel forceful and clear, but not theatrical.

The user should immediately understand:

- what matters now
- what is falling behind
- what needs approval
- what the agent has already prepared

The most important future UX change is not visual decoration.

It is making the central agent brain a first-class part of the workflow rather than an assistant bolted onto the side.

## Open Questions For Later Design Sections

- How exactly should the central agent route work internally?
- What approval checkpoints are mandatory by default?
- How should agent memory be partitioned by role, area, and sensitivity?
- Which actions can agents execute automatically and which must remain human-confirmed?
- How should the home page balance human controls with agent-generated summaries?

## References

- MIT Press: Benjamin Peters on OGAS
- GovStack Architecture
- GovStack Interoperability Architecture
- UNDP Digital Public Infrastructure
- CDPI
