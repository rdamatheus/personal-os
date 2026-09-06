import { supabase } from '../supabase';
import { archiveEntity, nowIso, recordActivity, requireTitle, restoreEntity, type WorkspaceActor } from './common';
import type { ProjectRecord, TaskRecord } from './core-repository';

export type GoalRecord = {
  id: string;
  area_id: string | null;
  title: string;
  description: string | null;
  status: string;
  priority: string | null;
  target_date: string | null;
  success_criteria: string | null;
  archived_at: string | null;
};

const goalSelect = 'id,area_id,title,description,status,priority,target_date,success_criteria,archived_at';
const projectSelect = 'id,area_id,goal_id,title,description,status,priority,progress,start_date,target_date,archived_at';
const taskSelect = 'id,area_id,project_id,route_step_id,title,description,status,priority,due_at,estimated_minutes,energy_required,archived_at';

export const goalsRepository = {
  async list(workspaceId: string) {
    const { data, error } = await supabase
      .from('goals')
      .select(goalSelect)
      .eq('workspace_id', workspaceId)
      .is('archived_at', null)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []) as GoalRecord[];
  },

  async listArchived(workspaceId: string) {
    const { data, error } = await supabase
      .from('goals')
      .select(goalSelect)
      .eq('workspace_id', workspaceId)
      .not('archived_at', 'is', null)
      .order('archived_at', { ascending: false });
    if (error) throw error;
    return (data ?? []) as GoalRecord[];
  },

  async create(input: WorkspaceActor & {
    title: string;
    description?: string;
    areaId?: string;
    priority?: string;
    targetDate?: string;
    successCriteria?: string;
  }) {
    const title = requireTitle(input.title);
    const { data, error } = await supabase.from('goals').insert({
      workspace_id: input.workspaceId,
      user_id: input.userId,
      area_id: input.areaId || null,
      title,
      description: input.description?.trim() || null,
      status: 'active',
      priority: input.priority || 'medium',
      target_date: input.targetDate || null,
      success_criteria: input.successCriteria?.trim() || null,
    }).select(goalSelect).single();
    if (error) throw error;
    await recordActivity({ ...input, action: 'goal_created', entityType: 'goal', entityId: data.id });
    return data as GoalRecord;
  },

  async update(input: WorkspaceActor & {
    id: string;
    title?: string;
    description?: string | null;
    areaId?: string | null;
    status?: string;
    priority?: string | null;
    targetDate?: string | null;
    successCriteria?: string | null;
  }) {
    const patch: Record<string, unknown> = { updated_at: nowIso() };
    if (input.title !== undefined) patch.title = requireTitle(input.title);
    if (input.description !== undefined) patch.description = input.description?.trim() || null;
    if (input.areaId !== undefined) patch.area_id = input.areaId;
    if (input.status !== undefined) patch.status = input.status;
    if (input.priority !== undefined) patch.priority = input.priority;
    if (input.targetDate !== undefined) patch.target_date = input.targetDate;
    if (input.successCriteria !== undefined) patch.success_criteria = input.successCriteria?.trim() || null;

    const { data, error } = await supabase
      .from('goals')
      .update(patch)
      .eq('id', input.id)
      .eq('workspace_id', input.workspaceId)
      .select(goalSelect)
      .single();
    if (error) throw error;
    await recordActivity({
      ...input,
      action: 'goal_updated',
      entityType: 'goal',
      entityId: input.id,
      metadata: { status: input.status },
    });
    return data as GoalRecord;
  },

  archive: (input: WorkspaceActor & { id: string }) => archiveEntity('goals', { ...input, entityType: 'goal' }),
  restore: (input: WorkspaceActor & { id: string }) => restoreEntity('goals', { ...input, entityType: 'goal' }),
};

export async function listArchivedProjects(workspaceId: string) {
  const { data, error } = await supabase
    .from('projects')
    .select(projectSelect)
    .eq('workspace_id', workspaceId)
    .not('archived_at', 'is', null)
    .order('archived_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(item => ({ ...item, progress: Number(item.progress ?? 0) })) as ProjectRecord[];
}

export async function listArchivedTasks(workspaceId: string) {
  const { data, error } = await supabase
    .from('tasks')
    .select(taskSelect)
    .eq('workspace_id', workspaceId)
    .not('archived_at', 'is', null)
    .order('archived_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as TaskRecord[];
}
