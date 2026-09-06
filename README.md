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
- **Real progress before fake points.** Progression should reflect actual skills, assets, money, projects, evidence and capabilities before optional game-like scoring.

## Domain at a glance

```text
User
└── Workspace
    └── Life
        ├── Areas
        ├── Goals
        │   └── Routes / Journeys
        │       └── Route Steps / Missions
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
│   └── product/              # Vision, AI behavior, roadmap and progression research
├── packages/
│   └── domain/               # Shared TypeScript domain contracts
├── supabase/
│   └── migrations/           # Database schema and security history
└── README.md
```

## Current stage

**Persistence / progression foundation — v0.5B+.**

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
- canonical repository/data layer for Areas, Projects, Tasks, Ideas, Decisions, Routines, Check-ins and Events;
- canonical `/organizar/` CRUD surface for Goals, Projects and Tasks;
- persistent Routes and Route Steps;
- deterministic route progress recalculation;
- activity-log foundation;
- legacy localStorage → Supabase polling bridge removed from authenticated bootstrap;
- progression/Journey planning contract for future AI route generation;
- reusable goal archetype frameworks for acquisition, learning, building, improvement, stabilization, decisions, experiences, habits, financial and career/business goals.

The old main dashboard still contains prototype/browser-only sections and must not be treated as canonical state. Journal and several secondary modules still need direct persistence UI. The Copilot cards are still demo-only and do not call a real AI model.

## Progression direction

The next-generation Personal OS experience is based on:

```text
current state
→ goal / dream / need
→ journey
→ chapters
→ missions
→ tasks / real actions
→ evidence / real result
→ unlock next capability
→ adapt route
```

The research and product rules are documented in:

- `docs/product/progression-copilot-research-v1.md`

The intent is to borrow useful progression mechanics from life/business simulations and gamified productivity systems without importing punishment, guilt or arbitrary busywork.

## Current delivery gate

Before enabling real AI write-proposal capabilities, Personal OS must complete the direct persistence lifecycle of the remaining operational modules and strengthen the Route/Journey engine.

Authoritative implementation documents:

- `docs/implementation/crud-audit-v0.5.md`
- `docs/implementation/v0.5a-canonical-data-layer.md`
- `docs/product/implementation-roadmap-v1.md`
- `docs/product/progression-copilot-research-v1.md`

Primary sequence:

1. ✅ repository/service layer and lifecycle conventions;
2. ✅ canonical CRUD UI for Tasks, Projects and Goals;
3. ✅ retire the runtime legacy polling bridge;
4. complete Route/RouteStep lifecycle and expose Journey/Chapter progression;
5. persistent Ideas and Decisions;
6. Routines execution history, Check-ins, Events and Journal;
7. canonical Today/History read models;
8. deterministic Next Best Action;
9. secure AI Copilot that produces structured, source-aware Journey/Route proposals;
10. structured memory and route adaptation.

## AI boundary

When enabled, the AI will run through a secure backend boundary. Provider secrets must remain in Supabase Edge Function secrets/backend runtime and never be embedded in GitHub Pages, repository code or browser storage.

Persistent/high-impact AI proposals follow:

```text
read authorized context
→ classify the goal
→ understand current state / constraints
→ research when useful
→ propose journey / alternatives
→ user confirms
→ persist through repository
→ audit
→ learn and adapt
```

## Important boundary

Personal OS can help organize observations, goals, decisions and information. It is not a diagnostic system and should not independently make high-impact medical, financial, legal or other consequential decisions for the user.
