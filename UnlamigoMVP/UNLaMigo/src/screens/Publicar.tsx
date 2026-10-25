import { useState, type FormEvent } from 'react'
import { Avatar } from '../components/Avatar'
import { RouteLine } from '../components/RouteLine'
import { TopBar } from '../components/TopBar'
import { BARRIOS_SUGERIDOS, DIAS, MAX_CUPOS } from '../data'
import { nombreCorto } from '../format'
import { useApp } from '../store'
import type { Dia } from '../types'

export function Publicar() {
  const { state, dispatch, go } = useApp()
  const usuario = state.usuario!
  const [origen, setOrigen] = useState('')
  const [hora, setHora] = useState('19:00')
  const [cupos, setCupos] = useState(3)
  const [dias, setDias] = useState<Dia[]>([])
  const [error, setError] = useState('')

  function toggleDia(d: Dia) {
    setDias((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]))
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!origen.trim()) return setError('Indicá desde dónde salís.')
    if (!hora) return setError('Elegí a qué hora salís.')
    if (dias.length === 0) return setError('Elegí al menos un día en que hacés este trayecto.')
    dispatch({ type: 'publicar', origen: origen.trim(), hora, dias, cupos })
    go('confirmacion')
  }

  return (
    <main className="screen">
      <TopBar title="Cargar trayecto" onBack={() => go('home')} />
      <form className="screen__body" onSubmit={onSubmit} noValidate id="form-publicar">
        <div className="map-card">
          <RouteLine origen={origen} hora={hora} />
        </div>

        <label className="field">
          <span className="field__label">Salís desde</span>
          <input
            className="input"
            list="barrios"
            placeholder="Barrio o calle de partida"
            value={origen}
            onChange={(e) => setOrigen(e.target.value)}
          />
          <datalist id="barrios">
            {BARRIOS_SUGERIDOS.map((b) => (
              <option key={b} value={b} />
            ))}
          </datalist>
        </label>

        <div className="field-row">
          <label className="field">
            <span className="field__label">Hora de salida</span>
            <input className="input" type="time" value={hora} onChange={(e) => setHora(e.target.value)} />
          </label>
          <div className="field">
            <span className="field__label" id="cupos-label">
              Lugares libres
            </span>
            <div className="stepper" role="group" aria-labelledby="cupos-label">
              <button type="button" onClick={() => setCupos((c) => Math.max(1, c - 1))} disabled={cupos <= 1} aria-label="Un lugar menos">
                −
              </button>
              <output aria-live="polite">{cupos}</output>
              <button
                type="button"
                onClick={() => setCupos((c) => Math.min(MAX_CUPOS, c + 1))}
                disabled={cupos >= MAX_CUPOS}
                aria-label="Un lugar más"
              >
                +
              </button>
            </div>
          </div>
        </div>

        <fieldset className="field">
          <legend className="field__label">Días que hacés este viaje</legend>
          <div className="days">
            {DIAS.map((d) => (
              <button
                type="button"
                key={d.id}
                className={`day ${dias.includes(d.id) ? 'day--on' : ''}`}
                aria-pressed={dias.includes(d.id)}
                aria-label={d.largo}
                onClick={() => toggleDia(d.id)}
              >
                {d.corto}
              </button>
            ))}
          </div>
        </fieldset>

        <section className="preview">
          <p className="preview__label">Así te van a ver los pasajeros</p>
          <div className="person">
            <Avatar persona={usuario} />
            <div>
              <div className="person__name">
                {nombreCorto(usuario)} · {usuario.carrera}
              </div>
              <div className="muted">
                Alumno desde {usuario.alumnoDesde} · Auto: {usuario.auto}
              </div>
            </div>
          </div>
        </section>

        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
      </form>
      <div className="screen__actions">
        <button type="submit" form="form-publicar" className="btn btn--primary">
          Publicar trayecto
        </button>
      </div>
    </main>
  )
}
