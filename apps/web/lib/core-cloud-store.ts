import { supabase } from './supabase';

const STORE_KEY = 'personal-os-v1';
const ID_MAP_KEY = 'personal-os-cloud-id-map-v1';
const DEMO_TASK_IDS = new Set(['t1', 't2', 't3']);
const DEMO_PROJECT_IDS = new Set(['p1', 'p2', 'p3']);
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type CoreStore = {
  tasks?: Array<{ id: string; title: string; area?: string; done: boolean; priority?: 'high' | 'medium' | 'low'; due?: string }>;
  projects?: Array<{ id: string; title: string; area?: string; progress?: number; status?: 'active' | 'paused' | 'done' }>;
  decisions?: Array<{ id: string; title: string; reason?: string; review?: string; at?: string }>;
  [key: string]: unknown;
};

function parseStore(raw: string | null): CoreStore {
  if (!raw) return {};
  try { return JSON.parse(raw) as CoreStore; } catch { return {}; }
}

function localUuid(kind: string, id: string) {
  if (UUID_RE.test(id)) return id;
  const raw = localStorage.getItem(ID_MAP_KEY);
  let map: Record<string, string> = {};
  try { if (raw) map = JSON.parse(raw); } catch {}
  const key = `${kind}:${id}`;
  if (!map[key]) {
    map[key] = crypto.randomUUID();
    localStorage.setItem(ID_MAP_KEY, JSON.stringify(map));
  }
  return map[key];
}

async function queryCore(workspaceId: string) {
  const [tasksRes, projectsRes, decisionsRes] = await Promise.all([
    supabase.from('tasks').select('id,title,status,priority,due_at').eq('workspace_id', workspaceId).is('archived_at', null).order('created_at'),
    supabase.from('projects').select('id,title,status,progress').eq('workspace_id', workspaceId).is('archived_at', null).order('created_at'),
    supabase.from('decisions').select('id,title,rationale,review_at,created_at').eq('workspace_id', workspaceId).is('archived_at', null).order('created_at', { ascending: false }),
  ]);

  const error = tasksRes.error ?? projectsRes.error ?? decisionsRes.error;
  if (error) throw error;

  return {
    tasks: (tasksRes.data ?? []).map(t => ({
      id: t.id,
      title: t.title,
      area: 'Pessoal',
      done: t.status === 'done',
      priority: (t.priority === 'high' || t.priority === 'low' ? t.priority : 'medium') as 'high' | 'medium' | 'low',
      due: t.due_at ?? undefined,
    })),
    projects: (projectsRes.data ?? []).map(p => ({
      id: p.id,
      title: p.title,
      area: 'Pessoal',
      progress: Number(p.progress ?? 0),
      status: (p.status === 'paused' || p.status === 'done' ? p.status : 'active') as 'active' | 'paused' | 'done',
    })),
    decisions: (decisionsRes.data ?? []).map(d => ({
      id: d.id,
      title: d.title,
      reason: d.rationale ?? '',
      review: d.review_at ?? undefined,
      at: d.created_at,
    })),
  };
}

export async function syncCoreStore(workspaceId: string, userId: string, store: CoreStore) {
  const tasks = (store.tasks ?? []).filter(t => !DEMO_TASK_IDS.has(t.id));
  const projects = (store.projects ?? []).filter(p => !DEMO_PROJECT_IDS.has(p.id));
  const decisions = store.decisions ?? [];

  const taskRows = tasks.map(t => ({
    id: localUuid('task', t.id),
    workspace_id: workspaceId,
    user_id: userId,
    title: t.title,
    status: t.done ? 'done' : 'todo',
    priority: t.priority ?? 'medium',
    due_at: t.due ?? null,
  }));
  const projectRows = projects.map(p => ({
    id: localUuid('project', p.id),
    workspace_id: workspaceId,
    user_id: userId,
    title: p.title,
    status: p.status ?? 'active',
    progress: p.progress ?? 0,
  }));
  const decisionRows = decisions.map(d => ({
    id: localUuid('decision', d.id),
    workspace_id: workspaceId,
    user_id: userId,
    title: d.title,
    decision: d.title,
    rationale: d.reason ?? null,
    review_at: d.review ?? null,
  }));

  const operations = [] as PromiseLike<unknown>[];
  if (taskRows.length) operations.push(supabase.from('tasks').upsert(taskRows, { onConflict: 'id' }));
  if (projectRows.length) operations.push(supabase.from('projects').upsert(projectRows, { onConflict: 'id' }));
  if (decisionRows.length) operations.push(supabase.from('decisions').upsert(decisionRows, { onConflict: 'id' }));
  await Promise.all(operations);
}

export async function hydrateCoreStore(workspaceId: string, userId: string) {
  let cloud = await queryCore(workspaceId);
  const local = parseStore(localStorage.getItem(STORE_KEY));
  const localHasRealCore =
    (local.tasks ?? []).some(t => !DEMO_TASK_IDS.has(t.id)) ||
    (local.projects ?? []).some(p => !DEMO_PROJECT_IDS.has(p.id)) ||
    (local.decisions ?? []).length > 0;
  const cloudIsEmpty = cloud.tasks.length === 0 && cloud.projects.length === 0 && cloud.decisions.length === 0;

  if (cloudIsEmpty && localHasRealCore) {
    await syncCoreStore(workspaceId, userId, local);
    cloud = await queryCore(workspaceId);
  }

  const merged: CoreStore = { ...local, ...cloud };
  localStorage.setItem(STORE_KEY, JSON.stringify(merged));
  return JSON.stringify(merged);
}

export function watchCoreStore(
  workspaceId: string,
  userId: string,
  baseline: string,
  onError?: (error: unknown) => void,
) {
  let last = baseline;
  let syncing = false;
  const timer = window.setInterval(async () => {
    if (syncing) return;
    const current = localStorage.getItem(STORE_KEY) ?? '';
    if (!current || current === last) return;
    syncing = true;
    try {
      await syncCoreStore(workspaceId, userId, parseStore(current));
      last = current;
    } catch (error) {
      onError?.(error);
    } finally {
      syncing = false;
    }
  }, 1500);

  return () => window.clearInterval(timer);
}
