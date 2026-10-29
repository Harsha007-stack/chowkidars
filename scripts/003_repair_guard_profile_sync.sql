-- Repair guard profile persistence for existing projects.
-- Safe to run more than once in the Supabase SQL Editor.

alter table public.guards
  add column if not exists shift_start time,
  add column if not exists shift_end time;

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

  v_name := coalesce(
    new.raw_user_meta_data ->> 'full_name',
    split_part(coalesce(new.email, ''), '@', 1)
  );
  v_phone := new.raw_user_meta_data ->> 'phone';

  insert into public.profiles (id, full_name, phone, role)
  values (new.id, v_name, v_phone, v_role)
  on conflict (id) do update
    set full_name = excluded.full_name,
        phone = excluded.phone,
        role = excluded.role;

  if v_role = 'guard' then
    insert into public.guards (id, full_name, phone, email, base_salary)
    values (new.id, v_name, v_phone, new.email, 0)
    on conflict (id) do update
      set full_name = excluded.full_name,
          phone = excluded.phone,
          email = excluded.email;
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- Backfill profiles and guard rows for accounts created before the trigger
-- was installed or corrected. This only touches accounts provisioned by the app.
insert into public.profiles (id, full_name, phone, role)
select
  u.id,
  coalesce(u.raw_user_meta_data ->> 'full_name', split_part(coalesce(u.email, ''), '@', 1)),
  u.raw_user_meta_data ->> 'phone',
  case
    when u.raw_user_meta_data ->> 'role' in ('guard', 'admin')
      then u.raw_user_meta_data ->> 'role'
    else 'guard'
  end
from auth.users as u
where u.raw_app_meta_data ->> 'guardtrac_provisioned' = 'true'
on conflict (id) do update
  set full_name = excluded.full_name,
      phone = excluded.phone,
      role = excluded.role;

insert into public.guards (id, full_name, phone, email, base_salary)
select
  u.id,
  coalesce(u.raw_user_meta_data ->> 'full_name', split_part(coalesce(u.email, ''), '@', 1)),
  u.raw_user_meta_data ->> 'phone',
  u.email,
  0
from auth.users as u
where u.raw_app_meta_data ->> 'guardtrac_provisioned' = 'true'
  and case
    when u.raw_user_meta_data ->> 'role' in ('guard', 'admin')
      then u.raw_user_meta_data ->> 'role'
    else 'guard'
  end = 'guard'
on conflict (id) do update
  set full_name = excluded.full_name,
      phone = excluded.phone,
      email = excluded.email;
