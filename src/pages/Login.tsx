import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { empleados } from '../data/mockData'
import type { Role } from '../types'
import { Button } from '../components/ui/Button'

export function Login() {
  const { login } = useAuth()
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [selectedEmpleadoId, setSelectedEmpleadoId] = useState(empleados[0].id)

  function handleLogin() {
    if (!selectedRole) return
    if (selectedRole === 'empleado') {
      const emp = empleados.find(e => e.id === selectedEmpleadoId)
      login('empleado', emp?.id, emp?.nombre)
    } else {
      login(selectedRole)
    }
  }

  const roles: { id: Role; label: string; desc: string; icon: string }[] = [
    { id: 'rrhh', label: 'RRHH Administrativo', desc: 'Dashboard completo, gestión de fichadas, novedades y cierre mensual', icon: '🏢' },
    { id: 'empleado', label: 'Empleado', desc: 'Ver asistencia personal, novedades y solicitar licencias o vacaciones', icon: '👤' },
    { id: 'contador', label: 'Contador Externo', desc: 'Descargar archivo CSV de novedades para liquidación salarial', icon: '📊' },
  ]

  return (
    <div style={{ minHeight: '100svh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f0' }}>
      <div style={{ width: 480 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#1a1a18', letterSpacing: '-0.5px' }}>ARCADE</div>
          <div style={{ fontSize: 14, color: '#6b6b66', marginTop: 6 }}>Gestión de novedades de empleados</div>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e2e0d8', borderRadius: 16, padding: 28 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1a18', marginBottom: 14 }}>Seleccionar rol</div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
            {roles.map(role => (
              <button
                key={role.id}
                onClick={() => setSelectedRole(role.id)}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 16px',
                  borderRadius: 10, border: `2px solid ${selectedRole === role.id ? '#1a1a18' : '#e2e0d8'}`,
                  background: selectedRole === role.id ? '#fafaf8' : '#fff',
                  cursor: 'pointer', textAlign: 'left', width: '100%',
                }}
              >
                <span style={{ fontSize: 20, flexShrink: 0, marginTop: 1 }}>{role.icon}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1a18' }}>{role.label}</div>
                  <div style={{ fontSize: 12, color: '#6b6b66', marginTop: 2 }}>{role.desc}</div>
                </div>
              </button>
            ))}
          </div>

          {selectedRole === 'empleado' && (
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, color: '#6b6b66', display: 'block', marginBottom: 6 }}>Empleado</label>
              <select
                value={selectedEmpleadoId}
                onChange={e => setSelectedEmpleadoId(e.target.value)}
                style={{
                  width: '100%', fontSize: 13, padding: '8px 10px', borderRadius: 8,
                  border: '1px solid #d4d2ca', background: '#fff', color: '#1a1a18',
                }}
              >
                {empleados.filter(e => e.estado === 'activo').map(e => (
                  <option key={e.id} value={e.id}>{e.nombre} — Legajo #{e.legajo}</option>
                ))}
              </select>
            </div>
          )}

          <Button
            variant="primary"
            disabled={!selectedRole}
            onClick={handleLogin}
            style={{ width: '100%', padding: '10px 14px', fontSize: 13 }}
          >
            Ingresar
          </Button>
        </div>
      </div>
    </div>
  )
}
