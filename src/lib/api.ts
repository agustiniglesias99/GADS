import { supabase } from './supabase'
import type {
  Empleado, Novedad, RegistroDia, CierreMensual, ResumenEmpleado,
  TipoNovedad, EstadoNovedad, OrigenNovedad,
} from '../types'
import type { Database } from './database.types'
import { interpretarFichada, type AccionFichada } from './asistencia'

type Tables = Database['public']['Tables']
type EmpleadoRow = Tables['empleados']['Row']
type NovedadRow = Tables['novedades']['Row']
type RegistroRow = Tables['registros_dia']['Row']
type CierreRow = Tables['cierres_mensuales']['Row']
type ResumenRow = Tables['resumen_empleados']['Row']

// ---- row → app type mappers ----------------------------------------------

const toEmpleado = (r: EmpleadoRow): Empleado => ({
  id: r.id, legajo: r.legajo, nombre: r.nombre, iniciales: r.iniciales,
  dni: r.dni, cuil: r.cuil, categoria: r.categoria, jornada: r.jornada,
  ingreso: r.ingreso, convenio: r.convenio, turno: r.turno, tolerancia: r.tolerancia,
  fichada: r.fichada, estado: r.estado, email: r.email,
})

const toNovedad = (r: NovedadRow): Novedad => ({
  id: r.id, empleadoId: r.empleado_id, empleadoNombre: r.empleado_nombre,
  fecha: r.fecha, tipo: r.tipo, detalle: r.detalle, origen: r.origen, estado: r.estado,
})

const toRegistro = (r: RegistroRow): RegistroDia => ({
  empleadoId: r.empleado_id, fecha: r.fecha,
  entrada: r.entrada ?? undefined,
  descansoInicio: r.descanso_inicio ?? undefined,
  descansoFin: r.descanso_fin ?? undefined,
  salida: r.salida ?? undefined,
  estado: r.estado, origen: r.origen,
  minutosExtra: r.minutos_extra ?? undefined,
  minutosTardanza: r.minutos_tardanza ?? undefined,
})

const toCierre = (r: CierreRow): CierreMensual => ({
  id: r.id, periodo: r.periodo, fechaCierre: r.fecha_cierre, estado: r.estado,
  totalEmpleados: r.total_empleados,
  novedadesAprobadas: r.novedades_aprobadas,
  novedadesPendientes: r.novedades_pendientes,
})

const toResumen = (r: ResumenRow): ResumenEmpleado => ({
  empleadoId: r.empleado_id, nombre: r.nombre, legajo: r.legajo, dni: r.dni, cuil: r.cuil,
  diasTrabajados: r.dias_trabajados,
  ausenciasJustificadas: r.ausencias_justificadas,
  ausenciasInjustificadas: r.ausencias_injustificadas,
  tardanzasMin: r.tardanzas_min,
  horasExtra50: r.horas_extra_50,
  horasExtra100: r.horas_extra_100,
  licencias: r.licencias, vacaciones: r.vacaciones, estado: r.estado,
})

function unwrap<T>(res: { data: T | null; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message)
  return res.data as T
}

// ---- queries --------------------------------------------------------------

export async function fetchEmpleados(): Promise<Empleado[]> {
  const res = await supabase.from('empleados').select('*').order('nombre')
  return unwrap(res).map(toEmpleado)
}

export async function fetchEmpleado(id: string): Promise<Empleado | null> {
  const res = await supabase.from('empleados').select('*').eq('id', id).maybeSingle()
  const row = unwrap(res)
  return row ? toEmpleado(row) : null
}

export async function fetchNovedades(): Promise<Novedad[]> {
  const res = await supabase.from('novedades').select('*').order('fecha', { ascending: false })
  return unwrap(res).map(toNovedad)
}

export async function fetchNovedadesByEmpleado(empleadoId: string): Promise<Novedad[]> {
  const res = await supabase.from('novedades').select('*')
    .eq('empleado_id', empleadoId).order('fecha', { ascending: false })
  return unwrap(res).map(toNovedad)
}

export async function fetchRegistros(fecha?: string): Promise<RegistroDia[]> {
  let q = supabase.from('registros_dia').select('*')
  if (fecha) q = q.eq('fecha', fecha)
  const res = await q.order('fecha', { ascending: false })
  return unwrap(res).map(toRegistro)
}

export async function fetchRegistrosMes(empleadoId: string, desde: string, hasta: string): Promise<RegistroDia[]> {
  const res = await supabase.from('registros_dia').select('*')
    .eq('empleado_id', empleadoId).gte('fecha', desde).lte('fecha', hasta)
    .order('fecha', { ascending: true })
  return unwrap(res).map(toRegistro)
}

export async function fetchRegistrosRango(desde: string, hasta: string): Promise<RegistroDia[]> {
  const res = await supabase.from('registros_dia').select('*')
    .gte('fecha', desde).lte('fecha', hasta)
    .order('fecha', { ascending: true })
  return unwrap(res).map(toRegistro)
}

export async function fetchRegistroDia(empleadoId: string, fecha: string): Promise<RegistroDia | null> {
  const res = await supabase.from('registros_dia').select('*')
    .eq('empleado_id', empleadoId).eq('fecha', fecha).maybeSingle()
  const row = unwrap(res)
  return row ? toRegistro(row) : null
}

export async function fetchCierres(): Promise<CierreMensual[]> {
  const res = await supabase.from('cierres_mensuales').select('*').order('id')
  return unwrap(res).map(toCierre)
}

export async function createCierre(row: CierreRow): Promise<CierreMensual> {
  const res = await supabase.from('cierres_mensuales').insert(row).select().single()
  return toCierre(unwrap(res))
}

export async function fetchResumen(): Promise<ResumenEmpleado[]> {
  const res = await supabase.from('resumen_empleados').select('*').order('nombre')
  return unwrap(res).map(toResumen)
}

// ---- mutations ------------------------------------------------------------

export async function setNovedadEstado(id: string, estado: EstadoNovedad): Promise<Novedad> {
  const res = await supabase.from('novedades').update({ estado }).eq('id', id).select().single()
  return toNovedad(unwrap(res))
}

export interface NuevaNovedadInput {
  empleadoId: string
  empleadoNombre: string
  fecha: string
  tipo: TipoNovedad
  detalle: string
  origen?: OrigenNovedad
  estado?: EstadoNovedad
}

export async function createNovedad(input: NuevaNovedadInput): Promise<Novedad> {
  const res = await supabase.from('novedades').insert({
    empleado_id: input.empleadoId,
    empleado_nombre: input.empleadoNombre,
    fecha: input.fecha,
    tipo: input.tipo,
    detalle: input.detalle,
    origen: input.origen ?? 'manual',
    estado: input.estado ?? 'pendiente',
  }).select().single()
  return toNovedad(unwrap(res))
}

export async function updateRegistroEstado(
  empleadoId: string, fecha: string, estado: RegistroDia['estado'],
): Promise<RegistroDia> {
  const res = await supabase.from('registros_dia')
    .update({ estado })
    .eq('empleado_id', empleadoId).eq('fecha', fecha)
    .select().single()
  return toRegistro(unwrap(res))
}

export async function updateCierreEstado(
  id: string, estado: CierreMensual['estado'], fechaCierre: string,
): Promise<CierreMensual> {
  const res = await supabase.from('cierres_mensuales')
    .update({ estado, fecha_cierre: fechaCierre })
    .eq('id', id)
    .select().single()
  return toCierre(unwrap(res))
}

export interface NuevoEmpleadoInput {
  legajo: string
  nombre: string
  dni: string
  cuil: string
  categoria: string
  jornada: string
  ingreso: string
  convenio: string
  turno: string
  tolerancia: number
  fichada: string
  email: string
  estado?: Empleado['estado']
}

export async function createEmpleado(input: NuevoEmpleadoInput): Promise<Empleado> {
  const iniciales = input.nombre.trim().split(/\s+/).map(w => w[0] ?? '').slice(0, 2).join('').toUpperCase()
  const res = await supabase.from('empleados').insert({
    id: `e${Date.now()}`,
    legajo: input.legajo, nombre: input.nombre, iniciales,
    dni: input.dni, cuil: input.cuil, categoria: input.categoria,
    jornada: input.jornada, ingreso: input.ingreso, convenio: input.convenio,
    turno: input.turno, tolerancia: input.tolerancia, fichada: input.fichada,
    estado: input.estado ?? 'activo', email: input.email,
  }).select().single()
  return toEmpleado(unwrap(res))
}

export async function updateEmpleado(id: string, input: NuevoEmpleadoInput): Promise<Empleado> {
  const iniciales = input.nombre.trim().split(/\s+/).map(w => w[0] ?? '').slice(0, 2).join('').toUpperCase()
  const res = await supabase.from('empleados').update({
    legajo: input.legajo, nombre: input.nombre, iniciales,
    dni: input.dni, cuil: input.cuil, categoria: input.categoria,
    jornada: input.jornada, ingreso: input.ingreso, convenio: input.convenio,
    turno: input.turno, tolerancia: input.tolerancia, fichada: input.fichada,
    estado: input.estado ?? 'activo', email: input.email,
  }).eq('id', id).select().single()
  return toEmpleado(unwrap(res))
}

export interface FichadaResult {
  accion: AccionFichada
  hora: string
  registro: RegistroDia
}

/**
 * Registra la fichada del empleado para una fecha (ingreso o egreso, decidido
 * por interpretarFichada). Hace upsert sobre (empleado_id, fecha) con origen QR.
 */
export async function registrarFichada(emp: Empleado, fecha: string): Promise<FichadaResult> {
  const actual = await fetchRegistroDia(emp.id, fecha)
  const r = interpretarFichada(emp, actual)
  if (!r.ok) throw new Error(r.error)

  const row = {
    empleado_id: emp.id,
    fecha,
    entrada: r.accion === 'ingreso' ? r.hora : (actual?.entrada ?? null),
    descanso_inicio: actual?.descansoInicio ?? null,
    descanso_fin: actual?.descansoFin ?? null,
    salida: r.accion === 'egreso' ? r.hora : (actual?.salida ?? null),
    estado: r.estado,
    origen: 'qr' as const,
    minutos_extra: r.minutosExtra ?? null,
    minutos_tardanza: r.minutosTardanza ?? null,
  }

  const res = await supabase.from('registros_dia')
    .upsert(row, { onConflict: 'empleado_id,fecha' })
    .select().single()
  return { accion: r.accion, hora: r.hora, registro: toRegistro(unwrap(res)) }
}
