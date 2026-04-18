import { createContext, useContext, useState } from 'react'
import type { AuthUser, Role } from '../types'

interface AuthContextType {
  user: AuthUser | null
  login: (role: Role, empleadoId?: string, nombre?: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => {},
  logout: () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)

  function login(role: Role, empleadoId?: string, nombre?: string) {
    const names: Record<Role, string> = {
      rrhh: 'Admin RRHH',
      empleado: nombre ?? 'Empleado',
      contador: 'Contador Externo',
    }
    setUser({ role, empleadoId, nombre: nombre ?? names[role] })
  }

  function logout() {
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
