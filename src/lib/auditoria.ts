// Utilidad compartida para registrar eventos en `eventos_auditoria`.
// Todos los módulos de API deben usar esta función en lugar de implementarla localmente.

import { supabase } from './supabase'

import type { EventoAuditoriaNew } from '../types/index'

/** Nombre de la tabla de auditoría. */
const TABLA_AUDITORIA = 'eventos_auditoria'

/**
 * Inserta un evento en `eventos_auditoria`.
 * No lanza errores para no ocultar el resultado de la operación principal.
 * Los fallos se reportan por consola.
 */
export async function registrarAuditoria(evento: EventoAuditoriaNew): Promise<void> {
  const { error } = await supabase.from(TABLA_AUDITORIA).insert(evento)

  if (error) {
    // No se lanza para no ocultar el resultado principal, pero sí se reporta.
    console.error(
      `[auditoría] No se pudo registrar el evento "${evento.accion}" sobre ${evento.tabla}/${evento.registro_id}: ${error.message}`
    )
  }
}
