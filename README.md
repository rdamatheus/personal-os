# Personal OS

> **Capture everything. Commit to less. Finish what matters. Learn from the pattern.**

Personal OS is a calm, extensible personal operating system for connecting life areas, goals, projects, routes, tasks, routines, observations, decisions, and patterns without turning every idea into an obligation.

## Product principles

- **Capture without commitment.** Ideas can exist without becoming tasks.
- **Generic by design.** Categories and taxonomies are configurable rather than hard-coded around one behavior, routine, or life area.
- **Context matters.** Events and observations can be connected to time, place, activity, people, and perceived state.
- **Reflection before automation.** The system can surface patterns, but the user remains the decision-maker.
- **Quiet cockpit.** The interface should reduce cognitive load instead of creating another source of pressure.
- **Privacy first.** Personal and sensitive data should be treated as private by default.
- **Copilot with approval.** AI may analyze and recommend, but relevant state-changing actions remain user-controlled.

## Domain at a glance

```text
User
└── Workspace
    └── Life
        ├── Areas
        ├── Goals
        │   └── Routes
        │       └── Route Steps
        ├── Projects
        │   └── Tasks
        ├── Ideas
        ├── Decisions
        ├── Routines
        ├── Events
        ├── Observations
        ├── Metrics
        └── Context
```

Health, behavior, work, finance, relationships, learning, and other domains are modeled through configurable areas, categories, items, tags, and relationships rather than rigid application fields.

## Repository structure

```text
personal-os/
├── apps/
│   └── web/                  # Next.js experience / quiet cockpit
├── docs/
│   ├── adr/                  # Architecture decision records
│   ├── domain/               # Domain model and taxonomies
│   ├── implementation/       # Versioned implementation notes and audits
│   └── product/              # Vision, AI behavior, roadmap and design system
├── packages/
│   └── domain/               # Shared TypeScript domain contracts
├── supabase/
│   └── migrations/           # Database schema and security history
└── README.md
```

## Current stage

**Persistence / CRUD completion planning — v0.5.**

Implemented foundation includes:

- Next.js Quiet Cockpit interface on GitHub Pages;
- Supabase PostgreSQL persistence foundation;
- email/password authentication;
- Google OAuth with production redirect configured;
- PKCE session handling, sign-out and protected routes;
- per-user profiles and personal workspaces;
- multi-user workspace model and RLS isolation;
- distinct `platform_admin` authorization;
- secure admin user directory through a Supabase Edge Function;
- persistent Goals;
- persistent Routes and Route Steps;
- deterministic route progress recalculation;
- activity-log foundation;
- transitional synchronization of Tasks, Projects and Decisions from the legacy browser store.

The current dashboard is **not yet fully persistence-complete**. Ideas, routines, check-ins, events and Journal remain browser-only, while Tasks/Projects/Decisions still use a temporary `localStorage` synchronization bridge. The Copilot cards are still demo-only and do not call a real AI model.

## Current delivery gate

Before enabling real AI write-proposal capabilities, Personal OS must complete the direct persistence lifecycle of its operational modules.

The authoritative audit is:

- `docs/implementation/crud-audit-v0.5.md`

Primary sequence:

1. repository/service layer and lifecycle conventions;
2. direct CRUD for Tasks, Projects and Goals;
3. complete Route/RouteStep lifecycle;
4. persistent Ideas and Decisions;
5. Routines execution history, Check-ins, Events and Journal;
6. canonical Today/History read models;
7. account lifecycle and automated CRUD/RLS regression tests;
8. only then connect the secure real AI Copilot.

## AI boundary

When enabled, the AI will run through a secure backend boundary. Provider secrets must remain in Supabase Edge Function secrets/backend runtime and never be embedded in GitHub Pages, repository code or browser storage.

Persistent/high-impact AI proposals follow:

```text
read authorized context
→ analyze / calculate
→ propose
→ user confirms
→ persist through repository
→ audit
→ learn from outcome
```

## Important boundary

Personal OS can help organize observations, goals, decisions and information. It is not a diagnostic system and should not independently make high-impact medical, financial, legal or other consequential decisions for the user.
