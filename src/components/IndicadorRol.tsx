// Componente badge para mostrar el rol de un usuario de forma visual.
// Usa colores semánticos: azul oscuro=admin, azul claro=operador, gris=viewer.
// Sigue el mismo patrón de IndicadorEstado.tsx con CONFIG_ROL y fallback.

import type { RolUsuario } from '../types'

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

interface IndicadorRolProps {
  /** Rol del usuario a representar visualmente. */
  rol: RolUsuario
}

// ---------------------------------------------------------------------------
// Configuración de estilos y etiquetas por rol
// ---------------------------------------------------------------------------

const CONFIG_ROL: Record<RolUsuario, { clases: string; etiqueta: string }> = {
  admin: {
    clases: 'bg-indigo-100 text-indigo-900 ring-indigo-700/30',
    etiqueta: 'Admin',
  },
  operador: {
    clases: 'bg-blue-100 text-blue-700 ring-blue-600/20',
    etiqueta: 'Operador',
  },
  viewer: {
    clases: 'bg-gray-100 text-gray-600 ring-gray-500/20',
    etiqueta: 'Viewer',
  },
}

// ---------------------------------------------------------------------------
// Componente
// ---------------------------------------------------------------------------

export function IndicadorRol({ rol }: IndicadorRolProps) {
  // Fallback a 'viewer' si llega un rol no reconocido (ej: dato corrupto en BD)
  const config = CONFIG_ROL[rol] ?? CONFIG_ROL['viewer']
  const { clases, etiqueta } = config

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${clases}`}
    >
      {etiqueta}
    </span>
  )
}
