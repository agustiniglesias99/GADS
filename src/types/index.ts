export type Role = 'rrhh' | 'empleado' | 'contador'

export type BadgeVariant = 'warn' | 'danger' | 'success' | 'info' | 'gray'

export type EstadoNovedad = 'pendiente' | 'aprobada' | 'rechazada' | 'justificada'
export type OrigenNovedad = 'automatica' | 'manual'
export type TipoNovedad =
  | 'tardanza'
  | 'ausencia_injustificada'
  | 'ausencia_justificada'
  | 'hora_extra_50'
  | 'hora_extra_100'
  | 'licencia'
  | 'vacaciones'
  | 'salida_anticipada'
  | 'sin_descanso'
  | 'anomalia'

export type OrigenFichada = 'biometrico' | 'qr' | 'manual' | 'api'
export type TipoFichada = 'entrada' | 'salida' | 'descanso_inicio' | 'descanso_fin'

export interface Empleado {
  id: string
  legajo: string
  nombre: string
  iniciales: string
  dni: string
  cuil: string
  categoria: string
  jornada: string
  ingreso: string
  convenio: string
  turno: string
  tolerancia: number
  fichada: string
  estado: 'activo' | 'suspendido' | 'inactivo'
  email: string
}

export interface Fichada {
  id: string
  empleadoId: string
  fecha: string
  hora: string
  tipo: TipoFichada
  origen: OrigenFichada
}

export interface RegistroDia {
  empleadoId: string
  fecha: string
  entrada?: string
  descansoInicio?: string
  descansoFin?: string
  salida?: string
  estado: 'presente' | 'ausente' | 'tardanza' | 'anomalia' | 'hora_extra' | 'sin_descanso' | 'salida_anticipada'
  origen: OrigenFichada
  minutosExtra?: number
  minutosTardanza?: number
}

export interface Novedad {
  id: string
  empleadoId: string
  empleadoNombre: string
  fecha: string
  tipo: TipoNovedad
  detalle: string
  origen: OrigenNovedad
  estado: EstadoNovedad
}

export interface CierreMensual {
  id: string
  periodo: string
  fechaCierre: string
  estado: 'abierto' | 'cerrado'
  totalEmpleados: number
  novedadesAprobadas: number
  novedadesPendientes: number
}

export interface ResumenEmpleado {
  empleadoId: string
  nombre: string
  legajo: string
  dni: string
  cuil: string
  diasTrabajados: number
  ausenciasJustificadas: number
  ausenciasInjustificadas: number
  tardanzasMin: number
  horasExtra50: number
  horasExtra100: number
  licencias: number
  vacaciones: number
  estado: 'listo' | 'pendiente'
}

export interface AuthUser {
  role: Role
  empleadoId?: string
  nombre: string
}
