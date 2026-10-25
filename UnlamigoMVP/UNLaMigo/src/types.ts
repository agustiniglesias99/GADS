export type Screen =
  | 'login'
  | 'home'
  | 'buscar'
  | 'publicar'
  | 'confirmacion'
  | 'solicitud'
  | 'refuerzo'
  | 'iniciar'
  | 'llegada'
  | 'cierre'

export type Dia = 'lun' | 'mar' | 'mie' | 'jue' | 'vie' | 'sab'

export interface Estudiante {
  nombre: string
  apellido: string
  carrera: string
  alumnoDesde: number
}

export interface Conductor extends Estudiante {
  usuario: string
  auto: string
}

export interface Trayecto {
  id: string
  origen: string
  hora: string
  dias: Dia[]
  cupos: number
  pasajeros: Estudiante[]
}

export interface ViajeEnCurso {
  trayectoId: string
  llegadaDetectada: boolean
}
