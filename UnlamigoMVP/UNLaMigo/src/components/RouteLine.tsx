import { DESTINO } from '../data'

interface Props {
  origen: string
  destino?: string
  hora?: string
  /** 0 = en el origen, 1 = llegó. Si se omite no se dibuja el auto. */
  progreso?: number
  compacta?: boolean
}

// Firma visual de la app: el trayecto como una línea de ruta punteada con dos paradas.
export function RouteLine({ origen, destino = DESTINO, hora, progreso, compacta }: Props) {
  return (
    <div className={`route ${compacta ? 'route--compact' : ''}`}>
      <div className="route__track" aria-hidden="true">
        <span className="route__stop route__stop--from" />
        <span className="route__dash" />
        {progreso !== undefined && (
          <span className="route__car" style={{ top: `calc(${Math.min(Math.max(progreso, 0), 1) * 100}% - 12px)` }}>
            <CarIcon />
          </span>
        )}
        <span className="route__stop route__stop--to" />
      </div>
      <div className="route__labels">
        <div>
          <div className="route__place">{origen || 'Elegí tu barrio'}</div>
          {hora && <div className="route__meta">Salís {hora} hs</div>}
        </div>
        <div>
          <div className="route__place">{destino}</div>
          <div className="route__meta">Destino</div>
        </div>
      </div>
    </div>
  )
}

export function CarIcon() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="10" fill="var(--sun)" />
      <path
        d="M7 14.5v-2.2l1.3-2.8c.2-.4.6-.7 1.1-.7h5.2c.5 0 .9.3 1.1.7l1.3 2.8v2.2M6.5 14.5h11"
        fill="none"
        stroke="var(--forest)"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="9" cy="15.2" r="1.1" fill="var(--forest)" />
      <circle cx="15" cy="15.2" r="1.1" fill="var(--forest)" />
    </svg>
  )
}
