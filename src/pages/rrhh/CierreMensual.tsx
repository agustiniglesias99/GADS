import { useState } from 'react'
import { MetricCard } from '../../components/ui/MetricCard'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Loading, ErrorBox } from '../../components/ui/States'
import { useQuery } from '../../lib/useQuery'
import { fetchCierres, fetchResumen, fetchNovedades } from '../../lib/api'

export function CierreMensual() {
  const { data, loading, error, reload } = useQuery(async () => {
    const [cierres, resumen, novedades] = await Promise.all([
      fetchCierres(), fetchResumen(), fetchNovedades(),
    ])
    return { cierres, resumen, novedades }
  }, [])
  const [periodo, setPeriodo] = useState('Abril 2025')

  if (loading) return <div style={{ padding: '24px 32px' }}><Loading /></div>
  if (error) return <div style={{ padding: '24px 32px' }}><ErrorBox message={error} onRetry={reload} /></div>

  const cierresMensuales = data!.cierres
  const resumenEmpleados = data!.resumen
  const novedades = data!.novedades
  const cierre = cierresMensuales.find(c => c.periodo === periodo) ?? cierresMensuales[0]
  const pendientes = novedades.filter(n => n.estado === 'pendiente').length

  if (!cierre) return <div style={{ padding: '24px 32px', color: '#8f8d84', fontSize: 14 }}>No hay períodos de cierre cargados.</div>

  const cerrado = cierre.estado === 'cerrado'
  const puedeEjecutar = pendientes === 0 && !cerrado

  const pasos = [
    { label: 'Revisar fichadas del período', sub: 'Completado — sin anomalías sin resolver', done: true },
    { label: 'Validar novedades automáticas', sub: `Completado — ${cierre.novedadesAprobadas} aprobadas`, done: true },
    { label: 'Resolver pendientes', sub: pendientes > 0 ? `${pendientes} novedades requieren acción` : 'Completado', done: pendientes === 0 },
    { label: 'Generar resumen', sub: pendientes > 0 ? 'Bloqueado hasta paso 3' : 'Listo para ejecutar', done: pendientes === 0 },
    { label: 'Ejecutar cierre y exportar', sub: puedeEjecutar ? 'Disponible' : 'Bloqueado hasta paso 4', done: cerrado },
  ]

  function handleExportCSV() {
    const headers = ['Legajo', 'Empleado', 'DNI', 'CUIL', 'Días trabajados', 'Aus. just.', 'Aus. injust.', 'Tardanzas (min)', 'H. extra 50% (min)', 'H. extra 100% (min)', 'Licencias', 'Vacaciones']
    const rows = resumenEmpleados.map(r => [
      r.legajo, r.nombre, r.dni, r.cuil,
      r.diasTrabajados, r.ausenciasJustificadas, r.ausenciasInjustificadas,
      r.tardanzasMin, r.horasExtra50, r.horasExtra100, r.licencias, r.vacaciones,
    ])
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `novedades_${periodo.replace(' ', '_')}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div style={{ padding: '24px 32px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 600 }}>Cierre mensual</div>
          <div style={{ fontSize: 13, color: '#6b6b66', marginTop: 2 }}>{periodo} — Metalúrgica San Justo S.R.L.</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <select value={periodo} onChange={e => setPeriodo(e.target.value)}
            style={{ fontSize: 13, padding: '5px 10px', borderRadius: 8, border: '1px solid #d4d2ca' }}>
            {cierresMensuales.map(c => <option key={c.id} value={c.periodo}>{c.periodo}</option>)}
          </select>
        </div>
      </div>

      {pendientes > 0 && !cerrado && (
        <div style={{ background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: 10, padding: '12px 14px', marginBottom: 16, fontSize: 13, color: '#92400e', display: 'flex', gap: 10 }}>
          <span style={{ fontSize: 16 }}>⚠</span>
          <div>
            <div style={{ fontWeight: 600 }}>Hay {pendientes} novedades pendientes de aprobación</div>
            <div style={{ fontSize: 12, marginTop: 2 }}>No podés ejecutar el cierre hasta resolver todas las novedades pendientes.</div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 16, alignItems: 'start' }}>
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 16 }}>
            <MetricCard label="Empleados en período" value={cierre.totalEmpleados} sub={`activos en ${periodo.split(' ')[0].toLowerCase()}`} />
            <MetricCard label="Novedades aprobadas" value={cierre.novedadesAprobadas} sub="listas para exportar" valueColor="success" />
            <MetricCard label="Pendientes" value={pendientes} sub="bloquean el cierre" valueColor={pendientes > 0 ? 'danger' : 'success'} />
            <MetricCard label="Días laborables" value={22} sub="en el período" />
          </div>

          <div style={{ background: '#fff', border: '1px solid #e2e0d8', borderRadius: 12, padding: 18, marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>Resumen por empleado — preliquidación</div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr>
                  {['Empleado', 'Días trab.', 'Aus. just.', 'Aus. injust.', 'Tardanzas', 'H. extra 50%', 'H. extra 100%', 'Estado', ''].map(h => (
                    <th key={h} style={{ textAlign: 'left', fontWeight: 600, fontSize: 11, color: '#888780', textTransform: 'uppercase', letterSpacing: '0.04em', paddingBottom: 8, borderBottom: '1px solid #e2e0d8', paddingRight: 8 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {resumenEmpleados.map(r => (
                  <tr key={r.empleadoId}>
                    <td style={{ padding: '8px 8px 8px 0', borderBottom: '1px solid #f0ede6', fontWeight: 600 }}>{r.nombre}</td>
                    <td style={{ padding: '8px 8px 8px 0', borderBottom: '1px solid #f0ede6' }}>{r.diasTrabajados}</td>
                    <td style={{ padding: '8px 8px 8px 0', borderBottom: '1px solid #f0ede6' }}>{r.ausenciasJustificadas || '—'}</td>
                    <td style={{ padding: '8px 8px 8px 0', borderBottom: '1px solid #f0ede6' }}>{r.ausenciasInjustificadas || '—'}</td>
                    <td style={{ padding: '8px 8px 8px 0', borderBottom: '1px solid #f0ede6' }}>{r.tardanzasMin ? `${r.tardanzasMin} min` : '—'}</td>
                    <td style={{ padding: '8px 8px 8px 0', borderBottom: '1px solid #f0ede6' }}>{r.horasExtra50 ? `${Math.floor(r.horasExtra50 / 60)}h ${r.horasExtra50 % 60}m` : '—'}</td>
                    <td style={{ padding: '8px 8px 8px 0', borderBottom: '1px solid #f0ede6' }}>{r.horasExtra100 ? `${Math.floor(r.horasExtra100 / 60)}h ${r.horasExtra100 % 60}m` : '—'}</td>
                    <td style={{ padding: '8px 8px 8px 0', borderBottom: '1px solid #f0ede6' }}>
                      <Badge variant={r.estado === 'listo' ? 'success' : 'warn'}>{r.estado === 'listo' ? 'Listo' : 'Pendiente'}</Badge>
                    </td>
                    <td style={{ padding: '8px 0', borderBottom: '1px solid #f0ede6' }}>
                      <Button variant="sm">Ver</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ background: '#fff', border: '1px solid #e2e0d8', borderRadius: 12, padding: 18 }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Exportar al contador</div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ fontSize: 13, color: '#6b6b66', flex: 1 }}>
                {puedeEjecutar ? 'Resumen listo para exportar.' : 'Deshabilitado hasta resolver todas las novedades pendientes.'}
              </div>
              <Button disabled={!puedeEjecutar} onClick={handleExportCSV}>Exportar CSV</Button>
              <Button disabled={!puedeEjecutar}>Exportar Excel</Button>
              <Button disabled={!puedeEjecutar}>Exportar PDF</Button>
            </div>
            {!puedeEjecutar && <div style={{ fontSize: 11, color: '#888780', marginTop: 8 }}>Resolvé las novedades pendientes para habilitar la exportación</div>}
          </div>
        </div>

        <div>
          <div style={{ background: '#fff', border: '1px solid #e2e0d8', borderRadius: 12, padding: 18, marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Pasos del cierre</div>
            {pasos.map((p, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 12px', borderRadius: 8, marginBottom: 8,
                background: p.done ? '#f0fdf4' : i === 2 && !pasos[1].done ? '#fef9e7' : '#fafaf8',
              }}>
                <div style={{
                  width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 600, flexShrink: 0, color: '#fff',
                  background: p.done ? '#15803d' : i <= 2 ? '#d97706' : '#d4d2ca',
                }}>
                  {p.done ? '✓' : i + 1}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{p.label}</div>
                  <div style={{ fontSize: 12, color: '#6b6b66', marginTop: 2 }}>{p.sub}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ background: '#fff', border: '1px solid #e2e0d8', borderRadius: 12, padding: 18, marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Historial de cierres</div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr>
                  {['Período', 'Fecha', 'Estado'].map(h => (
                    <th key={h} style={{ textAlign: 'left', fontWeight: 600, fontSize: 11, color: '#888780', textTransform: 'uppercase', letterSpacing: '0.04em', paddingBottom: 8, borderBottom: '1px solid #e2e0d8', paddingRight: 8 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {cierresMensuales.filter(c => c.estado === 'cerrado').map(c => (
                  <tr key={c.id}>
                    <td style={{ padding: '7px 8px 7px 0', borderBottom: '1px solid #f0ede6' }}>{c.periodo}</td>
                    <td style={{ padding: '7px 8px 7px 0', borderBottom: '1px solid #f0ede6' }}>{c.fechaCierre}</td>
                    <td style={{ padding: '7px 0', borderBottom: '1px solid #f0ede6' }}>
                      <Badge variant="success">Cerrado</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Button variant="primary" disabled={!puedeEjecutar} style={{ width: '100%', padding: '10px', fontSize: 13 }}>
            Ejecutar cierre de {periodo}
          </Button>
          <div style={{ fontSize: 11, color: '#888780', textAlign: 'center', marginTop: 6 }}>
            {puedeEjecutar ? 'Todos los pasos completos' : 'Disponible cuando todos los pasos estén completos'}
          </div>
        </div>
      </div>
    </div>
  )
}
