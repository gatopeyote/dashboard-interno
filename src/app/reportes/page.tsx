// Página de reportes — Server Component.
// Carga en paralelo las métricas de clientes y los eventos de auditoría.
// Si alguna carga falla, muestra un mensaje de error en lugar de la vista.

import { obtenerMetricasClientes, obtenerEventosAuditoria } from '../../api/reportes'
import { ReportesView } from './ReportesView'

export default async function PaginaReportes() {
  // Ejecutar ambas consultas en paralelo para minimizar tiempo de respuesta
  const [resultadoMetricas, resultadoEventos] = await Promise.all([
    obtenerMetricasClientes(),
    obtenerEventosAuditoria(),
  ])

  // Si las métricas fallan, mostrar error principal
  if (!resultadoMetricas.ok) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6">
        <p className="text-sm font-medium text-red-700">
          No se pudieron cargar las métricas de clientes
        </p>
        <p className="mt-1 text-sm text-red-600">{resultadoMetricas.mensaje}</p>
      </div>
    )
  }

  // Si los eventos fallan, mostrar error (pero aún podríamos mostrar las métricas;
  // optamos por un error unificado para simplificar el flujo)
  if (!resultadoEventos.ok) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6">
        <p className="text-sm font-medium text-red-700">
          No se pudieron cargar los eventos de auditoría
        </p>
        <p className="mt-1 text-sm text-red-600">{resultadoEventos.mensaje}</p>
      </div>
    )
  }

  return (
    <ReportesView
      metricas={resultadoMetricas.datos}
      eventos={resultadoEventos.datos.eventos}
      totalEventos={resultadoEventos.datos.total}
    />
  )
}
