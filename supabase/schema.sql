-- ============================================================
--  ARCADE — Supabase schema
--  Run this FIRST in the Supabase SQL Editor (before seed.sql).
--  Safe to re-run: it drops and recreates everything.
-- ============================================================

-- ---- Clean slate (dev only) --------------------------------
drop table if exists public.resumen_empleados cascade;
drop table if exists public.cierres_mensuales cascade;
drop table if exists public.registros_dia      cascade;
drop table if exists public.novedades          cascade;
drop table if exists public.profiles           cascade;
drop table if exists public.empleados          cascade;

drop type if exists public.app_role         cascade;
drop type if exists public.estado_empleado  cascade;
drop type if exists public.tipo_novedad     cascade;
drop type if exists public.origen_novedad   cascade;
drop type if exists public.estado_novedad   cascade;
drop type if exists public.origen_fichada   cascade;
drop type if exists public.estado_registro  cascade;
drop type if exists public.estado_cierre    cascade;
drop type if exists public.estado_resumen   cascade;

-- ---- Enums -------------------------------------------------
create type public.app_role        as enum ('rrhh', 'empleado', 'contador');
create type public.estado_empleado as enum ('activo', 'suspendido', 'inactivo');
create type public.tipo_novedad    as enum (
  'tardanza', 'ausencia_injustificada', 'ausencia_justificada',
  'hora_extra_50', 'hora_extra_100', 'licencia', 'vacaciones',
  'salida_anticipada', 'sin_descanso'
);
create type public.origen_novedad  as enum ('automatica', 'manual');
create type public.estado_novedad  as enum ('pendiente', 'aprobada', 'rechazada', 'justificada');
create type public.origen_fichada  as enum ('biometrico', 'qr', 'manual', 'api');
create type public.estado_registro as enum (
  'presente', 'ausente', 'tardanza', 'anomalia',
  'hora_extra', 'sin_descanso', 'salida_anticipada'
);
create type public.estado_cierre   as enum ('abierto', 'cerrado');
create type public.estado_resumen  as enum ('listo', 'pendiente');

-- ============================================================
--  Tables
-- ============================================================

create table public.empleados (
  id          text primary key,
  legajo      text not null unique,
  nombre      text not null,
  iniciales   text not null,
  dni         text not null,
  cuil        text not null,
  categoria   text not null,
  jornada     text not null,
  ingreso     text not null,                 -- display string dd/mm/yyyy
  convenio    text not null,
  turno       text not null,
  tolerancia  int  not null default 5,
  fichada     text not null,
  estado      public.estado_empleado not null default 'activo',
  email       text not null,
  created_at  timestamptz not null default now()
);

-- Links a Supabase auth user to a role (and, for employees, to an empleado row)
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  role        public.app_role not null default 'empleado',
  empleado_id text references public.empleados(id) on delete set null,
  nombre      text,
  email       text,
  created_at  timestamptz not null default now()
);

create table public.novedades (
  id              text primary key default gen_random_uuid()::text,
  empleado_id     text not null references public.empleados(id) on delete cascade,
  empleado_nombre text not null,
  fecha           date not null,
  tipo            public.tipo_novedad   not null,
  detalle         text not null default '',
  origen          public.origen_novedad not null default 'manual',
  estado          public.estado_novedad not null default 'pendiente',
  created_at      timestamptz not null default now()
);

create table public.registros_dia (
  id               uuid primary key default gen_random_uuid(),
  empleado_id      text not null references public.empleados(id) on delete cascade,
  fecha            date not null,
  entrada          text,
  descanso_inicio  text,
  descanso_fin     text,
  salida           text,
  estado           public.estado_registro not null,
  origen           public.origen_fichada  not null,
  minutos_extra    int,
  minutos_tardanza int,
  unique (empleado_id, fecha)
);

create table public.cierres_mensuales (
  id                    text primary key,
  periodo               text not null,
  fecha_cierre          text not null default '',
  estado                public.estado_cierre not null default 'abierto',
  total_empleados       int not null default 0,
  novedades_aprobadas   int not null default 0,
  novedades_pendientes  int not null default 0
);

create table public.resumen_empleados (
  empleado_id              text primary key references public.empleados(id) on delete cascade,
  nombre                   text not null,
  legajo                   text not null,
  dni                      text not null,
  cuil                     text not null,
  dias_trabajados          int not null default 0,
  ausencias_justificadas   int not null default 0,
  ausencias_injustificadas int not null default 0,
  tardanzas_min            int not null default 0,
  horas_extra_50           int not null default 0,
  horas_extra_100          int not null default 0,
  licencias                int not null default 0,
  vacaciones               int not null default 0,
  estado                   public.estado_resumen not null default 'pendiente'
);

create index on public.novedades     (empleado_id);
create index on public.novedades     (estado);
create index on public.novedades     (fecha);
create index on public.registros_dia (empleado_id);
create index on public.registros_dia (fecha);

-- ============================================================
--  Auth helpers + new-user trigger
-- ============================================================

-- Returns the role of the current user. SECURITY DEFINER so it can read
-- profiles without tripping that table's own RLS (avoids recursion).
create or replace function public.current_app_role()
returns public.app_role
language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid()
$$;

create or replace function public.current_empleado_id()
returns text
language sql stable security definer set search_path = public as $$
  select empleado_id from public.profiles where id = auth.uid()
$$;

-- Creates a profile automatically whenever a new auth user is created.
-- Role / nombre / empleado_id are taken from the user's metadata.
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, role, empleado_id, nombre, email)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data->>'role','')::public.app_role, 'empleado'),
    nullif(new.raw_user_meta_data->>'empleado_id',''),
    coalesce(new.raw_user_meta_data->>'nombre', new.email),
    new.email
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
--  Row Level Security
-- ============================================================
alter table public.empleados         enable row level security;
alter table public.profiles          enable row level security;
alter table public.novedades         enable row level security;
alter table public.registros_dia     enable row level security;
alter table public.cierres_mensuales enable row level security;
alter table public.resumen_empleados enable row level security;

-- ---- profiles ----------------------------------------------
create policy "profiles: read own"  on public.profiles
  for select using (id = auth.uid());
create policy "profiles: rrhh reads all" on public.profiles
  for select using (public.current_app_role() = 'rrhh');

-- ---- empleados ---------------------------------------------
create policy "empleados: rrhh full" on public.empleados
  for all using (public.current_app_role() = 'rrhh')
          with check (public.current_app_role() = 'rrhh');
create policy "empleados: contador read" on public.empleados
  for select using (public.current_app_role() = 'contador');
create policy "empleados: empleado reads own" on public.empleados
  for select using (public.current_app_role() = 'empleado' and id = public.current_empleado_id());

-- ---- novedades ---------------------------------------------
create policy "novedades: rrhh full" on public.novedades
  for all using (public.current_app_role() = 'rrhh')
          with check (public.current_app_role() = 'rrhh');
create policy "novedades: contador reads approved" on public.novedades
  for select using (public.current_app_role() = 'contador' and estado = 'aprobada');
create policy "novedades: empleado reads own" on public.novedades
  for select using (public.current_app_role() = 'empleado' and empleado_id = public.current_empleado_id());
create policy "novedades: empleado requests own" on public.novedades
  for insert with check (
    public.current_app_role() = 'empleado'
    and empleado_id = public.current_empleado_id()
    and origen = 'manual'
    and estado = 'pendiente'
  );

-- ---- registros_dia -----------------------------------------
create policy "registros: rrhh full" on public.registros_dia
  for all using (public.current_app_role() = 'rrhh')
          with check (public.current_app_role() = 'rrhh');
create policy "registros: contador read" on public.registros_dia
  for select using (public.current_app_role() = 'contador');
create policy "registros: empleado reads own" on public.registros_dia
  for select using (public.current_app_role() = 'empleado' and empleado_id = public.current_empleado_id());

-- ---- cierres_mensuales -------------------------------------
create policy "cierres: rrhh full" on public.cierres_mensuales
  for all using (public.current_app_role() = 'rrhh')
          with check (public.current_app_role() = 'rrhh');
create policy "cierres: contador read" on public.cierres_mensuales
  for select using (public.current_app_role() = 'contador');

-- ---- resumen_empleados -------------------------------------
create policy "resumen: rrhh full" on public.resumen_empleados
  for all using (public.current_app_role() = 'rrhh')
          with check (public.current_app_role() = 'rrhh');
create policy "resumen: contador read" on public.resumen_empleados
  for select using (public.current_app_role() = 'contador');
create policy "resumen: empleado reads own" on public.resumen_empleados
  for select using (public.current_app_role() = 'empleado' and empleado_id = public.current_empleado_id());
