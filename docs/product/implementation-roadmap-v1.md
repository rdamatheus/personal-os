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
- GitHub Pages deployment and versioned source.

### Transitional
- Tasks, projects and decisions still use the legacy dashboard state with a cloud synchronization adapter.
- Ideas, routines, check-ins and journal require full direct database persistence.
- The main dashboard still contains prototype/demo elements and hard-coded route examples.
- AI cards and monthly AI budget remain presentation-only until the secure AI backend is connected.

## Phase A — Security and identity
Status: substantially complete.

Remaining:
- Enable leaked-password protection in Supabase Auth when available for the project plan/settings.
- Add automated tenant-isolation regression tests.
- Add session/device management later if product usage warrants it.

## Phase B — Persistent personal core
Status: in progress.

1. Goals and routes — implemented.
2. Tasks — replace polling/localStorage adapter with direct repository operations.
3. Projects — direct persistence and goal relationships.
4. Decisions — direct persistence, assumptions, alternatives and review dates.
5. Ideas — persistent inbox and explicit promotion flow.
6. Routines — persistence plus execution/check history.
7. Check-ins/events — persistent personal state history.
8. Journal — persistent private entries with future privacy flags.

Success criterion: browser storage is only an optional cache; the database is the source of truth.

## Phase C — Route engine
Status: first functional version implemented.

Next:
- Step editing and reordering.
- Dependencies between route steps.
- Cost and time estimates.
- Route pause/archive.
- Conversion of route steps into executable tasks.
- Goal progress derived from routes/projects.
- Provenance and evidence fields for AI/researched routes.

## Phase D — Next Best Action engine

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

## Phase E — Secure AI Copilot

Architecture:

```text
browser
  ↓ authenticated request
Supabase Edge Function
  ↓ curated context
AI provider adapter
  ↓ structured proposal
Personal OS
  ↓ user approval when persistent/high-impact
Database
```

No provider secret is stored in GitHub or sent to the browser.

Initial capabilities:
1. contextual conversation;
2. conversation → proposed goal;
3. goal → proposed route;
4. explain Next Best Action;
5. summarize progress and blockers;
6. decision preparation with assumptions/trade-offs;
7. structured proposals requiring confirmation before persistence.

External requirement: an AI API credential must be configured in Supabase Edge Function secrets before real model calls can be enabled.

## Phase F — Structured memory and context

- Curated context assembler by workspace, goal, route, project and decision.
- Context provenance log.
- Summaries instead of unlimited chat replay.
- User-controlled exclusion from AI context for sensitive records.
- Knowledge items with source, date, confidence and relevance.

## Phase G — Reviews and learning

- Today cockpit.
- Daily closeout.
- Weekly review.
- Monthly trajectory review.
- Pattern detection with uncertainty and provenance.
- Recommendation/outcome audit trail.

## Phase H — Product hardening

- Responsive UI and accessibility.
- Empty/error/loading states.
- Automated build and tenant-isolation tests.
- Observability for Edge Functions.
- Rate limiting and AI cost limits.
- Privacy/export/delete-account workflows.
- Terms/privacy surfaces before public commercialization.

## Platform administration privacy rule

Platform admins may see account/operational metadata required to operate the product. Personal content is not exposed by default. Any future support-access mechanism to private user content must be explicit, reason-bound and audited.

## LUFF schema discovered in Personal OS Supabase

A separate `luff` schema currently exists inside the `personal-os` Supabase project and contains taxonomy/configuration records. It remains isolated from Personal OS application tables and was not deleted because it contains non-empty data.

Long-term action: move LUFF to a dedicated project/database. Do not move it into `croma-hub` by assumption. Creating a new Supabase project may have billing implications and requires explicit cost confirmation at the platform level.
