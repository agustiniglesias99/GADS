-- ============================================================
--  ARCADE — datos de prueba 2026
--  Ejecutar en el SQL Editor de Supabase DESPUÉS de schema.sql
--  (y, opcionalmente, de seed.sql para tener los empleados base).
--
--  Genera fichadas (registros_dia), novedades, cierres mensuales y
--  el resumen por empleado para todos los días hábiles desde el
--  2026-04-01 hasta el 2026-06-25 19:00 hs.
--
--  Es idempotente: borra el rango generado y vuelve a crearlo,
--  así que se puede re-ejecutar sin duplicar nada.
-- ============================================================

-- ------------------------------------------------------------
-- 1) Fichadas diarias (registros_dia)
-- ------------------------------------------------------------
do $$
declare
  e          record;
  d          date;
  start_date date := '2026-04-01';
  end_date   date := '2026-06-25';   -- "hoy", corte 19:00 hs
  cutoff     time := '19:00';
  ent_h      int;
  sal_h      int;
  has_break  boolean;
  bucket     int;
  jitter     int;
  v_origen   public.origen_fichada;
  entrada    text;
  salida     text;
  desc_ini   text;
  desc_fin   text;
  estado     public.estado_registro;
  min_extra  int;
  min_tarde  int;
  t_salida   time;
begin
  -- limpiar el rango antes de regenerar
  delete from public.registros_dia
   where fecha between start_date and end_date;

  for e in
    select * from public.empleados emp where emp.estado = 'activo'
  loop
    -- horario base a partir del turno
    if e.turno like '%08%17%' then
      ent_h := 8; sal_h := 17; has_break := true;
    elsif e.turno like '%09%14%' then
      ent_h := 9; sal_h := 14; has_break := false;   -- jornada parcial
    else
      ent_h := 9; sal_h := 18; has_break := true;
    end if;

    -- medio de fichaje del empleado
    v_origen := case e.fichada
      when 'Biométrico' then 'biometrico'
      when 'QR'         then 'qr'
      when 'Manual'     then 'manual'
      else 'api'
    end::public.origen_fichada;

    d := start_date;
    while d <= end_date loop
      if extract(isodow from d) < 6 then          -- Lunes a Viernes
        -- entero determinístico 0..268M a partir de empleado + fecha
        bucket := (('x' || substr(md5(e.id || '|' || d::text), 1, 7))::bit(28)::int) % 100;

        min_extra := null;
        min_tarde := null;
        desc_ini  := null;
        desc_fin  := null;

        if bucket < 4 then
          -- ausencia injustificada
          estado  := 'ausente';
          entrada := null; salida := null;

        elsif bucket < 6 then
          -- ausencia justificada (se registra igual como ausente)
          estado  := 'ausente';
          entrada := null; salida := null;

        elsif bucket < 14 then
          -- tardanza
          min_tarde := 6 + (bucket % 18);          -- 6..23 min
          estado    := 'tardanza';
          entrada   := to_char(make_time(ent_h, min_tarde, 0), 'HH24:MI');
          salida    := to_char(make_time(sal_h, 2, 0), 'HH24:MI');
          if has_break then
            desc_ini := '13:05'; desc_fin := '13:50';
          end if;

        elsif bucket < 21 then
          -- hora extra
          estado    := 'hora_extra';
          min_extra := 60 + (bucket % 4) * 30;     -- 60/90/120/150 min
          entrada   := to_char(make_time(ent_h, 0, 0), 'HH24:MI');
          salida    := to_char(make_time(sal_h, 0, 0) + (min_extra || ' minutes')::interval, 'HH24:MI');
          if has_break then
            desc_ini := '13:00'; desc_fin := '14:00';
          end if;

        elsif bucket < 25 then
          -- sin descanso
          estado  := 'sin_descanso';
          entrada := to_char(make_time(ent_h, 2, 0), 'HH24:MI');
          salida  := to_char(make_time(sal_h, 3, 0), 'HH24:MI');

        elsif bucket < 28 then
          -- salida anticipada
          estado  := 'salida_anticipada';
          entrada := to_char(make_time(ent_h, 1, 0), 'HH24:MI');
          salida  := to_char(make_time(sal_h - 2, 0, 0), 'HH24:MI');
          if has_break then
            desc_ini := '13:00'; desc_fin := '13:30';
          end if;

        else
          -- presente (en horario)
          estado  := 'presente';
          jitter  := bucket % 5;                   -- 0..4 min
          entrada := to_char(make_time(ent_h, 0, 0) - (jitter || ' minutes')::interval, 'HH24:MI');
          salida  := to_char(make_time(sal_h, 0, 0) + (jitter || ' minutes')::interval, 'HH24:MI');
          if has_break then
            desc_ini := '13:00'; desc_fin := '13:55';
          end if;
        end if;

        -- corte del último día a las 19:00 hs: quien todavía estaría
        -- trabajando queda fichado sin salida (presente en planta)
        if d = end_date and salida is not null then
          t_salida := salida::time;
          if t_salida > cutoff then
            salida    := null;
            estado    := 'presente';
            min_extra := null;
          end if;
        end if;

        insert into public.registros_dia
          (empleado_id, fecha, entrada, descanso_inicio, descanso_fin,
           salida, estado, origen, minutos_extra, minutos_tardanza)
        values
          (e.id, d, entrada, desc_ini, desc_fin,
           salida, estado, v_origen, min_extra, min_tarde)
        on conflict (empleado_id, fecha) do nothing;
      end if;
      d := d + 1;
    end loop;
  end loop;
end $$;

-- ------------------------------------------------------------
-- 2) Novedades automáticas derivadas de las fichadas
--    (ids con prefijo 'g-' para poder regenerarlas)
-- ------------------------------------------------------------
delete from public.novedades
 where id like 'g-%'
   and fecha between '2026-04-01' and '2026-06-25';

-- Tardanzas
insert into public.novedades
  (id, empleado_id, empleado_nombre, fecha, tipo, detalle, origen, estado)
select
  'g-' || r.empleado_id || '-' || to_char(r.fecha, 'YYYYMMDD') || '-tar',
  r.empleado_id, e.nombre, r.fecha, 'tardanza',
  r.minutos_tardanza || ' min', 'automatica',
  case when (('x' || substr(md5(r.empleado_id || r.fecha::text), 1, 7))::bit(28)::int) % 3 = 0
       then 'pendiente' else 'aprobada' end::public.estado_novedad
from public.registros_dia r
join public.empleados e on e.id = r.empleado_id
where r.estado = 'tardanza'
  and r.fecha between '2026-04-01' and '2026-06-25'
on conflict (id) do nothing;

-- Horas extra (50% hasta 120 min, 100% por encima)
insert into public.novedades
  (id, empleado_id, empleado_nombre, fecha, tipo, detalle, origen, estado)
select
  'g-' || r.empleado_id || '-' || to_char(r.fecha, 'YYYYMMDD') || '-hex',
  r.empleado_id, e.nombre, r.fecha,
  case when r.minutos_extra > 120 then 'hora_extra_100' else 'hora_extra_50' end::public.tipo_novedad,
  r.minutos_extra || ' min', 'automatica', 'aprobada'
from public.registros_dia r
join public.empleados e on e.id = r.empleado_id
where r.estado = 'hora_extra'
  and r.fecha between '2026-04-01' and '2026-06-25'
on conflict (id) do nothing;

-- Ausencias (1 de cada 3 justificada, el resto injustificada)
insert into public.novedades
  (id, empleado_id, empleado_nombre, fecha, tipo, detalle, origen, estado)
select
  'g-' || r.empleado_id || '-' || to_char(r.fecha, 'YYYYMMDD') || '-aus',
  r.empleado_id, e.nombre, r.fecha,
  case when (('x' || substr(md5(r.empleado_id || r.fecha::text), 1, 7))::bit(28)::int) % 3 = 0
       then 'ausencia_justificada' else 'ausencia_injustificada' end::public.tipo_novedad,
  case when (('x' || substr(md5(r.empleado_id || r.fecha::text), 1, 7))::bit(28)::int) % 3 = 0
       then 'Certificado presentado' else 'Día completo' end,
  'automatica',
  case when (('x' || substr(md5(r.empleado_id || r.fecha::text), 1, 7))::bit(28)::int) % 3 = 0
       then 'aprobada' else 'pendiente' end::public.estado_novedad
from public.registros_dia r
join public.empleados e on e.id = r.empleado_id
where r.estado = 'ausente'
  and r.fecha between '2026-04-01' and '2026-06-25'
on conflict (id) do nothing;

-- Salidas anticipadas
insert into public.novedades
  (id, empleado_id, empleado_nombre, fecha, tipo, detalle, origen, estado)
select
  'g-' || r.empleado_id || '-' || to_char(r.fecha, 'YYYYMMDD') || '-sal',
  r.empleado_id, e.nombre, r.fecha, 'salida_anticipada',
  '120 min antes', 'automatica', 'aprobada'
from public.registros_dia r
join public.empleados e on e.id = r.empleado_id
where r.estado = 'salida_anticipada'
  and r.fecha between '2026-04-01' and '2026-06-25'
on conflict (id) do nothing;

-- Sin descanso
insert into public.novedades
  (id, empleado_id, empleado_nombre, fecha, tipo, detalle, origen, estado)
select
  'g-' || r.empleado_id || '-' || to_char(r.fecha, 'YYYYMMDD') || '-snd',
  r.empleado_id, e.nombre, r.fecha, 'sin_descanso',
  'Sin registro de descanso', 'automatica', 'aprobada'
from public.registros_dia r
join public.empleados e on e.id = r.empleado_id
where r.estado = 'sin_descanso'
  and r.fecha between '2026-04-01' and '2026-06-25'
on conflict (id) do nothing;

-- ------------------------------------------------------------
-- 3) Cierres mensuales 2026
-- ------------------------------------------------------------
insert into public.cierres_mensuales
  (id, periodo, fecha_cierre, estado, total_empleados, novedades_aprobadas, novedades_pendientes)
values
  ('cm2026-06', 'Junio 2026', '', 'abierto',
     (select count(*) from public.empleados where estado = 'activo'),
     (select count(*) from public.novedades where fecha between '2026-06-01' and '2026-06-30' and estado = 'aprobada'),
     (select count(*) from public.novedades where fecha between '2026-06-01' and '2026-06-30' and estado = 'pendiente')),
  ('cm2026-05', 'Mayo 2026', '31/05/2026', 'cerrado',
     (select count(*) from public.empleados where estado = 'activo'),
     (select count(*) from public.novedades where fecha between '2026-05-01' and '2026-05-31' and estado = 'aprobada'),
     0),
  ('cm2026-04', 'Abril 2026', '30/04/2026', 'cerrado',
     (select count(*) from public.empleados where estado = 'activo'),
     (select count(*) from public.novedades where fecha between '2026-04-01' and '2026-04-30' and estado = 'aprobada'),
     0)
on conflict (id) do update set
  periodo              = excluded.periodo,
  fecha_cierre         = excluded.fecha_cierre,
  estado               = excluded.estado,
  total_empleados      = excluded.total_empleados,
  novedades_aprobadas  = excluded.novedades_aprobadas,
  novedades_pendientes = excluded.novedades_pendientes;

-- ------------------------------------------------------------
-- 4) Resumen por empleado del período abierto (Junio 2026)
-- ------------------------------------------------------------
insert into public.resumen_empleados
  (empleado_id, nombre, legajo, dni, cuil,
   dias_trabajados, ausencias_justificadas, ausencias_injustificadas,
   tardanzas_min, horas_extra_50, horas_extra_100, licencias, vacaciones, estado)
select
  e.id, e.nombre, e.legajo, e.dni, e.cuil,
  (select count(*) from public.registros_dia r
     where r.empleado_id = e.id and r.fecha between '2026-06-01' and '2026-06-25' and r.estado <> 'ausente'),
  (select count(*) from public.novedades n
     where n.empleado_id = e.id and n.fecha between '2026-06-01' and '2026-06-25' and n.tipo = 'ausencia_justificada'),
  (select count(*) from public.novedades n
     where n.empleado_id = e.id and n.fecha between '2026-06-01' and '2026-06-25' and n.tipo = 'ausencia_injustificada'),
  coalesce((select sum(r.minutos_tardanza) from public.registros_dia r
     where r.empleado_id = e.id and r.fecha between '2026-06-01' and '2026-06-25'), 0),
  coalesce((select sum(r.minutos_extra) from public.registros_dia r
     where r.empleado_id = e.id and r.fecha between '2026-06-01' and '2026-06-25' and r.minutos_extra <= 120), 0),
  coalesce((select sum(r.minutos_extra) from public.registros_dia r
     where r.empleado_id = e.id and r.fecha between '2026-06-01' and '2026-06-25' and r.minutos_extra > 120), 0),
  (select count(*) from public.novedades n
     where n.empleado_id = e.id and n.fecha between '2026-06-01' and '2026-06-25' and n.tipo = 'licencia'),
  (select count(*) from public.novedades n
     where n.empleado_id = e.id and n.fecha between '2026-06-01' and '2026-06-25' and n.tipo = 'vacaciones'),
  case when (select count(*) from public.novedades n
               where n.empleado_id = e.id and n.fecha between '2026-06-01' and '2026-06-25' and n.estado = 'pendiente') > 0
       then 'pendiente' else 'listo' end::public.estado_resumen
from public.empleados e
where e.estado = 'activo'
on conflict (empleado_id) do update set
  nombre                   = excluded.nombre,
  legajo                   = excluded.legajo,
  dni                      = excluded.dni,
  cuil                     = excluded.cuil,
  dias_trabajados          = excluded.dias_trabajados,
  ausencias_justificadas   = excluded.ausencias_justificadas,
  ausencias_injustificadas = excluded.ausencias_injustificadas,
  tardanzas_min            = excluded.tardanzas_min,
  horas_extra_50           = excluded.horas_extra_50,
  horas_extra_100          = excluded.horas_extra_100,
  licencias                = excluded.licencias,
  vacaciones               = excluded.vacaciones,
  estado                   = excluded.estado;
