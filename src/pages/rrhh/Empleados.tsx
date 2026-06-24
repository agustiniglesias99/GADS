import { useState } from 'react'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Loading, ErrorBox } from '../../components/ui/States'
import { useQuery } from '../../lib/useQuery'
import { fetchEmpleados, createEmpleado, type NuevoEmpleadoInput } from '../../lib/api'
import type { BadgeVariant, Empleado } from '../../types'

const estadoBadge: Record<string, BadgeVariant> = {
  activo: 'success',
  suspendido: 'warn',
  inactivo: 'gray',
}

function NuevoEmpleadoModal({ onClose, onSave }: { onClose: () => void; onSave: (e: Empleado) => void }) {
  const hoy = new Date()
  const ingresoDefault = `${String(hoy.getDate()).padStart(2, '0')}/${String(hoy.getMonth() + 1).padStart(2, '0')}/${hoy.getFullYear()}`
  const [form, setForm] = useState<NuevoEmpleadoInput>({
    legajo: '', nombre: '', dni: '', cuil: '', categoria: '', jornada: 'Completa',
    ingreso: ingresoDefault, convenio: 'Metalúrgico', turno: 'Lun–Vie 09–18',
    tolerancia: 5, fichada: 'Biométrico', email: '', estado: 'activo',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const canSave = !!(form.nombre.trim() && form.legajo.trim() && form.dni.trim() && form.email.trim())
  const set = (k: keyof NuevoEmpleadoInput) => (v: string) => setForm(f => ({ ...f, [k]: v }))

  async function handleSave() {
    if (!canSave) return
    setSaving(true)
    setError('')
    try {
      const created = await createEmpleado(form)
      onSave(created)
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

  return (
    <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(26,24,20,0.38)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 20 }}
      onClick={onClose}>
      <div className="modal-card" style={{ background: '#fff', borderRadius: 16, padding: 24, width: 520, maxHeight: '90vh', overflowY: 'auto', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border)' }} onClick={e => e.stopPropagation()}>
        <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Nuevo empleado</div>
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
          <Button variant="primary" onClick={handleSave} disabled={saving || !canSave}>{saving ? 'Guardando…' : 'Crear empleado'}</Button>
        </div>
      </div>
    </div>
  )
}

interface Props {
  onSelectEmpleado: (id: string) => void
}

export function Empleados({ onSelectEmpleado }: Props) {
  const { data, loading, error, reload, setData } = useQuery(fetchEmpleados, [])
  const empleados = data ?? []
  const [search, setSearch] = useState('')
  const [filterEstado, setFilterEstado] = useState('todos')
  const [showNew, setShowNew] = useState(false)

  const filtrados = empleados.filter(e => {
    const matchSearch = e.nombre.toLowerCase().includes(search.toLowerCase()) || e.legajo.includes(search)
    const matchEstado = filterEstado === 'todos' || e.estado === filterEstado
    return matchSearch && matchEstado
  })

  return (
    <div style={{ padding: '24px 32px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 600 }}>Empleados</div>
          <div style={{ fontSize: 13, color: '#6b6b66', marginTop: 2 }}>{empleados.filter(e => e.estado === 'activo').length} activos · {empleados.filter(e => e.estado === 'suspendido').length} suspendidos</div>
        </div>
        <Button variant="primary" onClick={() => setShowNew(true)}>+ Nuevo empleado</Button>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        <input type="text" placeholder="Buscar por nombre o legajo..." value={search} onChange={e => setSearch(e.target.value)}
          style={{ fontSize: 13, padding: '6px 10px', borderRadius: 8, border: '1px solid #d4d2ca', width: 250 }} />
        <select value={filterEstado} onChange={e => setFilterEstado(e.target.value)}
          style={{ fontSize: 13, padding: '6px 10px', borderRadius: 8, border: '1px solid #d4d2ca' }}>
          <option value="todos">Todos los estados</option>
          <option value="activo">Activo</option>
          <option value="suspendido">Suspendido</option>
          <option value="inactivo">Inactivo</option>
        </select>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e2e0d8', borderRadius: 12, padding: 18 }}>
        {loading ? <Loading /> : error ? <ErrorBox message={error} onRetry={reload} /> : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr>
              {['Legajo', 'Nombre', 'DNI', 'Categoría', 'Convenio', 'Ingreso', 'Estado', ''].map(h => (
                <th key={h} style={{ textAlign: 'left', fontWeight: 600, fontSize: 11, color: '#888780', textTransform: 'uppercase', letterSpacing: '0.04em', paddingBottom: 8, borderBottom: '1px solid #e2e0d8', paddingRight: 12 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtrados.map(e => (
              <tr key={e.id} style={{ cursor: 'pointer' }} onClick={() => onSelectEmpleado(e.id)}>
                <td style={{ padding: '10px 12px 10px 0', borderBottom: '1px solid #f0ede6', color: '#6b6b66' }}>#{e.legajo}</td>
                <td style={{ padding: '10px 12px 10px 0', borderBottom: '1px solid #f0ede6' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, color: '#1d4ed8', flexShrink: 0 }}>{e.iniciales}</div>
                    <div>
                      <div style={{ fontWeight: 600 }}>{e.nombre}</div>
                      <div style={{ fontSize: 11, color: '#6b6b66' }}>{e.email}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '10px 12px 10px 0', borderBottom: '1px solid #f0ede6' }}>{e.dni}</td>
                <td style={{ padding: '10px 12px 10px 0', borderBottom: '1px solid #f0ede6' }}>{e.categoria}</td>
                <td style={{ padding: '10px 12px 10px 0', borderBottom: '1px solid #f0ede6' }}>{e.convenio}</td>
                <td style={{ padding: '10px 12px 10px 0', borderBottom: '1px solid #f0ede6' }}>{e.ingreso}</td>
                <td style={{ padding: '10px 12px 10px 0', borderBottom: '1px solid #f0ede6' }}>
                  <Badge variant={estadoBadge[e.estado]}>{e.estado.charAt(0).toUpperCase() + e.estado.slice(1)}</Badge>
                </td>
                <td style={{ padding: '10px 0', borderBottom: '1px solid #f0ede6' }}>
                  <Button variant="sm" onClick={ev => { ev.stopPropagation(); onSelectEmpleado(e.id) }}>Ver detalle</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        )}
      </div>

      {showNew && (
        <NuevoEmpleadoModal
          onClose={() => setShowNew(false)}
          onSave={e => setData(prev => [e, ...(prev ?? [])])}
        />
      )}
    </div>
  )
}
