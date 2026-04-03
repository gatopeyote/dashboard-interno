// Panel unificado del estado de operaciones del sistema.
// Sección superior: grid 2×3 de TarjetaMetrica con las métricas clave.
// Sección inferior: tabla de actividad reciente usando TablaAuditoria.
// Maneja estados: cargando, vacío y error.

import { formatearFechaHora } from '../lib/formato'
import type { EstadoSistema } from '../types'
import { TablaAuditoria } from './TablaAuditoria'
import { TarjetaMetrica } from './TarjetaMetrica'

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

interface PanelOperacionesProps {
  /** Estado completo del sistema; null si aún no se han cargado los datos. */
  estado: EstadoSistema | null
  /** Indica si los datos se están cargando. */
  cargando: boolean
  /** Mensaje de error si la carga falló; null si no hay error. */
  error: string | null
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Componente principal
// ---------------------------------------------------------------------------

export function PanelOperaciones({ estado, cargando, error }: PanelOperacionesProps) {
  // --- Estado: error ---
  if (error !== null) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6">
        <p className="text-sm font-medium text-red-700">
          No se pudo cargar el panel de operaciones
        </p>
        <p className="mt-1 text-sm text-red-600">{error}</p>
      </div>
    )
  }

  // --- Estado: vacío (sin error y sin datos tras cargar) ---
  if (!cargando && estado === null) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
        <p className="text-sm font-medium text-gray-900">Sin datos disponibles</p>
        <p className="mt-1 text-sm text-gray-500">
          No se encontró información del estado del sistema.
        </p>
      </div>
    )
  }

  // Determina si la tarjeta de errores debe destacarse en rojo
  const hayErrores = estado !== null && estado.operacionesConError > 0

  // Los conteos de Airtable son parciales si hay más de 100 operaciones
  const conteosParciales = estado?.conteosParciales === true

  return (
    <div className="space-y-6">
      {/* ------------------------------------------------------------------ */}
      {/* Sección superior: grid 2×3 de métricas del sistema                 */}
      {/* ------------------------------------------------------------------ */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Clientes activos */}
        <TarjetaMetrica
          titulo="Clientes activos"
          valor={estado?.clientesActivos ?? 0}
          descripcion="Clientes con estado activo en Supabase"
          cargando={cargando}
        />

        {/* Usuarios activos */}
        <TarjetaMetrica
          titulo="Usuarios activos"
          valor={estado?.usuariosActivos ?? 0}
          descripcion="Usuarios con acceso habilitado"
          cargando={cargando}
        />

        {/* Operaciones pendientes */}
        <TarjetaMetrica
          titulo="Operaciones pendientes"
          valor={estado?.operacionesPendientes ?? 0}
          descripcion="En espera de ser procesadas en Airtable"
          cargando={cargando}
        />

        {/* Operaciones completadas */}
        <TarjetaMetrica
          titulo="Operaciones completadas"
          valor={estado?.operacionesCompletadas ?? 0}
          descripcion="Finalizadas correctamente en Airtable"
          cargando={cargando}
        />

        {/* Operaciones con error — destacada en rojo cuando hay errores */}
        <TarjetaMetrica
          titulo="Con error"
          valor={estado?.operacionesConError ?? 0}
          descripcion="Requieren revisión manual en Airtable"
          cargando={cargando}
          destacar={hayErrores}
        />

        {/* Última actualización */}
        <TarjetaMetrica
          titulo="Última actualización"
          valor={
            estado !== null
              ? formatearFechaHora(estado.actualizadoEn)
              : '—'
          }
          descripcion="Momento en que se generó este estado"
          cargando={cargando}
        />
      </div>

      {/* Aviso de conteos parciales cuando Airtable tiene más de 100 registros */}
      {conteosParciales && (
        <p className="rounded-md border border-yellow-200 bg-yellow-50 px-4 py-2 text-xs text-yellow-700">
          Los conteos de operaciones son parciales. Airtable tiene más de 100 registros y solo se muestra la primera página.
        </p>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Sección inferior: actividad reciente de auditoría                  */}
      {/* ------------------------------------------------------------------ */}
      <div>
        <h2 className="mb-3 text-base font-semibold text-gray-900">
          Actividad reciente
        </h2>

        {/* error={null} porque el error del panel ya se maneja arriba;
            si en el futuro actividadReciente se carga de forma independiente,
            pasar su propio estado de error aquí */}
        <TablaAuditoria
          eventos={estado?.actividadReciente ?? []}
          cargando={cargando}
          error={null}
        />
      </div>

      {/* Pie: marca de tiempo de la última actualización */}
      {!cargando && estado !== null && (
        <p className="text-right text-xs text-gray-400">
          Estado generado el{' '}
          <time dateTime={estado.actualizadoEn}>
            {formatearFechaHora(estado.actualizadoEn)}
          </time>
        </p>
      )}
    </div>
  )
}
