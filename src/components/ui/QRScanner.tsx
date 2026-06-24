import { useEffect, useRef } from 'react'
import { Html5Qrcode } from 'html5-qrcode'

interface Props {
  onScan: (text: string) => void
  onError?: (message: string) => void
}

/**
 * Escáner de QR por cámara (html5-qrcode). Llama a onScan una sola vez con el
 * texto decodificado y se detiene/limpia al desmontar.
 */
export function QRScanner({ onScan, onError }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const onScanRef = useRef(onScan)
  const onErrorRef = useRef(onError)
  onScanRef.current = onScan
  onErrorRef.current = onError

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const id = 'qr-reader-' + Math.random().toString(36).slice(2)
    el.id = id

    const scanner = new Html5Qrcode(id)
    let done = false

    scanner
      .start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 220, height: 220 } },
        (text) => {
          if (done) return
          done = true
          onScanRef.current(text)
        },
        undefined,
      )
      .catch((e) => {
        onErrorRef.current?.(
          e instanceof Error ? e.message : 'No se pudo acceder a la cámara.',
        )
      })

    return () => {
      scanner.stop().then(() => scanner.clear()).catch(() => {})
    }
  }, [])

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', minHeight: 220, borderRadius: 10, overflow: 'hidden', background: '#000' }}
    />
  )
}
