# Personal OS — CRUD Readiness Audit v0.5

Date: 2026-09-06

## Purpose

This document freezes the current state before the next implementation pass. The immediate goal is to make every current Personal OS module use a deliberate persistence model with complete user-facing lifecycle operations before connecting the real AI Copilot.

The audit covers four layers for each feature:

1. **UI** — what the user can actually do today;
2. **application service** — whether the frontend calls a direct repository/service or only browser state;
3. **database** — whether a persistent structure exists;
4. **authorization** — whether RLS/privileged boundaries match the intended behavior.

No AI implementation should be considered production-ready until this persistence layer is coherent. AI must propose or operate on canonical application data, not on demo cards or browser-only state.

## CRUD definition for Personal OS

CRUD is interpreted semantically rather than as unconditional SQL `DELETE` access.

- **C — Create:** create a canonical record.
- **R — Read:** list and retrieve the user's authorized records.
- **U — Update:** edit content/status/relationships where the domain allows it.
- **D — Deactivate / Archive:** remove the item from the active experience without silently destroying history.

Hard deletion is intentionally not the normal lifecycle for goals, projects, tasks, ideas, routes, decisions or routines. Most of these entities already contain `archived_at` or an archive-capable status and should use soft deletion.

Append-oriented records such as `activity_log`, check-ins and event history are exceptions. Their correct lifecycle is normally **Create + Read**, with explicit correction/supersession when needed instead of destructive update/delete.

## Snapshot at audit time

- Authentication is active with email/password and Google OAuth.
- Google PKCE callback is deployed and the production redirect now works.
- Two authenticated accounts exist, one using email/password and one using Google.
- Each of the two accounts has its own active owner membership/workspace.
- Platform administration is separate from workspace ownership.
- RLS is enabled on all Personal OS public application tables.
- Personal content tables are currently empty in Supabase; most visible dashboard examples are still prototype/browser state.
- The latest inspected GitHub Pages build/deploy completed successfully.
- The only active Edge Function is `admin-users`; the real AI backend does not exist yet.

## Current CRUD matrix

Legend:

- ✅ complete for the current intended lifecycle
- 🟡 partial
- 🔵 intentionally append/read-oriented
- ❌ missing/not connected
- ⚪ infrastructure exists but no usable product flow

| Module / entity | C | R | U | D / archive | Current source of truth | Status |
|---|---:|---:|---:|---:|---|---|
| Auth account / session | ✅ | ✅ | 🟡 | ❌ | Supabase Auth | 🟡 |
| Profile | trigger | ✅ | ❌ UI | ❌ | Supabase | 🟡 |
| Personal workspace | trigger | ✅ | ❌ UI | ❌ | Supabase | 🟡 |
| Workspace membership | trigger/admin | ✅ | backend-capable | ❌ | Supabase | ⚪ |
| Areas | ❌ UI | ❌ UI | ❌ UI | ❌ UI | DB structure only | ⚪ |
| Goals | ✅ | ✅ | ❌ UI | ❌ UI | Supabase direct | 🟡 |
| Routes | ✅ | ✅ | 🟡 | ❌ UI | Supabase direct | 🟡 |
| Route steps | ✅ with route | ✅ | 🟡 status only | ❌ UI | Supabase direct | 🟡 |
| Projects | ❌ practical create UI | ✅ via bridge | 🟡 progress | ❌ | localStorage + Supabase sync bridge | 🟡 |
| Tasks | ✅ UI | ✅ via bridge | 🟡 completion only | ❌ | localStorage + Supabase sync bridge | 🟡 |
| Ideas / Inbox | ✅ | ✅ | 🟡 promote-to-task only | local removal only | localStorage only | ❌ |
| Decisions | ✅ | ✅ via bridge | ❌ UI | ❌ | localStorage + Supabase sync bridge | 🟡 |
| Routine definitions | ❌ | static seed only | checkbox state only | ❌ | localStorage/static | ❌ |
| Routine daily execution | local checkbox | local | local toggle | n/a | localStorage only | ❌ |
| Check-ins | local create | local history | n/a | n/a | localStorage only | ❌ |
| Events / consumption logs | local create | local history | n/a | n/a | localStorage only | ❌ |
| Journal | ✅ local | ✅ local | ❌ | ❌ | separate localStorage key | ❌ |
| History / timeline | derived | ✅ local | n/a | n/a | derived from browser state | ❌ |
| Activity log | ✅ selected flows | ✅ by workspace | n/a | n/a | Supabase | 🔵 |
| Admin user directory | n/a | ✅ | ❌ | ❌ | secure Edge Function | ✅ for read-only scope |
| Platform admins | operational only | self-detect | operational only | operational only | Supabase protected | ✅ for restricted scope |
| AI Copilot | ❌ real | ❌ real | ❌ | ❌ | demo response only | ❌ |

## Detailed findings

### 1. Authentication and account lifecycle

Implemented:
- email/password sign-up;
- email/password sign-in;
- Google OAuth;
- PKCE session handling;
- session persistence/refresh;
- sign-out;
- automatic profile + personal workspace bootstrap.

Missing for a complete account lifecycle:
- forgot-password request;
- password recovery/reset screen;
- profile/preferences screen;
- update display name/timezone/locale/avatar strategy;
- account export;
- account deletion/closure workflow;
- optional session/device management.

Account deletion is a high-impact operation and should be an explicit workflow with warning, export option, reauthentication and controlled cascading/retention rules.

### 2. Goals

Current direct Supabase service supports:
- list goals;
- create goal;
- log `goal_created`.

Missing:
- edit title/description/priority/target date/success criteria;
- pause/resume;
- mark achieved;
- archive/restore;
- goal detail page;
- relationships to Area, Projects and Routes in the product UI;
- derived progress model.

**Conclusion:** persistent but not CRUD complete.

### 3. Routes and route steps

Current direct Supabase service supports:
- create route;
- create ordered steps;
- list routes + steps;
- toggle step status between `ready` and `done` in the current UI;
- automatic route progress recalculation;
- automatic release of the next pending step after completion;
- route/step mutation activity log.

Missing:
- edit route title/description/goal;
- pause/resume/archive/restore route;
- add a step to an existing route;
- edit step title/description;
- reorder steps;
- block/unblock/skip explicitly in UI;
- archive/restore individual steps;
- edit due date, cost, duration, reason, confidence;
- dependency editor;
- convert route step to Task;
- validation of dependency readiness before marking a step ready;
- transactional creation of route + all steps (currently partial failure can leave a route without all steps).

**Conclusion:** the first functional route engine exists, but lifecycle is partial.

### 4. Projects

The database structure supports projects and RLS. The current dashboard, however, starts from hard-coded project cards and changes progress in browser state. `core-cloud-store.ts` can hydrate and upsert projects, but this is a compatibility bridge, not a project repository.

Missing:
- direct create project UI;
- project detail;
- edit title/description/status/priority/dates;
- goal and area relationships;
- archive/restore;
- canonical task/project relationship management;
- direct activity logging.

Important bridge limitation: removing an item from browser state does not archive/delete the corresponding cloud record because the bridge only upserts current records.

### 5. Tasks

Current UI can:
- create a browser task;
- list tasks;
- toggle completion.

The compatibility bridge then upserts non-demo tasks into Supabase.

Missing:
- direct database mutation from the task UI;
- edit title/description/priority/due date;
- status model beyond checkbox (`next`, `doing`, `blocked`, `cancelled`);
- project/area/route-step links;
- archive/cancel/restore;
- duration and energy fields;
- explicit activity events;
- reliable deletion reconciliation.

### 6. Ideas / Inbox

Current UI is browser-only:
- create idea;
- read idea;
- promote to task, which removes the browser idea.

The `ideas` table already exists but is not connected.

Required canonical flow:

```text
capture idea
→ persist as idea
→ review/edit/incubate
→ promote deliberately
→ create linked Task/Project/Goal candidate
→ retain original idea with promoted status/reference
```

The current browser flow loses provenance when it removes the idea after promotion.

### 7. Decisions

Current UI can create and list decisions in browser state. The bridge upserts them into the `decisions` table.

Missing:
- direct repository;
- edit decision/outcome/rationale;
- assumptions;
- alternatives;
- review date editing;
- relationships to area/project/other entity;
- supersede decision;
- archive/restore;
- review workflow and outcome follow-up.

There is also a naming mismatch: the database uses `decision`; the TypeScript domain uses `outcome`.

### 8. Routines

This area requires a model correction before CRUD UI is implemented.

The current browser model stores a static object such as `routine name → completed today boolean`. The database `routines` table stores routine definitions, not daily execution history.

A complete design needs at least:
- routine definition CRUD;
- recurring schedule/trigger/window;
- active/archive lifecycle;
- execution records by date/time (`routine_runs` or `routine_completions`);
- optional routine steps if the richer domain model is retained.

Do not store daily completion by overwriting the routine definition itself.

### 9. Check-ins and events

Current dashboard check-ins and consumption/event logs are browser-only even though `check_ins` and `events` tables exist.

The database intentionally exposes only INSERT + SELECT through RLS for these append-oriented tables.

That is acceptable if the product adopts explicit append semantics. The implementation still needs:
- direct persistence;
- pagination/time filtering;
- clear correction strategy for mistaken entries;
- activity/history integration;
- no silent mutation of old observations.

### 10. Journal

The journal is fully separate from the cloud core and uses `personal-os-journal-v1` in `localStorage`.

There is no current Personal OS journal table.

Required persistence model:
- `journal_entries` scoped by `workspace_id` and author;
- area/category/type;
- title optional;
- body/text;
- occurred/created/updated timestamps;
- archive status;
- privacy flags including future `exclude_from_ai`;
- optional links to Goal/Project/Decision/Event;
- RLS;
- create/read/edit/archive/restore UI.

Journal content should remain excluded from platform-admin listing and should not automatically enter AI context.

### 11. History

The current History screen is computed only from browser check-ins, event logs and decisions.

Target: a unified read model drawing from persistent domain records and `activity_log`, without forcing every entity into a single mutable table.

History is read-oriented by design; it does not need CRUD itself. The underlying records do.

### 12. Platform administration

The current `/admin/users/` implementation is intentionally read-only and is considered complete for its current scope:
- verifies `platform_admin` in the browser for navigation/UX;
- enforces the privilege again in the Edge Function;
- lists Supabase Auth users securely server-side;
- shows account/workspace metadata;
- does not expose personal content;
- never sends the secret/service role credential to the browser.

Future admin mutations such as suspend/restore account are separate operational features and must remain backend-only, permission-checked and audited.

## Database / domain alignment gaps

Before replacing the compatibility layer, normalize behavior through adapters or migrations. Do not let frontend components depend directly on inconsistent legacy column meanings.

Known mismatches:

| Concept | Database today | TypeScript domain |
|---|---|---|
| Goal priority | `text` | `number` |
| Project priority | `text` | `number` |
| Task priority | `text` | `number` |
| Task status | legacy default `todo` | `inbox/next/doing/blocked/done/cancelled` |
| Task energy | `integer` | `low/medium/high` |
| Decision result | column `decision` | property `outcome` |
| Routine name | column `name` | property `title` |
| Routine recurrence | `frequency` | `recurrence` |
| Routine duration | `duration_estimate` | `estimatedMinutes` |

The domain model also describes entities not yet represented by the current Personal OS database: `RoutineStep`, `Observation`, `MetricDefinition`, generic `Category`, `Item`, and `Context`. These are not required to block the first direct-CRUD pass unless a current UI depends on them, but they should not be forgotten when the pattern/learning engine is implemented.

## RLS / authorization audit

Current RLS behavior is consistent with the desired tenant model:

- all Personal OS public tables have RLS enabled;
- SELECT for workspace-scoped data requires active workspace membership;
- write policies on mutable workspace data require `owner`, `admin` or `member`;
- `viewer` is read-only;
- profile is self-select/self-update only;
- platform-admin detection is self-only;
- no normal client DELETE policies exist;
- `check_ins`, `events` and `activity_log` are append/read oriented;
- personal workspace ownership cannot be reassigned through a normal update;
- owner membership of a personal workspace is protected from accidental demotion/suspension.

This means the CRUD implementation should use archive/status updates rather than adding broad DELETE permissions.

## Security remaining

Supabase security advisor still reports `Leaked Password Protection Disabled` for password accounts. This is an Auth setting, not a database RLS failure. It should be enabled if the current plan/configuration allows it.

Automated RLS regression tests are still required. Manual/simulated isolation checks are not enough for a commercial product.

## Migration / reproducibility warning

The live `personal-os` database contains migration history for a separate `luff` schema that is not part of this repository's `supabase/migrations` directory. The LUFF schema also contains non-empty taxonomy/configuration data.

Additionally, Personal OS v0.2 adapted pre-existing untracked legacy tables, so the first tracked Personal OS migration is not a complete clean-database bootstrap by itself.

Therefore:
- do not rewrite live migration history;
- do not drop the LUFF schema as part of Personal OS CRUD work;
- create a safe Personal OS baseline/bootstrap strategy before depending on fresh-environment recreation;
- move LUFF to its own Supabase project later, after cost confirmation and a controlled migration plan.

## Required implementation sequence — Phase 1: complete the system core

### Release 0.5A — Repository layer and lifecycle conventions

1. Generate/use typed Supabase contracts.
2. Establish one repository/service per entity.
3. Remove components' direct dependence on legacy browser-store shapes.
4. Standardize archive/restore semantics.
5. Standardize activity-log emission for meaningful mutations.
6. Add explicit adapters for legacy DB/domain naming mismatches.
7. Preserve one-time localStorage import only as a migration path; stop using it as primary state.

### Release 0.5B — Direct CRUD: Tasks, Projects, Goals

Tasks:
- create/list/detail/edit/status/cancel/archive/restore;
- project/area/route-step relation;
- due date, priority, duration, energy.

Projects:
- create/list/detail/edit/status/archive/restore;
- goal/area relation;
- derived/manual progress rules.

Goals:
- create/list/detail/edit/status/achieve/archive/restore;
- success criteria, horizon, priority;
- related routes/projects.

### Release 0.5C — Route engine lifecycle

- edit/archive/restore routes;
- add/edit/reorder/archive steps;
- explicit blocked/skipped/doing states;
- dependencies;
- estimates;
- create Task from RouteStep;
- transactional route creation;
- consistent progress derivation.

### Release 0.5D — Ideas and Decisions

Ideas:
- direct persistence;
- edit/incubate/archive/restore;
- promotion while retaining provenance.

Decisions:
- direct persistence;
- edit/supersede/archive/restore;
- assumptions/alternatives/review workflow;
- relations to project/goal/route or generic entity reference.

### Release 0.5E — Routines, Check-ins, Events, Journal

Routines:
- add execution-history schema;
- CRUD definitions;
- daily completion records.

Check-ins/events:
- direct append/read persistence;
- filters and correction strategy.

Journal:
- create secure table + RLS;
- create/read/edit/archive/restore;
- `exclude_from_ai` privacy control.

### Release 0.5F — Today + History read models

- build Today from canonical DB state;
- remove hard-coded route/project demo data from operational cards;
- build persistent timeline/history;
- make quick capture route into the correct canonical entity;
- show synchronization/error states based on real operations rather than polling browser storage.

### Release 0.5G — Account completeness and automated validation

- profile/preferences;
- forgot/reset password;
- account export/delete design;
- CRUD integration tests;
- RLS cross-user regression suite;
- deployment validation;
- security advisor recheck;
- documentation update.

## Exit criteria before AI Phase 2

The core is considered ready for the real Copilot only when all of the following are true:

1. Supabase is the source of truth for all operational modules.
2. No normal feature depends on `localStorage` for canonical data.
3. Every mutable entity has explicit create/read/update/archive lifecycle.
4. Append-only entities have direct persistence and a documented correction policy.
5. Goal → Route → RouteStep → Task relationships work end-to-end.
6. Ideas retain provenance when promoted.
7. Decisions retain context and review history.
8. Routines have execution history rather than a single mutable checkbox.
9. Journal is cloud-persisted, RLS-protected and AI-excludable.
10. Today/History read from canonical state.
11. Cross-user isolation is automated and passing.
12. Activity logging covers meaningful lifecycle mutations.
13. Production build/deploy passes.
14. Known migration/bootstrap limitations are documented and controlled.

Only then should the Copilot be given real write-proposal capabilities.

## Phase 2 — AI Copilot, after CRUD completion

The AI layer will then be connected against the stable repositories and canonical state.

Target flow:

```text
user conversation
→ intent/context interpretation
→ read authorized canonical state
→ deterministic tools/calculations where applicable
→ AI explanation or structured proposal
→ user confirmation for persistent/high-impact change
→ repository mutation
→ activity log
→ outcome/review loop
```

Initial AI capabilities after the CRUD gate:
- contextual chat;
- capture classification;
- proposed goals;
- evidence-based proposed routes;
- Next Best Action explanation;
- blocker/progress summaries;
- decision preparation;
- weekly review synthesis;
- structured mutations only after explicit confirmation.

The AI provider key must remain only in Supabase Edge Function secrets/backend runtime. No OpenAI secret belongs in GitHub Pages, repository source or browser storage.
