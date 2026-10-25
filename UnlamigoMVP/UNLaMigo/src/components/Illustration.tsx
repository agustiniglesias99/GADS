interface Props {
  kind: 'publicado' | 'aceptado' | 'gracias'
}

// Ilustraciones livianas en SVG para las pantallas de refuerzo.
export function Illustration({ kind }: Props) {
  return (
    <div className="illus" aria-hidden="true">
      <svg viewBox="0 0 240 150" width="100%" height="150">
        <ellipse cx="120" cy="132" rx="96" ry="10" fill="var(--mint-200)" />
        <path
          d="M24 120 C 70 120, 70 60, 120 60 S 170 18, 216 22"
          fill="none"
          stroke="var(--leaf)"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray="2 12"
        />
        <circle cx="24" cy="120" r="9" fill="#fff" stroke="var(--leaf)" strokeWidth="4" />
        <circle cx="216" cy="22" r="11" fill="var(--sun)" stroke="#fff" strokeWidth="4" />

        {kind === 'publicado' && (
          <g className="illus__pop">
            <circle cx="120" cy="66" r="30" fill="var(--leaf)" />
            <path d="M106 66l10 10 19-20" fill="none" stroke="#fff" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        )}

        {kind === 'aceptado' && (
          <g className="illus__pop">
            <circle cx="102" cy="66" r="24" fill="var(--mint-300)" stroke="#fff" strokeWidth="4" />
            <circle cx="138" cy="66" r="24" fill="var(--leaf)" stroke="#fff" strokeWidth="4" />
            <path d="M120 78c-8-5-14-10-14-16 0-4 3-7 7-7 3 0 5 2 7 4 2-2 4-4 7-4 4 0 7 3 7 7 0 6-6 11-14 16z" fill="#fff" />
          </g>
        )}

        {kind === 'gracias' && (
          <g className="illus__pop">
            <path
              d="M120 98c-20-12-36-26-36-42 0-11 8-19 18-19 8 0 14 5 18 11 4-6 10-11 18-11 10 0 18 8 18 19 0 16-16 30-36 42z"
              fill="var(--leaf)"
            />
            <path d="M106 60l9 9 19-18" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        )}
      </svg>
    </div>
  )
}
