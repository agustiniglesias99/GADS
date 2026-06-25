import { useState } from 'react'
import { MetricCard } from '../../components/ui/MetricCard'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Loading, ErrorBox } from '../../components/ui/States'
import { useQuery } from '../../lib/useQuery'
import { fetchNovedades, fetchEmpleados, fetchRegistros, setNovedadEstado } from '../../lib/api'
import type { BadgeVariant, EstadoNovedad, TipoNovedad } from '../../types'

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

const MESES_ES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const DIAS_ES  = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

function fechaToMesPeriodo(fecha: string) {
  const [y, m] = fecha.split('-')
  return `${MESES_ES[parseInt(m) - 1]} ${y}`
}

function toISO(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

type DayState = 'ok' | 'warn' | 'danger' | 'info'

const dayBadge: Record<DayState, { variant: BadgeVariant; label: string }> = {
  ok:     { variant: 'success', label: 'OK' },
  warn:   { variant: 'warn',    label: 'Tardanza' },
  danger: { variant: 'danger',  label: 'Ausente' },
  info:   { variant: 'info',    label: 'H. Extra' },
}

interface Props {
  onNavigate: (page: 'fichadas' | 'novedades' | 'empleados') => void
}

export function Dashboard({ onNavigate }: Props) {
  const { data, loading, error, reload, setData } = useQuery(async () => {
    const [novedades, empleados, registros] = await Promise.all([
      fetchNovedades(), fetchEmpleados(), fetchRegistros(),
    ])
    return { novedades, empleados, registros }
  }, [])
  const [periodo, setPeriodo] = useState('')

  async function aprobar(id: string) {
    await setNovedadEstado(id, 'aprobada')
    setData(d => ({ ...d!, novedades: d!.novedades.map(x => x.id === id ? { ...x, estado: 'aprobada' } : x) }))
  }

  const novedadesData = data?.novedades ?? []
  const empleados     = data?.empleados ?? []
  const registrosDia  = data?.registros ?? []

  const periodosSet = new Set([
    ...novedadesData.map(n => fechaToMesPeriodo(n.fecha)),
    ...registrosDia.map(r => fechaToMesPeriodo(r.fecha)),
  ])
  const periodos = Array.from(periodosSet)
    .sort((a, b) => {
      const [ma, ya] = a.split(' ')
      const [mb, yb] = b.split(' ')
      const toNum = (mes: string, anio: string) => parseInt(anio) * 12 + MESES_ES.indexOf(mes)
      return toNum(ma, ya) - toNum(mb, yb)
    })
  const mesActual = `${MESES_ES[new Date().getMonth()]} ${new Date().getFullYear()}`
  const periodoActivo = periodo || (periodos.includes(mesActual) ? mesActual : periodos[periodos.length - 1]) || ''

  // --- Parse period ---
  const [mesNombre = '', yearStr = ''] = periodoActivo.split(' ')
  const pYear  = parseInt(yearStr)  || new Date().getFullYear()
  const pMonth = MESES_ES.indexOf(mesNombre) + 1 || new Date().getMonth() + 1

  const hoyDate    = new Date()
  const esMesActual = hoyDate.getFullYear() === pYear && hoyDate.getMonth() + 1 === pMonth

  const primerDiaMes = `${pYear}-${String(pMonth).padStart(2, '0')}-01`
  const ultimoDiaMes = `${pYear}-${String(pMonth).padStart(2, '0')}-${String(new Date(pYear, pMonth, 0).getDate()).padStart(2, '0')}`

  // --- Novedades del mes ---
  const novedadesDelMes = novedadesData.filter(n => fechaToMesPeriodo(n.fecha) === periodoActivo)
  const pendientes      = novedadesDelMes.filter(n => n.estado === 'pendiente')
  const ultimasNovedades = [...novedadesDelMes].sort((a, b) => {
    const pa = a.estado === 'pendiente' ? 0 : 1
    const pb = b.estado === 'pendiente' ? 0 : 1
    return pa !== pb ? pa - pb : b.fecha.localeCompare(a.fecha)
  }).slice(0, 5)

  // --- Fichadas: last date with data in the period (today if current month) ---
  const registrosPeriodo = registrosDia.filter(r => r.fecha >= primerDiaMes && r.fecha <= ultimoDiaMes)
  const ultimaFecha = registrosPeriodo.length > 0
    ? registrosPeriodo.reduce((max, r) => r.fecha > max ? r.fecha : max, '')
    : toISO(hoyDate)
  const fechaFichadas = esMesActual ? toISO(hoyDate) : ultimaFecha

  const fichadasDia = registrosDia.filter(r => r.fecha === fechaFichadas)
  const presentes   = fichadasDia.filter(r => r.estado !== 'ausente').length
  const ausentes    = fichadasDia.filter(r => r.estado === 'ausente').length
  const anomalias   = fichadasDia.filter(r => r.estado === 'anomalia')

  // --- Días para cierre ---
  const finMes = new Date(pYear, pMonth, 0)
  const diasParaCierre = Math.max(0, Math.ceil((finMes.getTime() - hoyDate.getTime()) / (1000 * 60 * 60 * 24)))

  // --- Semana de referencia (Mon–Sat) ---
  const fechaRefDate = esMesActual
    ? hoyDate
    : new Date(pYear, pMonth - 1, new Date(pYear, pMonth, 0).getDate())

  const dow = fechaRefDate.getDay()
  const lunes = new Date(fechaRefDate)
  lunes.setDate(fechaRefDate.getDate() - (dow === 0 ? 6 : dow - 1))

  const semanaDias = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(lunes)
    d.setDate(lunes.getDate() + i)
    return toISO(d)
  })

  const semanaDiasLabel = semanaDias.map(f => {
    const d = new Date(f + 'T12:00:00')
    const esHoy = f === toISO(hoyDate)
    return `${esHoy ? 'HOY' : DIAS_ES[d.getDay()]} ${d.getDate()}/${d.getMonth() + 1}`
  })

  function getDayState(empleadoId: string, fecha: string): DayState | null {
    const reg = registrosDia.find(r => r.empleadoId === empleadoId && r.fecha === fecha)
    if (!reg) return null
    if (reg.estado === 'ausente' || reg.estado === 'ausencia_justificada') return 'danger'
    if (reg.estado === 'tardanza') return 'warn'
    if (reg.estado === 'hora_extra' || reg.estado === 'salida_anticipada' || reg.estado === 'sin_descanso') return 'info'
    return 'ok'
  }

  const empleadosActivos = empleados.filter(e => e.estado === 'activo')

  const labelFichadas = esMesActual
    ? 'Ficharon hoy'
    : `Ficharon ${fechaFichadas.split('-').reverse().slice(0, 2).join('/')}`

  return (
    <div style={{ padding: '24px 32px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 2 }}>Dashboard</div>
          <div style={{ fontSize: 13, color: '#6b6b66' }}>{periodoActivo} — Metalúrgica San Justo S.R.L.</div>
        </div>
        {!loading && !error && periodos.length > 0 && (
          <select value={periodoActivo} onChange={e => setPeriodo(e.target.value)}
            style={{ fontSize: 13, padding: '5px 10px', borderRadius: 8, border: '1px solid #d4d2ca' }}>
            {periodos.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        )}
      </div>

      {loading ? <Loading /> : error ? <ErrorBox message={error} onRetry={reload} /> : (
      <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
        <MetricCard label="Empleados activos" value={empleados.filter(e => e.estado === 'activo').length}
          sub={`${empleados.filter(e => e.estado === 'suspendido').length} suspendido${empleados.filter(e => e.estado === 'suspendido').length !== 1 ? 's' : ''}`} />
        <MetricCard label={labelFichadas} value={presentes} valueColor="success"
          sub={`${ausentes} ausente${ausentes !== 1 ? 's' : ''} sin justificar`} />
        <MetricCard label="Novedades pendientes" value={pendientes.length} valueColor="warn" sub="Requieren aprobación" />
        <MetricCard label="Días para cierre" value={diasParaCierre} valueColor="danger"
          sub={`Vence el ${String(new Date(pYear, pMonth, 0).getDate()).padStart(2,'0')}/${String(pMonth).padStart(2,'0')}`} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div style={{ background: '#fff', border: '1px solid #e2e0d8', borderRadius: 12, padding: 18 }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>Últimas novedades detectadas</div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr>
                {['Empleado', 'Tipo', 'Fecha', 'Estado', ''].map(h => (
                  <th key={h} style={{ textAlign: 'left', fontWeight: 600, fontSize: 11, color: '#888780', textTransform: 'uppercase', letterSpacing: '0.04em', paddingBottom: 8, borderBottom: '1px solid #e2e0d8' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ultimasNovedades.map(n => (
                <tr key={n.id}>
                  <td style={{ padding: '9px 0', borderBottom: '1px solid #f0ede6' }}>{n.empleadoNombre}</td>
                  <td style={{ padding: '9px 0', borderBottom: '1px solid #f0ede6' }}>{tipoLabel[n.tipo]}</td>
                  <td style={{ padding: '9px 0', borderBottom: '1px solid #f0ede6' }}>{n.fecha.slice(8)}/{n.fecha.slice(5, 7)}</td>
                  <td style={{ padding: '9px 0', borderBottom: '1px solid #f0ede6' }}>
                    <Badge variant={estadoBadge[n.estado]}>{n.estado.charAt(0).toUpperCase() + n.estado.slice(1)}</Badge>
                  </td>
                  <td style={{ padding: '9px 0', borderBottom: '1px solid #f0ede6' }}>
                    {n.estado === 'pendiente' && (
                      <Button variant="sm" onClick={() => aprobar(n.id)}>Aprobar</Button>
                    )}
                  </td>
                </tr>
              ))}
              {ultimasNovedades.length === 0 && (
                <tr><td colSpan={5} style={{ padding: '16px 0', color: '#888780', fontSize: 13 }}>Sin novedades en este período.</td></tr>
              )}
            </tbody>
          </table>
          <div style={{ marginTop: 10, textAlign: 'right' }}>
            <button onClick={() => onNavigate('novedades')} style={{ fontSize: 12, color: '#6b6b66', border: 'none', background: 'none', cursor: 'pointer' }}>Ver todas →</button>
          </div>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e2e0d8', borderRadius: 12, padding: 18 }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>Alertas del día</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              ausentes > 0 && {
                color: '#dc2626',
                text: `${ausentes} empleado${ausentes !== 1 ? 's' : ''} sin fichada de entrada`,
                time: `${fechaFichadas.split('-').reverse().slice(0,2).join('/')} — Motor de reglas`,
              },
              anomalias.length > 0 && {
                color: '#d97706',
                text: `Doble fichada detectada — ${anomalias.map(r => empleados.find(e => e.id === r.empleadoId)?.nombre ?? r.empleadoId).join(', ')}`,
                time: `${fechaFichadas.split('-').reverse().slice(0,2).join('/')} — Requiere resolución manual`,
              },
              {
                color: pendientes.length > 0 ? '#d97706' : '#22c55e',
                text: `${pendientes.length} novedades pendientes de aprobación`,
                time: 'Acumuladas del período',
              },
              diasParaCierre > 0 && {
                color: '#2563eb',
                text: `Cierre mensual en ${diasParaCierre} día${diasParaCierre !== 1 ? 's' : ''}`,
                time: `Vence el ${String(new Date(pYear, pMonth, 0).getDate()).padStart(2,'0')}/${String(pMonth).padStart(2,'0')}/${pYear}`,
              },
            ].filter(Boolean).map((a, i) => {
              const alerta = a as { color: string; text: string; time: string }
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 12px', borderRadius: 8, background: '#fafaf8', border: '1px solid #f0ede6' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: alerta.color, marginTop: 4, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 13, lineHeight: 1.4 }}>{alerta.text}</div>
                    <div style={{ fontSize: 11, color: '#888780', marginTop: 2 }}>{alerta.time}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e2e0d8', borderRadius: 12, padding: 18 }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>
          Resumen de asistencia — semana del {semanaDiasLabel[0]} al {semanaDiasLabel[5]}
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', fontWeight: 600, fontSize: 11, color: '#888780', textTransform: 'uppercase', letterSpacing: '0.04em', paddingBottom: 8, borderBottom: '1px solid #e2e0d8', paddingRight: 8 }}>Empleado</th>
                {semanaDiasLabel.map(d => (
                  <th key={d} style={{ textAlign: 'left', fontWeight: 600, fontSize: 11, color: '#888780', textTransform: 'uppercase', letterSpacing: '0.04em', paddingBottom: 8, borderBottom: '1px solid #e2e0d8', paddingRight: 8 }}>{d}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {empleadosActivos.map(emp => (
                <tr key={emp.id}>
                  <td style={{ padding: '9px 8px 9px 0', borderBottom: '1px solid #f0ede6', fontWeight: 600 }}>{emp.nombre}</td>
                  {semanaDias.map(fecha => {
                    const state = getDayState(emp.id, fecha)
                    return (
                      <td key={fecha} style={{ padding: '9px 8px 9px 0', borderBottom: '1px solid #f0ede6' }}>
                        {state
                          ? <Badge variant={dayBadge[state].variant}>{dayBadge[state].label}</Badge>
                          : <span style={{ color: '#ccc', fontSize: 12 }}>—</span>}
                      </td>
                    )
                  })}
                </tr>
              ))}
              {empleadosActivos.length === 0 && (
                <tr><td colSpan={7} style={{ padding: '16px 0', color: '#888780', fontSize: 13 }}>Sin empleados activos.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      </>
      )}
    </div>
  )
}
