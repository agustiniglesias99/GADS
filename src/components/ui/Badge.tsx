import type { BadgeVariant } from '../../types'

const styles: Record<BadgeVariant, { bg: string; color: string; border: string; dot: string }> = {
  warn:    { bg: '#fef6e1', color: '#92400e', border: '#fbe3b0', dot: '#d97706' },
  danger:  { bg: '#fdeaea', color: '#991b1b', border: '#f6cdcd', dot: '#dc2626' },
  success: { bg: '#e7f7ec', color: '#166534', border: '#c4ecd0', dot: '#16a34a' },
  info:    { bg: '#e8effe', color: '#1e40af', border: '#cadcfb', dot: '#2563eb' },
  gray:    { bg: '#f1efe8', color: '#6b6b66', border: '#e3e0d6', dot: '#a8a59a' },
}

export function Badge({ variant, children }: { variant: BadgeVariant; children: React.ReactNode }) {
  const s = styles[variant]
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      fontSize: 11,
      fontWeight: 600,
      lineHeight: 1,
      padding: '4px 9px 4px 8px',
      borderRadius: 999,
      background: s.bg,
      color: s.color,
      border: `1px solid ${s.border}`,
      whiteSpace: 'nowrap',
      letterSpacing: '0.01em',
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: s.dot, flexShrink: 0 }} />
      {children}
    </span>
  )
}
