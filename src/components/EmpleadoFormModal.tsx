import { useState } from 'react'
import { createPortal } from 'react-dom'
import { Button } from './ui/Button'
import { createEmpleado, updateEmpleado, type NuevoEmpleadoInput } from '../lib/api'
import type { Empleado } from '../types'

interface Props {
  /** Si se pasa, el modal funciona en modo edición; si no, crea uno nuevo. */
  empleado?: Empleado
  onClose: () => void
  onSave: (e: Empleado) => void
}

export function EmpleadoFormModal({ empleado, onClose, onSave }: Props) {
  const isEdit = !!empleado
  const hoy = new Date()
  const ingresoDefault = `${String(hoy.getDate()).padStart(2, '0')}/${String(hoy.getMonth() + 1).padStart(2, '0')}/${hoy.getFullYear()}`
  const [form, setForm] = useState<NuevoEmpleadoInput>(() =>
    empleado
      ? {
          legajo: empleado.legajo, nombre: empleado.nombre, dni: empleado.dni, cuil: empleado.cuil,
          categoria: empleado.categoria, jornada: empleado.jornada, ingreso: empleado.ingreso,
          convenio: empleado.convenio, turno: empleado.turno, tolerancia: empleado.tolerancia,
          fichada: empleado.fichada, email: empleado.email, estado: empleado.estado,
        }
      : {
          legajo: '', nombre: '', dni: '', cuil: '', categoria: '', jornada: 'Completa',
          ingreso: ingresoDefault, convenio: 'Metalúrgico', turno: 'Lun–Vie 09–18',
          tolerancia: 5, fichada: 'Biométrico', email: '', estado: 'activo',
        }
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const canSave = !!(form.nombre.trim() && form.legajo.trim() && form.dni.trim() && form.email.trim())
  const set = (k: keyof NuevoEmpleadoInput) => (v: string) => setForm(f => ({ ...f, [k]: v }))

  async function handleSave() {
    if (!canSave) return
    setSaving(true)
    setError('')
    try {
      const saved = empleado
        ? await updateEmpleado(empleado.id, form)
        : await createEmpleado(form)
      onSave(saved)
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
      setSaving(false)
    }
  }

  const textFields: [keyof NuevoEmpleadoInput, string][] = [
    ['nombre', 'Nombre y apellido'], ['legajo', 'Legajo'], ['dni', 'DNI'], ['cuil', 'CUIL'],
    ['email', 'Email'], ['categoria', 'Categoría'], ['convenio', 'Convenio'], ['turno', 'Turno'],
    ['ingreso', 'Ingreso (dd/mm/aaaa)'],
  ]

  const inputStyle: React.CSSProperties = { width: '100%', fontSize: 13, padding: '7px 10px', borderRadius: 8, border: '1px solid #d4d2ca', boxSizing: 'border-box' }

  return createPortal(
    <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(26,24,20,0.38)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 20 }}
      onClick={onClose}>
      <div className="modal-card" style={{ background: '#fff', borderRadius: 16, padding: 24, width: 520, maxHeight: '90vh', overflowY: 'auto', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border)' }} onClick={e => e.stopPropagation()}>
        <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>{isEdit ? 'Editar empleado' : 'Nuevo empleado'}</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {textFields.map(([key, label]) => (
            <div key={key}>
              <label style={{ fontSize: 12, color: '#6b6b66', display: 'block', marginBottom: 4 }}>{label}</label>
              <input type="text" value={form[key] as string} onChange={e => set(key)(e.target.value)} style={inputStyle} />
            </div>
          ))}
          <div>
            <label style={{ fontSize: 12, color: '#6b6b66', display: 'block', marginBottom: 4 }}>Jornada</label>
            <select value={form.jornada} onChange={e => set('jornada')(e.target.value)} style={inputStyle}>
              <option value="Completa">Completa</option>
              <option value="Parcial">Parcial</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: 12, color: '#6b6b66', display: 'block', marginBottom: 4 }}>Medio de fichada</label>
            <select value={form.fichada} onChange={e => set('fichada')(e.target.value)} style={inputStyle}>
              {['Biométrico', 'QR', 'Manual', 'API'].map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 12, color: '#6b6b66', display: 'block', marginBottom: 4 }}>Tolerancia (min)</label>
            <input type="number" min={0} value={form.tolerancia} onChange={e => setForm(f => ({ ...f, tolerancia: Number(e.target.value) || 0 }))} style={inputStyle} />
          </div>
          <div>
            <label style={{ fontSize: 12, color: '#6b6b66', display: 'block', marginBottom: 4 }}>Estado</label>
            <select value={form.estado} onChange={e => setForm(f => ({ ...f, estado: e.target.value as Empleado['estado'] }))} style={inputStyle}>
              <option value="activo">Activo</option>
              <option value="suspendido">Suspendido</option>
              <option value="inactivo">Inactivo</option>
            </select>
          </div>
        </div>
        {error && (
          <div style={{ background: '#fdeaea', border: '1px solid #f6cdcd', color: '#991b1b', borderRadius: 8, padding: '8px 10px', fontSize: 12, marginTop: 14 }}>{error}</div>
        )}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 20 }}>
          <Button onClick={onClose} disabled={saving}>Cancelar</Button>
          <Button variant="primary" onClick={handleSave} disabled={saving || !canSave}>{saving ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Crear empleado'}</Button>
        </div>
      </div>
    </div>,
    document.body
  )
}
