import { useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'
import { generateQRToken } from '../../lib/asistencia'

interface Props {
  onClose: () => void
}

export function QRDisplay({ onClose }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [token, setToken] = useState(() => generateQRToken())
  const [secondsLeft, setSecondsLeft] = useState(() => 60 - new Date().getSeconds())

  // Tick cada segundo: actualiza el contador y rota el token al cambiar el minuto
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date()
      setSecondsLeft(60 - now.getSeconds())
      setToken(generateQRToken(now))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  // Redibuja el canvas cada vez que cambia el token
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    QRCode.toCanvas(canvas, token, { width: 280, margin: 2, color: { dark: '#1a1814', light: '#ffffff' } }).catch(() => {})
  }, [token])

  const pct = (secondsLeft / 60) * 100

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(26,24,20,0.92)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 500 }}
      onClick={onClose}
    >
      <div
        style={{ background: '#fff', borderRadius: 20, padding: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, boxShadow: '0 24px 64px rgba(0,0,0,0.4)' }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ fontSize: 18, fontWeight: 700, color: '#1a1814', letterSpacing: '-0.01em' }}>Punto de fichaje — ARCADE</div>
        <div style={{ fontSize: 13, color: '#6b6b66' }}>Escaneá este QR con tu celular para fichar</div>

        <canvas ref={canvasRef} style={{ borderRadius: 10 }} />

        {/* Barra de progreso del tiempo restante */}
        <div style={{ width: 280, display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ height: 4, background: '#f0ede6', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${pct}%`, background: pct > 20 ? '#15803d' : '#dc2626', borderRadius: 4, transition: 'width 0.8s linear, background 0.4s' }} />
          </div>
          <div style={{ fontSize: 11, color: '#888780', textAlign: 'center' }}>
            Se actualiza en {secondsLeft}s
          </div>
        </div>

        <button
          onClick={onClose}
          style={{ fontSize: 13, color: '#6b6b66', border: '1px solid #d4d2ca', background: '#fff', borderRadius: 8, padding: '6px 16px', cursor: 'pointer' }}
        >
          Cerrar
        </button>
      </div>
    </div>
  )
}
