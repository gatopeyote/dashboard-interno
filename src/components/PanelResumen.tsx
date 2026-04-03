// Panel de resumen diario: muestra 4 TarjetaMetrica en grid 2x2 con los datos
// del ResumenDiario. Incluye la hora de última actualización al pie del panel.
// Maneja estados: cargando (delega a TarjetaMetrica), vacío y error.

import type { ResumenDiario } from '../types'
import { TarjetaMetrica } from './TarjetaMetrica'

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

interface PanelResumenProps {
  /** Datos del resumen diario; null si aún no se han cargado. */
  resumen: ResumenDiario | null
  /** Indica si los datos se están cargando. */
  cargando: boolean
  /** Mensaje de error si la carga falló; null si no hay error. */
  error: string | null
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Formatea una fecha ISO en español con día, mes largo y año. */
const formatearFecha = (iso: string): string => {
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(iso))
}

/** Formatea una marca de tiempo ISO mostrando hora y minutos en español. */
const formatearHora = (iso: string): string => {
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))
}

// ---------------------------------------------------------------------------
// Componente principal
// ---------------------------------------------------------------------------

export function PanelResumen({ resumen, cargando, error }: PanelResumenProps) {
  // --- Estado: error ---
  if (error !== null) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6">
        <p className="text-sm font-medium text-red-700">
          No se pudo cargar el resumen del día
        </p>
        <p className="mt-1 text-sm text-red-600">{error}</p>
      </div>
    )
  }

  // --- Estado: vacío (sin error y sin datos tras cargar) ---
  if (!cargando && resumen === null) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
        <p className="text-sm font-medium text-gray-900">Sin resumen disponible</p>
        <p className="mt-1 text-sm text-gray-500">
          No se encontró información de resumen para el día de hoy.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Grid 2×2 de tarjetas de métricas */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Clientes activos */}
        <TarjetaMetrica
          titulo="Clientes activos"
          valor={resumen?.totalClientesActivos ?? 0}
          descripcion="Clientes con estado activo en el sistema"
          cargando={cargando}
        />

        {/* Usuarios activos */}
        <TarjetaMetrica
          titulo="Usuarios activos"
          valor={resumen?.totalUsuariosActivos ?? 0}
          descripcion="Usuarios con acceso habilitado"
          cargando={cargando}
        />

        {/* Operaciones del día */}
        <TarjetaMetrica
          titulo="Operaciones del día"
          valor={resumen?.operacionesDelDia ?? 0}
          descripcion="Total de operaciones registradas hoy"
          cargando={cargando}
        />

        {/* Fecha del resumen */}
        <TarjetaMetrica
          titulo="Fecha del resumen"
          valor={resumen !== null ? formatearFecha(resumen.fecha) : '—'}
          descripcion="Período correspondiente a este resumen"
          cargando={cargando}
        />
      </div>

      {/* Pie: marca de tiempo de última actualización */}
      {!cargando && resumen !== null && (
        <p className="text-right text-xs text-gray-400">
          Actualizado el{' '}
          <time dateTime={resumen.actualizadoEn}>
            {formatearHora(resumen.actualizadoEn)}
          </time>
        </p>
      )}
    </div>
  )
}
