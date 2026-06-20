-- ============================================================
--  ARCADE — assign roles AFTER creating auth users
--  Run this in the SQL Editor once you've added your users in
--  Authentication → Users (see SUPABASE_SETUP.md, step 4).
--
--  When a user signs up, a row is auto-created in public.profiles
--  with role 'empleado' by default. This script fixes the roles.
-- ============================================================

-- Staff accounts (adjust emails to whatever you created):
update public.profiles set role = 'rrhh'     where email = 'rrhh@arcade.com';
update public.profiles set role = 'contador' where email = 'contador@arcade.com';

-- Employees: link any auth user whose email matches an empleado row,
-- and point their profile at that empleado.
update public.profiles p
set role = 'empleado',
    empleado_id = e.id
from public.empleados e
where p.email = e.email;

-- Check the result:
-- select email, role, empleado_id from public.profiles order by role;
