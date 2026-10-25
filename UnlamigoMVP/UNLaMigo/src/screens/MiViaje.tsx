import { Avatar } from '../components/Avatar'
import { RouteLine } from '../components/RouteLine'
import { TopBar } from '../components/TopBar'
import { formatDias, nombreCorto, pluralEstudiantes } from '../format'
import { useApp, useTrayectoActivo } from '../store'

export function MiViaje() {
  const { state, dispatch, go } = useApp()
  const trayecto = useTrayectoActivo()

  if (!trayecto) {
    return (
      <main className="screen">
        <TopBar title="Mi viaje" onBack={() => go('home')} />
        <div className="screen__body">
          <div className="empty empty--tall">
            <p>No encontramos este trayecto.</p>
            <p className="muted">Volvé al inicio y elegí uno de tus trayectos.</p>
          </div>
        </div>
      </main>
    )
  }

  const enCurso = state.viaje?.trayectoId === trayecto.id
  const otroEnCurso = state.viaje !== null && !enCurso
  const n = trayecto.pasajeros.length

  return (
    <main className="screen">
      <TopBar title="Mi viaje" onBack={() => go('home')} />
      <div className="screen__body">
        <div className="map-card">
          <RouteLine origen={trayecto.origen} hora={trayecto.hora} />
          <p className="muted">{formatDias(trayecto.dias)}</p>
        </div>

        <section className="section">
          <h3 className="section__title">
            Pasajeros confirmados{' '}
            <span className="seats">
              {n}/{trayecto.cupos}
            </span>
          </h3>
          {n === 0 ? (
            <p className="muted">Todavía no se sumó nadie. Te avisamos cuando llegue una solicitud.</p>
          ) : (
            <ul className="people">
              {trayecto.pasajeros.map((p) => (
                <li key={`${p.nombre}-${p.apellido}`} className="person">
                  <Avatar persona={p} size="sm" />
                  <div>
                    <div className="person__name">{nombreCorto(p)}</div>
                    <div className="muted">
                      {p.carrera} · desde {p.alumnoDesde}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {n > 0 && <p className="cheer">Hoy vas a ayudar a {pluralEstudiantes(n)} a llegar.</p>}
      </div>
      <div className="screen__actions">
        {enCurso ? (
          <button className="btn btn--primary" onClick={() => go('llegada')}>
            Ver viaje en curso
          </button>
        ) : (
          <>
            <button
              className="btn btn--primary"
              disabled={otroEnCurso}
              onClick={() => {
                dispatch({ type: 'iniciarViaje' })
                go('llegada')
              }}
            >
              Iniciar viaje
            </button>
            {otroEnCurso && <p className="hint">Terminá tu viaje en curso antes de iniciar otro.</p>}
          </>
        )}
      </div>
    </main>
  )
}
