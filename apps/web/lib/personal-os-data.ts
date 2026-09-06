import { supabase } from './supabase';

export type GoalRecord = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string | null;
  target_date: string | null;
  success_criteria: string | null;
  created_at: string;
};

export type RouteStepRecord = {
  id: string;
  route_id: string;
  title: string;
  description: string | null;
  position: number;
  status: 'pending' | 'ready' | 'doing' | 'blocked' | 'done' | 'skipped';
  estimated_minutes: number | null;
  estimated_cost: number | null;
  currency: string;
  due_date: string | null;
  reason: string | null;
  source: string;
  confidence: number | null;
  depends_on_step_ids: string[];
};

export type RouteRecord = {
  id: string;
  goal_id: string | null;
  title: string;
  description: string | null;
  status: 'draft' | 'proposed' | 'active' | 'paused' | 'completed' | 'archived';
  source: 'manual' | 'ai' | 'template';
  progress: number;
  created_at: string;
  route_steps: RouteStepRecord[];
};

export async function listGoals(workspaceId: string) {
  const { data, error } = await supabase
    .from('goals')
    .select('id,title,description,status,priority,target_date,success_criteria,created_at')
    .eq('workspace_id', workspaceId)
    .is('archived_at', null)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as GoalRecord[];
}

export async function createGoal(input: {
  workspaceId: string;
  userId: string;
  title: string;
  description?: string;
  priority?: string;
  targetDate?: string;
  successCriteria?: string;
}) {
  const { data, error } = await supabase
    .from('goals')
    .insert({
      workspace_id: input.workspaceId,
      user_id: input.userId,
      title: input.title,
      description: input.description || null,
      priority: input.priority || 'medium',
      target_date: input.targetDate || null,
      success_criteria: input.successCriteria || null,
      status: 'active',
    })
    .select('id,title,description,status,priority,target_date,success_criteria,created_at')
    .single();
  if (error) throw error;

  await supabase.from('activity_log').insert({
    workspace_id: input.workspaceId,
    actor_user_id: input.userId,
    action: 'goal_created',
    entity_type: 'goal',
    entity_id: data.id,
    metadata: { source: 'manual' },
  });

  return data as GoalRecord;
}

export async function listRoutes(workspaceId: string) {
  const { data, error } = await supabase
    .from('routes')
    .select('id,goal_id,title,description,status,source,progress,created_at,route_steps(id,route_id,title,description,position,status,estimated_minutes,estimated_cost,currency,due_date,reason,source,confidence,depends_on_step_ids)')
    .eq('workspace_id', workspaceId)
    .is('archived_at', null)
    .order('created_at', { ascending: false });
  if (error) throw error;

  return (data ?? []).map(route => ({
    ...route,
    progress: Number(route.progress ?? 0),
    route_steps: [...(route.route_steps ?? [])].sort((a, b) => a.position - b.position),
  })) as RouteRecord[];
}

export async function createRoute(input: {
  workspaceId: string;
  userId: string;
  goalId?: string;
  title: string;
  description?: string;
  steps: Array<{ title: string; description?: string }>;
  source?: 'manual' | 'ai' | 'template';
}) {
  const { data: route, error: routeError } = await supabase
    .from('routes')
    .insert({
      workspace_id: input.workspaceId,
      goal_id: input.goalId || null,
      title: input.title,
      description: input.description || null,
      status: 'active',
      source: input.source ?? 'manual',
      progress: 0,
      created_by: input.userId,
    })
    .select('id')
    .single();
  if (routeError) throw routeError;

  if (input.steps.length) {
    const { error: stepError } = await supabase.from('route_steps').insert(
      input.steps.map((step, index) => ({
        workspace_id: input.workspaceId,
        route_id: route.id,
        title: step.title,
        description: step.description || null,
        position: index,
        status: index === 0 ? 'ready' : 'pending',
        source: input.source ?? 'manual',
        created_by: input.userId,
      })),
    );
    if (stepError) throw stepError;
  }

  await supabase.from('activity_log').insert({
    workspace_id: input.workspaceId,
    actor_user_id: input.userId,
    action: 'route_created',
    entity_type: 'route',
    entity_id: route.id,
    metadata: { source: input.source ?? 'manual', step_count: input.steps.length },
  });

  return route.id as string;
}

export async function setRouteStepStatus(input: {
  workspaceId: string;
  userId: string;
  routeId: string;
  stepId: string;
  status: RouteStepRecord['status'];
}) {
  const { error } = await supabase
    .from('route_steps')
    .update({ status: input.status, updated_at: new Date().toISOString() })
    .eq('id', input.stepId)
    .eq('workspace_id', input.workspaceId);
  if (error) throw error;

  const { data: steps, error: stepsError } = await supabase
    .from('route_steps')
    .select('id,status,position')
    .eq('route_id', input.routeId)
    .eq('workspace_id', input.workspaceId)
    .is('archived_at', null)
    .order('position');
  if (stepsError) throw stepsError;

  const total = steps?.length ?? 0;
  const done = (steps ?? []).filter(step => step.status === 'done' || step.status === 'skipped').length;
  const progress = total ? Math.round((done / total) * 100) : 0;
  const routeStatus = total > 0 && done === total ? 'completed' : 'active';

  const { error: routeError } = await supabase
    .from('routes')
    .update({ progress, status: routeStatus, updated_at: new Date().toISOString() })
    .eq('id', input.routeId)
    .eq('workspace_id', input.workspaceId);
  if (routeError) throw routeError;

  if (input.status === 'done') {
    const next = (steps ?? []).find(step => step.position > ((steps ?? []).find(s => s.id === input.stepId)?.position ?? -1) && step.status === 'pending');
    if (next) {
      await supabase
        .from('route_steps')
        .update({ status: 'ready', updated_at: new Date().toISOString() })
        .eq('id', next.id)
        .eq('workspace_id', input.workspaceId);
    }
  }

  await supabase.from('activity_log').insert({
    workspace_id: input.workspaceId,
    actor_user_id: input.userId,
    action: 'route_step_status_changed',
    entity_type: 'route_step',
    entity_id: input.stepId,
    metadata: { route_id: input.routeId, status: input.status, progress },
  });

  return { progress, routeStatus };
}
