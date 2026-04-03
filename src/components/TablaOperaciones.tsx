// Tabla de operaciones con paginación de 20 filas por página.
// Muestra nombre, estado (usando IndicadorEstadoOperacion) y fecha de cada operación.
// Maneja estados: cargando (skeleton), vacío y error.

import { useEffect, useState } from 'react'

import { formatearFechaHora } from '../lib/formato'
import type { EstadoOperacion, RegistroOperacion } from '../types'
import { IndicadorEstadoOperacion } from './IndicadorEstadoOperacion'

// ---------------------------------------------------------------------------
// Constantes
// ---------------------------------------------------------------------------

/** Número de operaciones mostradas por página. */
const FILAS_POR_PAGINA = 20

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

interface TablaOperacionesProps {
  /** Lista de operaciones a mostrar. */
  operaciones: RegistroOperacion[]
  /** Indica si los datos se están cargando. */
  cargando: boolean
  /** Mensaje de error si la carga falló; null si no hay error. */
  error: string | null
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Convierte el campo `estado` (string genérico de Airtable) a EstadoOperacion
 * con fallback a 'error' para valores no reconocidos.
 */
const normalizarEstado = (estado: string): EstadoOperacion => {
  const validos: EstadoOperacion[] = ['pendiente', 'completada', 'error']
  return validos.includes(estado as EstadoOperacion)
    ? (estado as EstadoOperacion)
    : 'error'
}

// ---------------------------------------------------------------------------
// Sub-componente: skeleton de carga
// ---------------------------------------------------------------------------

function EsqueletoCarga() {
  return (
    <div
      className="rounded-lg border border-gray-200 bg-white"
      aria-busy="true"
      aria-label="Cargando operaciones"
    >
      <div className="p-4">
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex gap-4">
              <div className="h-4 w-2/5 animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-1/5 animate-pulse rounded bg-gray-200" />
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
        {' operaciones'}
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

export function TablaOperaciones({ operaciones, cargando, error }: TablaOperacionesProps) {
  const [paginaActual, setPaginaActual] = useState(1)

  // Reiniciar a la primera página cuando cambia el conjunto de operaciones (ej: al cambiar filtro)
  useEffect(() => {
    setPaginaActual(1)
  }, [operaciones])

  // --- Estado: cargando ---
  if (cargando) {
    return <EsqueletoCarga />
  }

  // --- Estado: error ---
  if (error !== null) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-sm font-medium text-red-700">
          No se pudieron cargar las operaciones
        </p>
        <p className="mt-1 text-sm text-red-600">{error}</p>
      </div>
    )
  }

  // --- Estado: sin datos ---
  if (operaciones.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
        <p className="text-sm font-medium text-gray-900">Sin operaciones registradas</p>
        <p className="mt-1 text-sm text-gray-500">
          No hay operaciones que coincidan con el filtro seleccionado.
        </p>
      </div>
    )
  }

  // --- Paginación ---
  const totalPaginas = Math.ceil(operaciones.length / FILAS_POR_PAGINA)
  const operacionesPagina = operaciones.slice(
    (paginaActual - 1) * FILAS_POR_PAGINA,
    paginaActual * FILAS_POR_PAGINA,
  )

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          {/* Encabezados de columnas */}
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                Nombre
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                Estado
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                Fecha
              </th>
            </tr>
          </thead>

          {/* Filas de datos */}
          <tbody className="divide-y divide-gray-200 bg-white">
            {operacionesPagina.map((op) => (
              <tr key={op.id} className="hover:bg-gray-50">
                {/* Nombre de la operación */}
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  {op.nombre}
                </td>

                {/* Estado visual usando IndicadorEstadoOperacion */}
                <td className="whitespace-nowrap px-6 py-4 text-sm">
                  <IndicadorEstadoOperacion estado={normalizarEstado(op.estado)} />
                </td>

                {/* Fecha formateada en español */}
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  {formatearFechaHora(op.fecha)}
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
          totalRegistros={operaciones.length}
          onCambiarPagina={setPaginaActual}
        />
      )}
    </div>
  )
}
