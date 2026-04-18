import { useState } from 'react'
import { MetricCard } from '../../components/ui/MetricCard'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { novedades, empleados, registrosDia } from '../../data/mockData'
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
  anomalia: 'Anomalía',
}

const estadoBadge: Record<EstadoNovedad, BadgeVariant> = {
  pendiente: 'warn',
  aprobada: 'success',
  rechazada: 'danger',
  justificada: 'info',
}

const diasSemana = ['Lun 8/4', 'Mar 9/4', 'Mié 10/4', 'Jue 11/4', 'Vie 12/4', 'Hoy 14/4']

type DayState = 'ok' | 'warn' | 'danger' | 'info'

const resumenSemana: Record<string, DayState[]> = {
  'Juan Pérez':   ['ok', 'warn', 'ok', 'ok', 'ok', 'warn'],
  'Ana Martínez': ['ok', 'ok', 'danger', 'ok', 'ok', 'danger'],
  'Carlos López': ['ok', 'ok', 'ok', 'info', 'ok', 'ok'],
  'María García': ['ok', 'ok', 'ok', 'ok', 'danger', 'danger'],
}

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
  const [novedadesData, setNovedadesData] = useState(novedades)
  const pendientes = novedadesData.filter(n => n.estado === 'pendiente')
  const ultimasNovedades = [...novedadesData].sort((a, b) => b.fecha.localeCompare(a.fecha)).slice(0, 5)
  const fichadas = registrosDia.filter(r => r.fecha === '2025-04-14')
  const presentes = fichadas.filter(r => r.estado !== 'ausente').length
  const ausentes = fichadas.filter(r => r.estado === 'ausente').length

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 2 }}>Dashboard</div>
      <div style={{ fontSize: 13, color: '#6b6b66', marginBottom: 20 }}>Abril 2025 — Empresa: Metalúrgica San Justo S.R.L.</div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
        <MetricCard label="Empleados activos" value={empleados.filter(e => e.estado === 'activo').length} sub="1 suspendido" />
        <MetricCard label="Ficharon hoy" value={presentes} valueColor="success" sub={`${ausentes} ausentes sin justificar`} />
        <MetricCard label="Novedades pendientes" value={pendientes.length} valueColor="warn" sub="Requieren aprobación" />
        <MetricCard label="Días para cierre" value={16} valueColor="danger" sub="Vence el 30/04" />
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
                <tr key={n.id} style={{ cursor: 'pointer' }}>
                  <td style={{ padding: '9px 0', borderBottom: '1px solid #f0ede6' }}>{n.empleadoNombre}</td>
                  <td style={{ padding: '9px 0', borderBottom: '1px solid #f0ede6' }}>{tipoLabel[n.tipo]}</td>
                  <td style={{ padding: '9px 0', borderBottom: '1px solid #f0ede6' }}>{n.fecha.slice(8)}/{n.fecha.slice(5, 7)}</td>
                  <td style={{ padding: '9px 0', borderBottom: '1px solid #f0ede6' }}>
                    <Badge variant={estadoBadge[n.estado]}>{n.estado.charAt(0).toUpperCase() + n.estado.slice(1)}</Badge>
                  </td>
                  <td style={{ padding: '9px 0', borderBottom: '1px solid #f0ede6' }}>
                    {n.estado === 'pendiente' && (
                      <Button variant="sm" onClick={() => {
                        setNovedadesData(prev => prev.map(x => x.id === n.id ? { ...x, estado: 'aprobada' } : x))
                      }}>Aprobar</Button>
                    )}
                  </td>
                </tr>
              ))}
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
              { color: '#dc2626', text: `${ausentes} empleados sin fichada de entrada`, time: 'Hoy 09:30 — Motor de reglas' },
              { color: '#d97706', text: 'Doble fichada detectada — Ana Martínez', time: 'Hoy 08:59 — Requiere resolución manual' },
              { color: '#d97706', text: `${pendientes.length} novedades pendientes de aprobación`, time: 'Acumuladas del período' },
              { color: '#2563eb', text: 'Cierre mensual en 16 días', time: 'Vence el 30/04/2025' },
            ].map((a, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 12px', borderRadius: 8, background: '#fafaf8', border: '1px solid #f0ede6' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: a.color, marginTop: 4, flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 13, lineHeight: 1.4 }}>{a.text}</div>
                  <div style={{ fontSize: 11, color: '#888780', marginTop: 2 }}>{a.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e2e0d8', borderRadius: 12, padding: 18 }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>Resumen de asistencia — semana actual</div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', fontWeight: 600, fontSize: 11, color: '#888780', textTransform: 'uppercase', letterSpacing: '0.04em', paddingBottom: 8, borderBottom: '1px solid #e2e0d8' }}>Empleado</th>
              {diasSemana.map(d => (
                <th key={d} style={{ textAlign: 'left', fontWeight: 600, fontSize: 11, color: '#888780', textTransform: 'uppercase', letterSpacing: '0.04em', paddingBottom: 8, borderBottom: '1px solid #e2e0d8' }}>{d}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Object.entries(resumenSemana).map(([nombre, dias]) => (
              <tr key={nombre}>
                <td style={{ padding: '9px 0', borderBottom: '1px solid #f0ede6', fontWeight: 600 }}>{nombre}</td>
                {dias.map((d, i) => (
                  <td key={i} style={{ padding: '9px 4px 9px 0', borderBottom: '1px solid #f0ede6' }}>
                    <Badge variant={dayBadge[d].variant}>{dayBadge[d].label}</Badge>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
