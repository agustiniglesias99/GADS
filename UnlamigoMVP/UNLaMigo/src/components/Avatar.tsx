import { iniciales } from '../format'
import type { Estudiante } from '../types'

interface Props {
  persona: Estudiante
  size?: 'sm' | 'md' | 'lg'
}

// Sin fotos reales en el MVP: iniciales sobre un tono derivado del nombre.
const TONOS = ['#BFE3C6', '#D7EDB8', '#A9DCC4', '#CDE8D9', '#E4F0B5']

export function Avatar({ persona, size = 'md' }: Props) {
  const tono = TONOS[(persona.nombre.charCodeAt(0) + persona.apellido.length) % TONOS.length]
  return (
    <span className={`avatar avatar--${size}`} style={{ background: tono }} aria-hidden="true">
      {iniciales(persona)}
    </span>
  )
}
