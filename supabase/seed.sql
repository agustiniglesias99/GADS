-- ============================================================
--  ARCADE — seed data (your current mock data)
--  Run this SECOND in the Supabase SQL Editor (after schema.sql).
--  Safe to re-run.
-- ============================================================

-- ---- empleados ---------------------------------------------
insert into public.empleados
  (id, legajo, nombre, iniciales, dni, cuil, categoria, jornada, ingreso, convenio, turno, tolerancia, fichada, estado, email)
values
  ('e1','042','Juan Pérez','JP','28.441.302','20-28441302-3','Operario B','Completa','03/05/2019','Metalúrgico','Lun–Vie 09–18',5,'Biométrico','activo','juan.perez@empresa.com'),
  ('e2','058','Ana Martínez','AM','31.220.445','27-31220445-2','Técnico A','Completa','15/02/2021','Metalúrgico','Lun–Vie 08–17',5,'Biométrico','activo','ana.martinez@empresa.com'),
  ('e3','019','Carlos López','CL','25.100.782','20-25100782-1','Supervisor','Completa','10/08/2016','Metalúrgico','Lun–Vie 08–17',10,'Biométrico','activo','carlos.lopez@empresa.com'),
  ('e4','075','María García','MG','33.508.910','27-33508910-4','Operario A','Completa','22/11/2022','Metalúrgico','Lun–Vie 09–18',5,'QR','activo','maria.garcia@empresa.com'),
  ('e5','061','Laura Díaz','LD','29.774.330','27-29774330-5','Administrativo','Completa','07/03/2020','Comercio','Lun–Vie 09–18',5,'QR','activo','laura.diaz@empresa.com'),
  ('e6','033','Pedro Sánchez','PS','27.060.215','20-27060215-9','Operario B','Completa','14/06/2018','Metalúrgico','Lun–Vie 09–18',5,'Manual','activo','pedro.sanchez@empresa.com'),
  ('e7','088','Lucía Romero','LR','35.112.045','27-35112045-3','Operario A','Parcial','01/09/2023','Metalúrgico','Lun–Vie 09–14',5,'Biométrico','activo','lucia.romero@empresa.com'),
  ('e8','047','Roberto Núñez','RN','26.300.887','20-26300887-7','Técnico B','Completa','20/01/2017','Metalúrgico','Lun–Vie 08–17',10,'Biométrico','suspendido','roberto.nunez@empresa.com')
on conflict (id) do nothing;

-- ---- novedades ---------------------------------------------
insert into public.novedades
  (id, empleado_id, empleado_nombre, fecha, tipo, detalle, origen, estado)
values
  ('n1','e1','Juan Pérez','2025-04-09','tardanza','8 min','automatica','aprobada'),
  ('n2','e1','Juan Pérez','2025-04-14','tardanza','6 min','automatica','pendiente'),
  ('n3','e1','Juan Pérez','2025-04-15','ausencia_injustificada','Día completo','automatica','pendiente'),
  ('n4','e1','Juan Pérez','2025-04-18','hora_extra_50','255 min','automatica','aprobada'),
  ('n5','e1','Juan Pérez','2025-04-22','ausencia_justificada','Turno médico','manual','aprobada'),
  ('n6','e2','Ana Martínez','2025-04-14','anomalia','Doble fichada','automatica','pendiente'),
  ('n7','e2','Ana Martínez','2025-04-10','tardanza','12 min','automatica','aprobada'),
  ('n8','e3','Carlos López','2025-04-13','hora_extra_50','135 min','automatica','aprobada'),
  ('n9','e3','Carlos López','2025-04-11','hora_extra_100','180 min','automatica','aprobada'),
  ('n10','e4','María García','2025-04-12','ausencia_injustificada','Día completo','automatica','pendiente'),
  ('n11','e4','María García','2025-04-14','ausencia_injustificada','Día completo','automatica','pendiente'),
  ('n12','e4','María García','2025-04-03','ausencia_justificada','Licencia médica','manual','aprobada'),
  ('n13','e5','Laura Díaz','2025-04-09','sin_descanso','Sin registro','automatica','aprobada'),
  ('n14','e5','Laura Díaz','2025-04-14','sin_descanso','Sin registro','automatica','aprobada'),
  ('n15','e5','Laura Díaz','2025-04-07','ausencia_injustificada','Día completo','automatica','aprobada'),
  ('n16','e5','Laura Díaz','2025-04-11','hora_extra_50','60 min','automatica','aprobada'),
  ('n17','e6','Pedro Sánchez','2025-04-11','salida_anticipada','90 min antes','automatica','aprobada'),
  ('n18','e6','Pedro Sánchez','2025-04-08','ausencia_justificada','Certificado médico','manual','aprobada'),
  ('n19','e1','Juan Pérez','2025-03-20','tardanza','15 min','automatica','aprobada'),
  ('n20','e2','Ana Martínez','2025-03-15','vacaciones','5 días','manual','aprobada'),
  ('n21','e3','Carlos López','2025-03-10','licencia','Licencia por matrimonio','manual','aprobada')
on conflict (id) do nothing;

-- ---- registros_dia -----------------------------------------
insert into public.registros_dia
  (empleado_id, fecha, entrada, descanso_inicio, descanso_fin, salida, estado, origen, minutos_extra, minutos_tardanza)
values
  ('e1','2025-04-14','09:11','13:05','13:52','18:02','tardanza','biometrico',null,6),
  ('e2','2025-04-14','08:58','13:10','13:45','17:58','anomalia','biometrico',null,null),
  ('e3','2025-04-14','08:55','13:00','14:00','20:15','hora_extra','biometrico',135,null),
  ('e5','2025-04-14','09:03',null,null,'18:05','sin_descanso','qr',null,null),
  ('e6','2025-04-14','09:00','13:00','13:30','16:30','salida_anticipada','manual',null,null),
  ('e4','2025-04-14',null,null,null,null,'ausente','biometrico',null,null),
  ('e7','2025-04-14','09:05',null,null,'14:02','presente','biometrico',null,null),
  ('e1','2025-04-13','09:00','13:00','14:00','18:00','presente','biometrico',null,null),
  ('e2','2025-04-13','08:55','13:00','13:45','17:55','presente','biometrico',null,null),
  ('e3','2025-04-13','08:50','13:00','14:00','20:15','hora_extra','biometrico',135,null)
on conflict (empleado_id, fecha) do nothing;

-- ---- cierres_mensuales -------------------------------------
insert into public.cierres_mensuales
  (id, periodo, fecha_cierre, estado, total_empleados, novedades_aprobadas, novedades_pendientes)
values
  ('cm1','Abril 2025','','abierto',34,48,4),
  ('cm2','Marzo 2025','31/03/2025','cerrado',33,52,0),
  ('cm3','Febrero 2025','28/02/2025','cerrado',33,44,0),
  ('cm4','Enero 2025','31/01/2025','cerrado',32,39,0)
on conflict (id) do nothing;

-- ---- resumen_empleados -------------------------------------
insert into public.resumen_empleados
  (empleado_id, nombre, legajo, dni, cuil, dias_trabajados, ausencias_justificadas, ausencias_injustificadas, tardanzas_min, horas_extra_50, horas_extra_100, licencias, vacaciones, estado)
values
  ('e1','Juan Pérez','042','28.441.302','20-28441302-3',17,1,1,42,255,0,0,0,'pendiente'),
  ('e2','Ana Martínez','058','31.220.445','27-31220445-2',20,0,0,12,0,0,0,0,'listo'),
  ('e3','Carlos López','019','25.100.782','20-25100782-1',20,0,0,0,510,180,0,0,'listo'),
  ('e4','María García','075','33.508.910','27-33508910-4',16,2,2,0,0,0,0,0,'pendiente'),
  ('e5','Laura Díaz','061','29.774.330','27-29774330-5',19,0,1,5,60,0,0,0,'listo'),
  ('e6','Pedro Sánchez','033','27.060.215','20-27060215-9',18,1,0,0,0,0,0,0,'listo'),
  ('e7','Lucía Romero','088','35.112.045','27-35112045-3',20,0,0,0,0,0,0,0,'listo')
on conflict (empleado_id) do nothing;
