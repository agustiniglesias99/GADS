type ValueColor = 'default' | 'success' | 'warn' | 'danger' | 'info'

const colors: Record<ValueColor, string> = {
  default: '#1a1a18',
  success: '#15803d',
  warn: '#b45309',
  danger: '#b91c1c',
  info: '#1d4ed8',
}

const accents: Record<ValueColor, string> = {
  default: '#cfccc2',
  success: '#22c55e',
  warn: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',
}

interface MetricCardProps {
  label: string
  value: string | number
  sub?: string
  valueColor?: ValueColor
}

export function MetricCard({ label, value, sub, valueColor = 'default' }: MetricCardProps) {
  return (
    <div className="metric" style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 12,
      padding: '15px 16px 15px 18px',
      boxShadow: 'var(--shadow-xs)',
    }}>
      <span style={{ position: 'absolute', left: 0, top: 12, bottom: 12, width: 3, borderRadius: 3, background: accents[valueColor] }} />
      <div style={{ fontSize: 11, color: '#8f8d84', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8, fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: 27, fontWeight: 700, lineHeight: 1, letterSpacing: '-0.02em', color: colors[valueColor] }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: '#6b6b66', marginTop: 6 }}>{sub}</div>}
    </div>
  )
}
