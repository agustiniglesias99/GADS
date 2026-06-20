import { useState } from 'react'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { MetricCard } from '../../components/ui/MetricCard'
import { Loading, ErrorBox } from '../../components/ui/States'
import { useQuery } from '../../lib/useQuery'
import { fetchNovedades, setNovedadEstado, createNovedad } from '../../lib/api'
import type { BadgeVariant, EstadoNovedad, TipoNovedad, Novedad } from '../../types'

const tipoLabel: Record<TipoNovedad, string> = {
  tardanza: 'Tardanza',
  ausencia_injustificada: 'Ausencia injust.',
  ausencia_justificada: 'Ausencia just.',
  hora_extra_50: 'H. extra 50%',
  hora_extra_100: 'H. extra 100%',
  licencia: 'Licencia',
  vacaciones: 'Vacaciones',
  salida_anticipada: 'Salida anticipada',
  sin_descanso: 'Sin descanso',
  anomalia: 'Anomalía',
}

const estadoBadge: Record<EstadoNovedad, BadgeVariant> = {
  pendiente: 'warn',
  aprobada: 'success',
  rechazada: 'danger',
  justificada: 'info',
}

interface ModalProps {
  novedad: Novedad
  onClose: () => void
  onAprobar: () => void
  onRechazar: () => void
}

function NovédadModal({ novedad, onClose, onAprobar, onRechazar }: ModalProps) {
  return (
    <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(26,24,20,0.38)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 20 }}
      onClick={onClose}>
      <div className="modal-card" style={{ background: '#fff', borderRadius: 16, padding: 24, width: 440, boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border)' }} onClick={e => e.stopPropagation()}>
        <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{novedad.empleadoNombre}</div>
        <div style={{ fontSize: 13, color: '#6b6b66', marginBottom: 16 }}>
          {tipoLabel[novedad.tipo]} — {novedad.fecha.split('-').reverse().join('/')}
        </div>
        {[
          ['Tipo', tipoLabel[novedad.tipo]],
          ['Detalle', novedad.detalle],
          ['Origen', novedad.origen === 'automatica' ? 'Automática (motor de reglas)' : 'Manual (RRHH)'],
          ['Estado actual', novedad.estado],
        ].map(([l, v]) => (
          <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 13, borderBottom: '1px solid #f0ede6' }}>
            <span style={{ color: '#6b6b66' }}>{l}</span>
            <span style={{ fontWeight: 500 }}>{v}</span>
          </div>
        ))}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 20 }}>
          <Button onClick={onClose}>Cerrar</Button>
          {novedad.estado === 'pendiente' && (
            <>
              <Button onClick={onRechazar} style={{ borderColor: '#dc2626', color: '#dc2626' }}>Rechazar</Button>
              <Button variant="primary" onClick={onAprobar}>Aprobar</Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

interface NuevaNovedadModalProps {
  onClose: () => void
  onSave: (n: Novedad) => void
}

function NuevaNovedadModal({ onClose, onSave }: NuevaNovedadModalProps) {
  const [form, setForm] = useState({ empleadoNombre: 'Juan Pérez', empleadoId: 'e1', fecha: '2025-04-18', tipo: 'licencia' as TipoNovedad, detalle: '' })
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  async function handleSave() {
    setSaving(true)
    setSaveError('')
    try {
      const created = await createNovedad({ ...form, origen: 'manual', estado: 'pendiente' })
      onSave(created)
      onClose()
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : String(e))
      setSaving(false)
    }
  }
  return (
    <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(26,24,20,0.38)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 20 }}
      onClick={onClose}>
      <div className="modal-card" style={{ background: '#fff', borderRadius: 16, padding: 24, width: 440, boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border)' }} onClick={e => e.stopPropagation()}>
        <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Nueva novedad</div>
        {[
          { label: 'Empleado', type: 'text', value: form.empleadoNombre, onChange: (v: string) => setForm(f => ({ ...f, empleadoNombre: v })) },
          { label: 'Fecha', type: 'date', value: form.fecha, onChange: (v: string) => setForm(f => ({ ...f, fecha: v })) },
          { label: 'Detalle', type: 'text', value: form.detalle, onChange: (v: string) => setForm(f => ({ ...f, detalle: v })) },
        ].map(field => (
          <div key={field.label} style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 12, color: '#6b6b66', display: 'block', marginBottom: 4 }}>{field.label}</label>
            <input type={field.type} value={field.value} onChange={e => field.onChange(e.target.value)}
              style={{ width: '100%', fontSize: 13, padding: '7px 10px', borderRadius: 8, border: '1px solid #d4d2ca' }} />
          </div>
        ))}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, color: '#6b6b66', display: 'block', marginBottom: 4 }}>Tipo</label>
          <select value={form.tipo} onChange={e => setForm(f => ({ ...f, tipo: e.target.value as TipoNovedad }))}
            style={{ width: '100%', fontSize: 13, padding: '7px 10px', borderRadius: 8, border: '1px solid #d4d2ca' }}>
            {Object.entries(tipoLabel).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        {saveError && (
          <div style={{ background: '#fdeaea', border: '1px solid #f6cdcd', color: '#991b1b', borderRadius: 8, padding: '8px 10px', fontSize: 12, marginBottom: 12 }}>{saveError}</div>
        )}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <Button onClick={onClose} disabled={saving}>Cancelar</Button>
          <Button variant="primary" onClick={handleSave} disabled={saving}>{saving ? 'Guardando…' : 'Guardar'}</Button>
        </div>
      </div>
    </div>
  )
}

interface Props {
  showNewModal?: boolean
  onCloseNewModal?: () => void
}

export function Novedades({ showNewModal, onCloseNewModal }: Props) {
  const { data: query, loading, error, reload, setData } = useQuery(fetchNovedades, [])
  const data = query ?? []
  const [search, setSearch] = useState('')
  const [filterEstado, setFilterEstado] = useState('todos')
  const [filterTipo, setFilterTipo] = useState('todos')
  const [selected, setSelected] = useState<Novedad | null>(null)
  const [showNew, setShowNew] = useState(false)

  const filtrados = data.filter(n => {
    const matchSearch = n.empleadoNombre.toLowerCase().includes(search.toLowerCase())
    const matchEstado = filterEstado === 'todos' || n.estado === filterEstado
    const matchTipo = filterTipo === 'todos' || n.tipo === filterTipo
    return matchSearch && matchEstado && matchTipo
  })

  async function aprobar(id: string) {
    setSelected(null)
    await setNovedadEstado(id, 'aprobada')
    setData(prev => (prev ?? []).map(n => n.id === id ? { ...n, estado: 'aprobada' } : n))
  }
  async function rechazar(id: string) {
    setSelected(null)
    await setNovedadEstado(id, 'rechazada')
    setData(prev => (prev ?? []).map(n => n.id === id ? { ...n, estado: 'rechazada' } : n))
  }

  const pendientes = data.filter(n => n.estado === 'pendiente').length

  return (
    <div style={{ padding: '24px 32px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 600 }}>Novedades</div>
          <div style={{ fontSize: 13, color: '#6b6b66', marginTop: 2 }}>{pendientes} pendientes de aprobación</div>
        </div>
        <Button variant="primary" onClick={() => setShowNew(true)}>+ Nueva novedad</Button>
      </div>

      {loading ? <Loading /> : error ? <ErrorBox message={error} onRetry={reload} /> : (
      <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
        <MetricCard label="Total" value={data.length} />
        <MetricCard label="Pendientes" value={pendientes} valueColor="warn" />
        <MetricCard label="Aprobadas" value={data.filter(n => n.estado === 'aprobada').length} valueColor="success" />
        <MetricCard label="Rechazadas" value={data.filter(n => n.estado === 'rechazada').length} valueColor="danger" />
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        <input type="text" placeholder="Buscar empleado..." value={search} onChange={e => setSearch(e.target.value)}
          style={{ fontSize: 13, padding: '6px 10px', borderRadius: 8, border: '1px solid #d4d2ca', width: 200 }} />
        <select value={filterEstado} onChange={e => setFilterEstado(e.target.value)}
          style={{ fontSize: 13, padding: '6px 10px', borderRadius: 8, border: '1px solid #d4d2ca' }}>
          <option value="todos">Todos los estados</option>
          <option value="pendiente">Pendiente</option>
          <option value="aprobada">Aprobada</option>
          <option value="rechazada">Rechazada</option>
          <option value="justificada">Justificada</option>
        </select>
        <select value={filterTipo} onChange={e => setFilterTipo(e.target.value)}
          style={{ fontSize: 13, padding: '6px 10px', borderRadius: 8, border: '1px solid #d4d2ca' }}>
          <option value="todos">Todos los tipos</option>
          {Object.entries(tipoLabel).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e2e0d8', borderRadius: 12, padding: 18 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr>
              {['Empleado', 'Fecha', 'Tipo', 'Detalle', 'Origen', 'Estado', ''].map(h => (
                <th key={h} style={{ textAlign: 'left', fontWeight: 600, fontSize: 11, color: '#888780', textTransform: 'uppercase', letterSpacing: '0.04em', paddingBottom: 8, borderBottom: '1px solid #e2e0d8', paddingRight: 10 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtrados.map(n => (
              <tr key={n.id} style={{ cursor: 'pointer' }} onClick={() => setSelected(n)}>
                <td style={{ padding: '9px 10px 9px 0', borderBottom: '1px solid #f0ede6', fontWeight: 500 }}>{n.empleadoNombre}</td>
                <td style={{ padding: '9px 10px 9px 0', borderBottom: '1px solid #f0ede6' }}>{n.fecha.split('-').reverse().join('/')}</td>
                <td style={{ padding: '9px 10px 9px 0', borderBottom: '1px solid #f0ede6' }}>{tipoLabel[n.tipo]}</td>
                <td style={{ padding: '9px 10px 9px 0', borderBottom: '1px solid #f0ede6', color: '#6b6b66' }}>{n.detalle}</td>
                <td style={{ padding: '9px 10px 9px 0', borderBottom: '1px solid #f0ede6' }}>
                  <Badge variant={n.origen === 'automatica' ? 'gray' : 'info'}>{n.origen === 'automatica' ? 'Automática' : 'Manual'}</Badge>
                </td>
                <td style={{ padding: '9px 10px 9px 0', borderBottom: '1px solid #f0ede6' }}>
                  <Badge variant={estadoBadge[n.estado]}>{n.estado.charAt(0).toUpperCase() + n.estado.slice(1)}</Badge>
                </td>
                <td style={{ padding: '9px 0', borderBottom: '1px solid #f0ede6' }}>
                  {n.estado === 'pendiente' ? (
                    <Button variant="sm" onClick={e => { e.stopPropagation(); aprobar(n.id) }}>Aprobar</Button>
                  ) : (
                    <Button variant="sm" onClick={e => { e.stopPropagation(); setSelected(n) }}>Ver</Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </>
      )}

      {selected && (
        <NovédadModal novedad={selected} onClose={() => setSelected(null)} onAprobar={() => aprobar(selected.id)} onRechazar={() => rechazar(selected.id)} />
      )}
      {(showNew || showNewModal) && (
        <NuevaNovedadModal
          onClose={() => { setShowNew(false); onCloseNewModal?.() }}
          onSave={n => setData(prev => [n, ...(prev ?? [])])}
        />
      )}
    </div>
  )
}
