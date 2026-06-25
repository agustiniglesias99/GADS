import { useState } from 'react'
import { MetricCard } from '../../components/ui/MetricCard'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Loading, ErrorBox } from '../../components/ui/States'
import { useQuery } from '../../lib/useQuery'
import { fetchRegistros, fetchEmpleados, createNovedad, updateRegistroEstado } from '../../lib/api'
import type { BadgeVariant, RegistroDia } from '../../types'

const estadoBadge: Record<string, BadgeVariant> = {
  presente: 'success',
  ausente: 'danger',
  tardanza: 'warn',
  anomalia: 'danger',
  hora_extra: 'info',
  sin_descanso: 'warn',
  salida_anticipada: 'warn',
}

const estadoLabel: Record<string, string> = {
  presente: 'Presente',
  ausente: 'Ausente',
  tardanza: 'Tardanza',
  anomalia: 'Anomalía',
  hora_extra: 'H. Extra',
  sin_descanso: 'Sin descanso',
  salida_anticipada: 'Sal. anticipada',
}

const origenColor: Record<string, string> = {
  biometrico: '#15803d',
  qr: '#b45309',
  manual: '#2563eb',
  api: '#6d28d9',
}

const origenLabel: Record<string, string> = {
  biometrico: 'Biométrico',
  qr: 'QR',
  manual: 'Manual',
  api: 'API',
}

export function Fichadas() {
  const { data, loading, error, reload } = useQuery(async () => {
    const [registros, empleados] = await Promise.all([fetchRegistros(), fetchEmpleados()])
    return { registros, empleados }
  }, [])
  const registrosDia = data?.registros ?? []
  const empleados = data?.empleados ?? []

  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [filterEstado, setFilterEstado] = useState('todos')
  const [selectedEmpleado, setSelectedEmpleado] = useState<RegistroDia | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  const registros = registrosDia.filter(r => r.fecha === selectedDate)
  const registrosConNombre = registros.map(r => ({
    ...r,
    nombre: empleados.find(e => e.id === r.empleadoId)?.nombre ?? r.empleadoId,
  }))

  const filtrados = registrosConNombre.filter(r => {
    const matchSearch = r.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    const matchEstado = filterEstado === 'todos' || r.estado === filterEstado
    return matchSearch && matchEstado
  })

  const presentes = registros.filter(r => r.estado !== 'ausente').length
  const ausentes = registros.filter(r => r.estado === 'ausente').length
  const tardanzas = registros.filter(r => r.estado === 'tardanza').length
  const anomalias = registros.filter(r => r.estado === 'anomalia').length
  const enHorario = registros.filter(r => r.estado === 'presente').length

  const origenStats = registros.reduce((acc, r) => {
    acc[r.origen] = (acc[r.origen] ?? 0) + 1
    return acc
  }, {} as Record<string, number>)
  const totalFichadas = registros.length

  function handleExportCSV() {
    const escapeCsv = (v: string | number) => {
      const s = String(v)
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
    }
    const headers = ['Empleado', 'Fecha', 'Entrada', 'Descanso inicio', 'Descanso fin', 'Salida', 'Estado', 'Origen', 'Min. tardanza', 'Min. extra']
    const rows = filtrados.map(r => [
      r.nombre, r.fecha, r.entrada ?? '', r.descansoInicio ?? '', r.descansoFin ?? '', r.salida ?? '',
      estadoLabel[r.estado] ?? r.estado, origenLabel[r.origen] ?? r.origen,
      r.minutosTardanza ?? '', r.minutosExtra ?? '',
    ])
    const csv = [headers, ...rows].map(r => r.map(escapeCsv).join(',')).join('\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `fichadas_${selectedDate}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  function closeModal() {
    setModalOpen(false)
    setSelectedEmpleado(null)
  }

  async function justificarAusencia() {
    if (!selectedEmpleado) return
    setActionLoading(true)
    try {
      const nombre = empleados.find(e => e.id === selectedEmpleado.empleadoId)?.nombre ?? selectedEmpleado.empleadoId
      await createNovedad({
        empleadoId: selectedEmpleado.empleadoId,
        empleadoNombre: nombre,
        fecha: selectedEmpleado.fecha,
        tipo: 'ausencia_justificada',
        detalle: 'Justificada por RRHH',
        origen: 'manual',
        estado: 'aprobada',
      })
      closeModal()
      reload()
    } catch (e) {
      alert(e instanceof Error ? e.message : String(e))
    } finally {
      setActionLoading(false)
    }
  }

  async function resolverAnomalia() {
    if (!selectedEmpleado) return
    setActionLoading(true)
    try {
      await updateRegistroEstado(selectedEmpleado.empleadoId, selectedEmpleado.fecha, 'presente')
      closeModal()
      reload()
    } catch (e) {
      alert(e instanceof Error ? e.message : String(e))
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div style={{ padding: '24px 32px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 600 }}>Fichadas del día</div>
          <div style={{ fontSize: 13, color: '#6b6b66', marginTop: 2 }}>
            {new Date(selectedDate + 'T12:00:00').toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} — {empleados.filter(e => e.estado === 'activo').length} empleados activos
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button onClick={handleExportCSV}>Exportar CSV</Button>
          <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
            style={{ fontSize: 13, padding: '6px 10px', borderRadius: 8, border: '1px solid #d4d2ca', background: '#fff' }} />
        </div>
      </div>

      {loading ? <Loading /> : error ? <ErrorBox message={error} onRetry={reload} /> : (
      <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 10, marginBottom: 16 }}>
        <MetricCard label="Presentes" value={presentes} valueColor="success" />
        <MetricCard label="Ausentes" value={ausentes} valueColor="danger" />
        <MetricCard label="Tardanzas" value={tardanzas} valueColor="warn" />
        <MetricCard label="Anomalías" value={anomalias} valueColor="danger" />
        <MetricCard label="En horario" value={enHorario} valueColor="success" />
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 14, alignItems: 'center' }}>
        <input type="text" placeholder="Buscar empleado..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
          style={{ fontSize: 13, padding: '6px 10px', borderRadius: 8, border: '1px solid #d4d2ca', width: 200 }} />
        <select value={filterEstado} onChange={e => setFilterEstado(e.target.value)}
          style={{ fontSize: 13, padding: '6px 10px', borderRadius: 8, border: '1px solid #d4d2ca' }}>
          <option value="todos">Todos los estados</option>
          <option value="presente">Presente</option>
          <option value="ausente">Ausente</option>
          <option value="tardanza">Tardanza</option>
          <option value="anomalia">Anomalía</option>
          <option value="hora_extra">H. Extra</option>
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
        <div style={{ background: '#fff', border: '1px solid #e2e0d8', borderRadius: 12, padding: 18 }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>Registro de fichadas</div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr>
                {['Empleado', 'Entrada', 'Descanso', 'Salida', 'Estado', 'Origen', ''].map(h => (
                  <th key={h} style={{ textAlign: 'left', fontWeight: 600, fontSize: 11, color: '#888780', textTransform: 'uppercase', letterSpacing: '0.04em', paddingBottom: 8, borderBottom: '1px solid #e2e0d8', paddingRight: 6 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtrados.map(r => (
                <tr key={r.empleadoId} style={{ cursor: 'pointer' }} onClick={() => { setSelectedEmpleado(r);}}>
                  <td style={{ padding: '9px 6px 9px 0', borderBottom: '1px solid #f0ede6', fontWeight: 600 }}>{r.nombre}</td>
                  <td style={{ padding: '9px 6px 9px 0', borderBottom: '1px solid #f0ede6' }}>
                    {r.entrada ?? <span style={{ color: '#aaa' }}>—</span>}
                    {r.minutosTardanza && <span style={{ fontSize: 11, color: '#b45309', marginLeft: 4 }}>+{r.minutosTardanza} min</span>}
                    {r.estado === 'anomalia' && r.entrada && <span style={{ fontSize: 11, color: '#b91c1c', marginLeft: 4 }}>⚠ doble</span>}
                  </td>
                  <td style={{ padding: '9px 6px 9px 0', borderBottom: '1px solid #f0ede6' }}>
                    {r.descansoInicio && r.descansoFin ? `${r.descansoInicio} / ${r.descansoFin}` : r.entrada ? <span style={{ color: '#b45309' }}>sin desc.</span> : <span style={{ color: '#aaa' }}>—</span>}
                  </td>
                  <td style={{ padding: '9px 6px 9px 0', borderBottom: '1px solid #f0ede6' }}>
                    {r.salida ?? <span style={{ color: '#aaa' }}>—</span>}
                    {r.minutosExtra && <span style={{ fontSize: 11, color: '#1d4ed8', marginLeft: 4 }}>+{r.minutosExtra} min</span>}
                  </td>
                  <td style={{ padding: '9px 6px 9px 0', borderBottom: '1px solid #f0ede6' }}>
                    <Badge variant={estadoBadge[r.estado]}>{estadoLabel[r.estado]}</Badge>
                  </td>
                  <td style={{ padding: '9px 6px 9px 0', borderBottom: '1px solid #f0ede6' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#6b6b66' }}>
                      <span style={{ width: 7, height: 7, borderRadius: '50%', background: origenColor[r.origen], display: 'inline-block' }} />
                      {origenLabel[r.origen]}
                    </span>
                  </td>
                  <td style={{ padding: '9px 0', borderBottom: '1px solid #f0ede6' }}>
                    <Button variant="sm" onClick={e => { e.stopPropagation(); setSelectedEmpleado(r);  setModalOpen(true)}}> 
                      {r.estado === 'anomalia' ? 'Resolver' : r.estado === 'ausente' ? 'Justificar' : 'Ver'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div>
          {selectedEmpleado && (
            <div style={{ background: '#fff', border: '1px solid #e2e0d8', borderRadius: 12, padding: 18, marginBottom: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>Línea de tiempo — {empleados.find(e => e.id === selectedEmpleado.empleadoId)?.nombre}</div>
              <div>
                {[
                  { hora: selectedEmpleado.entrada, label: 'Entrada', sub: selectedEmpleado.minutosTardanza ? `Tardanza ${selectedEmpleado.minutosTardanza} min` : 'En horario', color: selectedEmpleado.minutosTardanza ? '#dc2626' : '#15803d' },
                  selectedEmpleado.descansoInicio ? { hora: selectedEmpleado.descansoInicio, label: 'Inicio descanso', sub: 'Registrado', color: '#d97706' } : null,
                  selectedEmpleado.descansoFin ? { hora: selectedEmpleado.descansoFin, label: 'Fin descanso', sub: 'OK', color: '#d97706' } : null,
                  selectedEmpleado.salida ? { hora: selectedEmpleado.salida, label: 'Salida', sub: selectedEmpleado.minutosExtra ? `${selectedEmpleado.minutosExtra} min extra` : 'En horario', color: '#15803d' } : null,
                ].filter(Boolean).map((item, i, arr) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'stretch', gap: 0 }}>
                    <div style={{ width: 55, fontSize: 12, color: '#6b6b66', padding: '8px 10px 8px 0', textAlign: 'right', flexShrink: 0 }}>{item!.hora}</div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 18, flexShrink: 0 }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: item!.color, marginTop: 10 }} />
                      {i < arr.length - 1 && <div style={{ flex: 1, width: 1, background: '#e2e0d8' }} />}
                    </div>
                    <div style={{ flex: 1, padding: '6px 0 6px 10px' }}>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{item!.label}</div>
                      <div style={{ fontSize: 12, color: '#6b6b66', marginTop: 1 }}>{item!.sub}</div>
                    </div>
                  </div>
                ))}
                {selectedEmpleado.estado === 'ausente' && (
                  <div style={{ fontSize: 13, color: '#b91c1c', padding: '10px 0' }}>Sin registro de fichada</div>
                )}
              </div>
            </div>
          )}

          <div style={{ background: '#fff', border: '1px solid #e2e0d8', borderRadius: 12, padding: 18 }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>Origen de fichadas hoy</div>
            {Object.entries(origenStats).map(([origen, count]) => (
              <div key={origen} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', fontSize: 13, borderBottom: '1px solid #f0ede6' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: '#6b6b66' }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: origenColor[origen], display: 'inline-block' }} />
                  {origenLabel[origen]}
                </span>
                <strong>{Math.round(count / totalFichadas * 100)}%</strong>
              </div>
            ))}
          </div>
        </div>
      </div>
      </>
      )}

      {modalOpen && selectedEmpleado && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(26,24,20,0.38)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 20 }}
          onClick={() => setModalOpen(false)}>
          <div className="modal-card" style={{ background: '#fff', borderRadius: 16, padding: 24, width: 400, boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border)' }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{empleados.find(e => e.id === selectedEmpleado.empleadoId)?.nombre}</div>
            <div style={{ fontSize: 13, color: '#6b6b66', marginBottom: 16 }}>{selectedDate} — <Badge variant={estadoBadge[selectedEmpleado.estado]}>{estadoLabel[selectedEmpleado.estado]}</Badge></div>
            <div style={{ fontSize: 13, display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 20 }}>
              {selectedEmpleado.entrada && <div><span style={{ color: '#6b6b66' }}>Entrada:</span> <strong>{selectedEmpleado.entrada}</strong></div>}
              {selectedEmpleado.descansoInicio && <div><span style={{ color: '#6b6b66' }}>Descanso:</span> <strong>{selectedEmpleado.descansoInicio} – {selectedEmpleado.descansoFin}</strong></div>}
              {selectedEmpleado.salida && <div><span style={{ color: '#6b6b66' }}>Salida:</span> <strong>{selectedEmpleado.salida}</strong></div>}
              {selectedEmpleado.minutosTardanza && <div style={{ color: '#b45309' }}>Tardanza: {selectedEmpleado.minutosTardanza} min</div>}
              {selectedEmpleado.minutosExtra && <div style={{ color: '#1d4ed8' }}>Horas extra: {selectedEmpleado.minutosExtra} min</div>}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <Button onClick={() => setModalOpen(false)}>Cerrar</Button>
              {selectedEmpleado.estado === 'ausente' && <Button variant="primary" onClick={justificarAusencia} disabled={actionLoading}>{actionLoading ? 'Procesando…' : 'Justificar ausencia'}</Button>}
              {selectedEmpleado.estado === 'anomalia' && <Button variant="primary" onClick={resolverAnomalia} disabled={actionLoading}>{actionLoading ? 'Procesando…' : 'Resolver anomalía'}</Button>}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
