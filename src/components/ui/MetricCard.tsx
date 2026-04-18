type ValueColor = 'default' | 'success' | 'warn' | 'danger' | 'info'

const colors: Record<ValueColor, string> = {
  default: '#1a1a18',
  success: '#15803d',
  warn: '#b45309',
  danger: '#b91c1c',
  info: '#1d4ed8',
}

interface MetricCardProps {
  label: string
  value: string | number
  sub?: string
  valueColor?: ValueColor
}

export function MetricCard({ label, value, sub, valueColor = 'default' }: MetricCardProps) {
  return (
    <div style={{ background: '#eeece6', borderRadius: 10, padding: '14px 16px' }}>
      <div style={{ fontSize: 11, color: '#888780', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6, fontWeight: 500 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 600, lineHeight: 1, color: colors[valueColor] }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: '#6b6b66', marginTop: 5 }}>{sub}</div>}
    </div>
  )
}
