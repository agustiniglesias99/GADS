import { useCallback, useEffect, useMemo, useState } from 'react'
import { Buscar } from './screens/Buscar'
import { Cierre } from './screens/Cierre'
import { Confirmacion } from './screens/Confirmacion'
import { Home } from './screens/Home'
import { Llegada } from './screens/Llegada'
import { Login } from './screens/Login'
import { MiViaje } from './screens/MiViaje'
import { Publicar } from './screens/Publicar'
import { Refuerzo } from './screens/Refuerzo'
import { Solicitud } from './screens/Solicitud'
import { AppContext, useAppReducer } from './store'
import type { Screen } from './types'

// Pantallas "de cierre": volver atrás desde acá no debe reabrir el paso anterior.
const RAICES: Screen[] = ['login', 'home']

export default function App() {
  const [state, dispatch] = useAppReducer()
  const [screen, setScreen] = useState<Screen>(() => (state.usuario ? 'home' : 'login'))

  // Navegación por estado, sincronizada con el historial para que funcione el "atrás" del celular.
  const go = useCallback((next: Screen) => {
    if (RAICES.includes(next)) window.history.replaceState({ screen: next }, '')
    else window.history.pushState({ screen: next }, '')
    setScreen(next)
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    window.history.replaceState({ screen }, '')
    const onPop = (e: PopStateEvent) => {
      const s = (e.state as { screen?: Screen } | null)?.screen
      setScreen(s ?? 'home')
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
    // Solo al montar: registra la pantalla inicial en el historial.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const ctx = useMemo(() => ({ state, dispatch, go }), [state, dispatch, go])
  const actual: Screen = state.usuario ? (screen === 'login' ? 'home' : screen) : 'login'

  return (
    <AppContext value={ctx}>
      <div className="app" key={actual}>
        {actual === 'login' && <Login />}
        {actual === 'home' && <Home />}
        {actual === 'buscar' && <Buscar />}
        {actual === 'publicar' && <Publicar />}
        {actual === 'confirmacion' && <Confirmacion />}
        {actual === 'solicitud' && <Solicitud />}
        {actual === 'refuerzo' && <Refuerzo />}
        {actual === 'iniciar' && <MiViaje />}
        {actual === 'llegada' && <Llegada />}
        {actual === 'cierre' && <Cierre />}
      </div>
    </AppContext>
  )
}
