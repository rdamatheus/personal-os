create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated, service_role;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  timezone text not null default 'America/Sao_Paulo',
  locale text not null default 'pt-BR',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete restrict,
  name text not null,
  kind text not null default 'personal' check (kind in ('personal','shared')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz
);

create unique index if not exists one_active_personal_workspace_per_owner
  on public.workspaces(owner_user_id)
  where kind = 'personal' and archived_at is null;

create table if not exists public.workspace_members (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner','admin','member','viewer')),
  status text not null default 'active' check (status in ('active','invited','suspended')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (workspace_id, user_id)
);

alter table public.areas add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;
alter table public.goals add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;
alter table public.projects add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;
alter table public.tasks add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;
alter table public.ideas add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;
alter table public.routines add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;
alter table public.check_ins add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;
alter table public.events add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;
alter table public.decisions add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;

alter table public.areas add column if not exists archived_at timestamptz;
alter table public.goals add column if not exists archived_at timestamptz;
alter table public.projects add column if not exists archived_at timestamptz;
alter table public.projects add column if not exists progress numeric(5,2) not null default 0 check (progress >= 0 and progress <= 100);
alter table public.tasks add column if not exists archived_at timestamptz;
alter table public.ideas add column if not exists archived_at timestamptz;
alter table public.routines add column if not exists archived_at timestamptz;
alter table public.decisions add column if not exists archived_at timestamptz;
alter table public.decisions add column if not exists assumptions text[] not null default '{}';
alter table public.decisions add column if not exists alternatives text[] not null default '{}';
alter table public.decisions add column if not exists related_entity_type text;
alter table public.decisions add column if not exists related_entity_id uuid;

alter table public.areas alter column user_id set default auth.uid();
alter table public.goals alter column user_id set default auth.uid();
alter table public.projects alter column user_id set default auth.uid();
alter table public.tasks alter column user_id set default auth.uid();
alter table public.ideas alter column user_id set default auth.uid();
alter table public.routines alter column user_id set default auth.uid();
alter table public.check_ins alter column user_id set default auth.uid();
alter table public.events alter column user_id set default auth.uid();
alter table public.decisions alter column user_id set default auth.uid();

create table public.routes (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  goal_id uuid,
  title text not null,
  description text,
  status text not null default 'draft' check (status in ('draft','proposed','active','paused','completed','archived')),
  source text not null default 'manual' check (source in ('manual','ai','template')),
  progress numeric(5,2) not null default 0 check (progress >= 0 and progress <= 100),
  created_by uuid not null default auth.uid() references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz
);

create table public.route_steps (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  route_id uuid not null,
  title text not null,
  description text,
  position integer not null check (position >= 0),
  status text not null default 'pending' check (status in ('pending','ready','doing','blocked','done','skipped')),
  estimated_minutes integer check (estimated_minutes is null or estimated_minutes >= 0),
  estimated_cost numeric(12,2) check (estimated_cost is null or estimated_cost >= 0),
  currency char(3) not null default 'BRL',
  due_date date,
  reason text,
  source text not null default 'manual' check (source in ('manual','ai','template')),
  confidence numeric(4,3) check (confidence is null or (confidence >= 0 and confidence <= 1)),
  depends_on_step_ids uuid[] not null default '{}',
  created_by uuid not null default auth.uid() references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  unique (route_id, position)
);

alter table public.tasks add column if not exists route_step_id uuid;

create table public.activity_log (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  actor_user_id uuid default auth.uid() references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.areas add constraint areas_id_workspace_key unique (id, workspace_id);
alter table public.goals add constraint goals_id_workspace_key unique (id, workspace_id);
alter table public.projects add constraint projects_id_workspace_key unique (id, workspace_id);
alter table public.routes add constraint routes_id_workspace_key unique (id, workspace_id);
alter table public.route_steps add constraint route_steps_id_workspace_key unique (id, workspace_id);

alter table public.goals add constraint goals_area_workspace_fk foreign key (area_id, workspace_id) references public.areas(id, workspace_id);
alter table public.projects add constraint projects_area_workspace_fk foreign key (area_id, workspace_id) references public.areas(id, workspace_id);
alter table public.projects add constraint projects_goal_workspace_fk foreign key (goal_id, workspace_id) references public.goals(id, workspace_id);
alter table public.tasks add constraint tasks_area_workspace_fk foreign key (area_id, workspace_id) references public.areas(id, workspace_id);
alter table public.tasks add constraint tasks_project_workspace_fk foreign key (project_id, workspace_id) references public.projects(id, workspace_id);
alter table public.decisions add constraint decisions_area_workspace_fk foreign key (area_id, workspace_id) references public.areas(id, workspace_id);
alter table public.decisions add constraint decisions_project_workspace_fk foreign key (project_id, workspace_id) references public.projects(id, workspace_id);
alter table public.ideas add constraint ideas_area_workspace_fk foreign key (area_id, workspace_id) references public.areas(id, workspace_id);
alter table public.ideas add constraint ideas_project_workspace_fk foreign key (project_id, workspace_id) references public.projects(id, workspace_id);
alter table public.routines add constraint routines_area_workspace_fk foreign key (area_id, workspace_id) references public.areas(id, workspace_id);
alter table public.routes add constraint routes_goal_workspace_fk foreign key (goal_id, workspace_id) references public.goals(id, workspace_id);
alter table public.route_steps add constraint route_steps_route_workspace_fk foreign key (route_id, workspace_id) references public.routes(id, workspace_id);
alter table public.tasks add constraint tasks_route_step_workspace_fk foreign key (route_step_id, workspace_id) references public.route_steps(id, workspace_id);

create index if not exists workspace_members_user_idx on public.workspace_members(user_id, status);
create index if not exists areas_workspace_status_idx on public.areas(workspace_id, status);
create index if not exists goals_workspace_status_idx on public.goals(workspace_id, status);
create index if not exists routes_workspace_status_idx on public.routes(workspace_id, status);
create index if not exists routes_goal_idx on public.routes(goal_id);
create index if not exists route_steps_route_status_idx on public.route_steps(route_id, status, position);
create index if not exists projects_workspace_status_idx on public.projects(workspace_id, status);
create index if not exists tasks_workspace_status_idx on public.tasks(workspace_id, status);
create index if not exists tasks_route_step_idx on public.tasks(route_step_id);
create index if not exists tasks_due_idx on public.tasks(workspace_id, due_at) where due_at is not null;
create index if not exists ideas_workspace_status_idx on public.ideas(workspace_id, status);
create index if not exists routines_workspace_active_idx on public.routines(workspace_id, active);
create index if not exists check_ins_workspace_occurred_idx on public.check_ins(workspace_id, occurred_at desc);
create index if not exists events_workspace_occurred_idx on public.events(workspace_id, occurred_at desc);
create index if not exists decisions_workspace_status_idx on public.decisions(workspace_id, status);
create index if not exists activity_log_workspace_created_idx on public.activity_log(workspace_id, created_at desc);
create index if not exists activity_log_entity_idx on public.activity_log(entity_type, entity_id);

create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function private.prevent_user_id_change()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if old.user_id is distinct from new.user_id then
    raise exception 'user_id is immutable';
  end if;
  return new;
end;
$$;

create or replace function private.prevent_created_by_change()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if old.created_by is distinct from new.created_by then
    raise exception 'created_by is immutable';
  end if;
  return new;
end;
$$;

create or replace function private.is_workspace_member(p_workspace_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.workspace_members wm
    where wm.workspace_id = p_workspace_id
      and wm.user_id = (select auth.uid())
      and wm.status = 'active'
  );
$$;

create or replace function private.has_workspace_role(p_workspace_id uuid, p_roles text[])
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.workspace_members wm
    where wm.workspace_id = p_workspace_id
      and wm.user_id = (select auth.uid())
      and wm.status = 'active'
      and wm.role = any(p_roles)
  );
$$;

revoke all on function private.is_workspace_member(uuid) from public;
revoke all on function private.has_workspace_role(uuid, text[]) from public;
grant execute on function private.is_workspace_member(uuid) to authenticated, service_role;
grant execute on function private.has_workspace_role(uuid, text[]) to authenticated, service_role;

create trigger profiles_set_updated_at before update on public.profiles for each row execute function private.set_updated_at();
create trigger workspaces_set_updated_at before update on public.workspaces for each row execute function private.set_updated_at();
create trigger workspace_members_set_updated_at before update on public.workspace_members for each row execute function private.set_updated_at();
create trigger areas_set_updated_at before update on public.areas for each row execute function private.set_updated_at();
create trigger goals_set_updated_at before update on public.goals for each row execute function private.set_updated_at();
create trigger projects_set_updated_at before update on public.projects for each row execute function private.set_updated_at();
create trigger tasks_set_updated_at before update on public.tasks for each row execute function private.set_updated_at();
create trigger ideas_set_updated_at before update on public.ideas for each row execute function private.set_updated_at();
create trigger routines_set_updated_at before update on public.routines for each row execute function private.set_updated_at();
create trigger decisions_set_updated_at before update on public.decisions for each row execute function private.set_updated_at();
create trigger routes_set_updated_at before update on public.routes for each row execute function private.set_updated_at();
create trigger route_steps_set_updated_at before update on public.route_steps for each row execute function private.set_updated_at();

create trigger areas_prevent_user_id_change before update on public.areas for each row execute function private.prevent_user_id_change();
create trigger goals_prevent_user_id_change before update on public.goals for each row execute function private.prevent_user_id_change();
create trigger projects_prevent_user_id_change before update on public.projects for each row execute function private.prevent_user_id_change();
create trigger tasks_prevent_user_id_change before update on public.tasks for each row execute function private.prevent_user_id_change();
create trigger ideas_prevent_user_id_change before update on public.ideas for each row execute function private.prevent_user_id_change();
create trigger routines_prevent_user_id_change before update on public.routines for each row execute function private.prevent_user_id_change();
create trigger decisions_prevent_user_id_change before update on public.decisions for each row execute function private.prevent_user_id_change();
create trigger routes_prevent_created_by_change before update on public.routes for each row execute function private.prevent_created_by_change();
create trigger route_steps_prevent_created_by_change before update on public.route_steps for each row execute function private.prevent_created_by_change();

alter table public.profiles enable row level security;
alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.areas enable row level security;
alter table public.goals enable row level security;
alter table public.projects enable row level security;
alter table public.tasks enable row level security;
alter table public.ideas enable row level security;
alter table public.routines enable row level security;
alter table public.check_ins enable row level security;
alter table public.events enable row level security;
alter table public.decisions enable row level security;
alter table public.routes enable row level security;
alter table public.route_steps enable row level security;
alter table public.activity_log enable row level security;

drop policy if exists areas_delete_own on public.areas;
drop policy if exists areas_insert_own on public.areas;
drop policy if exists areas_select_own on public.areas;
drop policy if exists areas_update_own on public.areas;
drop policy if exists goals_own_all on public.goals;
drop policy if exists projects_own_all on public.projects;
drop policy if exists tasks_own_all on public.tasks;
drop policy if exists ideas_own_all on public.ideas;
drop policy if exists routines_own_all on public.routines;
drop policy if exists check_ins_own_all on public.check_ins;
drop policy if exists events_own_all on public.events;
drop policy if exists decisions_own_all on public.decisions;

create policy profiles_select_self on public.profiles for select to authenticated using (id = (select auth.uid()));
create policy profiles_update_self on public.profiles for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));

create policy workspaces_select_member on public.workspaces for select to authenticated using (owner_user_id = (select auth.uid()) or private.is_workspace_member(id));
create policy workspaces_insert_owner on public.workspaces for insert to authenticated with check (owner_user_id = (select auth.uid()));
create policy workspaces_update_admin on public.workspaces for update to authenticated using (owner_user_id = (select auth.uid()) or private.has_workspace_role(id, array['owner','admin'])) with check (owner_user_id = (select auth.uid()) or private.has_workspace_role(id, array['owner','admin']));

create policy workspace_members_select_related on public.workspace_members for select to authenticated using (user_id = (select auth.uid()) or private.is_workspace_member(workspace_id));
create policy workspace_members_insert_admin on public.workspace_members for insert to authenticated with check (private.has_workspace_role(workspace_id, array['owner','admin']) or exists (select 1 from public.workspaces w where w.id = workspace_id and w.owner_user_id = (select auth.uid())));
create policy workspace_members_update_admin on public.workspace_members for update to authenticated using (private.has_workspace_role(workspace_id, array['owner','admin']) or exists (select 1 from public.workspaces w where w.id = workspace_id and w.owner_user_id = (select auth.uid()))) with check (private.has_workspace_role(workspace_id, array['owner','admin']) or exists (select 1 from public.workspaces w where w.id = workspace_id and w.owner_user_id = (select auth.uid())));

create policy areas_select_member on public.areas for select to authenticated using (private.is_workspace_member(workspace_id));
create policy areas_insert_member on public.areas for insert to authenticated with check (private.is_workspace_member(workspace_id) and user_id = (select auth.uid()));
create policy areas_update_member on public.areas for update to authenticated using (private.is_workspace_member(workspace_id)) with check (private.is_workspace_member(workspace_id));
create policy goals_select_member on public.goals for select to authenticated using (private.is_workspace_member(workspace_id));
create policy goals_insert_member on public.goals for insert to authenticated with check (private.is_workspace_member(workspace_id) and user_id = (select auth.uid()));
create policy goals_update_member on public.goals for update to authenticated using (private.is_workspace_member(workspace_id)) with check (private.is_workspace_member(workspace_id));
create policy projects_select_member on public.projects for select to authenticated using (private.is_workspace_member(workspace_id));
create policy projects_insert_member on public.projects for insert to authenticated with check (private.is_workspace_member(workspace_id) and user_id = (select auth.uid()));
create policy projects_update_member on public.projects for update to authenticated using (private.is_workspace_member(workspace_id)) with check (private.is_workspace_member(workspace_id));
create policy tasks_select_member on public.tasks for select to authenticated using (private.is_workspace_member(workspace_id));
create policy tasks_insert_member on public.tasks for insert to authenticated with check (private.is_workspace_member(workspace_id) and user_id = (select auth.uid()));
create policy tasks_update_member on public.tasks for update to authenticated using (private.is_workspace_member(workspace_id)) with check (private.is_workspace_member(workspace_id));
create policy ideas_select_member on public.ideas for select to authenticated using (private.is_workspace_member(workspace_id));
create policy ideas_insert_member on public.ideas for insert to authenticated with check (private.is_workspace_member(workspace_id) and user_id = (select auth.uid()));
create policy ideas_update_member on public.ideas for update to authenticated using (private.is_workspace_member(workspace_id)) with check (private.is_workspace_member(workspace_id));
create policy routines_select_member on public.routines for select to authenticated using (private.is_workspace_member(workspace_id));
create policy routines_insert_member on public.routines for insert to authenticated with check (private.is_workspace_member(workspace_id) and user_id = (select auth.uid()));
create policy routines_update_member on public.routines for update to authenticated using (private.is_workspace_member(workspace_id)) with check (private.is_workspace_member(workspace_id));
create policy check_ins_select_member on public.check_ins for select to authenticated using (private.is_workspace_member(workspace_id));
create policy check_ins_insert_member on public.check_ins for insert to authenticated with check (private.is_workspace_member(workspace_id) and user_id = (select auth.uid()));
create policy events_select_member on public.events for select to authenticated using (private.is_workspace_member(workspace_id));
create policy events_insert_member on public.events for insert to authenticated with check (private.is_workspace_member(workspace_id) and user_id = (select auth.uid()));
create policy decisions_select_member on public.decisions for select to authenticated using (private.is_workspace_member(workspace_id));
create policy decisions_insert_member on public.decisions for insert to authenticated with check (private.is_workspace_member(workspace_id) and user_id = (select auth.uid()));
create policy decisions_update_member on public.decisions for update to authenticated using (private.is_workspace_member(workspace_id)) with check (private.is_workspace_member(workspace_id));
create policy routes_select_member on public.routes for select to authenticated using (private.is_workspace_member(workspace_id));
create policy routes_insert_member on public.routes for insert to authenticated with check (private.is_workspace_member(workspace_id) and created_by = (select auth.uid()));
create policy routes_update_member on public.routes for update to authenticated using (private.is_workspace_member(workspace_id)) with check (private.is_workspace_member(workspace_id));
create policy route_steps_select_member on public.route_steps for select to authenticated using (private.is_workspace_member(workspace_id));
create policy route_steps_insert_member on public.route_steps for insert to authenticated with check (private.is_workspace_member(workspace_id) and created_by = (select auth.uid()));
create policy route_steps_update_member on public.route_steps for update to authenticated using (private.is_workspace_member(workspace_id)) with check (private.is_workspace_member(workspace_id));
create policy activity_log_select_member on public.activity_log for select to authenticated using (private.is_workspace_member(workspace_id));
create policy activity_log_insert_member on public.activity_log for insert to authenticated with check (private.is_workspace_member(workspace_id) and (actor_user_id is null or actor_user_id = (select auth.uid())));

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_workspace_id uuid;
  v_display_name text;
begin
  v_display_name := coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), nullif(new.raw_user_meta_data ->> 'name', ''), nullif(split_part(coalesce(new.email, ''), '@', 1), ''), 'Usuário');
  insert into public.profiles (id, display_name, avatar_url)
  values (new.id, v_display_name, coalesce(new.raw_user_meta_data ->> 'avatar_url', new.raw_user_meta_data ->> 'picture'))
  on conflict (id) do nothing;
  select w.id into v_workspace_id from public.workspaces w where w.owner_user_id = new.id and w.kind = 'personal' and w.archived_at is null limit 1;
  if v_workspace_id is null then
    insert into public.workspaces (owner_user_id, name, kind) values (new.id, 'Personal OS de ' || v_display_name, 'personal') returning id into v_workspace_id;
  end if;
  insert into public.workspace_members (workspace_id, user_id, role, status)
  values (v_workspace_id, new.id, 'owner', 'active')
  on conflict (workspace_id, user_id) do update set role = 'owner', status = 'active', updated_at = now();
  return new;
end;
$$;

revoke all on function private.handle_new_user() from public;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function private.handle_new_user();

insert into public.profiles (id, display_name, avatar_url)
select u.id,
       coalesce(nullif(u.raw_user_meta_data ->> 'full_name',''), nullif(u.raw_user_meta_data ->> 'name',''), nullif(split_part(coalesce(u.email,''),'@',1),''), 'Usuário'),
       coalesce(u.raw_user_meta_data ->> 'avatar_url', u.raw_user_meta_data ->> 'picture')
from auth.users u
on conflict (id) do nothing;

do $$
declare
  r record;
  v_workspace_id uuid;
begin
  for r in select id, email, raw_user_meta_data from auth.users loop
    select w.id into v_workspace_id from public.workspaces w where w.owner_user_id = r.id and w.kind = 'personal' and w.archived_at is null limit 1;
    if v_workspace_id is null then
      insert into public.workspaces (owner_user_id, name, kind)
      values (r.id, 'Personal OS de ' || coalesce(nullif(r.raw_user_meta_data ->> 'full_name',''), nullif(r.raw_user_meta_data ->> 'name',''), nullif(split_part(coalesce(r.email,''),'@',1),''), 'Usuário'), 'personal')
      returning id into v_workspace_id;
    end if;
    insert into public.workspace_members (workspace_id, user_id, role, status)
    values (v_workspace_id, r.id, 'owner', 'active')
    on conflict (workspace_id, user_id) do update set role='owner', status='active', updated_at=now();
  end loop;
end $$;

alter table public.areas alter column workspace_id set not null;
alter table public.goals alter column workspace_id set not null;
alter table public.projects alter column workspace_id set not null;
alter table public.tasks alter column workspace_id set not null;
alter table public.ideas alter column workspace_id set not null;
alter table public.routines alter column workspace_id set not null;
alter table public.check_ins alter column workspace_id set not null;
alter table public.events alter column workspace_id set not null;
alter table public.decisions alter column workspace_id set not null;

comment on table public.profiles is 'Application profile linked 1:1 to auth.users.';
comment on table public.workspaces is 'Tenant boundary for Personal OS data; each user starts with one personal workspace.';
comment on table public.workspace_members is 'Workspace membership and role mapping used by RLS.';
comment on table public.routes is 'Structured path from a goal toward an outcome.';
comment on table public.route_steps is 'Ordered actionable steps inside a route.';
comment on table public.activity_log is 'Append-only audit/event log for significant application actions.';