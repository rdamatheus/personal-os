# Personal OS — Implementation Roadmap v1

Date: 2026-09-06

## Delivery principle

Personal OS is built as a real multi-user personal platform, not a single-user prototype. Each account owns a private personal workspace and application data is scoped by `workspace_id` with Row Level Security.

Persistent or high-impact changes follow this flow:

```text
understand → validate context → propose/compute → user decides → persist → audit → learn
```

AI is an advisor and orchestrator. Deterministic calculations, ownership, authorization, progress and dependencies remain system responsibilities.

## Current foundation

### Implemented
- Supabase Auth with email/password and Google OAuth.
- Production Google OAuth redirects configured and validated.
- PKCE browser flow for the static GitHub Pages application.
- Per-user profile and personal workspace bootstrap.
- RLS on application tables.
- Workspace membership authorization helpers.
- Platform administration separated from workspace ownership.
- Secure admin user listing through a Supabase Edge Function.
- Cross-user isolation validation.
- Persistent goals.
- Persistent routes and route steps.
- Deterministic route progress recalculation.
- Activity logging for goal/route mutations.
- Canonical repository/data layer for core personal entities.
- Canonical `/organizar/` CRUD surface for Goals, Projects and Tasks.
- Legacy localStorage → Supabase polling bridge retired from the authentication bootstrap.
- Progression/Journey domain contract and reusable goal archetype frameworks.
- GitHub Pages deployment and versioned source.

### Transitional
- The old main dashboard still contains local prototype/demo state and must no longer be treated as canonical data.
- Ideas, routines, check-ins, events and journal still need complete user-facing direct persistence flows.
- The main dashboard still contains hard-coded/demo route/project elements.
- AI cards and monthly AI budget remain presentation-only until the secure AI backend is connected.

## Current implementation gate

Before connecting the real AI Copilot, complete the persistence/CRUD gate documented in:

- `docs/implementation/crud-audit-v0.5.md`

Progression/Copilot product direction is documented in:

- `docs/product/progression-copilot-research-v1.md`

The research introduces a game-inspired progression model without turning real life into arbitrary points:

```text
current state
→ goal / dream / need
→ journey
→ chapters
→ missions / route steps
→ tasks / real actions
→ evidence / result
→ unlock next capability
→ adapt route
```

## Phase A — Security and identity
Status: substantially complete.

Remaining:
- Enable leaked-password protection in Supabase Auth when available for the project plan/settings.
- Add automated tenant-isolation regression tests.
- Add password reset/profile/account lifecycle flows.
- Add session/device management later if product usage warrants it.

## Phase B — Persistent personal core
Status: in progress; governed by CRUD Audit v0.5.

1. ✅ Repository/service layer and lifecycle conventions.
2. ✅ Goals/Projects/Tasks canonical CRUD surface in `/organizar/`.
3. ✅ Retire the runtime browser polling bridge from authenticated bootstrap.
4. Decisions — direct persistence, assumptions, alternatives and review dates.
5. Ideas — persistent inbox and explicit promotion flow with provenance.
6. Routines — persistence plus execution/check history.
7. Check-ins/events — persistent personal state history.
8. Journal — persistent private entries with AI exclusion/privacy flags.
9. Today/History — canonical DB read models.
10. Replace or retire remaining prototype sections of the old dashboard.

Success criterion: browser storage is only optional UI/cache/migration state; the database is the source of truth.

## Phase C — Route engine
Status: first functional version implemented; lifecycle incomplete.

Next:
- Route edit/pause/archive/restore.
- Step add/edit/reorder/archive/restore.
- Explicit blocked/skipped/doing states.
- Dependencies between route steps.
- Cost and time estimates.
- Route-step → Task conversion.
- Transactional route creation.
- Goal progress derived from routes/projects.
- Provenance and evidence fields for AI/researched routes.

## Phase D — Journey / Progression engine

Inspired by progression systems such as Big Ambitions, but grounded in real-world state rather than arbitrary game points.

Core principles:
- user defines what success means;
- start from current state and constraints;
- chapters unlock from real prerequisites;
- progress comes from money, skills, assets, completed work, capabilities and evidence;
- several route strategies may be valid;
- time, money, workload and personal state constrain feasibility;
- failures cause adaptation, not punishment;
- optional XP/levels are secondary visualizations derived from real progress.

Reusable goal archetypes now exist for:
- acquire;
- learn;
- build;
- improve;
- stabilize;
- decide;
- experience;
- habit;
- financial;
- career/business;
- custom.

Next implementation:
- expose Journey/Chapter language in the Routes UI;
- persist route chapter/provenance metadata when the schema is ready;
- add real-world progress metrics and milestone evidence;
- support alternative route strategies;
- support route recalculation after major state changes.

## Phase E — Next Best Action engine

Implement deterministic scoring using:
- priority;
- deadline pressure;
- unblock impact;
- goal/route importance;
- estimated duration;
- energy/context fit;
- dependency readiness;
- stale/blocked penalties.

The system ranks candidates first. AI explains the recommendation; AI does not invent the ranking silently.

## Phase F — Secure AI Copilot

This phase starts only after the CRUD/persistence gate is reliable enough that AI is operating on canonical data.

Architecture:

```text
browser
  ↓ authenticated request
Supabase Edge Function
  ↓ curated context
AI provider adapter
  ↓ structured Journey/Route proposal
Personal OS
  ↓ user approval when persistent/high-impact
Repository / Database
  ↓ activity log
```

No provider secret is stored in GitHub or sent to the browser.

Initial capabilities:
1. contextual conversation;
2. conversation → classified goal archetype;
3. minimum discovery of current state, deadline, resources and constraints;
4. goal → proposed Journey with chapters and missions;
5. alternative route strategies when useful;
6. explain Next Best Action;
7. summarize progress and blockers;
8. decision preparation with assumptions/trade-offs;
9. researched routes with sources/provenance;
10. structured proposals requiring confirmation before persistence.

External requirement: an AI API credential must be configured in Supabase Edge Function secrets before real model calls can be enabled.

## Phase G — Structured memory and context

- Curated context assembler by workspace, goal, route, project and decision.
- Context provenance log.
- Summaries instead of unlimited chat replay.
- User-controlled exclusion from AI context for sensitive records.
- Knowledge items with source, date, confidence and relevance.
- Current-state snapshots required for route adaptation.

## Phase H — Reviews and learning

- Today cockpit.
- Daily closeout.
- Weekly review.
- Monthly trajectory review.
- Pattern detection with uncertainty and provenance.
- Recommendation/outcome audit trail.
- Journey recalculation when assumptions or resources change.

## Phase I — Product hardening

- Responsive UI and accessibility.
- Empty/error/loading states.
- Automated build, CRUD and tenant-isolation tests.
- Observability for Edge Functions.
- Rate limiting and AI cost limits.
- Privacy/export/delete-account workflows.
- Terms/privacy surfaces before public commercialization.

## Platform administration privacy rule

Platform admins may see account/operational metadata required to operate the product. Personal content is not exposed by default. Any future support-access mechanism to private user content must be explicit, reason-bound and audited.

## LUFF schema discovered in Personal OS Supabase

A separate `luff` schema currently exists inside the `personal-os` Supabase project and contains taxonomy/configuration records. It remains isolated from Personal OS application tables and was not deleted because it contains non-empty data.

Long-term action: move LUFF to a dedicated project/database. Do not move it into `croma-hub` by assumption. Creating a new Supabase project may have billing implications and requires explicit cost confirmation at the platform level.

## Reproducibility warning

The current live database includes pre-v0.2 Personal OS tables that existed before tracked migrations, and also LUFF migrations not stored in this repository. Do not rewrite live history or treat the current migration folder as a complete clean bootstrap yet. A safe baseline/bootstrap strategy must be created before fresh-environment recreation is relied upon.
