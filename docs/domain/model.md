# Domain Model

The domain uses a small set of stable primitives plus configurable taxonomies. Specific real-world items should be data, not schema.

## Core entities
- **Area:** durable sphere of life or responsibility.
- **Goal:** desired outcome with success criteria and optional horizon.
- **Project:** bounded initiative moving goals forward.
- **Task:** concrete executable action.
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

## Relationships
```text
Area 1 ── * Goal
Goal * ── * Project
Project 1 ── * Task
Area 1 ── * Idea
Idea 0..1 ── 0..1 Project
Routine 1 ── * RoutineStep
CheckIn 1 ── * Observation
Event * ── * Item
Event * ── * Context
Decision * ── * EntityRef
Tag * ── * EntityRef
```

## Generic behavior model
Rather than dedicated fields for individual behaviors or consumables, record generic `Event` instances referencing categorized `Item` records, with quantity, unit, timestamp, context and notes. Effects are recorded separately as `Observation` records. This preserves extensibility and prevents the schema from encoding assumptions about any specific item.
