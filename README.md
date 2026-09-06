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
│   ├── implementation/       # Versioned implementation notes
│   └── product/              # Vision, AI behavior and design system
├── packages/
│   └── domain/               # Shared TypeScript domain contracts
├── supabase/
│   └── migrations/           # Database schema and security history
└── README.md
```

## Current stage

**Foundation / v0.3.**

Implemented foundation includes:

- Next.js Quiet Cockpit interface;
- Supabase PostgreSQL persistence foundation;
- per-user profiles and workspaces;
- multi-user membership model and RLS;
- goals, projects, tasks and decisions data model;
- persisted routes and route steps domain;
- activity log foundation;
- email/password authentication UI;
- Google OAuth flow prepared in the application;
- session protection and workspace resolution;
- transitional synchronization between the legacy browser store and Supabase core records.

## Next milestones

1. Finish external Google OAuth provider configuration.
2. Replace the transitional `localStorage` bridge with repository-backed CRUD modules.
3. Make Goals, Routes, Route Steps, Projects, Tasks and Decisions fully persisted UI flows.
4. Activate the existing route cards/buttons against real database records.
5. Add the secure AI backend and structured route generation.
6. Implement Next Best Action and curated AI context assembly.
7. Add daily/weekly review flows, provenance and pattern detection.

## Important boundary

Personal OS can help organize observations, goals, decisions and information. It is not a diagnostic system and should not independently make high-impact medical, financial, legal or other consequential decisions for the user.
