import { useState } from 'react'
import { useApp } from '../store'
import { Avatar } from './Avatar'
import { Logo } from './Logo'

interface Props {
  title?: string
  onBack?: () => void
}

export function TopBar({ title, onBack }: Props) {
  const { state, dispatch, go } = useApp()
  const [menuAbierto, setMenuAbierto] = useState(false)
  const usuario = state.usuario

  return (
    <header className="topbar">
      {onBack ? (
        <button className="icon-btn" onClick={onBack} aria-label="Volver">
          <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
            <path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      ) : (
        !title && <Logo size="sm" />
      )}

      {title && <h1 className="topbar__title">{title}</h1>}

      {usuario && (
        <div className="topbar__user">
          <button
            className="icon-btn icon-btn--avatar"
            onClick={() => setMenuAbierto((v) => !v)}
            aria-label="Mi cuenta"
            aria-expanded={menuAbierto}
          >
            <Avatar persona={usuario} size="sm" />
          </button>
          {menuAbierto && (
            <div className="menu" role="menu">
              <div className="menu__who">
                <strong>
                  {usuario.nombre} {usuario.apellido}
                </strong>
                <span>{usuario.carrera}</span>
              </div>
              <button
                role="menuitem"
                className="menu__item"
                onClick={() => {
                  setMenuAbierto(false)
                  dispatch({ type: 'logout' })
                  go('login')
                }}
              >
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  )
}
