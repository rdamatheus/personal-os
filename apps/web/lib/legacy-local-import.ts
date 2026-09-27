import { supabase } from './supabase';

const STORE_KEY = 'personal-os-v1';
const ID_MAP_KEY = 'personal-os-cloud-id-map-v1';
const IMPORT_KEY_PREFIX = 'personal-os-croma-import-v1';
const DEMO_TASK_IDS = new Set(['t1', 't2', 't3']);
const DEMO_PROJECT_IDS = new Set(['p1', 'p2', 'p3']);
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type LegacyStore = {
  tasks?: Array<{ id: string; title: string; done?: boolean; priority?: string; due?: string }>;
  projects?: Array<{ id: string; title: string; progress?: number; status?: string }>;
  decisions?: Array<{ id: string; title: string; reason?: string; review?: string; at?: string }>;
  ideas?: Array<{ id: string; title: string; createdAt?: string }>;
  logs?: Array<{ id: string; kind?: string; item?: string; amount?: string; note?: string; at?: string }>;
  checkins?: Array<{ id: string; focus?: number; energy?: number; mood?: number; stress?: number; at?: string }>;
  routines?: Record<string, boolean>;
};

function parseStore(raw: string): LegacyStore | null {
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed as LegacyStore : null;
  } catch {
    return null;
  }
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

function textOrNull(value: unknown) {
  const text = String(value ?? '').trim();
  return text || null;
}

export async function importLegacyLocalData(workspaceId: string, userId: string) {
  if (typeof window === 'undefined') return { imported: false, reason: 'server' };

  const importKey = `${IMPORT_KEY_PREFIX}:${userId}`;
  if (localStorage.getItem(importKey) === 'done') return { imported: false, reason: 'already_imported' };

  const raw = localStorage.getItem(STORE_KEY);
  if (!raw) return { imported: false, reason: 'no_local_store' };
  const store = parseStore(raw);
  if (!store) return { imported: false, reason: 'invalid_local_store' };

  const tasks = (store.tasks ?? []).filter(item => item?.id && item?.title && !DEMO_TASK_IDS.has(item.id));
  const projects = (store.projects ?? []).filter(item => item?.id && item?.title && !DEMO_PROJECT_IDS.has(item.id));
  const decisions = (store.decisions ?? []).filter(item => item?.id && item?.title);
  const ideas = (store.ideas ?? []).filter(item => item?.id && item?.title);
  const logs = (store.logs ?? []).filter(item => item?.id && (item?.item || item?.kind));
  const checkins = (store.checkins ?? []).filter(item => item?.id);
  const routines = Object.entries(store.routines ?? {}).filter(([name, done]) => name.trim() && done === true);

  const operations: PromiseLike<unknown>[] = [];

  if (projects.length) {
    operations.push(supabase.from('projects').upsert(projects.map(item => ({
      id: localUuid('project', item.id),
      workspace_id: workspaceId,
      user_id: userId,
      title: item.title.trim(),
      status: item.status === 'paused' || item.status === 'done' ? item.status : 'active',
      progress: Math.min(100, Math.max(0, Number(item.progress ?? 0))),
    })), { onConflict: 'id' }));
  }

  if (tasks.length) {
    operations.push(supabase.from('tasks').upsert(tasks.map(item => ({
      id: localUuid('task', item.id),
      workspace_id: workspaceId,
      user_id: userId,
      title: item.title.trim(),
      status: item.done ? 'done' : 'todo',
      priority: ['high', 'medium', 'low'].includes(String(item.priority)) ? item.priority : 'medium',
      due_at: textOrNull(item.due),
    })), { onConflict: 'id' }));
  }

  if (decisions.length) {
    operations.push(supabase.from('decisions').upsert(decisions.map(item => ({
      id: localUuid('decision', item.id),
      workspace_id: workspaceId,
      user_id: userId,
      title: item.title.trim(),
      decision: item.title.trim(),
      rationale: textOrNull(item.reason),
      review_at: textOrNull(item.review),
      created_at: item.at || undefined,
    })), { onConflict: 'id' }));
  }

  if (ideas.length) {
    operations.push(supabase.from('ideas').upsert(ideas.map(item => ({
      id: localUuid('idea', item.id),
      workspace_id: workspaceId,
      user_id: userId,
      title: item.title.trim(),
      status: 'inbox',
      created_at: item.createdAt || undefined,
    })), { onConflict: 'id' }));
  }

  if (logs.length) {
    operations.push(supabase.from('events').upsert(logs.map(item => ({
      id: localUuid('event', item.id),
      workspace_id: workspaceId,
      user_id: userId,
      category: textOrNull(item.kind) || 'Registro',
      item_name: textOrNull(item.item),
      occurred_at: item.at || new Date().toISOString(),
      notes: [textOrNull(item.amount), textOrNull(item.note)].filter(Boolean).join(' · ') || null,
    })), { onConflict: 'id' }));
  }

  if (checkins.length) {
    operations.push(supabase.from('check_ins').upsert(checkins.map(item => ({
      id: localUuid('checkin', item.id),
      workspace_id: workspaceId,
      user_id: userId,
      occurred_at: item.at || new Date().toISOString(),
      focus: item.focus ?? null,
      energy: item.energy ?? null,
      mood: item.mood ?? null,
      stress: item.stress ?? null,
    })), { onConflict: 'id' }));
  }

  if (routines.length) {
    operations.push(supabase.from('routines').upsert(routines.map(([name]) => ({
      id: localUuid('routine', name),
      workspace_id: workspaceId,
      user_id: userId,
      name,
      active: true,
    })), { onConflict: 'id' }));
  }

  const results = await Promise.all(operations);
  const failure = results.find((result: any) => result?.error);
  if (failure && (failure as any).error) throw (failure as any).error;

  localStorage.setItem(importKey, 'done');
  return {
    imported: true,
    counts: {
      tasks: tasks.length,
      projects: projects.length,
      decisions: decisions.length,
      ideas: ideas.length,
      events: logs.length,
      checkins: checkins.length,
      routines: routines.length,
    },
  };
}
