import { Avatar } from '../components/Avatar'
import { RouteLine } from '../components/RouteLine'
import { SealIcon } from '../components/SealIcon'
import { TopBar } from '../components/TopBar'
import { formatDias, nombreCorto } from '../format'
import { useApp } from '../store'

export function Solicitud() {
  const { state, dispatch, go } = useApp()
  const solicitud = state.solicitud
  const trayecto = state.trayectos.find((t) => t.id === solicitud?.trayectoId)

  if (!solicitud || !trayecto) {
    return (
      <main className="screen">
        <TopBar onBack={() => go('home')} />
        <div className="screen__body">
          <div className="empty empty--tall">
            <p>No tenés solicitudes pendientes.</p>
          </div>
        </div>
      </main>
    )
  }

  const e = solicitud.estudiante

  return (
    <main className="screen">
      <TopBar title="Nueva solicitud" />
      <div className="screen__body screen__body--center">
        <Avatar persona={e} size="lg" />
        <h2 className="headline">{nombreCorto(e)} quiere unirse a tu viaje</h2>
        <p className="muted">
          {e.carrera} · Alumno/a desde {e.alumnoDesde}
        </p>
        <p className="trust-seal trust-seal--big">
          <SealIcon />
          Alumno validado UNLaM
        </p>

        <div className="map-card map-card--left">
          <RouteLine origen={trayecto.origen} hora={trayecto.hora} compacta />
          <p className="muted">
            {formatDias(trayecto.dias)} · quedan {trayecto.cupos - trayecto.pasajeros.length} de {trayecto.cupos} lugares
          </p>
        </div>
      </div>
      <div className="screen__actions actions-row">
        <button
          className="btn btn--secondary"
          onClick={() => {
            dispatch({ type: 'rechazarSolicitud' })
            go('home')
          }}
        >
          Rechazar
        </button>
        <button
          className="btn btn--primary"
          onClick={() => {
            dispatch({ type: 'aceptarSolicitud' })
            go('refuerzo')
          }}
        >
          Aceptar
        </button>
      </div>
    </main>
  )
}
