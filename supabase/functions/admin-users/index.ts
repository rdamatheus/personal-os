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
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders(req) });
  }
  if (req.method !== 'POST') {
    return json(req, { error: 'Method not allowed' }, 405);
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return json(req, { error: 'Authentication required' }, 401);
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const publishableKeysRaw = Deno.env.get('SUPABASE_PUBLISHABLE_KEYS');
    const secretKeysRaw = Deno.env.get('SUPABASE_SECRET_KEYS');
    if (!supabaseUrl || !publishableKeysRaw || !secretKeysRaw) {
      console.error('Required Supabase Edge Function environment is missing.');
      return json(req, { error: 'Server configuration unavailable' }, 500);
    }

    const publishableKey = JSON.parse(publishableKeysRaw)?.default;
    const secretKey = JSON.parse(secretKeysRaw)?.default;
    if (!publishableKey || !secretKey) {
      console.error('Default Supabase API keys are unavailable to the function.');
      return json(req, { error: 'Server configuration unavailable' }, 500);
    }

    const userClient = createClient(supabaseUrl, publishableKey, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.slice('Bearer '.length);
    const { data: userData, error: userError } = await userClient.auth.getUser(token);
    if (userError || !userData.user) {
      return json(req, { error: 'Invalid or expired session' }, 401);
    }

    const adminClient = createClient(supabaseUrl, secretKey, {
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
    if (!platformAdmin) {
      return json(req, { error: 'Platform administrator access required' }, 403);
    }

    const payload = await req.json().catch(() => ({} as Record<string, unknown>));
    const requestedPage = Number((payload as Record<string, unknown>).page ?? 1);
    const requestedPerPage = Number((payload as Record<string, unknown>).perPage ?? 200);
    const page = Number.isFinite(requestedPage) ? Math.max(1, Math.floor(requestedPage)) : 1;
    const perPage = Number.isFinite(requestedPerPage) ? Math.min(500, Math.max(1, Math.floor(requestedPerPage))) : 200;

    const { data: authPage, error: authError } = await adminClient.auth.admin.listUsers({ page, perPage });
    if (authError) {
      console.error('Auth user listing failed', authError);
      return json(req, { error: 'Could not load users' }, 500);
    }

    const users = authPage.users ?? [];
    const userIds = users.map((user) => user.id);

    let profiles: Array<Record<string, any>> = [];
    let memberships: Array<Record<string, any>> = [];
    if (userIds.length > 0) {
      const [profilesRes, membershipsRes] = await Promise.all([
        adminClient.from('profiles').select('id,display_name,avatar_url,timezone,locale,created_at').in('id', userIds),
        adminClient.from('workspace_members').select('workspace_id,user_id,role,status,created_at').in('user_id', userIds),
      ]);
      if (profilesRes.error) throw profilesRes.error;
      if (membershipsRes.error) throw membershipsRes.error;
      profiles = profilesRes.data ?? [];
      memberships = membershipsRes.data ?? [];
    }

    const workspaceIds = [...new Set(memberships.map((membership) => membership.workspace_id).filter(Boolean))];
    let workspaces: Array<Record<string, any>> = [];
    if (workspaceIds.length > 0) {
      const { data, error } = await adminClient
        .from('workspaces')
        .select('id,owner_user_id,name,kind,created_at,archived_at')
        .in('id', workspaceIds);
      if (error) throw error;
      workspaces = data ?? [];
    }

    const profileByUser = new Map(profiles.map((profile) => [profile.id, profile]));
    const workspaceById = new Map(workspaces.map((workspace) => [workspace.id, workspace]));
    const membershipsByUser = new Map<string, Array<Record<string, any>>>();
    for (const membership of memberships) {
      const existing = membershipsByUser.get(membership.user_id) ?? [];
      existing.push(membership);
      membershipsByUser.set(membership.user_id, existing);
    }

    const normalizedUsers = users.map((user) => {
      const profile = profileByUser.get(user.id);
      const userMemberships = membershipsByUser.get(user.id) ?? [];
      const personalMembership = userMemberships.find((membership) => workspaceById.get(membership.workspace_id)?.kind === 'personal') ?? userMemberships[0];
      const workspace = personalMembership ? workspaceById.get(personalMembership.workspace_id) : undefined;
      const providers = Array.isArray(user.app_metadata?.providers)
        ? user.app_metadata.providers
        : user.app_metadata?.provider
          ? [user.app_metadata.provider]
          : [];
      const bannedUntil = user.banned_until ? new Date(user.banned_until) : null;
      const isBanned = Boolean(bannedUntil && bannedUntil.getTime() > Date.now());

      return {
        id: user.id,
        email: user.email ?? null,
        phone: user.phone || null,
        displayName: profile?.display_name ?? user.user_metadata?.full_name ?? user.user_metadata?.name ?? user.email?.split('@')[0] ?? 'Usuário',
        avatarUrl: profile?.avatar_url ?? user.user_metadata?.avatar_url ?? user.user_metadata?.picture ?? null,
        providers,
        createdAt: user.created_at,
        lastSignInAt: user.last_sign_in_at ?? null,
        emailConfirmedAt: user.email_confirmed_at ?? null,
        isAnonymous: Boolean(user.is_anonymous),
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
      total: authPage.total ?? normalizedUsers.length,
      returned: normalizedUsers.length,
      active: normalizedUsers.filter((user) => user.status === 'active').length,
      google: normalizedUsers.filter((user) => user.providers.includes('google')).length,
      email: normalizedUsers.filter((user) => user.providers.includes('email')).length,
      newLast7Days: normalizedUsers.filter((user) => now - new Date(user.createdAt).getTime() <= sevenDaysMs).length,
      page,
      perPage,
      nextPage: authPage.nextPage ?? null,
      lastPage: authPage.lastPage ?? null,
    };

    return json(req, { summary, users: normalizedUsers });
  } catch (error) {
    console.error('admin-users failed', error);
    return json(req, { error: 'Unexpected server error' }, 500);
  }
});
