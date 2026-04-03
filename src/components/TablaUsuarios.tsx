// Tabla paginada de usuarios con manejo de estados: carga, vacío y error.
// La paginación se activa automáticamente con más de 20 registros.
// No realiza llamadas a la base de datos; recibe todos los datos por props.

import { useState } from 'react'

import type { Usuario } from '../types'
import { IndicadorRol } from './IndicadorRol'

// ---------------------------------------------------------------------------
// Constantes
// ---------------------------------------------------------------------------

/** Número de filas mostradas por página. */
const FILAS_POR_PAGINA = 20

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

interface TablaUsuariosProps {
  /** Lista completa de usuarios a mostrar. */
  usuarios: Usuario[]
  /** Indica si los datos se están cargando. */
  cargando: boolean
  /** Mensaje de error si la carga falló; null si no hay error. */
  error: string | null
  /** Callback invocado al pulsar "Editar rol" en una fila. */
  onEditarRol: (usuario: Usuario) => void
  /** Callback invocado al pulsar "Desactivar" en una fila. */
  onDesactivar: (id: string) => void
}

// ---------------------------------------------------------------------------
// Sub-componente: esqueleto de carga
// ---------------------------------------------------------------------------

function EsqueletoCarga() {
  return (
    <div className="space-y-3 p-6" aria-busy="true" aria-label="Cargando usuarios">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-10 w-full animate-pulse rounded-md bg-gray-200" />
      ))}
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
        {' usuarios'}
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

export function TablaUsuarios({
  usuarios,
  cargando,
  error,
  onEditarRol,
  onDesactivar,
}: TablaUsuariosProps) {
  const [paginaActual, setPaginaActual] = useState(1)

  // --- Estado: cargando ---
  if (cargando) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <EsqueletoCarga />
      </div>
    )
  }

  // --- Estado: error ---
  if (error !== null) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-sm font-medium text-red-700">
          No se pudieron cargar los usuarios
        </p>
        <p className="mt-1 text-sm text-red-600">{error}</p>
      </div>
    )
  }

  // --- Estado: sin datos ---
  if (usuarios.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
        <p className="text-sm font-medium text-gray-900">Sin usuarios registrados</p>
        <p className="mt-1 text-sm text-gray-500">
          Aún no hay usuarios en el sistema. Invita al primero con el botón de arriba.
        </p>
      </div>
    )
  }

  // --- Paginación ---
  const totalPaginas = Math.ceil(usuarios.length / FILAS_POR_PAGINA)
  const usuariosPagina = usuarios.slice(
    (paginaActual - 1) * FILAS_POR_PAGINA,
    paginaActual * FILAS_POR_PAGINA,
  )

  // Formateador de fechas en español (España/LatAm)
  const formatearFecha = (iso: string): string => {
    return new Date(iso).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

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
                Nombre
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                Email
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                Rol
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                Fecha de alta
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Acciones</span>
              </th>
            </tr>
          </thead>

          {/* Filas */}
          <tbody className="divide-y divide-gray-200 bg-white">
            {usuariosPagina.map((usuario) => (
              <tr key={usuario.id} className="hover:bg-gray-50">
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                  {usuario.nombre}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  {usuario.email}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm">
                  <IndicadorRol rol={usuario.rol} />
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  {formatearFecha(usuario.creado_en)}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                  <div className="flex justify-end gap-3">
                    {/* Acción: editar rol */}
                    <button
                      onClick={() => onEditarRol(usuario)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Editar rol
                    </button>

                    {/* Acción: desactivar — solo disponible si el usuario está activo */}
                    {usuario.activo && (
                      <button
                        onClick={() => onDesactivar(usuario.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Desactivar
                      </button>
                    )}
                  </div>
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
          totalRegistros={usuarios.length}
          onCambiarPagina={setPaginaActual}
        />
      )}
    </div>
  )
}
