import { useAuth } from '../../context/AuthContext'
import { Button } from '../ui/Button'

type Page =
  | 'dashboard' | 'fichadas' | 'empleados' | 'novedades' | 'cierre'
  | 'mi-panel' | 'exportar'

interface TopbarProps {
  currentPage: Page
  onNavigate: (page: Page) => void
  onNewNovedad?: () => void
}

const navItemsRRHH: { id: Page; label: string }[] = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'fichadas', label: 'Fichadas' },
  { id: 'empleados', label: 'Empleados' },
  { id: 'novedades', label: 'Novedades' },
  { id: 'cierre', label: 'Cierre mensual' },
]

const navItemsEmpleado: { id: Page; label: string }[] = [
  { id: 'mi-panel', label: 'Mi panel' },
]

const navItemsContador: { id: Page; label: string }[] = [
  { id: 'exportar', label: 'Exportar liquidación' },
]

export function Topbar({ currentPage, onNavigate, onNewNovedad }: TopbarProps) {
  const { user, logout } = useAuth()

  const navItems = user?.role === 'rrhh'
    ? navItemsRRHH
    : user?.role === 'empleado'
    ? navItemsEmpleado
    : navItemsContador

  const initials = user?.nombre?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() ?? 'US'

  const roleLabel = user?.role === 'rrhh' ? 'RRHH' : user?.role === 'empleado' ? 'Empleado' : 'Contador'

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '11px 24px', borderBottom: '1px solid var(--border)',
      background: 'rgba(255,255,255,0.82)',
      backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
      position: 'sticky', top: 0, zIndex: 100,
      boxShadow: '0 1px 0 rgba(30,28,22,0.02)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <span style={{
            width: 26, height: 26, borderRadius: 8, flexShrink: 0,
            background: 'linear-gradient(135deg, #2a2a26 0%, #000 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 14, fontWeight: 800,
            boxShadow: '0 2px 6px rgba(0,0,0,0.18)',
          }}>A</span>
          <span style={{ fontSize: 15, fontWeight: 700, color: '#1a1a18', letterSpacing: '-0.01em' }}>ARCADE</span>
        </div>
        <div style={{ width: 1, height: 20, background: 'var(--border)' }} />
        <nav style={{ display: 'flex', gap: 2 }}>
          {navItems.map(item => (
            <button
              key={item.id}
              className="nav-btn"
              onClick={() => onNavigate(item.id)}
              style={{
                fontSize: 13,
                padding: '7px 12px',
                borderRadius: 8,
                background: currentPage === item.id ? 'var(--surface-sunk)' : 'transparent',
                color: currentPage === item.id ? '#1a1a18' : '#6b6b66',
                fontWeight: currentPage === item.id ? 600 : 500,
              }}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {user?.role === 'rrhh' && onNewNovedad && (
          <Button variant="primary" onClick={onNewNovedad}>+ Nueva novedad</Button>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <div title={user?.nombre} style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 700, color: '#fff', cursor: 'default',
            boxShadow: '0 2px 6px rgba(67,56,202,0.28)',
          }}>
            {initials}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: '#1a1a18' }}>{user?.nombre}</span>
            <span style={{ fontSize: 11, color: '#8f8d84' }}>{roleLabel}</span>
          </div>
        </div>
        <button
          onClick={logout}
          className="icon-btn"
          style={{
            fontSize: 12, fontWeight: 500, padding: '6px 12px', borderRadius: 8,
            border: '1px solid var(--border-strong)', background: '#fff', color: '#6b6b66',
          }}
        >
          Salir
        </button>
      </div>
    </div>
  )
}
