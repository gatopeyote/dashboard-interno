// Componente badge para mostrar el estado de un cliente de forma visual.
// Usa colores semánticos: verde=activo, rojo=inactivo, amarillo=pendiente.

import type { EstadoCliente } from '../types'

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

interface IndicadorEstadoProps {
  /** Estado operativo del cliente a representar visualmente. */
  estado: EstadoCliente
}

// ---------------------------------------------------------------------------
// Configuración de estilos y etiquetas por estado
// ---------------------------------------------------------------------------

const CONFIG_ESTADO: Record<EstadoCliente, { clases: string; etiqueta: string }> = {
  activo: {
    clases: 'bg-green-100 text-green-800 ring-green-600/20',
    etiqueta: 'Activo',
  },
  inactivo: {
    clases: 'bg-red-100 text-red-800 ring-red-600/20',
    etiqueta: 'Inactivo',
  },
  pendiente: {
    clases: 'bg-yellow-100 text-yellow-800 ring-yellow-600/20',
    etiqueta: 'Pendiente',
  },
}

// ---------------------------------------------------------------------------
// Componente
// ---------------------------------------------------------------------------

export function IndicadorEstado({ estado }: IndicadorEstadoProps) {
  // Fallback a 'inactivo' si llega un estado no reconocido (ej: dato corrupto en BD)
  const config = CONFIG_ESTADO[estado] ?? CONFIG_ESTADO['inactivo']
  const { clases, etiqueta } = config

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${clases}`}
    >
      {etiqueta}
    </span>
  )
}
