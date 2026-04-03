// Botón que genera y descarga un archivo CSV en el cliente.
// Los headers se extraen automáticamente de las keys del primer objeto del array.
// El nombre del archivo incluye la fecha actual en formato YYYY-MM-DD.

import { useState } from 'react'

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

interface ExportarReporteProps {
  /** Nombre base del reporte (se usa en el nombre del archivo descargado). */
  nombreReporte: string
  /** Array de objetos a exportar; cada objeto se convierte en una fila CSV. */
  datos: Record<string, unknown>[]
  /**
   * Keys a excluir del CSV. Usar para omitir campos sensibles como tokens,
   * hashes de contraseña o IDs internos que no deben salir del sistema.
   * Ejemplo: ['password_hash', 'token', 'api_key']
   */
  camposExcluidos?: string[]
  /** Cuando es true, el botón queda deshabilitado (p.ej. datos aún cargando). */
  deshabilitado?: boolean
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Escapa un valor para CSV: envuelve en comillas dobles si contiene
 * comas, comillas o saltos de línea, y escapa comillas internas.
 */
const escaparCeldaCSV = (valor: unknown): string => {
  const texto = valor === null || valor === undefined ? '' : String(valor)
  const necesitaComillas = /[",\n\r]/.test(texto)
  if (necesitaComillas) {
    return `"${texto.replace(/"/g, '""')}"`
  }
  return texto
}

/** Genera la fecha actual en formato YYYY-MM-DD para el nombre del archivo. */
const obtenerFechaHoy = (): string => {
  return new Date().toISOString().slice(0, 10)
}

/**
 * Convierte un array de objetos a contenido CSV con BOM UTF-8
 * para que Excel lo abra correctamente con tildes y caracteres especiales.
 *
 * @param datos           - Registros a exportar.
 * @param camposExcluidos - Keys a omitir del CSV (para campos sensibles).
 */
const generarCSV = (datos: Record<string, unknown>[], camposExcluidos: string[] = []): string => {
  if (datos.length === 0) return ''

  // Extraer headers de las keys del primer objeto, excluyendo campos sensibles
  const headers = Object.keys(datos[0]).filter((k) => !camposExcluidos.includes(k))
  const filaHeaders = headers.map(escaparCeldaCSV).join(',')

  // Construir las filas de datos
  const filas = datos.map((fila) =>
    headers.map((header) => escaparCeldaCSV(fila[header])).join(','),
  )

  // BOM UTF-8 (\uFEFF) para compatibilidad con Excel
  return '\uFEFF' + [filaHeaders, ...filas].join('\r\n')
}

// ---------------------------------------------------------------------------
// Componente principal
// ---------------------------------------------------------------------------

export function ExportarReporte({
  nombreReporte,
  datos,
  camposExcluidos = [],
  deshabilitado = false,
}: ExportarReporteProps) {
  const [exportando, setExportando] = useState(false)

  const handleExportar = () => {
    if (exportando || deshabilitado || datos.length === 0) return

    setExportando(true)

    try {
      // Generar contenido CSV excluyendo campos sensibles
      const contenidoCSV = generarCSV(datos, camposExcluidos)

      // Crear un Blob y disparar la descarga
      const blob = new Blob([contenidoCSV], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)

      const enlace = document.createElement('a')
      enlace.href = url
      enlace.download = `${nombreReporte}-${obtenerFechaHoy()}.csv`
      document.body.appendChild(enlace)
      enlace.click()

      // Limpieza del DOM y del objeto URL
      document.body.removeChild(enlace)
      URL.revokeObjectURL(url)
    } finally {
      // Pequeño delay para que el estado "Exportando..." sea perceptible
      setTimeout(() => setExportando(false), 600)
    }
  }

  // Determinar si el botón debe estar deshabilitado
  const botonDeshabilitado = deshabilitado || exportando || datos.length === 0

  return (
    <button
      onClick={handleExportar}
      disabled={botonDeshabilitado}
      className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
      title={
        datos.length === 0
          ? 'No hay datos para exportar'
          : `Descargar ${nombreReporte} como CSV`
      }
    >
      {exportando ? (
        <>
          {/* Spinner de carga */}
          <svg
            className="h-4 w-4 animate-spin text-gray-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          Exportando…
        </>
      ) : (
        <>
          {/* Icono de descarga */}
          <svg
            className="h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
            />
          </svg>
          Exportar CSV
        </>
      )}
    </button>
  )
}
