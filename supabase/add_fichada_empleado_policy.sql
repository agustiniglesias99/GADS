-- ============================================================
--  ARCADE — permitir que el empleado fiche su asistencia
--
--  Agrega las policies RLS que faltan en registros_dia para que un
--  usuario con rol 'empleado' pueda registrar su propio ingreso/egreso
--  por QR (insert + update de su fila del día).
--
--  Ejecutar en el SQL Editor. Idempotente (drop + create de las policies).
-- ============================================================

drop policy if exists "registros: empleado ficha own"     on public.registros_dia;
drop policy if exists "registros: empleado actualiza own"  on public.registros_dia;

create policy "registros: empleado ficha own" on public.registros_dia
  for insert with check (
    public.current_app_role() = 'empleado'
    and empleado_id = public.current_empleado_id()
    and origen = 'qr'
  );

create policy "registros: empleado actualiza own" on public.registros_dia
  for update using (
    public.current_app_role() = 'empleado'
    and empleado_id = public.current_empleado_id()
  ) with check (
    public.current_app_role() = 'empleado'
    and empleado_id = public.current_empleado_id()
    and origen = 'qr'
  );
