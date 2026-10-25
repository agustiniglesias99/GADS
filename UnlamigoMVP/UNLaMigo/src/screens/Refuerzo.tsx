import { Illustration } from '../components/Illustration'
import { TopBar } from '../components/TopBar'
import { useApp, useTrayectoActivo } from '../store'

export function Refuerzo() {
  const { go } = useApp()
  const trayecto = useTrayectoActivo()
  const ultimo = trayecto?.pasajeros.at(-1)

  return (
    <main className="screen">
      <TopBar />
      <div className="screen__body screen__body--center">
        <Illustration kind="aceptado" />
        <h2 className="headline">¡Genial! {ultimo ? ultimo.nombre : 'Tu compañero/a'} se suma a tu viaje.</h2>
        <p className="muted">Podés ver su perfil cuando quieras desde “Mi viaje”.</p>
      </div>
      <div className="screen__actions">
        <button className="btn btn--primary" onClick={() => go('iniciar')}>
          Ir a mi viaje
        </button>
      </div>
    </main>
  )
}
