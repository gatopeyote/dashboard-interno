'use client'

// Vista de operaciones: componente cliente que combina el panel de estado
// con el filtro y la tabla de operaciones de Airtable.
// Filtra localmente sobre la lista inicial — no requiere llamadas adicionales.

import { useState } from 'react'

import { PanelOperaciones } from '../../components/PanelOperaciones'
import { FiltroOperaciones } from '../../components/FiltroOperaciones'
import { TablaOperaciones } from '../../components/TablaOperaciones'

import type { EstadoSistema, RegistroOperacion } from '../../types'
import type { FiltroEstado } from '../../components/FiltroOperaciones'

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

interface OperacionesViewProps {
  /** Estado completo del sistema cargado por el Server Component. */
  estadoSistema: EstadoSistema
  /** Lista completa de operaciones para filtrar localmente. */
  operaciones: RegistroOperacion[]
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Filtra la lista de operaciones según el filtro activo.
 * Cuando el filtro es 'todas' devuelve la lista completa sin modificar.
 */
function filtrarOperaciones(
  operaciones: RegistroOperacion[],
  filtro: FiltroEstado
): RegistroOperacion[] {
  if (filtro === 'todas') return operaciones
  return operaciones.filter((op) => op.estado === filtro)
}

// ---------------------------------------------------------------------------
// Componente
// ---------------------------------------------------------------------------

export function OperacionesView({ estadoSistema, operaciones }: OperacionesViewProps) {
  // Filtro activo: por defecto muestra todas las operaciones
  const [filtroActual, setFiltroActual] = useState<FiltroEstado>('todas')

  // Filtrar la lista localmente sin llamadas adicionales al servidor
  const operacionesFiltradas = filtrarOperaciones(operaciones, filtroActual)

  return (
    <div className="space-y-8">
      {/* Cabecera de página */}
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Operaciones</h1>
        <p className="mt-1 text-sm text-gray-500">
          Estado unificado del sistema: métricas de Supabase y operaciones de Airtable.
        </p>
      </div>

      {/* Sección 1: Panel de estado del sistema */}
      <section aria-labelledby="titulo-panel">
        <h2 id="titulo-panel" className="sr-only">Panel de estado del sistema</h2>
        <PanelOperaciones
          estado={estadoSistema}
          cargando={false}
          error={null}
        />
      </section>

      {/* Sección 2: Filtro + tabla de operaciones */}
      <section aria-labelledby="titulo-operaciones">
        <div className="mb-4 flex items-center justify-between">
          <h2 id="titulo-operaciones" className="text-base font-semibold text-gray-900">
            Operaciones de Airtable
          </h2>

          {/* Grupo de botones de filtro */}
          <FiltroOperaciones
            estadoActual={filtroActual}
            onChange={setFiltroActual}
          />
        </div>

        {/* Tabla con la lista filtrada localmente */}
        <TablaOperaciones
          operaciones={operacionesFiltradas}
          cargando={false}
          error={null}
        />
      </section>
    </div>
  )
}
