// API de reportes — métricas y resúmenes combinando Supabase y Airtable.
// Este módulo es estrictamente de SOLO LECTURA; ninguna función modifica datos.
//
// Fuentes de datos:
//   - Supabase  → clientes, usuarios, eventos de auditoría
//   - Airtable  → operaciones del día
//
// Manejo de errores: este módulo usa try/catch global porque combina Supabase y Airtable
// en Promise.all; un throw de cualquiera de las dos fuentes debe capturarse de forma unificada.
// Los módulos de api/ que solo usan Supabase manejan errores via el campo `.error` del resultado.
//
// NOTA: Los castings `data as ...` en las consultas de Supabase son temporales hasta
// que se generen los tipos con `supabase gen types typescript` y se tipifique el cliente.

import { supabase } from '../lib/supabase'
import { airtableFetch } from '../lib/airtable'

import type { AirtableRecord } from '../lib/airtable'

import type {
  EventoAuditoria,
  ResumenDiario,
  MetricasClientes,
  RegistroOperacion,
  RespuestaAPI,
} from '../types/index'

// ---------------------------------------------------------------------------
// Constantes internas
// ---------------------------------------------------------------------------

/** Tabla de clientes en Supabase. */
const TABLA_CLIENTES = 'clientes'

/** Tabla de usuarios en Supabase. */
const TABLA_USUARIOS = 'usuarios'

/** Tabla de eventos de auditoría en Supabase. */
const TABLA_AUDITORIA = 'eventos_auditoria'

/** Tabla de operaciones en Airtable. */
const TABLA_OPERACIONES_AIRTABLE = 'Operaciones'

/** Máximo de registros por página en consultas paginadas. */
const REGISTROS_POR_PAGINA = 100

// ---------------------------------------------------------------------------
// Helpers internos
// ---------------------------------------------------------------------------

/**
 * Devuelve la fecha de hace N días en formato ISO 8601 (solo fecha, sin hora).
 *
 * @param dias - Cantidad de días a restar desde hoy.
 */
function fechaHaceNDias(dias: number): string {
  const fecha = new Date()
  fecha.setDate(fecha.getDate() - dias)
  return fecha.toISOString().split('T')[0] as string
}

// ---------------------------------------------------------------------------
// Funciones públicas de reportes
// ---------------------------------------------------------------------------

/**
 * Genera un resumen diario del estado del sistema para la fecha indicada.
 * Combina datos de Supabase (clientes y usuarios activos) y Airtable (operaciones del día)
 * en una única llamada paralela con `Promise.all`.
 *
 * @param fecha - Fecha en formato ISO 8601 (YYYY-MM-DD) para filtrar operaciones.
 */
export async function obtenerResumenDiario(
  fecha: string
): Promise<RespuestaAPI<ResumenDiario>> {
  if (!fecha) {
    return { ok: false, mensaje: 'Se requiere una fecha válida para generar el resumen diario.' }
  }

  try {
    // Ejecutar las tres fuentes en paralelo para minimizar latencia
    const [
      resultadoClientes,
      resultadoUsuarios,
      resultadoOperaciones,
    ] = await Promise.all([
      // 1. Total de clientes activos en Supabase
      supabase
        .from(TABLA_CLIENTES)
        .select('id', { count: 'exact', head: true })
        .eq('activo', true)
        .eq('estado', 'activo'),

      // 2. Total de usuarios activos en Supabase
      supabase
        .from(TABLA_USUARIOS)
        .select('id', { count: 'exact', head: true })
        .eq('activo', true),

      // 3. Operaciones del día en Airtable — filtrar por fecha con formula de Airtable.
      // LIMITACIÓN CONOCIDA: solo se obtiene la primera página (máx 100 registros).
      // Si el volumen diario supera 100 operaciones, el conteo será incorrecto.
      // Para iterar páginas adicionales, usar el token `offset` de la respuesta.
      airtableFetch<Partial<RegistroOperacion>>(TABLA_OPERACIONES_AIRTABLE, {
        // filterByFormula: busca registros cuyo campo `fecha` coincida con la fecha dada
        filterByFormula: `SEARCH("${fecha}", {fecha})`,
        pageSize: String(REGISTROS_POR_PAGINA),
      }),
    ])

    // Verificar errores de Supabase
    if (resultadoClientes.error) {
      return {
        ok: false,
        mensaje: `Error al obtener total de clientes activos: ${resultadoClientes.error.message}`,
      }
    }

    if (resultadoUsuarios.error) {
      return {
        ok: false,
        mensaje: `Error al obtener total de usuarios activos: ${resultadoUsuarios.error.message}`,
      }
    }

    // Contar las operaciones del día filtrando por el campo `fecha` ya en el lado cliente
    // (Airtable puede devolver registros adicionales según la formula; verificamos aquí también)
    const operacionesDelDia = resultadoOperaciones.records.filter(
      (r: AirtableRecord<Partial<RegistroOperacion>>) =>
        r.fields.fecha?.startsWith(fecha)
    ).length

    const resumen: ResumenDiario = {
      fecha,
      // NOTA: `count` puede ser null si no hay filas; el operador ?? normaliza a 0
      totalClientesActivos: resultadoClientes.count ?? 0,
      totalUsuariosActivos: resultadoUsuarios.count ?? 0,
      operacionesDelDia,
      actualizadoEn: new Date().toISOString(),
    }

    return { ok: true, datos: resumen }
  } catch (err) {
    const mensaje =
      err instanceof Error
        ? err.message
        : 'Error desconocido al generar el resumen diario.'

    console.error('[reportes.ts] obtenerResumenDiario:', mensaje)

    return { ok: false, mensaje }
  }
}

/**
 * Calcula métricas agregadas del estado de la cartera de clientes en Supabase.
 * Solo consulta Supabase; no requiere Airtable.
 * Ejecuta las cuatro consultas en paralelo con `Promise.all`.
 */
export async function obtenerMetricasClientes(): Promise<RespuestaAPI<MetricasClientes>> {
  try {
    const fechaHace7Dias = fechaHaceNDias(7)

    const [
      resultadoActivos,
      resultadoInactivos,
      resultadoPendientes,
      resultadoAltas,
    ] = await Promise.all([
      // 1. Clientes con estado activo
      supabase
        .from(TABLA_CLIENTES)
        .select('id', { count: 'exact', head: true })
        .eq('activo', true)
        .eq('estado', 'activo'),

      // 2. Clientes con estado inactivo (solo registros activos lógicamente)
      supabase
        .from(TABLA_CLIENTES)
        .select('id', { count: 'exact', head: true })
        .eq('activo', true)
        .eq('estado', 'inactivo'),

      // 3. Clientes con estado pendiente (solo registros activos lógicamente)
      supabase
        .from(TABLA_CLIENTES)
        .select('id', { count: 'exact', head: true })
        .eq('activo', true)
        .eq('estado', 'pendiente'),

      // 4. Altas en los últimos 7 días (sin importar estado actual)
      supabase
        .from(TABLA_CLIENTES)
        .select('id', { count: 'exact', head: true })
        .gte('creado_en', `${fechaHace7Dias}T00:00:00.000Z`),
    ])

    // Verificar errores individuales con mensajes descriptivos
    if (resultadoActivos.error) {
      return {
        ok: false,
        mensaje: `Error al contar clientes activos: ${resultadoActivos.error.message}`,
      }
    }
    if (resultadoInactivos.error) {
      return {
        ok: false,
        mensaje: `Error al contar clientes inactivos: ${resultadoInactivos.error.message}`,
      }
    }
    if (resultadoPendientes.error) {
      return {
        ok: false,
        mensaje: `Error al contar clientes pendientes: ${resultadoPendientes.error.message}`,
      }
    }
    if (resultadoAltas.error) {
      return {
        ok: false,
        mensaje: `Error al contar altas de los últimos 7 días: ${resultadoAltas.error.message}`,
      }
    }

    const metricas: MetricasClientes = {
      // NOTA: `count` puede ser null si la tabla está vacía; ?? normaliza a 0
      totalActivos:       resultadoActivos.count       ?? 0,
      totalInactivos:     resultadoInactivos.count     ?? 0,
      totalPendientes:    resultadoPendientes.count    ?? 0,
      altasUltimos7Dias:  resultadoAltas.count         ?? 0,
      actualizadoEn:      new Date().toISOString(),
    }

    return { ok: true, datos: metricas }
  } catch (err) {
    const mensaje =
      err instanceof Error
        ? err.message
        : 'Error desconocido al obtener métricas de clientes.'

    console.error('[reportes.ts] obtenerMetricasClientes:', mensaje)

    return { ok: false, mensaje }
  }
}

// ---------------------------------------------------------------------------
// Filtros para auditoría
// ---------------------------------------------------------------------------

/** Parámetros opcionales para filtrar eventos de auditoría. */
export interface FiltrosAuditoria {
  /** Filtrar por el ID del usuario que ejecutó la acción. */
  usuarioId?: string
  /** Filtrar por el nombre de la tabla afectada. */
  tabla?: string
  /** Fecha de inicio del rango (ISO 8601 inclusive). */
  desde?: string
  /** Fecha de fin del rango (ISO 8601 inclusive). */
  hasta?: string
}

/**
 * Consulta eventos de auditoría con filtros opcionales y paginación.
 * Los resultados se ordenan de más reciente a más antiguo.
 * Máximo 100 registros por página.
 *
 * @param filtros - Criterios de búsqueda opcionales.
 * @param offset  - Índice de inicio para la paginación (múltiplo de 100).
 */
export async function obtenerEventosAuditoria(
  filtros?: FiltrosAuditoria,
  offset = 0
): Promise<RespuestaAPI<{ eventos: EventoAuditoria[]; total: number; offset: number }>> {
  try {
    // Construir la consulta base con orden descendente por timestamp
    let consulta = supabase
      .from(TABLA_AUDITORIA)
      .select('*', { count: 'exact' })
      .order('timestamp', { ascending: false })
      .range(offset, offset + REGISTROS_POR_PAGINA - 1)

    // Aplicar filtros solo cuando están presentes — evita condiciones vacías
    if (filtros?.usuarioId) {
      consulta = consulta.eq('usuario_id', filtros.usuarioId)
    }

    if (filtros?.tabla) {
      consulta = consulta.eq('tabla', filtros.tabla)
    }

    if (filtros?.desde) {
      consulta = consulta.gte('timestamp', filtros.desde)
    }

    if (filtros?.hasta) {
      consulta = consulta.lte('timestamp', filtros.hasta)
    }

    const { data, error, count } = await consulta

    if (error) {
      return {
        ok: false,
        mensaje: `Error al obtener eventos de auditoría: ${error.message}`,
      }
    }

    return {
      ok: true,
      datos: {
        // NOTA: casting `data as EventoAuditoria[]` — temporal hasta que se tipifique el cliente de Supabase
        eventos: data as EventoAuditoria[],
        total:   count ?? 0,
        offset,
      },
    }
  } catch (err) {
    const mensaje =
      err instanceof Error
        ? err.message
        : 'Error desconocido al obtener eventos de auditoría.'

    console.error('[reportes.ts] obtenerEventosAuditoria:', mensaje)

    return { ok: false, mensaje }
  }
}
