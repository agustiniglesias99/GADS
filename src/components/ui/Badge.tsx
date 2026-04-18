import type { BadgeVariant } from '../../types'

const styles: Record<BadgeVariant, { bg: string; color: string }> = {
  warn:    { bg: '#fef3c7', color: '#92400e' },
  danger:  { bg: '#fee2e2', color: '#991b1b' },
  success: { bg: '#dcfce7', color: '#166534' },
  info:    { bg: '#dbeafe', color: '#1e40af' },
  gray:    { bg: '#f0ede6', color: '#6b6b66' },
}

export function Badge({ variant, children }: { variant: BadgeVariant; children: React.ReactNode }) {
  const s = styles[variant]
  return (
    <span style={{
      display: 'inline-block',
      fontSize: 11,
      fontWeight: 600,
      padding: '3px 9px',
      borderRadius: 6,
      background: s.bg,
      color: s.color,
      whiteSpace: 'nowrap',
    }}>
      {children}
    </span>
  )
}
