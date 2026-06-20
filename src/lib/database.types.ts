/**
 * Hand-written types for the ARCADE Supabase schema (see supabase/schema.sql).
 * Column names are snake_case (Postgres); the data layer maps them to the
 * camelCase shapes used by the app in src/types/index.ts.
 *
 * You can later replace this file with generated types:
 *   npx supabase gen types typescript --project-id <id> > src/lib/database.types.ts
 */

export type AppRole = 'rrhh' | 'empleado' | 'contador'

type EstadoEmpleado = 'activo' | 'suspendido' | 'inactivo'
type TipoNovedad =
  | 'tardanza' | 'ausencia_injustificada' | 'ausencia_justificada'
  | 'hora_extra_50' | 'hora_extra_100' | 'licencia' | 'vacaciones'
  | 'salida_anticipada' | 'sin_descanso' | 'anomalia'
type OrigenNovedad = 'automatica' | 'manual'
type EstadoNovedad = 'pendiente' | 'aprobada' | 'rechazada' | 'justificada'
type OrigenFichada = 'biometrico' | 'qr' | 'manual' | 'api'
type EstadoRegistro =
  | 'presente' | 'ausente' | 'tardanza' | 'anomalia'
  | 'hora_extra' | 'sin_descanso' | 'salida_anticipada'
type EstadoCierre = 'abierto' | 'cerrado'
type EstadoResumen = 'listo' | 'pendiente'

interface EmpleadoRow {
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
  estado: EstadoEmpleado
  email: string
  created_at: string
}

interface ProfileRow {
  id: string
  role: AppRole
  empleado_id: string | null
  nombre: string | null
  email: string | null
  created_at: string
}

interface NovedadRow {
  id: string
  empleado_id: string
  empleado_nombre: string
  fecha: string
  tipo: TipoNovedad
  detalle: string
  origen: OrigenNovedad
  estado: EstadoNovedad
  created_at: string
}

interface RegistroDiaRow {
  id: string
  empleado_id: string
  fecha: string
  entrada: string | null
  descanso_inicio: string | null
  descanso_fin: string | null
  salida: string | null
  estado: EstadoRegistro
  origen: OrigenFichada
  minutos_extra: number | null
  minutos_tardanza: number | null
}

interface CierreMensualRow {
  id: string
  periodo: string
  fecha_cierre: string
  estado: EstadoCierre
  total_empleados: number
  novedades_aprobadas: number
  novedades_pendientes: number
}

interface ResumenEmpleadoRow {
  empleado_id: string
  nombre: string
  legajo: string
  dni: string
  cuil: string
  dias_trabajados: number
  ausencias_justificadas: number
  ausencias_injustificadas: number
  tardanzas_min: number
  horas_extra_50: number
  horas_extra_100: number
  licencias: number
  vacaciones: number
  estado: EstadoResumen
}

type Table<Row, Insert = Partial<Row>, Update = Partial<Row>> = {
  Row: Row
  Insert: Insert
  Update: Update
  Relationships: []
}

export interface Database {
  public: {
    Tables: {
      empleados:         Table<EmpleadoRow>
      profiles:          Table<ProfileRow>
      novedades:         Table<NovedadRow, Omit<NovedadRow, 'id' | 'created_at'> & { id?: string }>
      registros_dia:     Table<RegistroDiaRow, Omit<RegistroDiaRow, 'id'> & { id?: string }>
      cierres_mensuales: Table<CierreMensualRow>
      resumen_empleados: Table<ResumenEmpleadoRow>
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    CompositeTypes: Record<string, never>
    Enums: {
      app_role: AppRole
      estado_empleado: EstadoEmpleado
      tipo_novedad: TipoNovedad
      origen_novedad: OrigenNovedad
      estado_novedad: EstadoNovedad
      origen_fichada: OrigenFichada
      estado_registro: EstadoRegistro
      estado_cierre: EstadoCierre
      estado_resumen: EstadoResumen
    }
  }
}
