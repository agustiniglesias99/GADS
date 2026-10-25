import { createContext, useContext, useEffect, useReducer } from 'react'
import { CONDUCTOR_DEMO, SOLICITANTES_DEMO } from './data'
import type { Conductor, Dia, Estudiante, Screen, Trayecto, ViajeEnCurso } from './types'

export interface Solicitud {
  trayectoId: string
  estudiante: Estudiante
}

export interface AppState {
  usuario: Conductor | null
  trayectos: Trayecto[]
  trayectoActivoId: string | null
  solicitud: Solicitud | null
  viaje: ViajeEnCurso | null
  ultimoCierre: { ayudados: number } | null
  totalAyudados: number
}

export type Action =
  | { type: 'login'; usuario: string }
  | { type: 'logout' }
  | { type: 'publicar'; origen: string; hora: string; dias: Dia[]; cupos: number }
  | { type: 'abrirTrayecto'; id: string }
  | { type: 'simularSolicitud' }
  | { type: 'aceptarSolicitud' }
  | { type: 'rechazarSolicitud' }
  | { type: 'iniciarViaje' }
  | { type: 'detectarLlegada' }
  | { type: 'finalizarViaje' }

const STORAGE_KEY = 'unlamigo:v1'

const initialState: AppState = {
  usuario: null,
  trayectos: [],
  trayectoActivoId: null,
  solicitud: null,
  viaje: null,
  ultimoCierre: null,
  totalAyudados: 0,
}

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return { ...initialState, ...(JSON.parse(raw) as Partial<AppState>) }
  } catch {
    // Storage bloqueado o corrupto: arrancamos de cero.
  }
  return initialState
}

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'login':
      return { ...state, usuario: { ...CONDUCTOR_DEMO, usuario: action.usuario } }

    case 'logout':
      return initialState

    case 'publicar': {
      const trayecto: Trayecto = {
        id: crypto.randomUUID(),
        origen: action.origen,
        hora: action.hora,
        dias: action.dias,
        cupos: action.cupos,
        pasajeros: [],
      }
      return { ...state, trayectos: [trayecto, ...state.trayectos], trayectoActivoId: trayecto.id }
    }

    case 'abrirTrayecto':
      return { ...state, trayectoActivoId: action.id }

    case 'simularSolicitud': {
      // Elige el primer trayecto con lugar y un solicitante que todavía no viaje en él.
      for (const t of state.trayectos) {
        if (t.pasajeros.length >= t.cupos) continue
        const estudiante = SOLICITANTES_DEMO.find(
          (s) => !t.pasajeros.some((p) => p.nombre === s.nombre && p.apellido === s.apellido),
        )
        if (estudiante) return { ...state, solicitud: { trayectoId: t.id, estudiante } }
      }
      return state
    }

    case 'aceptarSolicitud': {
      const sol = state.solicitud
      if (!sol) return state
      return {
        ...state,
        solicitud: null,
        trayectoActivoId: sol.trayectoId,
        trayectos: state.trayectos.map((t) =>
          t.id === sol.trayectoId ? { ...t, pasajeros: [...t.pasajeros, sol.estudiante] } : t,
        ),
      }
    }

    case 'rechazarSolicitud':
      return { ...state, solicitud: null }

    case 'iniciarViaje':
      if (!state.trayectoActivoId) return state
      return { ...state, viaje: { trayectoId: state.trayectoActivoId, llegadaDetectada: false } }

    case 'detectarLlegada':
      if (!state.viaje) return state
      return { ...state, viaje: { ...state.viaje, llegadaDetectada: true } }

    case 'finalizarViaje': {
      const viaje = state.viaje
      if (!viaje?.llegadaDetectada) return state
      const ayudados = state.trayectos.find((t) => t.id === viaje.trayectoId)?.pasajeros.length ?? 0
      return {
        ...state,
        viaje: null,
        ultimoCierre: { ayudados },
        totalAyudados: state.totalAyudados + ayudados,
      }
    }
  }
}

export function useAppReducer() {
  const [state, dispatch] = useReducer(reducer, undefined, loadState)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // Sin persistencia: la app sigue funcionando en memoria.
    }
  }, [state])

  return [state, dispatch] as const
}

export interface AppContextValue {
  state: AppState
  dispatch: (action: Action) => void
  go: (screen: Screen) => void
}

export const AppContext = createContext<AppContextValue | null>(null)

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp debe usarse dentro de AppContext')
  return ctx
}

export function useTrayectoActivo(): Trayecto | undefined {
  const { state } = useApp()
  return state.trayectos.find((t) => t.id === state.trayectoActivoId)
}
