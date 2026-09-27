import { createClient } from 'npm:@supabase/supabase-js@2.115.0';

const allowedOrigins = new Set([
  'https://rdamatheus.github.io',
  'http://localhost:3000',
]);

function corsHeaders(req: Request) {
  const origin = req.headers.get('Origin') ?? '';
  return {
    'Access-Control-Allow-Origin': allowedOrigins.has(origin) ? origin : 'https://rdamatheus.github.io',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Vary': 'Origin',
  };
}

function json(req: Request, body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders(req),
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'private, no-store',
    },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders(req) });
  if (req.method !== 'POST') return json(req, { error: 'Method not allowed' }, 405);

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) return json(req, { error: 'Authentication required' }, 401);

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const publishableKeysRaw = Deno.env.get('SUPABASE_PUBLISHABLE_KEYS');
    const secretKeysRaw = Deno.env.get('SUPABASE_SECRET_KEYS');
    if (!supabaseUrl || !publishableKeysRaw || !secretKeysRaw) {
      console.error('Required Supabase Edge Function environment is missing.');
      return json(req, { error: 'Server configuration unavailable' }, 500);
    }

    const publishableKey = JSON.parse(publishableKeysRaw)?.default;
    const secretKey = JSON.parse(secretKeysRaw)?.default;
    if (!publishableKey || !secretKey) return json(req, { error: 'Server configuration unavailable' }, 500);

    const userClient = createClient(supabaseUrl, publishableKey, {
      db: { schema: 'personal_os' },
      auth: { persistSession: false, autoRefreshToken: false },
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.slice('Bearer '.length);
    const { data: userData, error: userError } = await userClient.auth.getUser(token);
    if (userError || !userData.user) return json(req, { error: 'Invalid or expired session' }, 401);

    const adminClient = createClient(supabaseUrl, secretKey, {
      db: { schema: 'personal_os' },
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: platformAdmin, error: platformAdminError } = await adminClient
      .from('platform_admins')
      .select('user_id')
      .eq('user_id', userData.user.id)
      .maybeSingle();
    if (platformAdminError) {
      console.error('Platform admin check failed', platformAdminError);
      return json(req, { error: 'Authorization check failed' }, 500);
    }
    if (!platformAdmin) return json(req, { error: 'Platform administrator access required' }, 403);

    const payload = await req.json().catch(() => ({} as Record<string, unknown>));
    const requestedPage = Number((payload as Record<string, unknown>).page ?? 1);
    const requestedPerPage = Number((payload as Record<string, unknown>).perPage ?? 100);
    const page = Number.isFinite(requestedPage) ? Math.max(1, Math.floor(requestedPage)) : 1;
    const perPage = Number.isFinite(requestedPerPage) ? Math.min(100, Math.max(1, Math.floor(requestedPerPage))) : 100;
    const from = (page - 1) * perPage;
    const to = from + perPage - 1;

    // A fonte da listagem é o próprio Personal OS. Usuários que pertencem apenas à Croma
    // compartilham auth.users, mas não aparecem nesta administração.
    const { data: profiles, error: profilesError, count } = await adminClient
      .from('profiles')
      .select('id,display_name,avatar_url,timezone,locale,created_at', { count: 'exact' })
      .order('created_at', { ascending: true })
      .range(from, to);
    if (profilesError) throw profilesError;

    const profileRows = profiles ?? [];
    const userIds = profileRows.map(profile => profile.id);
    let memberships: Array<Record<string, any>> = [];
    if (userIds.length) {
      const { data, error } = await adminClient
        .from('workspace_members')
        .select('workspace_id,user_id,role,status,created_at')
        .in('user_id', userIds);
      if (error) throw error;
      memberships = data ?? [];
    }

    const workspaceIds = [...new Set(memberships.map(membership => membership.workspace_id).filter(Boolean))];
    let workspaces: Array<Record<string, any>> = [];
    if (workspaceIds.length) {
      const { data, error } = await adminClient
        .from('workspaces')
        .select('id,owner_user_id,name,kind,created_at,archived_at')
        .in('id', workspaceIds);
      if (error) throw error;
      workspaces = data ?? [];
    }

    const authUsers = new Map<string, any>();
    await Promise.all(userIds.map(async userId => {
      const { data, error } = await adminClient.auth.admin.getUserById(userId);
      if (!error && data.user) authUsers.set(userId, data.user);
    }));

    const workspaceById = new Map(workspaces.map(workspace => [workspace.id, workspace]));
    const membershipsByUser = new Map<string, Array<Record<string, any>>>();
    for (const membership of memberships) {
      const existing = membershipsByUser.get(membership.user_id) ?? [];
      existing.push(membership);
      membershipsByUser.set(membership.user_id, existing);
    }

    const normalizedUsers = profileRows.map(profile => {
      const authUser = authUsers.get(profile.id);
      const userMemberships = membershipsByUser.get(profile.id) ?? [];
      const personalMembership = userMemberships.find(membership => workspaceById.get(membership.workspace_id)?.kind === 'personal') ?? userMemberships[0];
      const workspace = personalMembership ? workspaceById.get(personalMembership.workspace_id) : undefined;
      const providers = Array.isArray(authUser?.app_metadata?.providers)
        ? authUser.app_metadata.providers
        : authUser?.app_metadata?.provider
          ? [authUser.app_metadata.provider]
          : [];
      const bannedUntil = authUser?.banned_until ? new Date(authUser.banned_until) : null;
      const isBanned = Boolean(bannedUntil && bannedUntil.getTime() > Date.now());

      return {
        id: profile.id,
        email: authUser?.email ?? null,
        phone: authUser?.phone || null,
        displayName: profile.display_name ?? authUser?.user_metadata?.full_name ?? authUser?.user_metadata?.name ?? authUser?.email?.split('@')[0] ?? 'Usuário',
        avatarUrl: profile.avatar_url ?? authUser?.user_metadata?.avatar_url ?? authUser?.user_metadata?.picture ?? null,
        providers,
        createdAt: authUser?.created_at ?? profile.created_at,
        lastSignInAt: authUser?.last_sign_in_at ?? null,
        emailConfirmedAt: authUser?.email_confirmed_at ?? null,
        isAnonymous: Boolean(authUser?.is_anonymous),
        status: isBanned ? 'suspended' : 'active',
        workspace: workspace ? {
          id: workspace.id,
          name: workspace.name,
          kind: workspace.kind,
          role: personalMembership?.role ?? null,
          membershipStatus: personalMembership?.status ?? null,
          createdAt: workspace.created_at,
          archivedAt: workspace.archived_at,
        } : null,
      };
    });

    const now = Date.now();
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
    const summary = {
      total: count ?? normalizedUsers.length,
      returned: normalizedUsers.length,
      active: normalizedUsers.filter(user => user.status === 'active').length,
      google: normalizedUsers.filter(user => user.providers.includes('google')).length,
      email: normalizedUsers.filter(user => user.providers.includes('email')).length,
      newLast7Days: normalizedUsers.filter(user => now - new Date(user.createdAt).getTime() <= sevenDaysMs).length,
      page,
      perPage,
      nextPage: count && to + 1 < count ? page + 1 : null,
      lastPage: count ? Math.max(1, Math.ceil(count / perPage)) : 1,
    };

    return json(req, { summary, users: normalizedUsers });
  } catch (error) {
    console.error('admin-users failed', error);
    return json(req, { error: 'Unexpected server error' }, 500);
  }
});
