-- ============================================================
--  ARCADE — backfill de perfiles / roles
--
--  Usar cuando los usuarios de Auth ya existen pero la tabla
--  public.profiles quedó vacía (por ejemplo, después de re-correr
--  schema.sql, que la borra y recrea). El trigger handle_new_user
--  solo crea perfiles para usuarios NUEVOS, no para los existentes.
--
--  Idempotente: se puede re-ejecutar sin duplicar nada.
-- ============================================================

-- 1) Crear un perfil para cada usuario de Auth que no tenga uno.
--    Toma rol / nombre / empleado_id de la metadata si existe; si no,
--    queda como 'empleado' (se corrige abajo).
insert into public.profiles (id, role, empleado_id, nombre, email)
select
  u.id,
  coalesce(nullif(u.raw_user_meta_data->>'role','')::public.app_role, 'empleado'),
  nullif(u.raw_user_meta_data->>'empleado_id',''),
  coalesce(u.raw_user_meta_data->>'nombre', u.email),
  u.email
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null;

-- 2) Asignar los roles de staff por email.
--    >>> Ajustá estos emails a los que realmente usaste al crear los
--    >>> usuarios en Authentication → Users.
update public.profiles set role = 'rrhh',     empleado_id = null
 where lower(email) = lower('rrhh@arcade.com');

update public.profiles set role = 'contador', empleado_id = null
 where lower(email) = lower('contador@arcade.com');

-- 3) Vincular las cuentas de empleados cuyo email coincide con la
--    tabla empleados (no toca a quienes ya quedaron rrhh/contador).
update public.profiles p
   set role = 'empleado', empleado_id = e.id
  from public.empleados e
 where lower(p.email) = lower(e.email)
   and p.role = 'empleado';

-- 4) Verificar el resultado.
select email, role, empleado_id
  from public.profiles
 order by role, email;
