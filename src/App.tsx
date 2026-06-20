import { useState } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { Login } from './pages/Login'
import { Topbar } from './components/layout/Topbar'
import { Dashboard } from './pages/rrhh/Dashboard'
import { Fichadas } from './pages/rrhh/Fichadas'
import { Empleados } from './pages/rrhh/Empleados'
import { EmpleadoDetalle } from './pages/rrhh/EmpleadoDetalle'
import { Novedades } from './pages/rrhh/Novedades'
import { CierreMensual } from './pages/rrhh/CierreMensual'
import { MiPanel } from './pages/empleado/MiPanel'
import { ExportarCSV } from './pages/contador/ExportarCSV'

type Page =
  | 'dashboard' | 'fichadas' | 'empleados' | 'novedades' | 'cierre'
  | 'mi-panel' | 'exportar'

function FullScreen({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100svh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b6b66', fontSize: 14 }}>
      {children}
    </div>
  )
}

function AppContent() {
  const { user, loading } = useAuth()
  const [currentPage, setCurrentPage] = useState<Page>(() => {
    return 'dashboard'
  })
  const [selectedEmpleadoId, setSelectedEmpleadoId] = useState<string | null>(null)
  const [showNewNovedad, setShowNewNovedad] = useState(false)

  if (loading) return <FullScreen><span style={{ animation: 'pageIn 0.4s var(--ease) both' }}>Cargando…</span></FullScreen>
  if (!user) return <Login />

  function navigate(page: Page) {
    setCurrentPage(page)
    setSelectedEmpleadoId(null)
  }

  function renderPage() {
    if (user!.role === 'rrhh') {
      if (selectedEmpleadoId && currentPage === 'empleados') {
        return <EmpleadoDetalle empleadoId={selectedEmpleadoId} onBack={() => setSelectedEmpleadoId(null)} />
      }
      switch (currentPage) {
        case 'dashboard': return <Dashboard onNavigate={p => navigate(p as Page)} />
        case 'fichadas':  return <Fichadas />
        case 'empleados': return <Empleados onSelectEmpleado={id => setSelectedEmpleadoId(id)} />
        case 'novedades': return <Novedades showNewModal={showNewNovedad} onCloseNewModal={() => setShowNewNovedad(false)} />
        case 'cierre':    return <CierreMensual />
        default:          return <Dashboard onNavigate={p => navigate(p as Page)} />
      }
    }
    if (user!.role === 'empleado') return <MiPanel />
    if (user!.role === 'contador') return <ExportarCSV />
    return null
  }

  const page = user.role === 'rrhh' ? currentPage : user.role === 'empleado' ? 'mi-panel' : 'exportar'

  return (
    <div style={{ minHeight: '100svh' }}>
      <Topbar
        currentPage={page as Page}
        onNavigate={p => {
          if (user.role === 'rrhh') {
            navigate(p)
            if (p === 'novedades' && showNewNovedad) setShowNewNovedad(false)
          }
        }}
        onNewNovedad={() => {
          if (currentPage !== 'novedades') navigate('novedades')
          setShowNewNovedad(true)
        }}
      />
      <main>{renderPage()}</main>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
