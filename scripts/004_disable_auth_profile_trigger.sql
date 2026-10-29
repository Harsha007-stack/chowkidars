-- Auth records are provisioned by the protected server actions, which
-- explicitly upsert profiles and guards with the service-role client.
-- Removing the auth trigger prevents trigger failures from aborting user
-- creation before those application writes can run.

drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();
