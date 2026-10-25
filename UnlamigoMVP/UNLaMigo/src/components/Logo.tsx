interface Props {
  size?: 'sm' | 'lg'
}

export function Logo({ size = 'lg' }: Props) {
  return (
    <span className={`logo logo--${size}`}>
      <svg viewBox="0 0 64 64" className="logo__mark" aria-hidden="true">
        <rect width="64" height="64" rx="18" fill="var(--leaf)" />
        <path
          d="M14 44c8-2 10-22 20-22s10 14 16 14"
          fill="none"
          stroke="#fff"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray="1 9"
        />
        <circle cx="14" cy="44" r="5" fill="#fff" />
        <circle cx="50" cy="22" r="7" fill="var(--sun)" stroke="#fff" strokeWidth="3" />
      </svg>
      <span className="logo__word">
        UNLa<span>migo</span>
      </span>
    </span>
  )
}
