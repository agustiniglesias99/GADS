import { useState } from 'react'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Loading, ErrorBox } from '../../components/ui/States'
import { useQuery } from '../../lib/useQuery'
import { fetchEmpleados } from '../../lib/api'
import type { BadgeVariant } from '../../types'

const estadoBadge: Record<string, BadgeVariant> = {
  activo: 'success',
  suspendido: 'warn',
  inactivo: 'gray',
}

interface Props {
  onSelectEmpleado: (id: string) => void
}

export function Empleados({ onSelectEmpleado }: Props) {
  const { data, loading, error, reload } = useQuery(fetchEmpleados, [])
  const empleados = data ?? []
  const [search, setSearch] = useState('')
  const [filterEstado, setFilterEstado] = useState('todos')

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
        <Button variant="primary">+ Nuevo empleado</Button>
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
    </div>
  )
}
