import { useState } from 'react'
import { RouteLine } from '../components/RouteLine'
import { TopBar } from '../components/TopBar'
import { RADIO_LLEGADA_M, UNLAM_COORDS } from '../data'
import { distanciaMetros } from '../format'
import { useApp } from '../store'

type Verificacion = { tipo: 'idle' } | { tipo: 'buscando' } | { tipo: 'lejos'; metros: number } | { tipo: 'error'; msg: string }

export function Llegada() {
  const { state, dispatch, go } = useApp()
  const viaje = state.viaje
  const trayecto = state.trayectos.find((t) => t.id === viaje?.trayectoId)
  const [verif, setVerif] = useState<Verificacion>({ tipo: 'idle' })

  if (!viaje || !trayecto) {
    return (
      <main className="screen">
        <TopBar onBack={() => go('home')} />
        <div className="screen__body">
          <div className="empty empty--tall">
            <p>No tenés ningún viaje en curso.</p>
          </div>
        </div>
      </main>
    )
  }

  const llego = viaje.llegadaDetectada

  // Lectura puntual de ubicación (sin tracking en vivo, fuera del alcance del MVP).
  function verificarLlegada() {
    if (!('geolocation' in navigator)) {
      setVerif({ tipo: 'error', msg: 'Tu navegador no permite leer la ubicación.' })
      return
    }
    setVerif({ tipo: 'buscando' })
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const metros = distanciaMetros({ lat: pos.coords.latitude, lng: pos.coords.longitude }, UNLAM_COORDS)
        if (metros <= RADIO_LLEGADA_M) {
          setVerif({ tipo: 'idle' })
          dispatch({ type: 'detectarLlegada' })
        } else {
          setVerif({ tipo: 'lejos', metros })
        }
      },
      () => setVerif({ tipo: 'error', msg: 'No pudimos leer tu ubicación. Revisá el permiso de ubicación del navegador.' }),
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }

  return (
    <main className="screen">
      <TopBar title="En viaje" />
      <div className="screen__body">
        <div className="map-card">
          <RouteLine origen={trayecto.origen} hora={trayecto.hora} progreso={llego ? 1 : 0.5} />
        </div>

        <div className={`status ${llego ? 'status--done' : ''}`} role="status">
          {llego ? (
            <strong>Llegada detectada en la UNLaM</strong>
          ) : (
            <>
              <span className="ongoing__pulse" aria-hidden="true" />
              <span>Viaje en curso. Cuando llegues a la UNLaM, verificá tu llegada para finalizar.</span>
            </>
          )}
        </div>

        {!llego && (
          <>
            <button className="btn btn--secondary" onClick={verificarLlegada} disabled={verif.tipo === 'buscando'}>
              {verif.tipo === 'buscando' ? 'Leyendo ubicación…' : 'Verificar llegada'}
            </button>
            {verif.tipo === 'lejos' && (
              <p className="form-error" role="alert">
                Todavía estás a {(verif.metros / 1000).toFixed(1)} km de la UNLaM.
              </p>
            )}
            {verif.tipo === 'error' && (
              <p className="form-error" role="alert">
                {verif.msg}
              </p>
            )}
            <div className="demo">
              <button className="btn btn--ghost" onClick={() => dispatch({ type: 'detectarLlegada' })}>
                Demo: simular llegada
              </button>
            </div>
          </>
        )}
      </div>
      <div className="screen__actions">
        <button
          className="btn btn--primary"
          disabled={!llego}
          onClick={() => {
            dispatch({ type: 'finalizarViaje' })
            go('cierre')
          }}
        >
          Finalizar viaje
        </button>
        {!llego && <p className="hint">Se habilita cuando detectamos que llegaste.</p>}
      </div>
    </main>
  )
}
