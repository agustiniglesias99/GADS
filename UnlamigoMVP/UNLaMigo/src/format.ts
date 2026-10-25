import { DIAS } from './data'
import type { Dia, Estudiante } from './types'

export function nombreCorto(e: Estudiante): string {
  return `${e.nombre} ${e.apellido.charAt(0)}.`
}

export function iniciales(e: Estudiante): string {
  return `${e.nombre.charAt(0)}${e.apellido.charAt(0)}`
}

export function formatDias(dias: Dia[]): string {
  if (dias.length === 0) return 'Sin días'
  const orden = DIAS.filter((d) => dias.includes(d.id))
  if (orden.length === 5 && !dias.includes('sab')) return 'Lunes a viernes'
  if (orden.length === 1) return orden[0].largo
  return orden.map((d) => d.largo.slice(0, 3)).join(', ')
}

export function pluralEstudiantes(n: number): string {
  return n === 1 ? '1 estudiante' : `${n} estudiantes`
}

export function distanciaMetros(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371000
  const rad = (x: number) => (x * Math.PI) / 180
  const dLat = rad(b.lat - a.lat)
  const dLng = rad(b.lng - a.lng)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}
