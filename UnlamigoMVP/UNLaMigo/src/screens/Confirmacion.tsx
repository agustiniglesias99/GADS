import { Illustration } from '../components/Illustration'
import { TopBar } from '../components/TopBar'
import { formatDias } from '../format'
import { useApp, useTrayectoActivo } from '../store'

export function Confirmacion() {
  const { go } = useApp()
  const trayecto = useTrayectoActivo()

  return (
    <main className="screen">
      <TopBar />
      <div className="screen__body screen__body--center">
        <Illustration kind="publicado" />
        <h2 className="headline">¡Listo! Ya estás ayudando a otro estudiante a llegar.</h2>
        <p className="muted">Te avisamos apenas alguien quiera sumarse a tu viaje.</p>
        {trayecto && (
          <p className="summary-pill">
            {trayecto.origen} → UNLaM · {trayecto.hora} hs · {formatDias(trayecto.dias)}
          </p>
        )}
      </div>
      <div className="screen__actions">
        <button className="btn btn--secondary" onClick={() => go('home')}>
          Volver al inicio
        </button>
      </div>
    </main>
  )
}
