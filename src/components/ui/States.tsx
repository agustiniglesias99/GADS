interface ErrorBoxProps { message: string; onRetry?: () => void }

export function Loading({ label = 'Cargando…' }: { label?: string }) {
  return (
    <div style={{ padding: '48px 0', textAlign: 'center', color: '#8f8d84', fontSize: 13, animation: 'pageIn 0.3s var(--ease) both' }}>
      {label}
    </div>
  )
}

export function ErrorBox({ message, onRetry }: ErrorBoxProps) {
  return (
    <div style={{ background: '#fdeaea', border: '1px solid #f6cdcd', color: '#991b1b', borderRadius: 12, padding: '16px 18px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 12 }}>
      <span style={{ fontSize: 16 }}>⚠</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, marginBottom: 2 }}>No se pudieron cargar los datos</div>
        <div style={{ fontSize: 12, opacity: 0.9 }}>{message}</div>
      </div>
      {onRetry && (
        <button onClick={onRetry} className="icon-btn" style={{ fontSize: 12, fontWeight: 500, padding: '6px 12px', borderRadius: 8, border: '1px solid #f6cdcd', background: '#fff', color: '#991b1b' }}>
          Reintentar
        </button>
      )}
    </div>
  )
}

export function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ padding: '32px 0', textAlign: 'center', color: '#8f8d84', fontSize: 13 }}>{children}</div>
  )
}
