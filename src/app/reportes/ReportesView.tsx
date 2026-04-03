'use client'

// Vista de reportes: componente cliente que organiza métricas, gráfica y auditoría.
// Recibe los datos precargados por el Server Component padre.
// No realiza llamadas de red propias; toda la carga se hizo en el servidor.

import { ExportarReporte } from '../../components/ExportarReporte'
import { PanelResumen } from '../../components/PanelResumen'

import type { EventoAuditoria, MetricasClientes, ResumenDiario } from '../../types'

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

interface ReportesViewProps {
  /** Métricas de clientes cargadas por el servidor. */
  metricas: MetricasClientes
  /** Eventos de auditoría cargados por el servidor. */
  eventos: EventoAuditoria[]
  /** Total de eventos disponibles (para mostrar cuántos hay en total). */
  totalEventos: number
}

// ---------------------------------------------------------------------------
// Sub-componente: gráfica de barras SVG de métricas
// ---------------------------------------------------------------------------

interface GraficaMetricasProps {
  activos: number
  inactivos: number
  pendientes: number
}

function GraficaMetricas({ activos, inactivos, pendientes }: GraficaMetricasProps) {
  const total = activos + inactivos + pendientes

  // Evitar división por cero cuando no hay datos
  const pctActivos    = total > 0 ? Math.round((activos    / total) * 100) : 0
  const pctInactivos  = total > 0 ? Math.round((inactivos  / total) * 100) : 0
  const pctPendientes = total > 0 ? Math.round((pendientes / total) * 100) : 0

  /** Ancho de barra proporcional al porcentaje sobre 300px máximo. */
  const ancho = (pct: number) => Math.max(pct * 3, pct > 0 ? 4 : 0)

  const barras = [
    { etiqueta: 'Activos',    valor: activos,    pct: pctActivos,    color: 'bg-green-500',  texto: 'text-green-700' },
    { etiqueta: 'Inactivos',  valor: inactivos,  pct: pctInactivos,  color: 'bg-red-400',    texto: 'text-red-700' },
    { etiqueta: 'Pendientes', valor: pendientes, pct: pctPendientes, color: 'bg-yellow-400', texto: 'text-yellow-700' },
  ]

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-base font-semibold text-gray-900">
        Distribución de clientes por estado
      </h2>

      {total === 0 ? (
        <p className="text-sm text-gray-500">Sin datos de clientes disponibles.</p>
      ) : (
        <div className="space-y-4">
          {barras.map(({ etiqueta, valor, pct, color, texto }) => (
            <div key={etiqueta} className="space-y-1">
              {/* Etiqueta con valor y porcentaje */}
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-gray-700">{etiqueta}</span>
                <span className={`font-semibold ${texto}`}>
                  {valor} ({pct}%)
                </span>
              </div>

              {/* Barra proporcional */}
              <div className="h-3 w-full overflow-hidden rounded-full bg-gray-100">
                <div
                  className={`h-3 rounded-full transition-all duration-500 ${color}`}
                  style={{ width: `${ancho(pct)}px`, maxWidth: '100%' }}
                  role="progressbar"
                  aria-valuenow={pct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${etiqueta}: ${pct}%`}
                />
              </div>
            </div>
          ))}

          {/* Total al pie */}
          <p className="pt-2 text-right text-xs text-gray-400">
            Total: <span className="font-medium text-gray-600">{total} clientes</span>
          </p>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Sub-componente: tabla de auditoría
// ---------------------------------------------------------------------------

interface TablaAuditoriaLocalProps {
  eventos: EventoAuditoria[]
  totalEventos: number
}

function TablaAuditoriaLocal({ eventos, totalEventos }: TablaAuditoriaLocalProps) {
  const formatearFecha = (iso: string): string =>
    new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(iso))

  if (eventos.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
        <p className="text-sm font-medium text-gray-900">Sin eventos de auditoría</p>
        <p className="mt-1 text-sm text-gray-500">
          No se han registrado acciones en el sistema todavía.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {['Usuario', 'Acción', 'Tabla', 'Registro', 'Fecha'].map((col) => (
                <th
                  key={col}
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {eventos.map((evento) => (
              <tr key={evento.id} className="hover:bg-gray-50">
                <td className="whitespace-nowrap px-6 py-4 text-xs font-mono text-gray-500">
                  {evento.usuario_id.slice(0, 8)}…
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 capitalize">
                  {evento.accion}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  {evento.tabla}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-xs font-mono text-gray-400">
                  {evento.registro_id.slice(0, 8)}…
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  {formatearFecha(evento.timestamp)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pie con total */}
      {totalEventos > eventos.length && (
        <div className="border-t border-gray-200 bg-white px-6 py-3">
          <p className="text-xs text-gray-500">
            Mostrando <span className="font-medium">{eventos.length}</span> de{' '}
            <span className="font-medium">{totalEventos}</span> eventos
          </p>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Componente principal
// ---------------------------------------------------------------------------

export function ReportesView({ metricas, eventos, totalEventos }: ReportesViewProps) {
  // Construir el ResumenDiario a partir de MetricasClientes para PanelResumen
  const resumenDiario: ResumenDiario = {
    fecha: metricas.actualizadoEn.slice(0, 10),
    totalClientesActivos: metricas.totalActivos,
    // PanelResumen muestra usuarios activos; se fija en 0 porque reportes.ts
    // solo devuelve métricas de clientes. Si se necesita el dato real,
    // añadir obtenerUsuarios al Promise.all de la page.
    totalUsuariosActivos: 0,
    operacionesDelDia: 0,
    actualizadoEn: metricas.actualizadoEn,
  }

  // Preparar los datos de auditoría para la exportación CSV
  const datosExportacion = eventos.map((e) => ({
    usuario_id:  e.usuario_id,
    accion:      e.accion,
    tabla:       e.tabla,
    registro_id: e.registro_id,
    timestamp:   e.timestamp,
  }))

  return (
    <div className="space-y-8">
      {/* Cabecera de página */}
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Reportes</h1>
        <p className="mt-1 text-sm text-gray-500">
          Métricas de clientes, distribución por estado y registro de auditoría.
        </p>
      </div>

      {/* Sección 1: Panel de resumen diario */}
      <section aria-labelledby="titulo-resumen">
        <h2 id="titulo-resumen" className="mb-4 text-base font-semibold text-gray-900">
          Resumen del día
        </h2>
        <PanelResumen
          resumen={resumenDiario}
          cargando={false}
          error={null}
        />
      </section>

      {/* Sección 2: Gráfica de distribución de estados */}
      <section aria-labelledby="titulo-grafica">
        <h2 id="titulo-grafica" className="mb-4 text-base font-semibold text-gray-900">
          Distribución de clientes
        </h2>
        <GraficaMetricas
          activos={metricas.totalActivos}
          inactivos={metricas.totalInactivos}
          pendientes={metricas.totalPendientes}
        />
      </section>

      {/* Sección 3: Tabla de auditoría + botón de exportación */}
      <section aria-labelledby="titulo-auditoria">
        <div className="mb-4 flex items-center justify-between">
          <h2 id="titulo-auditoria" className="text-base font-semibold text-gray-900">
            Registro de auditoría
          </h2>

          {/* Exportar como CSV */}
          <ExportarReporte
            nombreReporte="auditoria"
            datos={datosExportacion}
            deshabilitado={eventos.length === 0}
          />
        </div>

        <TablaAuditoriaLocal
          eventos={eventos}
          totalEventos={totalEventos}
        />
      </section>
    </div>
  )
}
