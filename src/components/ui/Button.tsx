interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'sm'
}

export function Button({ variant = 'default', style, ...props }: ButtonProps) {
  const base: React.CSSProperties = {
    fontSize: variant === 'sm' ? 11 : 12,
    padding: variant === 'sm' ? '3px 9px' : '6px 14px',
    borderRadius: variant === 'sm' ? 6 : 8,
    border: '1px solid #d4d2ca',
    background: variant === 'primary' ? '#1a1a18' : '#fff',
    color: variant === 'primary' ? '#fff' : '#1a1a18',
    fontWeight: 500,
    cursor: props.disabled ? 'not-allowed' : 'pointer',
    opacity: props.disabled ? 0.4 : 1,
    ...style,
  }
  return <button style={base} {...props} />
}
