-- ============================================================
--  ARCADE — assign roles AFTER creating auth users
--  Run this in the SQL Editor once you've added your users in
--  Authentication → Users (see SUPABASE_SETUP.md, step 4).
--
--  When a user signs up, a row is auto-created in public.profiles
--  with role 'empleado' by default. This script fixes the roles.
-- ============================================================

-- Sanity check: confirm a profile row exists for each new auth user.
-- (If a user is missing here, the on_auth_user_created trigger didn't
--  fire — insert it manually using their UUID from Authentication → Users.)
-- select id, email, role, empleado_id from public.profiles order by created_at desc;

-- RRHH / admin account:
update public.profiles set role = 'rrhh'
where email = 'rrhh@arcade.com';

-- Employee account → link it to Juan Pérez (empleado e1):
update public.profiles set role = 'empleado', empleado_id = 'e1'
where email = 'agustiniglesias99@gmail.com';

-- Check the result:
-- select email, role, empleado_id from public.profiles order by role;
