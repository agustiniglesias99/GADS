import { RouteLine } from '../components/RouteLine'
import { SealIcon } from '../components/SealIcon'
import { TopBar } from '../components/TopBar'
import { formatDias, pluralEstudiantes } from '../format'
import { useApp } from '../store'

export function Home() {
  const { state, dispatch, go } = useApp()
  const usuario = state.usuario!
  const hayLugar = state.trayectos.some((t) => t.pasajeros.length < t.cupos)

  return (
    <main className="screen">
      <TopBar />
      <div className="screen__body">
        <section className="welcome">
          <h2 className="welcome__hello">Hola, {usuario.nombre}</h2>
          <p className="trust-seal">
            <SealIcon />3 alumnos validados cerca tuyo
          </p>
          {state.totalAyudados > 0 && (
            <p className="muted">Ya ayudaste a {pluralEstudiantes(state.totalAyudados)} a llegar a la UNLaM.</p>
          )}
        </section>

        {state.viaje && (
          <button className="ongoing" onClick={() => go('llegada')}>
            <span className="ongoing__pulse" aria-hidden="true" />
            <span>
              <strong>Tenés un viaje en curso</strong>
              <span className="muted">Tocá para ver el estado</span>
            </span>
          </button>
        )}

        <div className="actions-row">
          <button className="btn btn--primary" onClick={() => go('publicar')}>
            Cargar trayecto
          </button>
          <button className="btn btn--secondary" onClick={() => go('buscar')}>
            Buscar viaje
          </button>
        </div>

        <section className="section">
          <h3 className="section__title">Tus trayectos</h3>
          {state.trayectos.length === 0 ? (
            <div className="empty">
              <p>Todavía no cargaste ningún trayecto.</p>
              <p className="muted">Cargá el primero y te avisamos apenas alguien quiera sumarse.</p>
            </div>
          ) : (
            <ul className="trip-list">
              {state.trayectos.map((t) => (
                <li key={t.id}>
                  <button
                    className="trip-card"
                    onClick={() => {
                      dispatch({ type: 'abrirTrayecto', id: t.id })
                      go('iniciar')
                    }}
                  >
                    <RouteLine origen={t.origen} hora={t.hora} compacta />
                    <span className="trip-card__foot">
                      <span>{formatDias(t.dias)}</span>
                      <span className="seats">
                        {t.pasajeros.length}/{t.cupos} lugares ocupados
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="demo">
          <button
            className="btn btn--ghost"
            disabled={!hayLugar}
            onClick={() => {
              dispatch({ type: 'simularSolicitud' })
              go('solicitud')
            }}
          >
            Demo: simular solicitud entrante
          </button>
          <p className="hint">
            {hayLugar
              ? 'Simula que otro estudiante pide sumarse a uno de tus trayectos.'
              : 'Cargá un trayecto con lugares libres para probar una solicitud.'}
          </p>
        </div>
      </div>
    </main>
  )
}
