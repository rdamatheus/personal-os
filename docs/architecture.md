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
- Select policies require active membership in the matching workspace, except self-only profile/platform-role checks.
- Write policies require a workspace role of `owner`, `admin` or `member`; `viewer` is read-only.
- Insert policies bind records to the authenticated actor where applicable.
- Identity ownership fields are immutable after creation.
- `workspaces.owner_user_id` cannot be reassigned by normal updates.
- The owner membership of a personal workspace must remain `owner` + `active`.
- Cross-workspace relationships use composite foreign keys where relevant, preventing references to entities from another tenant.
- API secrets, secret/service-role credentials and AI credentials must never be placed in the public repository or browser bundle.

## Platform administration
Workspace authorization and platform administration are deliberately separate concepts.

```text
workspace role              platform role
owner/admin/member/viewer   platform_admin
```

Every personal user is normally `owner` of their own workspace. That does not make them an administrator of the Personal OS platform.

Platform administrators are stored in `public.platform_admins`. The table has RLS enabled and authenticated clients may only detect whether their own user ID is present. There are no client-side insert/update/delete policies for platform administrators.

Privileged user listing is implemented by the `admin-users` Edge Function:
1. the browser sends the current user session;
2. the function validates the session with Supabase Auth;
3. the function checks `platform_admins` by authenticated user UUID;
4. only then does a server-side secret-key client call Auth Admin APIs;
5. the response contains account/workspace metadata, not personal goal/task/diary content.

The Supabase secret key exists only in the Edge Function environment. It is never embedded in GitHub Pages or committed to the repository.

The first platform administrator is provisioned operationally in the database after account creation rather than hardcoded into a migration, so repository history does not bind administrative access to a generated user UUID or account credential.

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

## Security + administration v0.4A
This release adds:
- `platform_admins` as a distinct platform-level authorization layer;
- read-only self-detection of platform-admin status;
- immutable personal-workspace ownership protections;
- read-only `viewer` behavior across workspace data;
- the authenticated `admin-users` Edge Function;
- the `/admin/users/` platform administration interface;
- account-level user visibility without exposing private Personal OS content.

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

Platform administration should default to account metadata and operational metrics. Reading a user's personal content for support should be a separate future capability with explicit purpose, authorization and audit logging.

## AI architecture
AI consumes a curated context view, not unrestricted raw storage. Context assembly should be explicit and logged. AI may propose structured changes, but high-impact or persistent changes require user confirmation before execution.

## Deployment boundary
The current Next.js app is exported statically and hosted on GitHub Pages. Therefore server secrets and privileged logic must live outside the frontend, primarily in Supabase Edge Functions for the current architecture.
