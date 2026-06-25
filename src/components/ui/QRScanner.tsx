import { useEffect, useRef, useState } from 'react'
import jsQR from 'jsqr'

interface Props {
  onScan: (text: string) => void
  onError?: (message: string) => void
}

/**
 * iOS Safari requiere que getUserMedia se llame directamente dentro de un
 * handler de click (gesto del usuario). Por eso el componente muestra primero
 * un botón; al tapearlo se llama getUserMedia de forma síncrona en el handler.
 *
 * También verifica si el contexto es seguro (HTTPS / localhost), ya que los
 * navegadores modernos no exponen navigator.mediaDevices en HTTP.
 */
export function QRScanner({ onScan, onError }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const doneRef = useRef(false)

  const [phase, setPhase] = useState<'idle' | 'starting' | 'scanning' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  // Limpieza al desmontar
  useEffect(() => {
    return () => {
      doneRef.current = true
      if (intervalRef.current) clearInterval(intervalRef.current)
      streamRef.current?.getTracks().forEach(t => t.stop())
    }
  }, [])

  // Una vez que tenemos stream, arranca el loop de detección
  useEffect(() => {
    if (phase !== 'scanning') return
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return

    const ctx = canvas.getContext('2d', { willReadFrequently: true })!

    intervalRef.current = setInterval(() => {
      if (doneRef.current || video.readyState < video.HAVE_ENOUGH_DATA) return

      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert',
      })

      if (code) {
        doneRef.current = true
        if (intervalRef.current) clearInterval(intervalRef.current)
        streamRef.current?.getTracks().forEach(t => t.stop())
        onScan(code.data)
      }
    }, 150)

    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [phase, onScan])

  // Este handler se llama directamente desde el click del botón, satisfaciendo
  // el requisito de gesto del usuario de iOS Safari.
  async function handleActivar() {
    // Verificar contexto seguro
    if (!navigator.mediaDevices?.getUserMedia) {
      const msg = window.isSecureContext === false
        ? 'La cámara solo está disponible en conexiones seguras (HTTPS). Avisá al administrador.'
        : 'Tu navegador no soporta acceso a la cámara. Probá con Chrome o Safari actualizado.'
      setErrorMsg(msg)
      setPhase('error')
      onError?.(msg)
      return
    }

    setPhase('starting')

    let stream: MediaStream
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      })
    } catch (e) {
      let msg = 'No se pudo acceder a la cámara.'
      if (e instanceof Error) {
        if (e.name === 'NotAllowedError' || e.name === 'PermissionDeniedError') {
          msg = 'Permiso de cámara denegado. Ir a Ajustes → Safari → Cámara y permitir el acceso.'
        } else if (e.name === 'NotFoundError' || e.name === 'DevicesNotFoundError') {
          msg = 'No se encontró cámara en el dispositivo.'
        } else if (e.name === 'NotReadableError' || e.name === 'TrackStartError') {
          msg = 'La cámara está siendo usada por otra aplicación.'
        } else if (e.name === 'OverconstrainedError') {
          msg = 'No se encontró una cámara compatible. Intentá con otro navegador.'
        }
      }
      setErrorMsg(msg)
      setPhase('error')
      onError?.(msg)
      return
    }

    streamRef.current = stream
    const video = videoRef.current
    if (!video) { stream.getTracks().forEach(t => t.stop()); return }

    video.srcObject = stream
    video.setAttribute('playsinline', 'true')
    video.setAttribute('muted', 'true')

    try {
      await video.play()
    } catch {
      // En algunos casos play() falla; el loop de intervalos lo manejará
    }

    setPhase('scanning')
  }

  function handleReintentar() {
    doneRef.current = false
    setErrorMsg('')
    setPhase('idle')
  }

  return (
    <div style={{ width: '100%', borderRadius: 10, overflow: 'hidden', background: '#000', minHeight: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
      {/* Video — siempre en el DOM para que el ref esté disponible */}
      <video
        ref={videoRef}
        style={{ width: '100%', display: phase === 'scanning' ? 'block' : 'none', objectFit: 'cover' }}
        autoPlay
        playsInline
        muted
      />
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Marco guía */}
      {phase === 'scanning' && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
          <div style={{ width: 180, height: 180, border: '2px solid rgba(255,255,255,0.8)', borderRadius: 12, boxShadow: '0 0 0 9999px rgba(0,0,0,0.45)' }} />
        </div>
      )}

      {phase === 'idle' && (
        <button
          onClick={handleActivar}
          style={{ background: '#fff', color: '#1a1814', border: 'none', borderRadius: 10, padding: '12px 24px', fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <span style={{ fontSize: 20 }}>📷</span>
          Activar cámara
        </button>
      )}

      {phase === 'starting' && (
        <div style={{ color: '#fff', fontSize: 13, padding: 24 }}>Iniciando cámara…</div>
      )}

      {phase === 'error' && (
        <div style={{ padding: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <div style={{ color: '#fca5a5', fontSize: 13, textAlign: 'center', lineHeight: 1.5 }}>{errorMsg}</div>
          <button
            onClick={handleReintentar}
            style={{ background: '#fff', color: '#1a1814', border: 'none', borderRadius: 8, padding: '8px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
          >
            Reintentar
          </button>
        </div>
      )}
    </div>
  )
}
