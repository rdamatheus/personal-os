# Personal OS — Progression Copilot Research v1

Date: 2026-09-06

## Objective

Turn Personal OS from a task/dashboard tool into a personal progression system: the user describes a dream, objective, need or problem, the system understands the current state, constructs a realistic route, exposes dependencies and milestones, and keeps adapting the path as real life changes.

The inspiration is not to make life childish or to copy a game UI. The goal is to borrow the useful mechanics of progression systems while keeping real-world state, privacy, evidence and user agency at the center.

## Research synthesis

### Big Ambitions

Useful mechanics identified from the official game description and developer material:

- sandbox: the player defines what success means;
- progression begins from a constrained current state rather than from an abstract goal;
- long-term outcomes emerge from chains of concrete prerequisites;
- money, time, infrastructure, people, assets and personal needs constrain what is possible next;
- visible progression comes from real changes in capability and assets, not only points;
- growth can branch into different strategies instead of following one mandatory ladder;
- health, sleep and happiness coexist with business ambition;
- failure is recoverable: succeed, fail, rebuild;
- personal goals and achievements provide milestones, but the simulation itself remains the main source of meaning.

Product translation:

```text
CURRENT STATE
  ↓
GOAL / DREAM / NEED
  ↓
JOURNEY
  ↓
CHAPTERS
  ↓
MISSIONS / ROUTE STEPS
  ↓
TASKS / REAL ACTIONS
  ↓
EVIDENCE / REAL-WORLD RESULT
  ↓
UNLOCK NEXT CAPABILITY
  ↓
ADAPT ROUTE
```

### AI and personal productivity assistants

Recurring high-value patterns across current products:

- **Motion / Reclaim:** automatic prioritization and scheduling should consider deadlines, priorities, dependencies and changing availability.
- **Sunsama:** daily/weekly planning works better when workload is explicit and overcommitment is surfaced instead of hidden.
- **Todoist AI:** a useful AI turns vague goals into concrete tasks/subtasks.
- **Notion AI:** AI is most useful when it lives near canonical project/task context and can create roadmaps from that context.
- **ChatGPT Projects:** long-running work benefits from persistent context instead of repeating background in every conversation.
- **Gemini:** proactive daily guidance becomes stronger when connected context can surface what deserves attention now.
- **Habitica:** rewards, levels and quests can make progress visible, but punishment mechanics should not be copied into Personal OS.
- **Finch:** gentle progress, themed areas, daily goals and milestones show that gamification can motivate without guilt or harsh failure states.

## Product principles derived from the research

### 1. Sandbox success

Personal OS must not impose a single definition of success.

Examples:
- owning one profitable business may be enough;
- buying a motorcycle may be the entire journey;
- learning phone repair may be for hobby, employment or a new business;
- improving a graphic service may mean quality, margin, speed or scale.

The Copilot must ask what success means for this user and this goal.

### 2. Real progress before fake points

Primary progress comes from actual state changes:

- money saved;
- skill practiced and demonstrated;
- course completed;
- first paying customer;
- asset acquired;
- debt reduced;
- project shipped;
- recurring process stabilized;
- prerequisite resolved.

Optional XP/levels may exist only as a visualization derived from those outcomes. Clicking tasks must never become more important than real progress.

### 3. Chapters and unlocks

A route should feel like progression through meaningful chapters.

Example — Buy a motorcycle:

```text
Chapter 1 — Readiness
  clarify use, license, constraints

Chapter 2 — Financial viability
  target price, ownership cost, savings capacity

Chapter 3 — Market research
  models, reliability, insurance, maintenance

Chapter 4 — Acquisition
  inspection, negotiation, documentation, purchase

Chapter 5 — Ownership
  maintenance plan, recurring cost, safety, reserve
```

A chapter may stay locked because of a real prerequisite, not because the application wants to slow the user down artificially.

### 4. Multiple route strategies

When useful, the Copilot should offer more than one viable path:

- conservative;
- balanced;
- aggressive / faster;
- low-cost;
- learning-first;
- outsource-first.

The user chooses the trade-off.

### 5. The route is persistent state

An AI answer is not the route.

The AI proposes a structured route. After approval, Personal OS persists it as Goal → Route → RouteSteps, links Projects/Tasks, tracks progress and updates the route as reality changes.

### 6. State-aware Copilot

Before generating a serious route, the system should use the minimum required discovery:

- desired outcome;
- current state;
- deadline, if any;
- money/resources available;
- time available;
- constraints;
- preferences;
- definition of success.

If information is missing but non-critical, the AI can proceed with explicit assumptions. If the missing information changes safety, feasibility or cost significantly, the AI should ask first.

### 7. Goal archetypes

The system now defines reusable route frameworks for:

- acquire;
- learn;
- build;
- improve;
- stabilize;
- decide;
- experience;
- habit;
- financial;
- career/business;
- custom.

The archetype is a planning scaffold, not a rigid template. AI customizes it to the person and context.

### 8. Gentle gamification

Use:
- chapters;
- missions;
- milestones;
- progress maps;
- real-world achievements;
- capabilities unlocked;
- optional levels/XP derived from verified progress;
- visible trajectory.

Avoid:
- loss of health/points because the user missed a task;
- guilt streaks;
- arbitrary daily pressure;
- rewards for busywork;
- pretending a percentage is meaningful when it is not tied to real state.

### 9. Personal state matters

Borrow the useful lesson from life simulation: ambition competes for finite resources.

The route engine should eventually consider:
- time;
- money;
- energy/focus;
- commitments;
- skills;
- dependencies;
- recurring costs;
- risks;
- current workload.

This does not mean diagnosing the user. It means not recommending an impossible plan.

## AI route-generation contract

The secure AI backend should return structured proposals containing:

- classified goal archetype;
- desired outcome;
- current-state assumptions;
- missing information;
- success definition;
- chapters;
- missions per chapter;
- prerequisites/dependencies;
- estimated time/cost where possible;
- reason for each mission;
- evidence required to consider a mission complete;
- progress metrics;
- sources/provenance when researched;
- confidence;
- first best action.

TypeScript contract lives at:

- `apps/web/lib/progression/model.ts`
- `apps/web/lib/progression/goal-framework.ts`

## Examples

### Dream: Buy a motorcycle

The system should not immediately output "save money".

It should discover intended use, license/readiness, budget, recurring affordability and target date, then build a route around acquisition plus sustainable ownership.

### Goal: Learn phone repair

Progression should emphasize demonstrated capability:

```text
fundamentals
→ tools + safety
→ supervised practice
→ common repairs
→ diagnostics
→ complete real devices
→ quality checklist
→ optional monetization path
```

### Need: Improve trail/signage plaque service

Possible progression:

```text
baseline current service
→ identify defects / complaints / margin
→ define improved standard
→ test materials and process
→ create reference prototype
→ price real cost
→ document production checklist
→ test with customer
→ standardize
```

### Goal: Start selling websites

Possible progression:

```text
choose market / offer
→ minimum delivery capability
→ portfolio proof
→ pricing and scope
→ prospecting system
→ first sale
→ delivery
→ testimonial / case study
→ repeatable operation
```

## Next implementation sequence

1. retire the legacy browser synchronization bridge after canonical CRUD validation;
2. complete canonical CRUD across the remaining modules;
3. evolve Routes into chapter/mission progression UI;
4. persist route provenance, dependencies, costs and success criteria;
5. implement deterministic Next Best Action;
6. add the secure AI route generator using the progression contract;
7. require approval before persisting AI-created goals/routes;
8. add journey dashboard and real-world milestones;
9. add daily/weekly adaptation and route recalculation;
10. add optional visual XP/levels only after real progress metrics are reliable.

## Research sources

- Big Ambitions official site: https://www.bigambitionsgame.com/
- Big Ambitions Steam: https://store.steampowered.com/app/1331550/Big_Ambitions/
- Big Ambitions developer community — personal goals: https://forum.bigambitionsgame.com/t/feedback-wanted-personal-goals/1185
- Motion AI Task Manager: https://www.usemotion.com/features/ai-task-manager
- Reclaim Planner / Tasks: https://reclaim.ai/features/planner and https://reclaim.ai/features/tasks
- Sunsama daily/weekly planning: https://www.sunsama.com/features/daily-planning-and-shutdown
- Todoist AI Assistant: https://www.todoist.com/integrations/apps/task-assist
- Notion AI: https://www.notion.com/product/ai
- ChatGPT Projects: https://help.openai.com/articles/10169521-projects-in-chatgpt
- Gemini task scheduling/day agenda: https://support.google.com/gemini/
- Habitica: https://habitica.com/static/home
- Finch: https://help.finchcare.com/
