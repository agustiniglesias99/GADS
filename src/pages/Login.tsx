import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/ui/Button'

const demoHints = [
  { icon: '🏢', label: 'RRHH Administrativo', email: 'rrhh@arcade.com' },
  { icon: '📊', label: 'Contador Externo', email: 'contador@arcade.com' },
  { icon: '👤', label: 'Empleado', email: 'juan.perez@empresa.com' },
]

export function Login() {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    const { error } = await signIn(email, password)
    if (error) {
      setError(error === 'Invalid login credentials' ? 'Email o contraseña incorrectos.' : error)
      setSubmitting(false)
    }
    // on success, AuthProvider flips `user` and App renders the role view
  }

  return (
    <div style={{
      minHeight: '100svh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
      background:
        'radial-gradient(900px 500px at 80% -10%, rgba(79,70,229,0.10), transparent 60%),' +
        'radial-gradient(800px 450px at -10% 110%, rgba(180,83,9,0.07), transparent 55%),' +
        '#f4f3ee',
    }}>
      <div style={{ width: 400, animation: 'pageIn 0.4s var(--ease) both' }}>
        <div style={{ textAlign: 'center', marginBottom: 26 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 15, margin: '0 auto 14px',
            background: 'linear-gradient(135deg, #2a2a26 0%, #000 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 26, fontWeight: 800,
            boxShadow: '0 10px 28px rgba(0,0,0,0.22)',
          }}>A</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: '#1a1a18', letterSpacing: '-0.02em' }}>ARCADE</div>
          <div style={{ fontSize: 14, color: '#6b6b66', marginTop: 5 }}>Gestión de novedades de empleados</div>
        </div>

        <form onSubmit={handleSubmit} style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 18, padding: 28, boxShadow: 'var(--shadow-md)' }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#1a1a18', marginBottom: 4 }}>Iniciar sesión</div>
          <div style={{ fontSize: 12.5, color: '#6b6b66', marginBottom: 20 }}>Ingresá con el email y la contraseña de tu cuenta.</div>

          <div style={{ marginBottom: 14 }}>
            <label htmlFor="login-email" style={{ fontSize: 12, fontWeight: 500, color: '#6b6b66', display: 'block', marginBottom: 6 }}>Email</label>
            <input
              id="login-email"
              type="email"
              autoFocus
              autoComplete="username"
              value={email}
              onChange={e => { setEmail(e.target.value); setError('') }}
              placeholder="tu@empresa.com"
              style={{ width: '100%', fontSize: 13.5, padding: '10px 12px', borderRadius: 10, border: '1px solid var(--border-strong)', background: '#fff' }}
            />
          </div>

          <div style={{ marginBottom: 18 }}>
            <label htmlFor="login-password" style={{ fontSize: 12, fontWeight: 500, color: '#6b6b66', display: 'block', marginBottom: 6 }}>Contraseña</label>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={e => { setPassword(e.target.value); setError('') }}
              placeholder="••••••••"
              style={{ width: '100%', fontSize: 13.5, padding: '10px 12px', borderRadius: 10, border: '1px solid var(--border-strong)', background: '#fff' }}
            />
          </div>

          {error && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, background: '#fdeaea', border: '1px solid #f6cdcd', color: '#991b1b', borderRadius: 10, padding: '9px 12px', fontSize: 12.5, marginBottom: 16 }}>
              <span style={{ flexShrink: 0 }}>⚠</span>
              <span>{error}</span>
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            disabled={!email || !password || submitting}
            style={{ width: '100%', padding: '11px 14px', fontSize: 13.5 }}
          >
            {submitting ? 'Ingresando…' : 'Ingresar'}
          </Button>
        </form>

        <div style={{ marginTop: 16, background: 'rgba(255,255,255,0.6)', border: '1px solid var(--border)', borderRadius: 14, padding: '12px 14px' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#8f8d84', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Cuentas de ejemplo</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {demoHints.map(d => (
              <button
                key={d.label}
                type="button"
                className="nav-btn"
                onClick={() => { setEmail(d.email); setError('') }}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 8px', borderRadius: 8, textAlign: 'left', width: '100%' }}
              >
                <span style={{ fontSize: 15, width: 22, textAlign: 'center', flexShrink: 0 }}>{d.icon}</span>
                <span style={{ fontSize: 12.5, fontWeight: 600, color: '#1a1a18', flex: 1 }}>{d.label}</span>
                <span style={{ fontSize: 11.5, color: '#6b6b66', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>{d.email}</span>
              </button>
            ))}
          </div>
          <div style={{ fontSize: 11, color: '#8f8d84', marginTop: 8 }}>Tocá una cuenta para autocompletar el email. Usá la contraseña que definiste en Supabase.</div>
        </div>
      </div>
    </div>
  )
}
