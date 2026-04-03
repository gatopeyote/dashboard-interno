// Tabla de eventos de auditoría con paginación de 20 filas por página.
// Formatea fechas en español con Intl y trunca el usuario_id para legibilidad.
// Maneja estados: cargando (skeleton), vacío y error.

import { useState } from 'react'

import type { EventoAuditoria } from '../types'

// ---------------------------------------------------------------------------
// Constantes
// ---------------------------------------------------------------------------

/** Número de eventos mostrados por página. */
const FILAS_POR_PAGINA = 20

/** Número de caracteres visibles del usuario_id antes del truncado. */
const LONGITUD_ID = 8

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

interface TablaAuditoriaProps {
  /** Lista de eventos de auditoría a mostrar. */
  eventos: EventoAuditoria[]
  /** Indica si los datos se están cargando. */
  cargando: boolean
  /** Mensaje de error si la carga falló; null si no hay error. */
  error: string | null
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Formateador de fecha y hora en español (España). */
const formatearFechaHora = (iso: string): string => {
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))
}

/** Trunca un UUID a los primeros N caracteres seguido de puntos suspensivos. */
const truncarId = (id: string): string => {
  if (id.length <= LONGITUD_ID) return id
  return `${id.slice(0, LONGITUD_ID)}…`
}

// ---------------------------------------------------------------------------
// Sub-componente: skeleton de carga
// ---------------------------------------------------------------------------

function EsqueletoCarga() {
  return (
    <div
      className="rounded-lg border border-gray-200 bg-white"
      aria-busy="true"
      aria-label="Cargando eventos de auditoría"
    >
      <div className="p-4">
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex gap-4">
              <div className="h-4 w-1/5 animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-1/5 animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-1/6 animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-1/4 animate-pulse rounded bg-gray-200" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Sub-componente: controles de paginación
// ---------------------------------------------------------------------------

interface ControlPaginacionProps {
  paginaActual: number
  totalPaginas: number
  totalRegistros: number
  onCambiarPagina: (pagina: number) => void
}

function ControlPaginacion({
  paginaActual,
  totalPaginas,
  totalRegistros,
  onCambiarPagina,
}: ControlPaginacionProps) {
  const inicio = (paginaActual - 1) * FILAS_POR_PAGINA + 1
  const fin = Math.min(paginaActual * FILAS_POR_PAGINA, totalRegistros)

  return (
    <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
      {/* Información de registros visibles */}
      <p className="text-sm text-gray-700">
        Mostrando{' '}
        <span className="font-medium">{inicio}</span>
        {' – '}
        <span className="font-medium">{fin}</span>
        {' de '}
        <span className="font-medium">{totalRegistros}</span>
        {' eventos'}
      </p>

      {/* Botones de navegación */}
      <div className="flex gap-2">
        <button
          onClick={() => onCambiarPagina(paginaActual - 1)}
          disabled={paginaActual === 1}
          className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Anterior
        </button>
        <button
          onClick={() => onCambiarPagina(paginaActual + 1)}
          disabled={paginaActual === totalPaginas}
          className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Siguiente
        </button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Componente principal
// ---------------------------------------------------------------------------

export function TablaAuditoria({ eventos, cargando, error }: TablaAuditoriaProps) {
  const [paginaActual, setPaginaActual] = useState(1)

  // --- Estado: cargando ---
  if (cargando) {
    return <EsqueletoCarga />
  }

  // --- Estado: error ---
  if (error !== null) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-sm font-medium text-red-700">
          No se pudieron cargar los eventos de auditoría
        </p>
        <p className="mt-1 text-sm text-red-600">{error}</p>
      </div>
    )
  }

  // --- Estado: sin datos ---
  if (eventos.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
        <p className="text-sm font-medium text-gray-900">Sin eventos registrados</p>
        <p className="mt-1 text-sm text-gray-500">
          No hay actividad de auditoría para el período seleccionado.
        </p>
      </div>
    )
  }

  // --- Paginación ---
  const totalPaginas = Math.ceil(eventos.length / FILAS_POR_PAGINA)
  const eventosPagina = eventos.slice(
    (paginaActual - 1) * FILAS_POR_PAGINA,
    paginaActual * FILAS_POR_PAGINA,
  )

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          {/* Encabezados */}
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                Acción
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                Tabla
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                Usuario ID
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                Fecha y hora
              </th>
            </tr>
          </thead>

          {/* Filas */}
          <tbody className="divide-y divide-gray-200 bg-white">
            {eventosPagina.map((evento) => (
              <tr key={evento.id} className="hover:bg-gray-50">
                {/* Acción: badge con capitalización */}
                <td className="whitespace-nowrap px-6 py-4 text-sm">
                  <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-600/20">
                    {evento.accion}
                  </span>
                </td>

                {/* Tabla afectada */}
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                  {evento.tabla}
                </td>

                {/* Usuario ID truncado con title para ver el completo */}
                <td className="whitespace-nowrap px-6 py-4 text-sm">
                  <span
                    className="font-mono text-xs text-gray-500"
                    title={evento.usuario_id}
                  >
                    {truncarId(evento.usuario_id)}
                  </span>
                </td>

                {/* Fecha y hora formateada en español */}
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  {formatearFechaHora(evento.timestamp)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginación: solo se muestra cuando hay más de una página */}
      {totalPaginas > 1 && (
        <ControlPaginacion
          paginaActual={paginaActual}
          totalPaginas={totalPaginas}
          totalRegistros={eventos.length}
          onCambiarPagina={setPaginaActual}
        />
      )}
    </div>
  )
}
