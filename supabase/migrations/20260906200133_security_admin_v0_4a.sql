create table if not exists public.platform_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null
);

comment on table public.platform_admins is 'Platform-level administrators. Separate from workspace roles.';

alter table public.platform_admins enable row level security;
revoke all on table public.platform_admins from anon;
revoke all on table public.platform_admins from authenticated;
grant select on table public.platform_admins to authenticated;

drop policy if exists platform_admins_select_self on public.platform_admins;
create policy platform_admins_select_self
  on public.platform_admins
  for select
  to authenticated
  using (user_id = (select auth.uid()));

create or replace function private.prevent_workspace_owner_change()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if old.owner_user_id is distinct from new.owner_user_id then
    raise exception 'workspace owner_user_id is immutable';
  end if;
  return new;
end;
$$;

create or replace function private.protect_personal_owner_membership()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_owner_user_id uuid;
  v_kind text;
begin
  select w.owner_user_id, w.kind
    into v_owner_user_id, v_kind
  from public.workspaces w
  where w.id = old.workspace_id;

  if v_kind = 'personal' and old.user_id = v_owner_user_id then
    if tg_op = 'DELETE' then
      raise exception 'personal workspace owner membership cannot be deleted';
    end if;
    if new.workspace_id is distinct from old.workspace_id
       or new.user_id is distinct from old.user_id
       or new.role <> 'owner'
       or new.status <> 'active' then
      raise exception 'personal workspace owner membership must remain active owner';
    end if;
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

revoke all on function private.prevent_workspace_owner_change() from public;
revoke all on function private.protect_personal_owner_membership() from public;

drop trigger if exists workspaces_prevent_owner_change on public.workspaces;
create trigger workspaces_prevent_owner_change
before update on public.workspaces
for each row execute function private.prevent_workspace_owner_change();

drop trigger if exists workspace_members_protect_personal_owner on public.workspace_members;
create trigger workspace_members_protect_personal_owner
before update or delete on public.workspace_members
for each row execute function private.protect_personal_owner_membership();

-- Viewers remain read-only. Owners, admins and members may write within workspaces they belong to.
drop policy if exists areas_insert_member on public.areas;
drop policy if exists areas_update_member on public.areas;
create policy areas_insert_writer on public.areas for insert to authenticated
  with check (private.has_workspace_role(workspace_id, array['owner','admin','member']) and user_id = (select auth.uid()));
create policy areas_update_writer on public.areas for update to authenticated
  using (private.has_workspace_role(workspace_id, array['owner','admin','member']))
  with check (private.has_workspace_role(workspace_id, array['owner','admin','member']));

drop policy if exists goals_insert_member on public.goals;
drop policy if exists goals_update_member on public.goals;
create policy goals_insert_writer on public.goals for insert to authenticated
  with check (private.has_workspace_role(workspace_id, array['owner','admin','member']) and user_id = (select auth.uid()));
create policy goals_update_writer on public.goals for update to authenticated
  using (private.has_workspace_role(workspace_id, array['owner','admin','member']))
  with check (private.has_workspace_role(workspace_id, array['owner','admin','member']));

drop policy if exists projects_insert_member on public.projects;
drop policy if exists projects_update_member on public.projects;
create policy projects_insert_writer on public.projects for insert to authenticated
  with check (private.has_workspace_role(workspace_id, array['owner','admin','member']) and user_id = (select auth.uid()));
create policy projects_update_writer on public.projects for update to authenticated
  using (private.has_workspace_role(workspace_id, array['owner','admin','member']))
  with check (private.has_workspace_role(workspace_id, array['owner','admin','member']));

drop policy if exists tasks_insert_member on public.tasks;
drop policy if exists tasks_update_member on public.tasks;
create policy tasks_insert_writer on public.tasks for insert to authenticated
  with check (private.has_workspace_role(workspace_id, array['owner','admin','member']) and user_id = (select auth.uid()));
create policy tasks_update_writer on public.tasks for update to authenticated
  using (private.has_workspace_role(workspace_id, array['owner','admin','member']))
  with check (private.has_workspace_role(workspace_id, array['owner','admin','member']));

drop policy if exists ideas_insert_member on public.ideas;
drop policy if exists ideas_update_member on public.ideas;
create policy ideas_insert_writer on public.ideas for insert to authenticated
  with check (private.has_workspace_role(workspace_id, array['owner','admin','member']) and user_id = (select auth.uid()));
create policy ideas_update_writer on public.ideas for update to authenticated
  using (private.has_workspace_role(workspace_id, array['owner','admin','member']))
  with check (private.has_workspace_role(workspace_id, array['owner','admin','member']));

drop policy if exists routines_insert_member on public.routines;
drop policy if exists routines_update_member on public.routines;
create policy routines_insert_writer on public.routines for insert to authenticated
  with check (private.has_workspace_role(workspace_id, array['owner','admin','member']) and user_id = (select auth.uid()));
create policy routines_update_writer on public.routines for update to authenticated
  using (private.has_workspace_role(workspace_id, array['owner','admin','member']))
  with check (private.has_workspace_role(workspace_id, array['owner','admin','member']));

drop policy if exists decisions_insert_member on public.decisions;
drop policy if exists decisions_update_member on public.decisions;
create policy decisions_insert_writer on public.decisions for insert to authenticated
  with check (private.has_workspace_role(workspace_id, array['owner','admin','member']) and user_id = (select auth.uid()));
create policy decisions_update_writer on public.decisions for update to authenticated
  using (private.has_workspace_role(workspace_id, array['owner','admin','member']))
  with check (private.has_workspace_role(workspace_id, array['owner','admin','member']));

drop policy if exists routes_insert_member on public.routes;
drop policy if exists routes_update_member on public.routes;
create policy routes_insert_writer on public.routes for insert to authenticated
  with check (private.has_workspace_role(workspace_id, array['owner','admin','member']) and created_by = (select auth.uid()));
create policy routes_update_writer on public.routes for update to authenticated
  using (private.has_workspace_role(workspace_id, array['owner','admin','member']))
  with check (private.has_workspace_role(workspace_id, array['owner','admin','member']));

drop policy if exists route_steps_insert_member on public.route_steps;
drop policy if exists route_steps_update_member on public.route_steps;
create policy route_steps_insert_writer on public.route_steps for insert to authenticated
  with check (private.has_workspace_role(workspace_id, array['owner','admin','member']) and created_by = (select auth.uid()));
create policy route_steps_update_writer on public.route_steps for update to authenticated
  using (private.has_workspace_role(workspace_id, array['owner','admin','member']))
  with check (private.has_workspace_role(workspace_id, array['owner','admin','member']));

drop policy if exists check_ins_insert_member on public.check_ins;
create policy check_ins_insert_writer on public.check_ins for insert to authenticated
  with check (private.has_workspace_role(workspace_id, array['owner','admin','member']) and user_id = (select auth.uid()));

drop policy if exists events_insert_member on public.events;
create policy events_insert_writer on public.events for insert to authenticated
  with check (private.has_workspace_role(workspace_id, array['owner','admin','member']) and user_id = (select auth.uid()));

drop policy if exists activity_log_insert_member on public.activity_log;
create policy activity_log_insert_writer on public.activity_log for insert to authenticated
  with check (private.has_workspace_role(workspace_id, array['owner','admin','member']) and (actor_user_id is null or actor_user_id = (select auth.uid())));
