// Grupo de botones en estilo tab para filtrar operaciones por estado.
// Componente controlado: no mantiene estado interno, delega todo al padre.
// Botón activo: fondo indigo. Botones inactivos: fondo gris claro.

import type { EstadoOperacion } from '../types'

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

/** Valor posible del filtro: un estado concreto o la opción "todas". */
export type FiltroEstado = EstadoOperacion | 'todas'

interface FiltroOperacionesProps {
  /** Estado actualmente seleccionado. */
  estadoActual: FiltroEstado
  /** Callback invocado cuando el usuario selecciona un filtro diferente. */
  onChange: (estado: FiltroEstado) => void
}

// ---------------------------------------------------------------------------
// Configuración de opciones del filtro
// ---------------------------------------------------------------------------

interface OpcionFiltro {
  valor: FiltroEstado
  etiqueta: string
}

const OPCIONES: OpcionFiltro[] = [
  { valor: 'todas', etiqueta: 'Todas' },
  { valor: 'pendiente', etiqueta: 'Pendientes' },
  { valor: 'completada', etiqueta: 'Completadas' },
  { valor: 'error', etiqueta: 'Con error' },
]

// ---------------------------------------------------------------------------
// Helpers de estilo
// ---------------------------------------------------------------------------

/** Devuelve las clases Tailwind correspondientes al botón según si está activo. */
const clasesBoton = (activo: boolean): string => {
  if (activo) {
    return 'bg-indigo-600 text-white shadow-sm hover:bg-indigo-700 focus:ring-indigo-500'
  }
  return 'bg-gray-100 text-gray-600 hover:bg-gray-200 focus:ring-gray-400'
}

// ---------------------------------------------------------------------------
// Componente
// ---------------------------------------------------------------------------

export function FiltroOperaciones({ estadoActual, onChange }: FiltroOperacionesProps) {
  return (
    <div
      className="inline-flex rounded-lg p-1 bg-gray-50 border border-gray-200"
      role="group"
      aria-label="Filtrar operaciones por estado"
    >
      {OPCIONES.map((opcion) => {
        const activo = estadoActual === opcion.valor

        return (
          <button
            key={opcion.valor}
            type="button"
            onClick={() => onChange(opcion.valor)}
            aria-pressed={activo}
            className={`
              rounded-md px-3 py-1.5 text-sm font-medium
              transition-colors duration-150
              focus:outline-none focus:ring-2 focus:ring-offset-1
              ${clasesBoton(activo)}
            `}
          >
            {opcion.etiqueta}
          </button>
        )
      })}
    </div>
  )
}
