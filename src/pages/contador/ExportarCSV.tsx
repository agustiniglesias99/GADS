import { useState } from 'react'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { MetricCard } from '../../components/ui/MetricCard'
import { Loading, ErrorBox } from '../../components/ui/States'
import { useQuery } from '../../lib/useQuery'
import { fetchResumen, fetchNovedades } from '../../lib/api'
import type { TipoNovedad, ResumenEmpleado, Novedad } from '../../types'

const tipoLabel: Record<TipoNovedad, string> = {
  tardanza: 'Tardanza',
  ausencia_injustificada: 'Ausencia injustificada',
  ausencia_justificada: 'Ausencia justificada',
  hora_extra_50: 'Hora extra 50%',
  hora_extra_100: 'Hora extra 100%',
  licencia: 'Licencia',
  vacaciones: 'Vacaciones',
  salida_anticipada: 'Salida anticipada',
  sin_descanso: 'Sin descanso',
}

export function ExportarCSV() {
  const { data, loading, error, reload } = useQuery(async () => {
    const [resumen, novedades] = await Promise.all([fetchResumen(), fetchNovedades()])
    return { resumen, novedades: novedades.filter(n => n.estado === 'aprobada') }
  }, [])

  const [fechaDesde, setFechaDesde] = useState('2025-04-01')
  const [fechaHasta, setFechaHasta] = useState('2025-04-30')
  const [filtered, setFiltered] = useState<ResumenEmpleado[]>([])
  const [novedadesFiltradas, setNovedadesFiltradas] = useState<Novedad[]>([])
  const [hasSearched, setHasSearched] = useState(false)

  function handleFilter() {
    const resumen = data?.resumen ?? []
    const novsFiltradas = (data?.novedades ?? []).filter(n => n.fecha >= fechaDesde && n.fecha <= fechaHasta)
    setNovedadesFiltradas(novsFiltradas)
    const empleadosConNovedad = new Set(novsFiltradas.map(n => n.empleadoId))
    setFiltered(resumen.filter(r => empleadosConNovedad.has(r.empleadoId) || r.diasTrabajados > 0))
    setHasSearched(true)
  }

  function handleDownload() {
    const headers = [
      'Legajo', 'Empleado', 'DNI', 'CUIL', 'Período',
      'Días trabajados', 'Ausencias justificadas', 'Ausencias injustificadas',
      'Tardanzas (min)', 'Horas extra 50% (min)', 'Horas extra 100% (min)',
      'Licencias', 'Vacaciones',
    ]
    const rows = filtered.map(r => [
      r.legajo, r.nombre, r.dni, r.cuil,
      `${fechaDesde} / ${fechaHasta}`,
      r.diasTrabajados, r.ausenciasJustificadas, r.ausenciasInjustificadas,
      r.tardanzasMin, r.horasExtra50, r.horasExtra100, r.licencias, r.vacaciones,
    ])
    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `novedades_${fechaDesde}_${fechaHasta}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleDownloadDetalle() {
    const headers = ['Legajo', 'Empleado', 'Fecha', 'Tipo', 'Detalle', 'Origen', 'Estado']
    const rows = novedadesFiltradas.map(n => {
      const emp = (data?.resumen ?? []).find(r => r.empleadoId === n.empleadoId)
      return [emp?.legajo ?? '', n.empleadoNombre, n.fecha, tipoLabel[n.tipo], n.detalle, n.origen, n.estado]
    })
    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `novedades_detalle_${fechaDesde}_${fechaHasta}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) return <div style={{ padding: '24px 32px' }}><Loading /></div>
  if (error) return <div style={{ padding: '24px 32px' }}><ErrorBox message={error} onRetry={reload} /></div>

  return (
    <div style={{ padding: '24px 32px' }}>
      <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 2 }}>Exportar liquidación</div>
      <div style={{ fontSize: 13, color: '#6b6b66', marginBottom: 20 }}>Descargá el archivo CSV de novedades para armar la liquidación salarial</div>

      <div style={{ background: '#fff', border: '1px solid #e2e0d8', borderRadius: 12, padding: 24, marginBottom: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Filtrar período</div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          {[['Fecha desde', fechaDesde, setFechaDesde] as const, ['Fecha hasta', fechaHasta, setFechaHasta] as const].map(([label, value, setter]) => (
            <div key={label}>
              <label style={{ fontSize: 12, color: '#6b6b66', display: 'block', marginBottom: 6 }}>{label}</label>
              <input type="date" value={value} onChange={e => setter(e.target.value)}
                style={{ fontSize: 13, padding: '7px 10px', borderRadius: 8, border: '1px solid #d4d2ca' }} />
            </div>
          ))}
          <Button variant="primary" onClick={handleFilter}>Filtrar</Button>
        </div>
      </div>

      {hasSearched && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 16 }}>
            <MetricCard label="Empleados" value={filtered.length} sub="en el período" />
            <MetricCard label="Novedades" value={novedadesFiltradas.length} sub="aprobadas" valueColor="success" />
            <div className="metric" style={{ position: 'relative', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '15px 16px 15px 18px', boxShadow: 'var(--shadow-xs)' }}>
              <span style={{ position: 'absolute', left: 0, top: 12, bottom: 12, width: 3, borderRadius: 3, background: '#cfccc2' }} />
              <div style={{ fontSize: 11, color: '#8f8d84', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8, fontWeight: 600 }}>Período</div>
              <div style={{ fontSize: 15, fontWeight: 700, marginTop: 4 }}>{fechaDesde} / {fechaHasta}</div>
            </div>
          </div>

          <div style={{ background: '#fff', border: '1px solid #e2e0d8', borderRadius: 12, padding: 18, marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>Vista previa — resumen por empleado</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <Button onClick={handleDownloadDetalle}>Descargar detalle de novedades</Button>
                <Button variant="primary" onClick={handleDownload}>Descargar resumen CSV</Button>
              </div>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr>
                    {['Legajo', 'Empleado', 'Días trab.', 'Aus. just.', 'Aus. injust.', 'Tardanzas', 'H. extra 50%', 'H. extra 100%'].map(h => (
                      <th key={h} style={{ textAlign: 'left', fontWeight: 600, fontSize: 11, color: '#888780', textTransform: 'uppercase', letterSpacing: '0.04em', paddingBottom: 8, borderBottom: '1px solid #e2e0d8', paddingRight: 10, whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(r => (
                    <tr key={r.empleadoId}>
                      <td style={{ padding: '8px 10px 8px 0', borderBottom: '1px solid #f0ede6', color: '#6b6b66' }}>#{r.legajo}</td>
                      <td style={{ padding: '8px 10px 8px 0', borderBottom: '1px solid #f0ede6', fontWeight: 600 }}>{r.nombre}</td>
                      <td style={{ padding: '8px 10px 8px 0', borderBottom: '1px solid #f0ede6' }}>{r.diasTrabajados}</td>
                      <td style={{ padding: '8px 10px 8px 0', borderBottom: '1px solid #f0ede6' }}>{r.ausenciasJustificadas || '—'}</td>
                      <td style={{ padding: '8px 10px 8px 0', borderBottom: '1px solid #f0ede6' }}>{r.ausenciasInjustificadas || '—'}</td>
                      <td style={{ padding: '8px 10px 8px 0', borderBottom: '1px solid #f0ede6' }}>{r.tardanzasMin ? `${r.tardanzasMin} min` : '—'}</td>
                      <td style={{ padding: '8px 10px 8px 0', borderBottom: '1px solid #f0ede6' }}>{r.horasExtra50 ? `${r.horasExtra50} min` : '—'}</td>
                      <td style={{ padding: '8px 0', borderBottom: '1px solid #f0ede6' }}>{r.horasExtra100 ? `${r.horasExtra100} min` : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ fontSize: 11, color: '#888780', marginTop: 10, borderLeft: '2px solid #e2e0d8', paddingLeft: 8 }}>
              Este archivo solo incluye novedades aprobadas. Las pendientes no se exportan hasta su aprobación por RRHH.
            </div>
          </div>

          <div style={{ background: '#fff', border: '1px solid #e2e0d8', borderRadius: 12, padding: 18 }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>Detalle de novedades del período</div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr>
                  {['Empleado', 'Fecha', 'Tipo', 'Detalle', 'Estado'].map(h => (
                    <th key={h} style={{ textAlign: 'left', fontWeight: 600, fontSize: 11, color: '#888780', textTransform: 'uppercase', letterSpacing: '0.04em', paddingBottom: 8, borderBottom: '1px solid #e2e0d8', paddingRight: 10 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {novedadesFiltradas.map(n => (
                  <tr key={n.id}>
                    <td style={{ padding: '7px 10px 7px 0', borderBottom: '1px solid #f0ede6', fontWeight: 500 }}>{n.empleadoNombre}</td>
                    <td style={{ padding: '7px 10px 7px 0', borderBottom: '1px solid #f0ede6' }}>{n.fecha.split('-').reverse().join('/')}</td>
                    <td style={{ padding: '7px 10px 7px 0', borderBottom: '1px solid #f0ede6' }}>{tipoLabel[n.tipo]}</td>
                    <td style={{ padding: '7px 10px 7px 0', borderBottom: '1px solid #f0ede6', color: '#6b6b66' }}>{n.detalle}</td>
                    <td style={{ padding: '7px 0', borderBottom: '1px solid #f0ede6' }}>
                      <Badge variant="success">Aprobada</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {!hasSearched && (
        <div style={{ background: '#fff', border: '1px solid #e2e0d8', borderRadius: 12, padding: 40, textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>📊</div>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>Seleccioná un período y presioná Filtrar</div>
          <div style={{ fontSize: 13, color: '#6b6b66' }}>Se mostrará la vista previa y podrás descargar el CSV para liquidación</div>
        </div>
      )}
    </div>
  )
}
