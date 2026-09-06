# Technical Architecture

## Initial stack
- Web: Next.js + TypeScript
- UI: React + accessible component primitives
- Hosting: GitHub Pages (static export)
- Backend platform: Supabase
- Database: PostgreSQL
- Auth: Supabase Auth, with email/password and optional Google OAuth
- Server-side integrations: Supabase Edge Functions
- AI: provider adapter with structured outputs; secrets never exposed to the browser

## Layers
```text
UI (GitHub Pages)
↓
Application Services
↓
Domain
↓
Repositories / Supabase client
↓
Supabase Auth + PostgreSQL + Edge Functions
↓
External providers such as OpenAI
```

## Tenant / workspace boundary
Personal OS is personal-first but prepared for multiple users. Every account owns a personal workspace and all application data is scoped by `workspace_id`.

```text
auth.users
↓
profiles
↓
workspaces
↓
workspace_members
↓
areas / goals / routes / projects / tasks / decisions / events
```

Roles are prepared as `owner`, `admin`, `member` and `viewer`, although the first product version primarily uses an owner of a personal workspace.

## Security model
- Row Level Security is enabled on every application table.
- Workspace membership is the main authorization boundary.
- Insert policies bind records to the authenticated actor where applicable.
- Identity ownership fields are immutable after creation.
- Cross-workspace relationships use composite foreign keys where relevant, preventing references to entities from another tenant.
- API secrets, service-role credentials and AI credentials must never be placed in the public repository or browser bundle.

## Domain strategy
Prefer stable primitives with configurable taxonomies over domain-specific columns. For high-value relationships, explicit foreign keys and join tables are preferable for integrity and queryability.

## Core foundation v0.2
The persistent core now includes:
- profiles
- workspaces
- workspace_members
- areas
- goals
- routes
- route_steps
- projects
- tasks
- ideas
- routines
- check_ins
- events
- decisions
- activity_log

`Route` and `RouteStep` formalize the path from an objective to actionable progress. Tasks may optionally be tied to a route step.

## Account bootstrap
A database trigger on `auth.users` creates:
1. an application profile;
2. one personal workspace;
3. an active owner membership.

This keeps onboarding deterministic regardless of whether the identity comes from email/password or a supported OAuth provider.

## Event / audit model
Important mutations should produce domain events or `activity_log` entries such as GoalCreated, RouteApproved, RouteStepCompleted, TaskCompleted, DecisionRecorded and ProjectPaused.

The audit log is intended to support the learning loop:

```text
recommendation → user decision → action → outcome → learning
```

## Privacy
Sensitive records should support visibility scopes, optional encryption strategy, exclusion from AI processing, exclusion from analytics and retention metadata in later versions.

## AI architecture
AI consumes a curated context view, not unrestricted raw storage. Context assembly should be explicit and logged. AI may propose structured changes, but high-impact or persistent changes require user confirmation before execution.

## Deployment boundary
The current Next.js app is exported statically and hosted on GitHub Pages. Therefore server secrets and privileged logic must live outside the frontend, primarily in Supabase Edge Functions for the current architecture.
