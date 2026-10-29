-- Restrict account creation to server-side admin provisioning.
-- Admin-created users must include guardtrac_provisioned=true in app_metadata.
alter table public.guards
  add column if not exists shift_start time,
  add column if not exists shift_end time;

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id and role = 'guard');

drop policy if exists "profiles_update" on public.profiles;
create policy "profiles_update" on public.profiles
  for update using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role text;
  v_name text;
  v_phone text;
begin
  if coalesce(new.raw_app_meta_data ->> 'guardtrac_provisioned', 'false') <> 'true' then
    raise exception 'Accounts must be created by an administrator.';
  end if;

  v_role := coalesce(new.raw_user_meta_data ->> 'role', 'guard');
  if v_role not in ('guard', 'admin') then
    v_role := 'guard';
  end if;
  v_name := coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1));
  v_phone := new.raw_user_meta_data ->> 'phone';

  insert into public.profiles (id, full_name, phone, role)
  values (new.id, v_name, v_phone, v_role)
  on conflict (id) do nothing;

  if v_role = 'guard' then
    insert into public.guards (id, full_name, phone, email, base_salary)
    values (new.id, v_name, v_phone, new.email, 0)
    on conflict (id) do nothing;
  end if;

  return new;
end;
$$;
