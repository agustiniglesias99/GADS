import { useState, lazy, Suspense } from 'react'
import { createPortal } from 'react-dom'
import { MetricCard } from '../../components/ui/MetricCard'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Loading, ErrorBox } from '../../components/ui/States'

// Carga diferida: html5-qrcode es pesado y solo se necesita al fichar.
const QRScanner = lazy(() => import('../../components/ui/QRScanner').then(m => ({ default: m.QRScanner })))
import { useQuery } from '../../lib/useQuery'
import { fetchEmpleado, fetchNovedadesByEmpleado, createNovedad, fetchRegistroDia, fetchRegistrosMes, registrarFichada, type FichadaResult } from '../../lib/api'
import { isQRTokenValid, fechaHoy } from '../../lib/asistencia'
import { useAuth } from '../../context/AuthContext'
import type { BadgeVariant, EstadoNovedad, TipoNovedad, Novedad, Empleado, RegistroDia } from '../../types'

const tipoLabel: Record<TipoNovedad, string> = {
  tardanza: 'Tardanza',
  ausencia_injustificada: 'Ausencia injustificada',
  ausencia_justificada: 'Ausencia justificada',
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

const registroEstadoBadge: Record<string, BadgeVariant> = {
  presente: 'success', tardanza: 'warn', hora_extra: 'info',
  salida_anticipada: 'warn', sin_descanso: 'warn', ausente: 'danger', anomalia: 'danger',
}
const registroEstadoLabel: Record<string, string> = {
  presente: 'Presente', tardanza: 'Tardanza', hora_extra: 'Hora extra',
  salida_anticipada: 'Salida anticipada', sin_descanso: 'Sin descanso', ausente: 'Ausente', anomalia: 'Anomalía',
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

function SolicitudModal({ onClose, onSave, empleadoNombre }: { onClose: () => void; onSave: (n: Novedad) => void; empleadoNombre: string }) {
  const { user } = useAuth()
  const [form, setForm] = useState({ tipo: 'vacaciones' as TipoNovedad, fechaDesde: '', fechaHasta: '', detalle: '' })

  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [fechaError, setFechaError] = useState('')

  async function handleSave() {
    if (!form.fechaDesde || !user?.empleadoId) return
    if (form.fechaHasta && form.fechaHasta < form.fechaDesde) {
      setFechaError('La fecha hasta no puede ser anterior a la fecha desde.')
      return
    }
    setFechaError('')
    setSaving(true)
    setSaveError('')
    try {
      const created = await createNovedad({
        empleadoId: user.empleadoId,
        empleadoNombre: empleadoNombre,
        fecha: form.fechaDesde,
        tipo: form.tipo,
        detalle: form.detalle || `Desde ${form.fechaDesde}${form.fechaHasta ? ` hasta ${form.fechaHasta}` : ''}`,
        origen: 'manual',
        estado: 'pendiente',
      })
      onSave(created)
      onClose()
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : String(e))
      setSaving(false)
    }
  }

  return createPortal(
    <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(26,24,20,0.38)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 20 }}
      onClick={onClose}>
      <div className="modal-card" style={{ background: '#fff', borderRadius: 16, padding: 24, width: 440, boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border)' }} onClick={e => e.stopPropagation()}>
        <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Solicitar novedad</div>

        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 12, color: '#6b6b66', display: 'block', marginBottom: 4 }}>Tipo de solicitud</label>
          <select value={form.tipo} onChange={e => setForm(f => ({ ...f, tipo: e.target.value as TipoNovedad }))}
            style={{ width: '100%', fontSize: 13, padding: '7px 10px', borderRadius: 8, border: '1px solid #d4d2ca' }}>
            <option value="vacaciones">Vacaciones</option>
            <option value="licencia">Licencia</option>
            <option value="ausencia_justificada">Ausencia justificada</option>
          </select>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: fechaError ? 4 : 12 }}>
          <div>
            <label style={{ fontSize: 12, color: '#6b6b66', display: 'block', marginBottom: 4 }}>Fecha desde</label>
            <input type="date" value={form.fechaDesde}
              onChange={e => { setForm(f => ({ ...f, fechaDesde: e.target.value })); setFechaError('') }}
              max={form.fechaHasta || undefined}
              style={{ width: '100%', fontSize: 13, padding: '7px 10px', borderRadius: 8, border: `1px solid ${fechaError ? '#e53e3e' : '#d4d2ca'}` }} />
          </div>
          <div>
            <label style={{ fontSize: 12, color: '#6b6b66', display: 'block', marginBottom: 4 }}>Fecha hasta</label>
            <input type="date" value={form.fechaHasta}
              onChange={e => { setForm(f => ({ ...f, fechaHasta: e.target.value })); setFechaError('') }}
              min={form.fechaDesde || undefined}
              style={{ width: '100%', fontSize: 13, padding: '7px 10px', borderRadius: 8, border: `1px solid ${fechaError ? '#e53e3e' : '#d4d2ca'}` }} />
          </div>
        </div>
        {fechaError && (
          <div style={{ fontSize: 12, color: '#e53e3e', marginBottom: 12 }}>{fechaError}</div>
        )}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, color: '#6b6b66', display: 'block', marginBottom: 4 }}>Motivo (opcional)</label>
          <textarea value={form.detalle} onChange={e => setForm(f => ({ ...f, detalle: e.target.value }))} rows={3}
            style={{ width: '100%', fontSize: 13, padding: '7px 10px', borderRadius: 8, border: '1px solid #d4d2ca', resize: 'vertical' }} />
        </div>
        {saveError && (
          <div style={{ background: '#fdeaea', border: '1px solid #f6cdcd', color: '#991b1b', borderRadius: 8, padding: '8px 10px', fontSize: 12, marginBottom: 12 }}>{saveError}</div>
        )}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <Button onClick={onClose} disabled={saving}>Cancelar</Button>
          <Button variant="primary" onClick={handleSave} disabled={!form.fechaDesde || saving}>{saving ? 'Enviando…' : 'Enviar solicitud'}</Button>
        </div>
      </div>
    </div>,
    document.body
  )
}

function FichajeModal({ emp, fecha, onClose, onDone }: {
  emp: Empleado
  fecha: string
  onClose: () => void
  onDone: (r: RegistroDia) => void
}) {
  const [scanning, setScanning] = useState(true)
  const [manual, setManual] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<FichadaResult | null>(null)

  async function procesar(text: string) {
    setScanning(false)
    if (!isQRTokenValid(text)) {
      setError('QR inválido o expirado. Pedí que actualicen el código en el punto de fichaje y volvé a escanear.')
      return
    }
    setSaving(true)
    setError('')
    try {
      const res = await registrarFichada(emp, fecha)
      setResult(res)
      onDone(res.registro)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setSaving(false)
    }
  }

  function reintentar() {
    setError('')
    setManual('')
    setScanning(true)
  }

  return createPortal(
    <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(26,24,20,0.38)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 20 }}
      onClick={onClose}>
      <div className="modal-card" style={{ background: '#fff', borderRadius: 16, padding: 24, width: 380, boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border)' }} onClick={e => e.stopPropagation()}>
        <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>Fichar asistencia</div>
        <div style={{ fontSize: 12, color: '#6b6b66', marginBottom: 16 }}>Escaneá el QR del punto de fichaje</div>

        {result ? (
          <div style={{ textAlign: 'center', padding: '8px 0 16px' }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>✅</div>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>
              {result.accion === 'ingreso' ? 'Ingreso registrado' : 'Egreso registrado'}
            </div>
            <div style={{ fontSize: 13, color: '#6b6b66', marginBottom: 10 }}>a las {result.hora} hs</div>
            <Badge variant={registroEstadoBadge[result.registro.estado] ?? 'gray'}>
              {registroEstadoLabel[result.registro.estado] ?? result.registro.estado}
            </Badge>
          </div>
        ) : saving ? (
          <div style={{ textAlign: 'center', padding: '24px 0', fontSize: 13, color: '#6b6b66' }}>Registrando…</div>
        ) : error ? (
          <div style={{ padding: '4px 0 8px' }}>
            <div style={{ background: '#fdeaea', border: '1px solid #f6cdcd', color: '#991b1b', borderRadius: 8, padding: '10px 12px', fontSize: 13, marginBottom: 14 }}>{error}</div>
            <Button variant="primary" onClick={reintentar} style={{ width: '100%' }}>Reintentar</Button>
          </div>
        ) : scanning ? (
          <>
            <Suspense fallback={<div style={{ textAlign: 'center', padding: '24px 0', fontSize: 13, color: '#6b6b66' }}>Cargando cámara…</div>}>
              <QRScanner onScan={procesar} onError={() => undefined} />
            </Suspense>
            <div style={{ fontSize: 12, color: '#888780', textAlign: 'center', margin: '12px 0 6px' }}>¿Sin cámara? Ingresá el código del QR</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input type="text" value={manual} onChange={e => setManual(e.target.value)} placeholder="arcade-YYYY-MM-DD-HH-MM"
                style={{ flex: 1, fontSize: 13, padding: '7px 10px', borderRadius: 8, border: '1px solid #d4d2ca' }} />
              <Button onClick={() => procesar(manual)} disabled={!manual.trim()}>Usar</Button>
            </div>
          </>
        ) : null}

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 18 }}>
          <Button onClick={onClose}>{result ? 'Listo' : 'Cancelar'}</Button>
        </div>
      </div>
    </div>,
    document.body
  )
}

export function MiPanel() {
  const { user } = useAuth()
  const empleadoId = user?.empleadoId
  const hoy = fechaHoy()
  const mesLabel = new Date(hoy + 'T12:00:00').toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })
  const hoyDate = new Date(hoy + 'T12:00:00')
  const mesDesde = `${hoyDate.getFullYear()}-${String(hoyDate.getMonth() + 1).padStart(2, '0')}-01`
  const mesHasta = `${hoyDate.getFullYear()}-${String(hoyDate.getMonth() + 1).padStart(2, '0')}-${String(new Date(hoyDate.getFullYear(), hoyDate.getMonth() + 1, 0).getDate()).padStart(2, '0')}`
  const { data, loading, error, reload, setData } = useQuery(async () => {
    if (!empleadoId) return { emp: null, novedades: [], registro: null, registrosMes: [] }
    const [emp, novedades, registro, registrosMes] = await Promise.all([
      fetchEmpleado(empleadoId), fetchNovedadesByEmpleado(empleadoId),
      fetchRegistroDia(empleadoId, hoy), fetchRegistrosMes(empleadoId, mesDesde, mesHasta),
    ])
    return { emp, novedades, registro, registrosMes }
  }, [empleadoId])
  const [showModal, setShowModal] = useState(false)
  const [showFichaje, setShowFichaje] = useState(false)

  if (loading) return <div style={{ padding: '24px 32px' }}><Loading /></div>
  if (error) return <div style={{ padding: '24px 32px' }}><ErrorBox message={error} onRetry={reload} /></div>

  const emp = data?.emp ?? null
  const misNovedades = data?.novedades ?? []
  const registro = data?.registro ?? null
  const registrosMes = data?.registrosMes ?? []
  const jornadaCompleta = !!(registro?.entrada && registro?.salida)
  const pendientes = misNovedades.filter(n => n.estado === 'pendiente').length

  // Métricas del mes
  const year = hoyDate.getFullYear()
  const month = hoyDate.getMonth()
  const todayNum = hoyDate.getDate()
  const lastDay = new Date(year, month + 1, 0).getDate()
  const diasLaborables = Array.from({ length: todayNum }, (_, i) => i + 1)
    .filter(d => { const w = new Date(year, month, d).getDay(); return w !== 0 && w !== 6 }).length
  const diasTrabajados = registrosMes.filter(r => !['ausente', 'ausencia_justificada'].includes(r.estado)).length
  const tardanzasCount = registrosMes.filter(r => r.estado === 'tardanza').length
  const tardanzasMin = registrosMes.reduce((s, r) => s + (r.minutosTardanza ?? 0), 0)
  const ausenciasCount = registrosMes.filter(r => r.estado === 'ausente' || r.estado === 'ausencia_justificada').length
  const ausenciasJust = registrosMes.filter(r => r.estado === 'ausencia_justificada').length
  const horasExtraMin = registrosMes.reduce((s, r) => s + (r.minutosExtra ?? 0), 0)
  const horasExtraStr = horasExtraMin >= 60 ? `${Math.floor(horasExtraMin / 60)}h ${horasExtraMin % 60}m` : `${horasExtraMin}m`

  // Calendario dinámico del mes actual
  const firstWeekday = new Date(year, month, 1).getDay()
  const offset = firstWeekday === 0 ? 6 : firstWeekday - 1
  const registroMap = new Map<number, string>(registrosMes.map(r => [parseInt(r.fecha.split('-')[2]), r.estado]))
  // Determina si el turno de hoy ya terminó para saber si mostrar ausente o "en turno"
  const turnoEndHour = (() => {
    const m = emp?.turno?.match(/(\d{1,2})-(\d{1,2})\s*$/)
    return m ? parseInt(m[2]) : null
  })()
  const shiftOver = turnoEndHour !== null ? new Date().getHours() >= turnoEndHour : true

  const calendarDays: [number, DayType][] = Array.from({ length: offset }, () => [0, 'empty' as DayType])
  for (let d = 1; d <= lastDay; d++) {
    const w = new Date(year, month, d).getDay()
    const isWeekend = w === 0 || w === 6
    if (isWeekend) calendarDays.push([d, 'gray'])
    else if (registroMap.has(d)) calendarDays.push([d, estadoToDayType(registroMap.get(d)!)])
    else if (d < todayNum) calendarDays.push([d, 'danger'])
    else if (d === todayNum) calendarDays.push([d, shiftOver ? 'danger' : 'today'])
    else calendarDays.push([d, 'future'])
  }

  if (!emp) return <div style={{ padding: '24px 32px', color: '#8f8d84', fontSize: 14 }}>No se encontró tu legajo asociado. Avisá a RRHH.</div>

  return (
    <div style={{ padding: '24px 32px' }}>
      <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 2 }}>Mi panel</div>
      <div style={{ fontSize: 13, color: '#6b6b66', marginBottom: 20 }}>{mesLabel} — {emp.nombre}</div>

      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 16, alignItems: 'start' }}>
        <div>
          <div style={{ background: '#fff', border: '1px solid #e2e0d8', borderRadius: 12, padding: 18, marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 600, color: '#1d4ed8' }}>{emp.iniciales}</div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600 }}>{emp.nombre}</div>
                <div style={{ fontSize: 12, color: '#6b6b66' }}>Legajo #{emp.legajo}</div>
              </div>
            </div>
            <Badge variant="success">Activo</Badge>
            <div style={{ height: 1, background: '#f0ede6', margin: '12px 0' }} />
            {[
              ['Categoría', emp.categoria],
              ['Turno', emp.turno],
              ['Ingreso', emp.ingreso],
              ['Convenio', emp.convenio],
            ].map(([l, v]) => (
              <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: 13 }}>
                <span style={{ color: '#6b6b66' }}>{l}</span>
                <span style={{ fontWeight: 500 }}>{v}</span>
              </div>
            ))}
          </div>
          <div style={{ background: '#fff', border: '1px solid #e2e0d8', borderRadius: 12, padding: 18, marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>Mi fichada de hoy</div>
              <span style={{ fontSize: 12, color: '#888780' }}>{hoy.split('-').reverse().join('/')}</span>
            </div>
            {[
              ['Entrada', registro?.entrada],
              ['Salida', registro?.salida],
            ].map(([l, v]) => (
              <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: 13 }}>
                <span style={{ color: '#6b6b66' }}>{l}</span>
                <span style={{ fontWeight: 500 }}>{v ?? <span style={{ color: '#bbb' }}>—</span>}</span>
              </div>
            ))}
            {registro && (
              <div style={{ marginTop: 8 }}>
                <Badge variant={registroEstadoBadge[registro.estado] ?? 'gray'}>
                  {registroEstadoLabel[registro.estado] ?? registro.estado}
                </Badge>
              </div>
            )}
            <Button variant="primary" onClick={() => setShowFichaje(true)} disabled={jornadaCompleta} //
              style={{ width: '100%', padding: '9px 14px', marginTop: 14 }}>
              {jornadaCompleta ? 'Jornada completa' : registro?.entrada ? 'Fichar egreso (QR)' : 'Fichar ingreso (QR)'}
            </Button>
          </div>

          <Button variant="primary" onClick={() => setShowModal(true)} style={{ width: '100%', padding: '9px 14px' }}>
            + Solicitar licencia / vacaciones
          </Button>
          {pendientes > 0 && (
            <div style={{ marginTop: 12, background: '#fef3c7', borderRadius: 8, padding: '10px 12px', fontSize: 13, color: '#92400e' }}>
              Tenés {pendientes} solicitud{pendientes > 1 ? 'es' : ''} pendiente{pendientes > 1 ? 's' : ''} de aprobación.
            </div>
          )}
        </div>

        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 16 }}>
            <MetricCard label="Días trabajados" value={diasTrabajados} sub={`de ${diasLaborables} laborables`} valueColor="success" />
            <MetricCard label="Tardanzas" value={tardanzasCount} sub={`${tardanzasMin} min acumulados`} valueColor="warn" />
            <MetricCard label="Ausencias" value={ausenciasCount} sub={`${ausenciasJust} justificada${ausenciasJust !== 1 ? 's' : ''}`} valueColor="danger" />
            <MetricCard label="Horas extra" value={horasExtraStr} sub="acumuladas" valueColor="info" />
          </div>

          <div style={{ background: '#fff', border: '1px solid #e2e0d8', borderRadius: 12, padding: 18, marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>Mi asistencia — {mesLabel}</div>
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
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>Mis novedades</div>
            {misNovedades.length === 0 ? (
              <div style={{ fontSize: 13, color: '#888780', padding: '12px 0' }}>Sin novedades en el período.</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr>
                    {['Fecha', 'Tipo', 'Detalle', 'Estado'].map(h => (
                      <th key={h} style={{ textAlign: 'left', fontWeight: 600, fontSize: 11, color: '#888780', textTransform: 'uppercase', letterSpacing: '0.04em', paddingBottom: 8, borderBottom: '1px solid #e2e0d8', paddingRight: 12 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {misNovedades.map(n => (
                    <tr key={n.id}>
                      <td style={{ padding: '8px 12px 8px 0', borderBottom: '1px solid #f0ede6' }}>{n.fecha.split('-').reverse().join('/')}</td>
                      <td style={{ padding: '8px 12px 8px 0', borderBottom: '1px solid #f0ede6' }}>{tipoLabel[n.tipo]}</td>
                      <td style={{ padding: '8px 12px 8px 0', borderBottom: '1px solid #f0ede6', color: '#6b6b66' }}>{n.detalle}</td>
                      <td style={{ padding: '8px 0', borderBottom: '1px solid #f0ede6' }}>
                        <Badge variant={estadoBadge[n.estado]}>{n.estado.charAt(0).toUpperCase() + n.estado.slice(1)}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <SolicitudModal
          onClose={() => setShowModal(false)}
          onSave={n => { setData(d => ({ ...d!, novedades: [n, ...(d?.novedades ?? [])] })); setShowModal(false) }}
          empleadoNombre={emp.nombre}
        />
      )}
      {showFichaje && emp && (
        <FichajeModal
          emp={emp}
          fecha={hoy}
          onClose={() => setShowFichaje(false)}
          onDone={r => setData(d => ({ ...d!, registro: r }))}
        />
      )}
    </div>
  )
}
