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

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '12px 24px', borderBottom: '1px solid #e2e0d8', background: '#fff',
      position: 'sticky', top: 0, zIndex: 100,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <span style={{ fontSize: 15, fontWeight: 600, color: '#1a1a18', marginRight: 8 }}>ARCADE</span>
        <nav style={{ display: 'flex', gap: 4 }}>
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              style={{
                fontSize: 13,
                padding: '6px 12px',
                borderRadius: 8,
                border: 'none',
                background: currentPage === item.id ? '#eeece6' : 'transparent',
                color: currentPage === item.id ? '#1a1a18' : '#6b6b66',
                fontWeight: currentPage === item.id ? 500 : 400,
                cursor: 'pointer',
              }}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {user?.role === 'rrhh' && onNewNovedad && (
          <Button variant="primary" onClick={onNewNovedad}>+ Nueva novedad</Button>
        )}
        <div title={user?.nombre} style={{
          width: 32, height: 32, borderRadius: '50%', background: '#dbeafe',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 12, fontWeight: 600, color: '#1d4ed8', cursor: 'pointer',
        }}>
          {initials}
        </div>
        <button
          onClick={logout}
          style={{
            fontSize: 12, padding: '5px 10px', borderRadius: 8, border: '1px solid #d4d2ca',
            background: '#fff', color: '#6b6b66', cursor: 'pointer',
          }}
        >
          Salir
        </button>
      </div>
    </div>
  )
}
