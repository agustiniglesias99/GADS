import { Illustration } from '../components/Illustration'
import { TopBar } from '../components/TopBar'
import { pluralEstudiantes } from '../format'
import { useApp } from '../store'

export function Cierre() {
  const { state, go } = useApp()
  const ayudados = state.ultimoCierre?.ayudados ?? 0

  return (
    <main className="screen">
      <TopBar />
      <div className="screen__body screen__body--center">
        <Illustration kind="gracias" />
        <h2 className="headline">¡Gracias por compartir tu viaje!</h2>
        <p className="muted">
          {ayudados > 0
            ? `Hoy ayudaste a ${pluralEstudiantes(ayudados)} a llegar sin combinar transporte público.`
            : 'Esta vez viajaste solo. Dejá tu trayecto publicado: la próxima seguro se suma alguien.'}
        </p>
      </div>
      <div className="screen__actions">
        <button className="btn btn--secondary" onClick={() => go('home')}>
          Volver al inicio
        </button>
      </div>
    </main>
  )
}
