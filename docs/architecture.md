# Technical Architecture

## Initial stack
- Web: Next.js + TypeScript
- UI: React + accessible component primitives
- Database: PostgreSQL
- ORM: Prisma or Drizzle
- Auth: provider-agnostic abstraction
- Jobs: queue abstraction
- AI: provider adapter with structured outputs

## Layers
```text
UI
↓
Application Services
↓
Domain
↓
Repositories / Integrations
↓
PostgreSQL + external providers
```

## Domain strategy
Prefer stable primitives with configurable taxonomies over domain-specific columns. For high-value relationships, explicit join tables are preferable for integrity and queryability.

## Event model
Important mutations may produce domain events such as IdeaCaptured, IdeaPromoted, TaskCompleted, RoutineCompleted, CheckInRecorded, DecisionRecorded, ProjectStarted and ProjectPaused.

## Privacy
Sensitive records should support visibility scopes, optional encryption strategy, exclusion from AI processing, exclusion from analytics and retention metadata.

## AI architecture
AI consumes a curated context view, not unrestricted raw storage. Context assembly should be explicit and logged.
