import { useState } from 'react'
import { createPortal } from 'react-dom'
import { MetricCard } from '../../components/ui/MetricCard'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Loading, ErrorBox } from '../../components/ui/States'
import { EmpleadoFormModal } from '../../components/EmpleadoFormModal'
import { useQuery } from '../../lib/useQuery'
import { fetchEmpleado, fetchNovedadesByEmpleado, fetchRegistrosMes, setNovedadEstado } from '../../lib/api'
import { fechaHoy } from '../../lib/asistencia'
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
}

const estadoBadge: Record<EstadoNovedad, BadgeVariant> = {
  pendiente: 'warn',
  aprobada: 'success',
  rechazada: 'danger',
  justificada: 'info',
}

type DayType = 'ok' | 'warn' | 'danger' | 'info' | 'gray' | 'empty' | 'future' | 'today'

const dayStyle: Record<DayType, { bg: string; color: string }> = {
  ok:     { bg: '#dcfce7', color: '#166534' },
  warn:   { bg: '#fef3c7', color: '#92400e' },
  danger: { bg: '#fee2e2', color: '#991b1b' },
  info:   { bg: '#dbeafe', color: '#1e40af' },
  gray:   { bg: '#f0ede6', color: '#888780' },
  empty:  { bg: 'transparent', color: 'transparent' },
  future: { bg: 'transparent', color: '#c4c2ba' },
  today:  { bg: '#faf5ff', color: '#7c3aed' },
}

function estadoToDayType(estado: string): DayType {
  switch (estado) {
    case 'presente': return 'ok'
    case 'tardanza': return 'warn'
    case 'hora_extra': return 'info'
    case 'sin_descanso': return 'warn'
    case 'salida_anticipada': return 'warn'
    case 'ausente': return 'danger'
    case 'ausencia_justificada': return 'info'
    case 'anomalia': return 'danger'
    default: return 'gray'
  }
}

interface Props {
  empleadoId: string
  onBack: () => void
}

export function EmpleadoDetalle({ empleadoId, onBack }: Props) {
  const hoy = fechaHoy()
  const hoyDate = new Date(hoy + 'T12:00:00')
  const year = hoyDate.getFullYear()
  const month = hoyDate.getMonth()
  const todayNum = hoyDate.getDate()
  const mesLabel = hoyDate.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })
  const lastDay = new Date(year, month + 1, 0).getDate()
  const mesDesde = `${year}-${String(month + 1).padStart(2, '0')}-01`
  const mesHasta = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`

  const { data, loading, error, reload, setData } = useQuery(async () => {
    const [emp, novedades, registrosMes] = await Promise.all([
      fetchEmpleado(empleadoId), fetchNovedadesByEmpleado(empleadoId),
      fetchRegistrosMes(empleadoId, mesDesde, mesHasta),
    ])
    return { emp, novedades, registrosMes }
  }, [empleadoId])

  const emp = data?.emp ?? null
  const novedadesData = data?.novedades ?? []
  const registrosMes = data?.registrosMes ?? []

  // Calendario dinámico del mes en curso
  const firstWeekday = new Date(year, month, 1).getDay()
  const offset = firstWeekday === 0 ? 6 : firstWeekday - 1
  const registroMap = new Map<number, string>(registrosMes.map(r => [parseInt(r.fecha.split('-')[2]), r.estado]))
  const calendarDays: [number, DayType][] = Array.from({ length: offset }, () => [0, 'empty' as DayType])
  for (let d = 1; d <= lastDay; d++) {
    const w = new Date(year, month, d).getDay()
    const isWeekend = w === 0 || w === 6
    if (isWeekend) calendarDays.push([d, 'gray'])
    else if (registroMap.has(d)) calendarDays.push([d, estadoToDayType(registroMap.get(d)!)])
    else if (d < todayNum) calendarDays.push([d, 'danger'])
    else if (d === todayNum) calendarDays.push([d, 'today'])
    else calendarDays.push([d, 'future'])
  }
  const [selectedNov, setSelectedNov] = useState<Novedad | null>(null)
  const [showEdit, setShowEdit] = useState(false)

  async function aprobar(id: string) {
    await setNovedadEstado(id, 'aprobada')
    setData(d => ({ ...d!, novedades: d!.novedades.map(n => n.id === id ? { ...n, estado: 'aprobada' } : n) }))
  }

  if (loading) return <div style={{ padding: '24px 32px' }}><Loading /></div>
  if (error) return <div style={{ padding: '24px 32px' }}><ErrorBox message={error} onRetry={reload} /></div>
  if (!emp) return (
    <div style={{ padding: '24px 32px' }}>
      <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b6b66', fontSize: 13, marginBottom: 12 }}>← Empleados</button>
      <div style={{ color: '#8f8d84', fontSize: 14 }}>No se encontró el empleado.</div>
    </div>
  )

  function handleExportResumen() {
    const escapeCsv = (v: string | number) => {
      const s = String(v)
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
    }
    const lines: string[] = []
    lines.push(['Legajo', 'Nombre', 'DNI', 'CUIL', 'Categoría', 'Jornada', 'Turno', 'Convenio', 'Estado'].join(','))
    lines.push([emp!.legajo, emp!.nombre, emp!.dni, emp!.cuil, emp!.categoria, emp!.jornada, emp!.turno, emp!.convenio, emp!.estado].map(escapeCsv).join(','))
    lines.push('')
    lines.push(['Fecha', 'Tipo', 'Detalle', 'Origen', 'Estado'].join(','))
    novedadesData.forEach(n => {
      lines.push([n.fecha, tipoLabel[n.tipo], n.detalle, n.origen, n.estado].map(escapeCsv).join(','))
    })
    const blob = new Blob(['﻿' + lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `resumen_${emp!.legajo}_${emp!.nombre.replace(/\s+/g, '_')}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div style={{ padding: '24px 32px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, fontSize: 13, color: '#6b6b66' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b6b66', fontSize: 13 }}>Empleados</button>
        <span>/</span>
        <span style={{ color: '#1a1a18', fontWeight: 600 }}>{emp.nombre}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 16, alignItems: 'start' }}>
        <div>
          <div style={{ background: '#fff', border: '1px solid #e2e0d8', borderRadius: 12, padding: 18, marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 600, color: '#1d4ed8' }}>{emp.iniciales}</div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600 }}>{emp.nombre}</div>
                <div style={{ fontSize: 12, color: '#6b6b66' }}>Legajo #{emp.legajo}</div>
              </div>
            </div>
            <Badge variant={emp.estado === 'activo' ? 'success' : 'warn'}>{emp.estado.charAt(0).toUpperCase() + emp.estado.slice(1)}</Badge>
            <div style={{ height: 1, background: '#f0ede6', margin: '12px 0' }} />
            {[
              ['DNI', emp.dni], ['CUIL', emp.cuil], ['Categoría', emp.categoria],
              ['Jornada', emp.jornada], ['Ingreso', emp.ingreso], ['Convenio', emp.convenio],
            ].map(([l, v]) => (
              <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: 13 }}>
                <span style={{ color: '#6b6b66' }}>{l}</span>
                <span style={{ fontWeight: 500 }}>{v}</span>
              </div>
            ))}
            <div style={{ height: 1, background: '#f0ede6', margin: '12px 0' }} />
            {[
              ['Turno', emp.turno], ['Tolerancia', `${emp.tolerancia} min`], ['Fichada', emp.fichada],
            ].map(([l, v]) => (
              <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: 13 }}>
                <span style={{ color: '#6b6b66' }}>{l}</span>
                <span style={{ fontWeight: 500 }}>{v}</span>
              </div>
            ))}
          </div>
          <Button variant="primary" onClick={() => setShowEdit(true)} style={{ width: '100%', marginBottom: 8 }}>Editar empleado</Button>
          <Button onClick={handleExportResumen} style={{ width: '100%' }}>Exportar resumen</Button>
        </div>

        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 16 }}>
            <MetricCard label="Días trabajados" value={17} sub="de 20 laborables" valueColor="success" />
            <MetricCard label="Tardanzas" value={3} sub="42 min acumulados" valueColor="warn" />
            <MetricCard label="Ausencias" value={2} sub="1 justificada" valueColor="danger" />
            <MetricCard label="Horas extra" value="4h 15m" sub="al 50%" valueColor="info" />
          </div>

          <div style={{ background: '#fff', border: '1px solid #e2e0d8', borderRadius: 12, padding: 18, marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>Calendario de asistencia — {mesLabel.charAt(0).toUpperCase() + mesLabel.slice(1)}</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4 }}>
              {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(d => (
                <div key={d} style={{ fontSize: 11, color: '#888780', textAlign: 'center', padding: '3px 0', fontWeight: 600 }}>{d}</div>
              ))}
              {calendarDays.map(([day, type], i) => (
                <div key={i} style={{
                  fontSize: 12, textAlign: 'center', padding: '6px 2px', borderRadius: 6,
                  background: dayStyle[type].bg, color: dayStyle[type].color,
                  opacity: type === 'empty' ? 0 : 1,
                }}>
                  {day === 0 ? '' : day}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 10, flexWrap: 'wrap' }}>
              {[['#dcfce7', 'Presente'], ['#fef3c7', 'Tardanza'], ['#fee2e2', 'Ausente'], ['#dbeafe', 'H. Extra'], ['#f0ede6', 'No laborable'], ['#faf5ff', 'Hoy']].map(([bg, label]) => (
                <span key={label} style={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 4, color: '#6b6b66' }}>
                  <span style={{ width: 10, height: 10, borderRadius: 2, background: bg, display: 'inline-block' }} />
                  {label}
                </span>
              ))}
            </div>
          </div>

          <div style={{ background: '#fff', border: '1px solid #e2e0d8', borderRadius: 12, padding: 18 }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>Novedades del período</div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr>
                  {['Fecha', 'Tipo', 'Detalle', 'Origen', 'Estado', ''].map(h => (
                    <th key={h} style={{ textAlign: 'left', fontWeight: 600, fontSize: 11, color: '#888780', textTransform: 'uppercase', letterSpacing: '0.04em', paddingBottom: 8, borderBottom: '1px solid #e2e0d8', paddingRight: 8 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {novedadesData.map(n => (
                  <tr key={n.id}>
                    <td style={{ padding: '8px 8px 8px 0', borderBottom: '1px solid #f0ede6' }}>{n.fecha.slice(8)}/{n.fecha.slice(5, 7)}</td>
                    <td style={{ padding: '8px 8px 8px 0', borderBottom: '1px solid #f0ede6' }}>{tipoLabel[n.tipo]}</td>
                    <td style={{ padding: '8px 8px 8px 0', borderBottom: '1px solid #f0ede6' }}>{n.detalle}</td>
                    <td style={{ padding: '8px 8px 8px 0', borderBottom: '1px solid #f0ede6' }}>
                      <Badge variant={n.origen === 'automatica' ? 'gray' : 'info'}>{n.origen === 'automatica' ? 'Automática' : 'Manual'}</Badge>
                    </td>
                    <td style={{ padding: '8px 8px 8px 0', borderBottom: '1px solid #f0ede6' }}>
                      <Badge variant={estadoBadge[n.estado]}>{n.estado.charAt(0).toUpperCase() + n.estado.slice(1)}</Badge>
                    </td>
                    <td style={{ padding: '8px 0', borderBottom: '1px solid #f0ede6' }}>
                      {n.estado === 'pendiente' ? (
                        <Button variant="sm" onClick={() => aprobar(n.id)}>Aprobar</Button>
                      ) : (
                        <Button variant="sm" onClick={() => setSelectedNov(n)}>Ver</Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showEdit && (
        <EmpleadoFormModal
          empleado={emp}
          onClose={() => setShowEdit(false)}
          onSave={updated => setData(d => ({ ...d!, emp: updated }))}
        />
      )}

      {selectedNov && createPortal(
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(26,24,20,0.38)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 20 }}
          onClick={() => setSelectedNov(null)}>
          <div className="modal-card" style={{ background: '#fff', borderRadius: 16, padding: 24, width: 420, boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border)' }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{tipoLabel[selectedNov.tipo]}</div>
            <div style={{ fontSize: 13, color: '#6b6b66', marginBottom: 16 }}>{selectedNov.fecha.split('-').reverse().join('/')}</div>
            {([
              ['Detalle', selectedNov.detalle || '—'],
              ['Origen', selectedNov.origen === 'automatica' ? 'Automática (motor de reglas)' : 'Manual (RRHH)'],
              ['Estado', selectedNov.estado.charAt(0).toUpperCase() + selectedNov.estado.slice(1)],
            ] as [string, string][]).map(([l, v]) => (
              <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 13, borderBottom: '1px solid #f0ede6' }}>
                <span style={{ color: '#6b6b66' }}>{l}</span>
                <span style={{ fontWeight: 500 }}>{v}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
              <Button onClick={() => setSelectedNov(null)}>Cerrar</Button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
