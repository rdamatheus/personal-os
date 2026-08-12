# Personal OS

> **Capture everything. Commit to less. Finish what matters. Learn from the pattern.**

Personal OS is a calm, extensible personal operating system for connecting life areas, goals, projects, tasks, routines, observations, decisions, and patterns without turning every idea into an obligation.

## Product principles

- **Capture without commitment.** Ideas can exist without becoming tasks.
- **Generic by design.** Categories and taxonomies are configurable rather than hard-coded around one behavior, medication, substance, routine, or life area.
- **Context matters.** Events and observations can be connected to time, place, activity, people, and perceived state.
- **Reflection before automation.** The system can surface patterns, but the user remains the decision-maker.
- **Quiet cockpit.** The interface should reduce cognitive load instead of creating another source of pressure.
- **Privacy first.** Personal and health-adjacent data should be treated as sensitive by default.

## Domain at a glance

```text
Life
├── Areas
├── Goals
├── Projects
├── Tasks
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
│   └── product/              # Vision, routines, AI behavior, design system
├── packages/
│   └── domain/               # Shared TypeScript domain contracts
├── LICENSE
└── README.md
```

## Current stage

Foundation / v0.1. The repository currently defines the product vision, domain model, extensibility rules, routine system, AI chief-of-staff principles, design language, and an initial Next.js dashboard shell.

## Next milestones

1. Persist the domain model in a relational database.
2. Add quick capture for ideas, tasks, events, and observations.
3. Implement daily and weekly review flows.
4. Build configurable taxonomies and relationships.
5. Add pattern detection with explicit uncertainty and provenance.
6. Add privacy controls and selective AI context.

## Important boundary

Personal OS can help organize self-observations and prepare information for professional conversations. It is not a diagnostic system and should not independently recommend medication changes, substance use, or medical treatment.
