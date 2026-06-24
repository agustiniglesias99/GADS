// Lógica de fichaje por QR para empleados.
//
// El empleado escanea un QR (pegado en el punto de fichaje). Si el contenido
// coincide con el token configurado, se registra la asistencia del día:
//   - sin entrada todavía  -> INGRESO
//   - con entrada, sin salida -> EGRESO
//   - con ambas            -> jornada ya completa
//
// El estado (tardanza / hora extra / salida anticipada) se deriva comparando
// la hora actual contra el turno del empleado y su tolerancia.

import type { Empleado, RegistroDia } from '../types'

export type AccionFichada = 'ingreso' | 'egreso'
type EstadoRegistro = RegistroDia['estado']

// Token que debe codificar el QR del punto de fichaje. Configurable por env.
export const QR_CHECKIN_TOKEN = (import.meta.env.VITE_QR_TOKEN ?? 'GADS-CHECKIN').trim()

export interface TurnoHorario {
  inicioMin: number // minutos desde 00:00
  finMin: number
}

/** Extrae el horario de inicio/fin desde un turno tipo "Lun–Vie 09–18". */
export function parseTurno(turno: string): TurnoHorario | null {
  const nums = turno.match(/\d{1,2}/g)
  if (!nums || nums.length < 2) return null
  const inicio = parseInt(nums[nums.length - 2], 10)
  const fin = parseInt(nums[nums.length - 1], 10)
  if (Number.isNaN(inicio) || Number.isNaN(fin)) return null
  return { inicioMin: inicio * 60, finMin: fin * 60 }
}

export function ahoraEnMinutos(d: Date = new Date()): number {
  return d.getHours() * 60 + d.getMinutes()
}

export function minutosAHora(min: number): string {
  const h = Math.floor(min / 60)
  const m = min % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export function fechaHoy(d: Date = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export type Interpretacion =
  | {
      ok: true
      accion: AccionFichada
      hora: string
      estado: EstadoRegistro
      minutosTardanza?: number
      minutosExtra?: number
    }
  | { ok: false; error: string }

/**
 * Decide si la fichada actual es ingreso o egreso (modelo híbrido) y clasifica
 * el estado según el turno del empleado.
 */
export function interpretarFichada(
  emp: Empleado,
  registro: RegistroDia | null,
  nowMin: number = ahoraEnMinutos(),
): Interpretacion {
  const hora = minutosAHora(nowMin)
  const horario = parseTurno(emp.turno)
  const tol = emp.tolerancia ?? 0
  const tieneEntrada = !!registro?.entrada
  const tieneSalida = !!registro?.salida

  if (tieneEntrada && tieneSalida) {
    return { ok: false, error: 'Ya registraste entrada y salida hoy.' }
  }

  // --- INGRESO ---
  if (!tieneEntrada) {
    let estado: EstadoRegistro = 'presente'
    let minutosTardanza: number | undefined
    if (horario && nowMin > horario.inicioMin + tol) {
      estado = 'tardanza'
      minutosTardanza = nowMin - horario.inicioMin
    }
    return { ok: true, accion: 'ingreso', hora, estado, minutosTardanza }
  }

  // --- EGRESO ---
  let estado: EstadoRegistro = 'presente'
  let minutosExtra: number | undefined
  const minutosTardanza = registro?.minutosTardanza
  if (horario) {
    if (nowMin >= horario.finMin + tol) {
      estado = 'hora_extra'
      minutosExtra = nowMin - horario.finMin
    } else if (nowMin <= horario.finMin - tol) {
      estado = 'salida_anticipada'
    } else if (minutosTardanza) {
      estado = 'tardanza'
    }
  }
  return { ok: true, accion: 'egreso', hora, estado, minutosExtra, minutosTardanza }
}
