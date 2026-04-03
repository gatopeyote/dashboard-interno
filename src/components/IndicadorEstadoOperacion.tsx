// Badge visual para el estado de una operación de Airtable.
// Sigue el mismo patrón que IndicadorEstado.tsx: CONFIG con fallback defensivo.
// Colores semánticos: amarillo=pendiente, verde=completada, rojo=error.

import type { EstadoOperacion } from '../types'

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

interface IndicadorEstadoOperacionProps {
  /** Estado de la operación a representar visualmente. */
  estado: EstadoOperacion
}

// ---------------------------------------------------------------------------
// Configuración de estilos y etiquetas por estado
// ---------------------------------------------------------------------------

const CONFIG_ESTADO: Record<EstadoOperacion, { clases: string; etiqueta: string }> = {
  pendiente: {
    clases: 'bg-yellow-100 text-yellow-800 ring-yellow-600/20',
    etiqueta: 'Pendiente',
  },
  completada: {
    clases: 'bg-green-100 text-green-800 ring-green-600/20',
    etiqueta: 'Completada',
  },
  error: {
    clases: 'bg-red-100 text-red-800 ring-red-600/20',
    etiqueta: 'Error',
  },
}

// ---------------------------------------------------------------------------
// Componente
// ---------------------------------------------------------------------------

export function IndicadorEstadoOperacion({ estado }: IndicadorEstadoOperacionProps) {
  // Fallback a 'error' si llega un estado no reconocido (dato corrupto en Airtable)
  const config = CONFIG_ESTADO[estado] ?? CONFIG_ESTADO['error']
  const { clases, etiqueta } = config

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${clases}`}
    >
      {etiqueta}
    </span>
  )
}
