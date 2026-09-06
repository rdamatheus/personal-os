import { supabase } from '../supabase';
import { archiveEntity, nowIso, recordActivity, requireTitle, restoreEntity, type WorkspaceActor } from './common';

export type AreaRecord = {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  icon: string | null;
  status: string;
  archived_at: string | null;
};

export type ProjectRecord = {
  id: string;
  area_id: string | null;
  goal_id: string | null;
  title: string;
  description: string | null;
  status: string;
  priority: string | null;
  progress: number;
  start_date: string | null;
  target_date: string | null;
  archived_at: string | null;
};

export type TaskRecord = {
  id: string;
  area_id: string | null;
  project_id: string | null;
  route_step_id: string | null;
  title: string;
  description: string | null;
  status: string;
  priority: string | null;
  due_at: string | null;
  estimated_minutes: number | null;
  energy_required: number | null;
  archived_at: string | null;
};

export type IdeaRecord = {
  id: string;
  area_id: string | null;
  project_id: string | null;
  title: string;
  description: string | null;
  status: string;
  potential_impact: number | null;
  review_at: string | null;
  archived_at: string | null;
};

export type DecisionRecord = {
  id: string;
  area_id: string | null;
  project_id: string | null;
  title: string;
  decision: string;
  rationale: string | null;
  assumptions: string[];
  alternatives: string[];
  review_at: string | null;
  status: string;
  related_entity_type: string | null;
  related_entity_id: string | null;
  archived_at: string | null;
};

export type RoutineRecord = {
  id: string;
  area_id: string | null;
  name: string;
  description: string | null;
  frequency: string | null;
  preferred_window: string | null;
  duration_estimate: number | null;
  trigger: string | null;
  priority: string | null;
  active: boolean;
  archived_at: string | null;
};

async function listActive<T>(table: string, select: string, workspaceId: string, order = 'created_at') {
  const { data, error } = await supabase
    .from(table)
    .select(select)
    .eq('workspace_id', workspaceId)
    .is('archived_at', null)
    .order(order, { ascending: false });
  if (error) throw error;
  return (data ?? []) as T[];
}

export const areasRepository = {
  list: (workspaceId: string) => listActive<AreaRecord>('areas', 'id,name,description,color,icon,status,archived_at', workspaceId),
  async create(input: WorkspaceActor & { name: string; description?: string; color?: string; icon?: string }) {
    const name = requireTitle(input.name, 'Nome da área');
    const { data, error } = await supabase.from('areas').insert({
      workspace_id: input.workspaceId,
      user_id: input.userId,
      name,
      description: input.description?.trim() || null,
      color: input.color || null,
      icon: input.icon || null,
      status: 'active',
    }).select('id,name,description,color,icon,status,archived_at').single();
    if (error) throw error;
    await recordActivity({ ...input, action: 'area_created', entityType: 'area', entityId: data.id });
    return data as AreaRecord;
  },
  async update(input: WorkspaceActor & { id: string; name?: string; description?: string | null; color?: string | null; icon?: string | null; status?: string }) {
    const patch: Record<string, unknown> = { updated_at: nowIso() };
    if (input.name !== undefined) patch.name = requireTitle(input.name, 'Nome da área');
    if (input.description !== undefined) patch.description = input.description?.trim() || null;
    if (input.color !== undefined) patch.color = input.color;
    if (input.icon !== undefined) patch.icon = input.icon;
    if (input.status !== undefined) patch.status = input.status;
    const { data, error } = await supabase.from('areas').update(patch).eq('id', input.id).eq('workspace_id', input.workspaceId).select('id,name,description,color,icon,status,archived_at').single();
    if (error) throw error;
    await recordActivity({ ...input, action: 'area_updated', entityType: 'area', entityId: input.id });
    return data as AreaRecord;
  },
  archive: (input: WorkspaceActor & { id: string }) => archiveEntity('areas', { ...input, entityType: 'area' }),
  restore: (input: WorkspaceActor & { id: string }) => restoreEntity('areas', { ...input, entityType: 'area' }),
};

export const projectsRepository = {
  list: (workspaceId: string) => listActive<ProjectRecord>('projects', 'id,area_id,goal_id,title,description,status,priority,progress,start_date,target_date,archived_at', workspaceId),
  async create(input: WorkspaceActor & { title: string; description?: string; areaId?: string; goalId?: string; priority?: string; startDate?: string; targetDate?: string }) {
    const title = requireTitle(input.title);
    const { data, error } = await supabase.from('projects').insert({
      workspace_id: input.workspaceId, user_id: input.userId, title,
      description: input.description?.trim() || null, area_id: input.areaId || null, goal_id: input.goalId || null,
      status: 'active', priority: input.priority || 'medium', progress: 0,
      start_date: input.startDate || null, target_date: input.targetDate || null,
    }).select('id,area_id,goal_id,title,description,status,priority,progress,start_date,target_date,archived_at').single();
    if (error) throw error;
    await recordActivity({ ...input, action: 'project_created', entityType: 'project', entityId: data.id });
    return { ...data, progress: Number(data.progress ?? 0) } as ProjectRecord;
  },
  async update(input: WorkspaceActor & { id: string; title?: string; description?: string | null; areaId?: string | null; goalId?: string | null; status?: string; priority?: string | null; progress?: number; startDate?: string | null; targetDate?: string | null }) {
    const patch: Record<string, unknown> = { updated_at: nowIso() };
    if (input.title !== undefined) patch.title = requireTitle(input.title);
    if (input.description !== undefined) patch.description = input.description?.trim() || null;
    if (input.areaId !== undefined) patch.area_id = input.areaId;
    if (input.goalId !== undefined) patch.goal_id = input.goalId;
    if (input.status !== undefined) patch.status = input.status;
    if (input.priority !== undefined) patch.priority = input.priority;
    if (input.progress !== undefined) patch.progress = Math.min(100, Math.max(0, input.progress));
    if (input.startDate !== undefined) patch.start_date = input.startDate;
    if (input.targetDate !== undefined) patch.target_date = input.targetDate;
    const { data, error } = await supabase.from('projects').update(patch).eq('id', input.id).eq('workspace_id', input.workspaceId).select('id,area_id,goal_id,title,description,status,priority,progress,start_date,target_date,archived_at').single();
    if (error) throw error;
    await recordActivity({ ...input, action: 'project_updated', entityType: 'project', entityId: input.id });
    return { ...data, progress: Number(data.progress ?? 0) } as ProjectRecord;
  },
  archive: (input: WorkspaceActor & { id: string }) => archiveEntity('projects', { ...input, entityType: 'project' }),
  restore: (input: WorkspaceActor & { id: string }) => restoreEntity('projects', { ...input, entityType: 'project' }),
};

export const tasksRepository = {
  list: (workspaceId: string) => listActive<TaskRecord>('tasks', 'id,area_id,project_id,route_step_id,title,description,status,priority,due_at,estimated_minutes,energy_required,archived_at', workspaceId),
  async create(input: WorkspaceActor & { title: string; description?: string; areaId?: string; projectId?: string; routeStepId?: string; priority?: string; dueAt?: string; estimatedMinutes?: number; energyRequired?: number }) {
    const title = requireTitle(input.title);
    const { data, error } = await supabase.from('tasks').insert({
      workspace_id: input.workspaceId, user_id: input.userId, title,
      description: input.description?.trim() || null, area_id: input.areaId || null, project_id: input.projectId || null,
      route_step_id: input.routeStepId || null, status: 'todo', priority: input.priority || 'medium', due_at: input.dueAt || null,
      estimated_minutes: input.estimatedMinutes ?? null, energy_required: input.energyRequired ?? null,
    }).select('id,area_id,project_id,route_step_id,title,description,status,priority,due_at,estimated_minutes,energy_required,archived_at').single();
    if (error) throw error;
    await recordActivity({ ...input, action: 'task_created', entityType: 'task', entityId: data.id });
    return data as TaskRecord;
  },
  async update(input: WorkspaceActor & { id: string; title?: string; description?: string | null; areaId?: string | null; projectId?: string | null; routeStepId?: string | null; status?: string; priority?: string | null; dueAt?: string | null; estimatedMinutes?: number | null; energyRequired?: number | null }) {
    const patch: Record<string, unknown> = { updated_at: nowIso() };
    if (input.title !== undefined) patch.title = requireTitle(input.title);
    if (input.description !== undefined) patch.description = input.description?.trim() || null;
    if (input.areaId !== undefined) patch.area_id = input.areaId;
    if (input.projectId !== undefined) patch.project_id = input.projectId;
    if (input.routeStepId !== undefined) patch.route_step_id = input.routeStepId;
    if (input.status !== undefined) patch.status = input.status;
    if (input.priority !== undefined) patch.priority = input.priority;
    if (input.dueAt !== undefined) patch.due_at = input.dueAt;
    if (input.estimatedMinutes !== undefined) patch.estimated_minutes = input.estimatedMinutes;
    if (input.energyRequired !== undefined) patch.energy_required = input.energyRequired;
    const { data, error } = await supabase.from('tasks').update(patch).eq('id', input.id).eq('workspace_id', input.workspaceId).select('id,area_id,project_id,route_step_id,title,description,status,priority,due_at,estimated_minutes,energy_required,archived_at').single();
    if (error) throw error;
    await recordActivity({ ...input, action: 'task_updated', entityType: 'task', entityId: input.id, metadata: { status: input.status } });
    return data as TaskRecord;
  },
  archive: (input: WorkspaceActor & { id: string }) => archiveEntity('tasks', { ...input, entityType: 'task' }),
  restore: (input: WorkspaceActor & { id: string }) => restoreEntity('tasks', { ...input, entityType: 'task' }),
};

export const ideasRepository = {
  list: (workspaceId: string) => listActive<IdeaRecord>('ideas', 'id,area_id,project_id,title,description,status,potential_impact,review_at,archived_at', workspaceId),
  async create(input: WorkspaceActor & { title: string; description?: string; areaId?: string; projectId?: string; potentialImpact?: number; reviewAt?: string }) {
    const title = requireTitle(input.title);
    const { data, error } = await supabase.from('ideas').insert({
      workspace_id: input.workspaceId, user_id: input.userId, title,
      description: input.description?.trim() || null, area_id: input.areaId || null, project_id: input.projectId || null,
      status: 'inbox', potential_impact: input.potentialImpact ?? null, review_at: input.reviewAt || null,
    }).select('id,area_id,project_id,title,description,status,potential_impact,review_at,archived_at').single();
    if (error) throw error;
    await recordActivity({ ...input, action: 'idea_created', entityType: 'idea', entityId: data.id });
    return data as IdeaRecord;
  },
  async update(input: WorkspaceActor & { id: string; title?: string; description?: string | null; areaId?: string | null; projectId?: string | null; status?: string; potentialImpact?: number | null; reviewAt?: string | null }) {
    const patch: Record<string, unknown> = { updated_at: nowIso() };
    if (input.title !== undefined) patch.title = requireTitle(input.title);
    if (input.description !== undefined) patch.description = input.description?.trim() || null;
    if (input.areaId !== undefined) patch.area_id = input.areaId;
    if (input.projectId !== undefined) patch.project_id = input.projectId;
    if (input.status !== undefined) patch.status = input.status;
    if (input.potentialImpact !== undefined) patch.potential_impact = input.potentialImpact;
    if (input.reviewAt !== undefined) patch.review_at = input.reviewAt;
    const { data, error } = await supabase.from('ideas').update(patch).eq('id', input.id).eq('workspace_id', input.workspaceId).select('id,area_id,project_id,title,description,status,potential_impact,review_at,archived_at').single();
    if (error) throw error;
    await recordActivity({ ...input, action: 'idea_updated', entityType: 'idea', entityId: input.id });
    return data as IdeaRecord;
  },
  archive: (input: WorkspaceActor & { id: string }) => archiveEntity('ideas', { ...input, entityType: 'idea' }),
  restore: (input: WorkspaceActor & { id: string }) => restoreEntity('ideas', { ...input, entityType: 'idea' }),
};

export const decisionsRepository = {
  list: (workspaceId: string) => listActive<DecisionRecord>('decisions', 'id,area_id,project_id,title,decision,rationale,assumptions,alternatives,review_at,status,related_entity_type,related_entity_id,archived_at', workspaceId),
  async create(input: WorkspaceActor & { title: string; outcome?: string; rationale?: string; assumptions?: string[]; alternatives?: string[]; reviewAt?: string; areaId?: string; projectId?: string; relatedEntityType?: string; relatedEntityId?: string }) {
    const title = requireTitle(input.title);
    const outcome = (input.outcome || title).trim();
    const { data, error } = await supabase.from('decisions').insert({
      workspace_id: input.workspaceId, user_id: input.userId, title, decision: outcome,
      rationale: input.rationale?.trim() || null, assumptions: input.assumptions ?? [], alternatives: input.alternatives ?? [],
      review_at: input.reviewAt || null, status: 'active', area_id: input.areaId || null, project_id: input.projectId || null,
      related_entity_type: input.relatedEntityType || null, related_entity_id: input.relatedEntityId || null,
    }).select('id,area_id,project_id,title,decision,rationale,assumptions,alternatives,review_at,status,related_entity_type,related_entity_id,archived_at').single();
    if (error) throw error;
    await recordActivity({ ...input, action: 'decision_created', entityType: 'decision', entityId: data.id });
    return data as DecisionRecord;
  },
  async update(input: WorkspaceActor & { id: string; title?: string; outcome?: string; rationale?: string | null; assumptions?: string[]; alternatives?: string[]; reviewAt?: string | null; status?: string; areaId?: string | null; projectId?: string | null; relatedEntityType?: string | null; relatedEntityId?: string | null }) {
    const patch: Record<string, unknown> = { updated_at: nowIso() };
    if (input.title !== undefined) patch.title = requireTitle(input.title);
    if (input.outcome !== undefined) patch.decision = input.outcome.trim();
    if (input.rationale !== undefined) patch.rationale = input.rationale?.trim() || null;
    if (input.assumptions !== undefined) patch.assumptions = input.assumptions;
    if (input.alternatives !== undefined) patch.alternatives = input.alternatives;
    if (input.reviewAt !== undefined) patch.review_at = input.reviewAt;
    if (input.status !== undefined) patch.status = input.status;
    if (input.areaId !== undefined) patch.area_id = input.areaId;
    if (input.projectId !== undefined) patch.project_id = input.projectId;
    if (input.relatedEntityType !== undefined) patch.related_entity_type = input.relatedEntityType;
    if (input.relatedEntityId !== undefined) patch.related_entity_id = input.relatedEntityId;
    const { data, error } = await supabase.from('decisions').update(patch).eq('id', input.id).eq('workspace_id', input.workspaceId).select('id,area_id,project_id,title,decision,rationale,assumptions,alternatives,review_at,status,related_entity_type,related_entity_id,archived_at').single();
    if (error) throw error;
    await recordActivity({ ...input, action: 'decision_updated', entityType: 'decision', entityId: input.id });
    return data as DecisionRecord;
  },
  archive: (input: WorkspaceActor & { id: string }) => archiveEntity('decisions', { ...input, entityType: 'decision' }),
  restore: (input: WorkspaceActor & { id: string }) => restoreEntity('decisions', { ...input, entityType: 'decision' }),
};

export const routinesRepository = {
  list: (workspaceId: string) => listActive<RoutineRecord>('routines', 'id,area_id,name,description,frequency,preferred_window,duration_estimate,trigger,priority,active,archived_at', workspaceId),
  async create(input: WorkspaceActor & { title: string; description?: string; areaId?: string; recurrence?: string; preferredWindow?: string; estimatedMinutes?: number; trigger?: string; priority?: string }) {
    const name = requireTitle(input.title, 'Nome da rotina');
    const { data, error } = await supabase.from('routines').insert({
      workspace_id: input.workspaceId, user_id: input.userId, name,
      description: input.description?.trim() || null, area_id: input.areaId || null, frequency: input.recurrence || null,
      preferred_window: input.preferredWindow || null, duration_estimate: input.estimatedMinutes ?? null, trigger: input.trigger || null,
      priority: input.priority || null, active: true,
    }).select('id,area_id,name,description,frequency,preferred_window,duration_estimate,trigger,priority,active,archived_at').single();
    if (error) throw error;
    await recordActivity({ ...input, action: 'routine_created', entityType: 'routine', entityId: data.id });
    return data as RoutineRecord;
  },
  async update(input: WorkspaceActor & { id: string; title?: string; description?: string | null; areaId?: string | null; recurrence?: string | null; preferredWindow?: string | null; estimatedMinutes?: number | null; trigger?: string | null; priority?: string | null; active?: boolean }) {
    const patch: Record<string, unknown> = { updated_at: nowIso() };
    if (input.title !== undefined) patch.name = requireTitle(input.title, 'Nome da rotina');
    if (input.description !== undefined) patch.description = input.description?.trim() || null;
    if (input.areaId !== undefined) patch.area_id = input.areaId;
    if (input.recurrence !== undefined) patch.frequency = input.recurrence;
    if (input.preferredWindow !== undefined) patch.preferred_window = input.preferredWindow;
    if (input.estimatedMinutes !== undefined) patch.duration_estimate = input.estimatedMinutes;
    if (input.trigger !== undefined) patch.trigger = input.trigger;
    if (input.priority !== undefined) patch.priority = input.priority;
    if (input.active !== undefined) patch.active = input.active;
    const { data, error } = await supabase.from('routines').update(patch).eq('id', input.id).eq('workspace_id', input.workspaceId).select('id,area_id,name,description,frequency,preferred_window,duration_estimate,trigger,priority,active,archived_at').single();
    if (error) throw error;
    await recordActivity({ ...input, action: 'routine_updated', entityType: 'routine', entityId: input.id });
    return data as RoutineRecord;
  },
  archive: (input: WorkspaceActor & { id: string }) => archiveEntity('routines', { ...input, entityType: 'routine' }),
  restore: (input: WorkspaceActor & { id: string }) => restoreEntity('routines', { ...input, entityType: 'routine' }),
};

export const appendRepository = {
  async createCheckIn(input: WorkspaceActor & { focus?: number; energy?: number; mood?: number; stress?: number; anxiety?: number; motivation?: number; appetite?: number; sleepiness?: number; mentalClarity?: number; impulsivity?: number; notes?: string }) {
    const { data, error } = await supabase.from('check_ins').insert({
      workspace_id: input.workspaceId, user_id: input.userId,
      focus: input.focus ?? null, energy: input.energy ?? null, mood: input.mood ?? null, stress: input.stress ?? null,
      anxiety: input.anxiety ?? null, motivation: input.motivation ?? null, appetite: input.appetite ?? null,
      sleepiness: input.sleepiness ?? null, mental_clarity: input.mentalClarity ?? null, impulsivity: input.impulsivity ?? null,
      notes: input.notes?.trim() || null,
    }).select('*').single();
    if (error) throw error;
    await recordActivity({ ...input, action: 'check_in_created', entityType: 'check_in', entityId: data.id });
    return data;
  },
  async listCheckIns(workspaceId: string, limit = 100) {
    const { data, error } = await supabase.from('check_ins').select('*').eq('workspace_id', workspaceId).order('occurred_at', { ascending: false }).limit(limit);
    if (error) throw error;
    return data ?? [];
  },
  async createEvent(input: WorkspaceActor & { category: string; itemName?: string; occurredAt?: string; quantity?: number; unit?: string; context?: string; perceivedEffect?: string; notes?: string }) {
    const { data, error } = await supabase.from('events').insert({
      workspace_id: input.workspaceId, user_id: input.userId, category: input.category,
      item_name: input.itemName?.trim() || null, occurred_at: input.occurredAt || nowIso(), quantity: input.quantity ?? null,
      unit: input.unit || null, context: input.context?.trim() || null, perceived_effect: input.perceivedEffect?.trim() || null,
      notes: input.notes?.trim() || null,
    }).select('*').single();
    if (error) throw error;
    await recordActivity({ ...input, action: 'event_created', entityType: 'event', entityId: data.id });
    return data;
  },
  async listEvents(workspaceId: string, limit = 100) {
    const { data, error } = await supabase.from('events').select('*').eq('workspace_id', workspaceId).order('occurred_at', { ascending: false }).limit(limit);
    if (error) throw error;
    return data ?? [];
  },
};
