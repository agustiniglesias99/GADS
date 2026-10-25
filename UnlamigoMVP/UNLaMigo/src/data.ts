import type { Conductor, Dia, Estudiante } from './types'

// Datos de demo del MVP: no hay backend todavía.
export const CONDUCTOR_DEMO: Conductor = {
  usuario: 'facundo.i',
  nombre: 'Facundo',
  apellido: 'Iglesias',
  carrera: 'Ing. Informática',
  alumnoDesde: 2022,
  auto: 'Corsa gris',
}

export const SOLICITANTES_DEMO: Estudiante[] = [
  { nombre: 'Dasha', apellido: 'Acosta', carrera: 'Ing. en Sistemas', alumnoDesde: 2021 },
  { nombre: 'Tomás', apellido: 'Benítez', carrera: 'Lic. en Nutrición', alumnoDesde: 2023 },
  { nombre: 'Lucía', apellido: 'Ferreyra', carrera: 'Abogacía', alumnoDesde: 2020 },
  { nombre: 'Martín', apellido: 'Godoy', carrera: 'Ing. Industrial', alumnoDesde: 2024 },
]

export const DIAS: { id: Dia; corto: string; largo: string }[] = [
  { id: 'lun', corto: 'L', largo: 'Lunes' },
  { id: 'mar', corto: 'M', largo: 'Martes' },
  { id: 'mie', corto: 'M', largo: 'Miércoles' },
  { id: 'jue', corto: 'J', largo: 'Jueves' },
  { id: 'vie', corto: 'V', largo: 'Viernes' },
  { id: 'sab', corto: 'S', largo: 'Sábado' },
]

export const BARRIOS_SUGERIDOS = [
  'Castelar Norte',
  'Ramos Mejía',
  'Morón Centro',
  'Haedo',
  'Isidro Casanova',
  'Lomas del Mirador',
  'Villa Luzuriaga',
  'González Catán',
]

export const DESTINO = 'UNLaM · San Justo'

// Campus UNLaM, Florencio Varela 1903, San Justo.
export const UNLAM_COORDS = { lat: -34.6705, lng: -58.5627 }
export const RADIO_LLEGADA_M = 600

export const MAX_CUPOS = 4
