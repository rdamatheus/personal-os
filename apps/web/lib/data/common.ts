import { supabase } from '../supabase';

export type WorkspaceActor = {
  workspaceId: string;
  userId: string;
};

export type AuditInput = WorkspaceActor & {
  action: string;
  entityType: string;
  entityId?: string | null;
  metadata?: Record<string, unknown>;
};

export function nowIso() {
  return new Date().toISOString();
}

export async function recordActivity(input: AuditInput) {
  const { error } = await supabase.from('activity_log').insert({
    workspace_id: input.workspaceId,
    actor_user_id: input.userId,
    action: input.action,
    entity_type: input.entityType,
    entity_id: input.entityId ?? null,
    metadata: input.metadata ?? {},
  });
  if (error) throw error;
}

export async function archiveEntity(
  table: 'areas' | 'goals' | 'projects' | 'tasks' | 'ideas' | 'routines' | 'decisions' | 'routes' | 'route_steps',
  input: WorkspaceActor & { id: string; entityType: string },
) {
  const archivedAt = nowIso();
  const { error } = await supabase
    .from(table)
    .update({ archived_at: archivedAt, updated_at: archivedAt })
    .eq('id', input.id)
    .eq('workspace_id', input.workspaceId);
  if (error) throw error;

  await recordActivity({
    ...input,
    action: `${input.entityType}_archived`,
    entityType: input.entityType,
    entityId: input.id,
  });
}

export async function restoreEntity(
  table: 'areas' | 'goals' | 'projects' | 'tasks' | 'ideas' | 'routines' | 'decisions' | 'routes' | 'route_steps',
  input: WorkspaceActor & { id: string; entityType: string },
) {
  const updatedAt = nowIso();
  const { error } = await supabase
    .from(table)
    .update({ archived_at: null, updated_at: updatedAt })
    .eq('id', input.id)
    .eq('workspace_id', input.workspaceId);
  if (error) throw error;

  await recordActivity({
    ...input,
    action: `${input.entityType}_restored`,
    entityType: input.entityType,
    entityId: input.id,
  });
}

export function requireTitle(value: string, label = 'Título') {
  const normalized = value.trim();
  if (!normalized) throw new Error(`${label} é obrigatório.`);
  return normalized;
}
