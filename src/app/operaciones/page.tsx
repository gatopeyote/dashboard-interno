// Página de operaciones — Server Component.
// Carga el estado del sistema y la lista de operaciones de Airtable en paralelo.
// Si alguna carga falla, muestra un mensaje de error en lugar de la vista.

import {
  obtenerEstadoSistema,
  obtenerOperacionesPorEstado,
} from '../../api/operaciones'
import { OperacionesView } from './OperacionesView'

import type { RegistroOperacion } from '../../types'

export default async function PaginaOperaciones() {
  // Cargar el estado del sistema y los tres grupos de operaciones en paralelo
  const [
    resultadoEstado,
    resultadoPendientes,
    resultadoCompletadas,
    resultadoErrores,
  ] = await Promise.all([
    obtenerEstadoSistema(),
    obtenerOperacionesPorEstado('pendiente'),
    obtenerOperacionesPorEstado('completada'),
    obtenerOperacionesPorEstado('error'),
  ])

  // Mostrar error si el estado del sistema no pudo cargarse
  if (!resultadoEstado.ok) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6">
        <p className="text-sm font-medium text-red-700">
          No se pudo cargar el estado del sistema
        </p>
        <p className="mt-1 text-sm text-red-600">{resultadoEstado.mensaje}</p>
      </div>
    )
  }

  // Combinar las operaciones de los tres estados en una lista unificada.
  // Si algún grupo falla se omite sin bloquear el resto.
  const operaciones: RegistroOperacion[] = [
    ...(resultadoPendientes.ok    ? resultadoPendientes.datos.registros    : []),
    ...(resultadoCompletadas.ok   ? resultadoCompletadas.datos.registros   : []),
    ...(resultadoErrores.ok       ? resultadoErrores.datos.registros       : []),
  ]

  return (
    <OperacionesView
      estadoSistema={resultadoEstado.datos}
      operaciones={operaciones}
    />
  )
}
