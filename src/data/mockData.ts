import type { Empleado, Novedad, RegistroDia, CierreMensual, ResumenEmpleado } from '../types'

export const empleados: Empleado[] = [
  { id: 'e1', legajo: '042', nombre: 'Juan Pérez', iniciales: 'JP', dni: '28.441.302', cuil: '20-28441302-3', categoria: 'Operario B', jornada: 'Completa', ingreso: '03/05/2019', convenio: 'Metalúrgico', turno: 'Lun–Vie 09–18', tolerancia: 5, fichada: 'Biométrico', estado: 'activo', email: 'juan.perez@empresa.com' },
  { id: 'e2', legajo: '058', nombre: 'Ana Martínez', iniciales: 'AM', dni: '31.220.445', cuil: '27-31220445-2', categoria: 'Técnico A', jornada: 'Completa', ingreso: '15/02/2021', convenio: 'Metalúrgico', turno: 'Lun–Vie 08–17', tolerancia: 5, fichada: 'Biométrico', estado: 'activo', email: 'ana.martinez@empresa.com' },
  { id: 'e3', legajo: '019', nombre: 'Carlos López', iniciales: 'CL', dni: '25.100.782', cuil: '20-25100782-1', categoria: 'Supervisor', jornada: 'Completa', ingreso: '10/08/2016', convenio: 'Metalúrgico', turno: 'Lun–Vie 08–17', tolerancia: 10, fichada: 'Biométrico', estado: 'activo', email: 'carlos.lopez@empresa.com' },
  { id: 'e4', legajo: '075', nombre: 'María García', iniciales: 'MG', dni: '33.508.910', cuil: '27-33508910-4', categoria: 'Operario A', jornada: 'Completa', ingreso: '22/11/2022', convenio: 'Metalúrgico', turno: 'Lun–Vie 09–18', tolerancia: 5, fichada: 'QR', estado: 'activo', email: 'maria.garcia@empresa.com' },
  { id: 'e5', legajo: '061', nombre: 'Laura Díaz', iniciales: 'LD', dni: '29.774.330', cuil: '27-29774330-5', categoria: 'Administrativo', jornada: 'Completa', ingreso: '07/03/2020', convenio: 'Comercio', turno: 'Lun–Vie 09–18', tolerancia: 5, fichada: 'QR', estado: 'activo', email: 'laura.diaz@empresa.com' },
  { id: 'e6', legajo: '033', nombre: 'Pedro Sánchez', iniciales: 'PS', dni: '27.060.215', cuil: '20-27060215-9', categoria: 'Operario B', jornada: 'Completa', ingreso: '14/06/2018', convenio: 'Metalúrgico', turno: 'Lun–Vie 09–18', tolerancia: 5, fichada: 'Manual', estado: 'activo', email: 'pedro.sanchez@empresa.com' },
  { id: 'e7', legajo: '088', nombre: 'Lucía Romero', iniciales: 'LR', dni: '35.112.045', cuil: '27-35112045-3', categoria: 'Operario A', jornada: 'Parcial', ingreso: '01/09/2023', convenio: 'Metalúrgico', turno: 'Lun–Vie 09–14', tolerancia: 5, fichada: 'Biométrico', estado: 'activo', email: 'lucia.romero@empresa.com' },
  { id: 'e8', legajo: '047', nombre: 'Roberto Núñez', iniciales: 'RN', dni: '26.300.887', cuil: '20-26300887-7', categoria: 'Técnico B', jornada: 'Completa', ingreso: '20/01/2017', convenio: 'Metalúrgico', turno: 'Lun–Vie 08–17', tolerancia: 10, fichada: 'Biométrico', estado: 'suspendido', email: 'roberto.nunez@empresa.com' },
]

export const novedades: Novedad[] = [
  { id: 'n1', empleadoId: 'e1', empleadoNombre: 'Juan Pérez', fecha: '2025-04-09', tipo: 'tardanza', detalle: '8 min', origen: 'automatica', estado: 'aprobada' },
  { id: 'n2', empleadoId: 'e1', empleadoNombre: 'Juan Pérez', fecha: '2025-04-14', tipo: 'tardanza', detalle: '6 min', origen: 'automatica', estado: 'pendiente' },
  { id: 'n3', empleadoId: 'e1', empleadoNombre: 'Juan Pérez', fecha: '2025-04-15', tipo: 'ausencia_injustificada', detalle: 'Día completo', origen: 'automatica', estado: 'pendiente' },
  { id: 'n4', empleadoId: 'e1', empleadoNombre: 'Juan Pérez', fecha: '2025-04-18', tipo: 'hora_extra_50', detalle: '255 min', origen: 'automatica', estado: 'aprobada' },
  { id: 'n5', empleadoId: 'e1', empleadoNombre: 'Juan Pérez', fecha: '2025-04-22', tipo: 'ausencia_justificada', detalle: 'Turno médico', origen: 'manual', estado: 'aprobada' },
  { id: 'n7', empleadoId: 'e2', empleadoNombre: 'Ana Martínez', fecha: '2025-04-10', tipo: 'tardanza', detalle: '12 min', origen: 'automatica', estado: 'aprobada' },
  { id: 'n8', empleadoId: 'e3', empleadoNombre: 'Carlos López', fecha: '2025-04-13', tipo: 'hora_extra_50', detalle: '135 min', origen: 'automatica', estado: 'aprobada' },
  { id: 'n9', empleadoId: 'e3', empleadoNombre: 'Carlos López', fecha: '2025-04-11', tipo: 'hora_extra_100', detalle: '180 min', origen: 'automatica', estado: 'aprobada' },
  { id: 'n10', empleadoId: 'e4', empleadoNombre: 'María García', fecha: '2025-04-12', tipo: 'ausencia_injustificada', detalle: 'Día completo', origen: 'automatica', estado: 'pendiente' },
  { id: 'n11', empleadoId: 'e4', empleadoNombre: 'María García', fecha: '2025-04-14', tipo: 'ausencia_injustificada', detalle: 'Día completo', origen: 'automatica', estado: 'pendiente' },
  { id: 'n12', empleadoId: 'e4', empleadoNombre: 'María García', fecha: '2025-04-03', tipo: 'ausencia_justificada', detalle: 'Licencia médica', origen: 'manual', estado: 'aprobada' },
  { id: 'n13', empleadoId: 'e5', empleadoNombre: 'Laura Díaz', fecha: '2025-04-09', tipo: 'sin_descanso', detalle: 'Sin registro', origen: 'automatica', estado: 'aprobada' },
  { id: 'n14', empleadoId: 'e5', empleadoNombre: 'Laura Díaz', fecha: '2025-04-14', tipo: 'sin_descanso', detalle: 'Sin registro', origen: 'automatica', estado: 'aprobada' },
  { id: 'n15', empleadoId: 'e5', empleadoNombre: 'Laura Díaz', fecha: '2025-04-07', tipo: 'ausencia_injustificada', detalle: 'Día completo', origen: 'automatica', estado: 'aprobada' },
  { id: 'n16', empleadoId: 'e5', empleadoNombre: 'Laura Díaz', fecha: '2025-04-11', tipo: 'hora_extra_50', detalle: '60 min', origen: 'automatica', estado: 'aprobada' },
  { id: 'n17', empleadoId: 'e6', empleadoNombre: 'Pedro Sánchez', fecha: '2025-04-11', tipo: 'salida_anticipada', detalle: '90 min antes', origen: 'automatica', estado: 'aprobada' },
  { id: 'n18', empleadoId: 'e6', empleadoNombre: 'Pedro Sánchez', fecha: '2025-04-08', tipo: 'ausencia_justificada', detalle: 'Certificado médico', origen: 'manual', estado: 'aprobada' },
  { id: 'n19', empleadoId: 'e1', empleadoNombre: 'Juan Pérez', fecha: '2025-03-20', tipo: 'tardanza', detalle: '15 min', origen: 'automatica', estado: 'aprobada' },
  { id: 'n20', empleadoId: 'e2', empleadoNombre: 'Ana Martínez', fecha: '2025-03-15', tipo: 'vacaciones', detalle: '5 días', origen: 'manual', estado: 'aprobada' },
  { id: 'n21', empleadoId: 'e3', empleadoNombre: 'Carlos López', fecha: '2025-03-10', tipo: 'licencia', detalle: 'Licencia por matrimonio', origen: 'manual', estado: 'aprobada' },
]

export const registrosDia: RegistroDia[] = [
  { empleadoId: 'e1', fecha: '2025-04-14', entrada: '09:11', descansoInicio: '13:05', descansoFin: '13:52', salida: '18:02', estado: 'tardanza', origen: 'biometrico', minutosTardanza: 6 },
  { empleadoId: 'e2', fecha: '2025-04-14', entrada: '08:58', descansoInicio: '13:10', descansoFin: '13:45', salida: '17:58', estado: 'anomalia', origen: 'biometrico' },
  { empleadoId: 'e3', fecha: '2025-04-14', entrada: '08:55', descansoInicio: '13:00', descansoFin: '14:00', salida: '20:15', estado: 'hora_extra', origen: 'biometrico', minutosExtra: 135 },
  { empleadoId: 'e5', fecha: '2025-04-14', entrada: '09:03', salida: '18:05', estado: 'sin_descanso', origen: 'qr' },
  { empleadoId: 'e6', fecha: '2025-04-14', entrada: '09:00', descansoInicio: '13:00', descansoFin: '13:30', salida: '16:30', estado: 'salida_anticipada', origen: 'manual' },
  { empleadoId: 'e4', fecha: '2025-04-14', estado: 'ausente', origen: 'biometrico' },
  { empleadoId: 'e7', fecha: '2025-04-14', entrada: '09:05', salida: '14:02', estado: 'presente', origen: 'biometrico' },
  { empleadoId: 'e1', fecha: '2025-04-13', entrada: '09:00', descansoInicio: '13:00', descansoFin: '14:00', salida: '18:00', estado: 'presente', origen: 'biometrico' },
  { empleadoId: 'e2', fecha: '2025-04-13', entrada: '08:55', descansoInicio: '13:00', descansoFin: '13:45', salida: '17:55', estado: 'presente', origen: 'biometrico' },
  { empleadoId: 'e3', fecha: '2025-04-13', entrada: '08:50', descansoInicio: '13:00', descansoFin: '14:00', salida: '20:15', estado: 'hora_extra', origen: 'biometrico', minutosExtra: 135 },
]

export const cierresMensuales: CierreMensual[] = [
  { id: 'cm1', periodo: 'Abril 2025', fechaCierre: '', estado: 'abierto', totalEmpleados: 34, novedadesAprobadas: 48, novedadesPendientes: 4 },
  { id: 'cm2', periodo: 'Marzo 2025', fechaCierre: '31/03/2025', estado: 'cerrado', totalEmpleados: 33, novedadesAprobadas: 52, novedadesPendientes: 0 },
  { id: 'cm3', periodo: 'Febrero 2025', fechaCierre: '28/02/2025', estado: 'cerrado', totalEmpleados: 33, novedadesAprobadas: 44, novedadesPendientes: 0 },
  { id: 'cm4', periodo: 'Enero 2025', fechaCierre: '31/01/2025', estado: 'cerrado', totalEmpleados: 32, novedadesAprobadas: 39, novedadesPendientes: 0 },
]

export const resumenEmpleados: ResumenEmpleado[] = [
  { empleadoId: 'e1', nombre: 'Juan Pérez', legajo: '042', dni: '28.441.302', cuil: '20-28441302-3', diasTrabajados: 17, ausenciasJustificadas: 1, ausenciasInjustificadas: 1, tardanzasMin: 42, horasExtra50: 255, horasExtra100: 0, licencias: 0, vacaciones: 0, estado: 'pendiente' },
  { empleadoId: 'e2', nombre: 'Ana Martínez', legajo: '058', dni: '31.220.445', cuil: '27-31220445-2', diasTrabajados: 20, ausenciasJustificadas: 0, ausenciasInjustificadas: 0, tardanzasMin: 12, horasExtra50: 0, horasExtra100: 0, licencias: 0, vacaciones: 0, estado: 'listo' },
  { empleadoId: 'e3', nombre: 'Carlos López', legajo: '019', dni: '25.100.782', cuil: '20-25100782-1', diasTrabajados: 20, ausenciasJustificadas: 0, ausenciasInjustificadas: 0, tardanzasMin: 0, horasExtra50: 510, horasExtra100: 180, licencias: 0, vacaciones: 0, estado: 'listo' },
  { empleadoId: 'e4', nombre: 'María García', legajo: '075', dni: '33.508.910', cuil: '27-33508910-4', diasTrabajados: 16, ausenciasJustificadas: 2, ausenciasInjustificadas: 2, tardanzasMin: 0, horasExtra50: 0, horasExtra100: 0, licencias: 0, vacaciones: 0, estado: 'pendiente' },
  { empleadoId: 'e5', nombre: 'Laura Díaz', legajo: '061', dni: '29.774.330', cuil: '27-29774330-5', diasTrabajados: 19, ausenciasJustificadas: 0, ausenciasInjustificadas: 1, tardanzasMin: 5, horasExtra50: 60, horasExtra100: 0, licencias: 0, vacaciones: 0, estado: 'listo' },
  { empleadoId: 'e6', nombre: 'Pedro Sánchez', legajo: '033', dni: '27.060.215', cuil: '20-27060215-9', diasTrabajados: 18, ausenciasJustificadas: 1, ausenciasInjustificadas: 0, tardanzasMin: 0, horasExtra50: 0, horasExtra100: 0, licencias: 0, vacaciones: 0, estado: 'listo' },
  { empleadoId: 'e7', nombre: 'Lucía Romero', legajo: '088', dni: '35.112.045', cuil: '27-35112045-3', diasTrabajados: 20, ausenciasJustificadas: 0, ausenciasInjustificadas: 0, tardanzasMin: 0, horasExtra50: 0, horasExtra100: 0, licencias: 0, vacaciones: 0, estado: 'listo' },
]
