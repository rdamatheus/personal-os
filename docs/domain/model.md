# Domain Model

The domain uses a small set of stable primitives plus configurable taxonomies. Specific real-world items should be data, not schema.

## Identity and tenancy
- **Profile:** application-facing identity linked 1:1 to `auth.users`.
- **Workspace:** tenant boundary for all Personal OS data.
- **WorkspaceMember:** maps a user to a workspace with role and status.

Every user starts with one personal workspace. Multi-user/shared workspaces are structurally supported without being required by the first product version.

## Core entities
- **Area:** durable sphere of life or responsibility.
- **Goal:** desired outcome with success criteria and optional horizon.
- **Route:** structured path from a goal toward an outcome.
- **RouteStep:** ordered actionable stage inside a route, with status, estimates, dependencies, source and confidence.
- **Project:** bounded initiative moving goals forward.
- **Task:** concrete executable action; may optionally belong to a project and/or route step.
- **Idea:** captured possibility; explicitly not a task.
- **Decision:** choice with rationale, assumptions, alternatives and review date.
- **Routine / RoutineStep:** reusable recurring behavior definition and its steps.
- **Event:** time-bound occurrence.
- **Observation / CheckIn:** subjective or measured datapoints and grouped observations.
- **MetricDefinition:** defines measurable dimensions and interpretation.
- **Category:** configurable hierarchical taxonomy node.
- **Item:** generic catalog item referenced by events or routines.
- **Context:** circumstances surrounding an event.
- **Tag:** flexible cross-cutting classification.
- **ActivityLog:** append-oriented audit record for significant application actions.

## Relationships
```text
User 1 ── * WorkspaceMember * ── 1 Workspace
Workspace 1 ── * Area
Area 1 ── * Goal
Goal 1 ── * Route
Route 1 ── * RouteStep
Goal * ── * Project
Project 1 ── * Task
RouteStep 0..1 ── * Task
Area 1 ── * Idea
Idea 0..1 ── 0..1 Project
Routine 1 ── * RoutineStep
CheckIn 1 ── * Observation
Event * ── * Item
Event * ── * Context
Decision * ── * EntityRef
Tag * ── * EntityRef
Workspace 1 ── * ActivityLog
```

## Route model
A route is not a static AI response. It is persistent application state.

A route can contain:
- status;
- progress;
- source (`manual`, `ai`, `template`);
- ordered steps;
- time/cost estimates;
- dependencies;
- reason/provenance;
- confidence;
- optional link to a goal.

A route step can later produce executable tasks while remaining the higher-level representation of progress toward the goal.

## Workspace integrity
High-value cross-entity relationships are constrained to the same `workspace_id`. This prevents a record in one tenant from referencing an entity in another tenant even if an application bug attempts it.

## Generic behavior model
Rather than dedicated fields for individual behaviors or consumables, record generic `Event` instances referencing categorized `Item` records, with quantity, unit, timestamp, context and notes. Effects are recorded separately as `Observation` records. This preserves extensibility and prevents the schema from encoding assumptions about any specific item.
