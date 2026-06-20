interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'sm'
}

export function Button({ variant = 'default', style, className, ...props }: ButtonProps) {
  const sizing: React.CSSProperties = {
    fontSize: variant === 'sm' ? 11 : 12,
    padding: variant === 'sm' ? '4px 10px' : '7px 14px',
    borderRadius: variant === 'sm' ? 7 : 9,
    opacity: props.disabled ? 0.45 : 1,
    ...style,
  }
  const cls = ['btn', variant === 'primary' ? 'btn--primary' : '', className]
    .filter(Boolean)
    .join(' ')
  return <button className={cls} style={sizing} {...props} />
}
