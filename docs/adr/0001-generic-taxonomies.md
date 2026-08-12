# ADR 0001: Prefer Generic Primitives and Configurable Taxonomies

Status: Accepted

## Context
The system must represent changing personal domains without schema rewrites.

## Decision
Use generic primitives (`Item`, `Event`, `Observation`, `Category`, `Context`) and user-configurable hierarchical taxonomies. Specific concepts are catalog data rather than schema fields.

## Consequences
Positive: extensibility, simpler migrations, customization and cross-domain analytics.

Tradeoffs: validation becomes metadata-driven, queries need careful indexing, and category semantics require governance.
