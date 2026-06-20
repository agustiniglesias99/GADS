import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { AuthUser, Role } from '../types'

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => ({}),
  logout: async () => {},
})

async function loadProfile(userId: string, fallbackEmail?: string): Promise<AuthUser | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('role, empleado_id, nombre, email')
    .eq('id', userId)
    .maybeSingle()

  if (error || !data) return null
  return {
    role: data.role as Role,
    empleadoId: data.empleado_id ?? undefined,
    nombre: data.nombre ?? data.email ?? fallbackEmail ?? 'Usuario',
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    supabase.auth.getSession().then(async ({ data }) => {
      const session = data.session
      if (session) {
        const profile = await loadProfile(session.user.id, session.user.email ?? undefined)
        if (active) setUser(profile)
      }
      if (active) setLoading(false)
    })

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!active) return
      if (session) {
        const profile = await loadProfile(session.user.id, session.user.email ?? undefined)
        if (active) setUser(profile)
      } else {
        setUser(null)
      }
    })

    return () => { active = false; sub.subscription.unsubscribe() }
  }, [])

  async function signIn(email: string, password: string): Promise<{ error?: string }> {
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    if (error) return { error: error.message }

    const profile = await loadProfile(data.user.id, data.user.email ?? undefined)
    if (!profile) {
      await supabase.auth.signOut()
      return { error: 'Tu usuario no tiene un perfil/rol asignado. Avisá a RRHH.' }
    }
    setUser(profile)
    return {}
  }

  async function logout() {
    await supabase.auth.signOut()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext)
}
