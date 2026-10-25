import { useState, type FormEvent } from 'react'
import { Logo } from '../components/Logo'
import { useApp } from '../store'

export function Login() {
  const { dispatch, go } = useApp()
  const [usuario, setUsuario] = useState('')
  const [clave, setClave] = useState('')
  const [error, setError] = useState('')

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!usuario.trim() || !clave) {
      setError('Completá tu usuario y tu contraseña para ingresar.')
      return
    }
    dispatch({ type: 'login', usuario: usuario.trim() })
    go('home')
  }

  return (
    <main className="screen screen--login">
      <div className="login__hero">
        <Logo />
        <p className="login__tagline">Compartí el viaje a la facu con otros estudiantes de la UNLaM.</p>
        <div className="login__road" aria-hidden="true" />
      </div>

      <form className="screen__body login__form" onSubmit={onSubmit} noValidate>
        <label className="field">
          <span className="field__label">Usuario</span>
          <input
            className="input"
            autoComplete="username"
            autoCapitalize="none"
            placeholder="Tu usuario de alumno"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
          />
        </label>
        <label className="field">
          <span className="field__label">Contraseña</span>
          <input
            className="input"
            type="password"
            autoComplete="current-password"
            value={clave}
            onChange={(e) => setClave(e.target.value)}
          />
        </label>

        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}

        <button type="submit" className="btn btn--primary">
          Ingresar
        </button>
        <p className="hint">Versión de prueba: tu cuenta de alumno regular ya fue validada al registrarte.</p>
      </form>
    </main>
  )
}
