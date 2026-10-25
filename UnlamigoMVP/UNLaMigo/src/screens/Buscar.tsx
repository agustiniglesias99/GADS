import { TopBar } from '../components/TopBar'
import { useApp } from '../store'

export function Buscar() {
  const { go } = useApp()

  return (
    <main className="screen">
      <TopBar title="Buscar viaje" onBack={() => go('home')} />
      <div className="screen__body">
        <div className="empty empty--tall">
          <p>
            <strong>Muy pronto vas a poder buscar viajes como pasajero.</strong>
          </p>
          <p className="muted">
            En esta primera versión probamos el recorrido del conductor: cargar un trayecto, aceptar a quien se suma y
            llegar juntos a la UNLaM.
          </p>
        </div>
      </div>
      <div className="screen__actions">
        <button className="btn btn--secondary" onClick={() => go('home')}>
          Volver al inicio
        </button>
      </div>
    </main>
  )
}
