// API del panel de operaciones — vista unificada del estado del sistema.
// Este módulo es estrictamente de SOLO LECTURA; ninguna función modifica datos.
//
// Fuentes de datos:
//   - Supabase  → clientes activos, usuarios activos, eventos de auditoría
//   - Airtable  → operaciones por estado (pendiente, completada, error)
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
  EstadoOperacion,
  EstadoSistema,
  EventoAuditoria,
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

/** Número máximo de registros por página en consultas paginadas. */
const REGISTROS_POR_PAGINA = 100

/** Límite por defecto de actividad reciente si no se especifica. */
const LIMITE_ACTIVIDAD_DEFAULT = 10

/** Límite máximo permitido de actividad reciente. */
const LIMITE_ACTIVIDAD_MAXIMO = 50

// ---------------------------------------------------------------------------
// Helpers internos
// ---------------------------------------------------------------------------

/**
 * Cuenta los registros de Airtable cuyo campo `estado` coincide exactamente
 * con el valor indicado. Opera sobre el arreglo ya recuperado desde la API.
 *
 * @param registros - Lista de registros crudos de Airtable.
 * @param estado    - Valor de estado a buscar.
 */
function contarPorEstado(
  registros: AirtableRecord<Partial<RegistroOperacion>>[],
  estado: EstadoOperacion
): number {
  return registros.filter((r) => r.fields.estado === estado).length
}

// ---------------------------------------------------------------------------
// Funciones públicas del panel de operaciones
// ---------------------------------------------------------------------------

/**
 * Devuelve la vista unificada del estado del sistema.
 * Combina en un único `Promise.all` paralelo:
 *   - Supabase: conteo de clientes activos, usuarios activos y últimos eventos de auditoría.
 *   - Airtable: todos los registros de operaciones para derivar conteos por estado.
 *
 * Los conteos de Airtable se calculan en el cliente a partir de la primera página
 * (máx 100 registros). Si el volumen supera ese límite, los conteos serán parciales.
 */
export async function obtenerEstadoSistema(): Promise<RespuestaAPI<EstadoSistema>> {
  try {
    // Ejecutar todas las fuentes en paralelo para minimizar latencia
    const [
      resultadoClientes,
      resultadoUsuarios,
      resultadoAuditoria,
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

      // 3. Últimos N eventos de auditoría en Supabase (usando el límite por defecto)
      supabase
        .from(TABLA_AUDITORIA)
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(LIMITE_ACTIVIDAD_DEFAULT),

      // 4. Operaciones desde Airtable — primera página para derivar conteos por estado
      airtableFetch<Partial<RegistroOperacion>>(TABLA_OPERACIONES_AIRTABLE, {
        pageSize: String(REGISTROS_POR_PAGINA),
      }),
    ])

    // Verificar errores de Supabase con mensajes descriptivos
    if (resultadoClientes.error) {
      return {
        ok: false,
        mensaje: `Error al obtener clientes activos: ${resultadoClientes.error.message}`,
      }
    }

    if (resultadoUsuarios.error) {
      return {
        ok: false,
        mensaje: `Error al obtener usuarios activos: ${resultadoUsuarios.error.message}`,
      }
    }

    if (resultadoAuditoria.error) {
      return {
        ok: false,
        mensaje: `Error al obtener actividad reciente: ${resultadoAuditoria.error.message}`,
      }
    }

    // Derivar conteos de Airtable filtrando en el cliente por cada estado
    const registrosOperaciones = resultadoOperaciones.records

    // Si Airtable devuelve token de paginación, significa que hay más de 100 registros
    // y los conteos derivados de esta página son parciales (incompletos)
    const conteosParciales = resultadoOperaciones.offset !== undefined

    const estado: EstadoSistema = {
      // NOTA: `count` puede ser null si no hay filas; el operador ?? normaliza a 0
      clientesActivos:        resultadoClientes.count  ?? 0,
      usuariosActivos:        resultadoUsuarios.count  ?? 0,
      operacionesPendientes:  contarPorEstado(registrosOperaciones, 'pendiente'),
      operacionesCompletadas: contarPorEstado(registrosOperaciones, 'completada'),
      operacionesConError:    contarPorEstado(registrosOperaciones, 'error'),
      conteosParciales,
      // NOTA: casting `data as EventoAuditoria[]` — temporal hasta que se tipifique el cliente de Supabase
      actividadReciente:      resultadoAuditoria.data as EventoAuditoria[],
      actualizadoEn:          new Date().toISOString(),
    }

    return { ok: true, datos: estado }
  } catch (err) {
    const mensaje =
      err instanceof Error
        ? err.message
        : 'Error desconocido al obtener el estado del sistema.'

    console.error('[operaciones.ts] obtenerEstadoSistema:', mensaje)

    return { ok: false, mensaje }
  }
}

/**
 * Obtiene operaciones de Airtable filtradas por un estado específico.
 * Máximo 100 registros por página; usar el token `offset` devuelto para paginar.
 *
 * @param estado - Estado por el que filtrar: 'pendiente', 'completada' o 'error'.
 * @param offset - Token de paginación devuelto por una llamada previa (opcional).
 */
export async function obtenerOperacionesPorEstado(
  estado: EstadoOperacion,
  offset?: string
): Promise<RespuestaAPI<{ registros: RegistroOperacion[]; offset?: string }>> {
  try {
    const params: Record<string, string> = {
      // filterByFormula: filtra registros cuyo campo `estado` sea exactamente el valor indicado
      filterByFormula: `{estado} = "${estado}"`,
      pageSize: String(REGISTROS_POR_PAGINA),
    }

    // Incluir el token de paginación solo cuando está presente
    if (offset) {
      params.offset = offset
    }

    // NOTA: casting genérico `Partial<RegistroOperacion>` — los campos reales se completarán
    // al conectar la base de Airtable; Partial evita errores de tipos en tiempo de build
    const respuesta = await airtableFetch<Partial<RegistroOperacion>>(
      TABLA_OPERACIONES_AIRTABLE,
      params
    )

    // Los estados válidos para normalizar el campo `estado` de Airtable
    const ESTADOS_VALIDOS: EstadoOperacion[] = ['pendiente', 'completada', 'error']

    // Mapear registros crudos al tipo de dominio, normalizando campos ausentes
    const registros: RegistroOperacion[] = respuesta.records.map(
      (r: AirtableRecord<Partial<RegistroOperacion>>): RegistroOperacion => ({
        id:     r.id,
        nombre: r.fields.nombre ?? '',
        // Normalizar estado: si el valor no es reconocido, cae a 'error' como fallback seguro
        estado: ESTADOS_VALIDOS.includes(r.fields.estado as EstadoOperacion)
          ? (r.fields.estado as EstadoOperacion)
          : 'error',
        fecha:  r.fields.fecha  ?? '',
      })
    )

    return {
      ok: true,
      datos: {
        registros,
        // Propagar el token de paginación solo si Airtable lo devuelve
        ...(respuesta.offset ? { offset: respuesta.offset } : {}),
      },
    }
  } catch (err) {
    const mensaje =
      err instanceof Error
        ? err.message
        : `Error desconocido al obtener operaciones con estado "${estado}".`

    console.error('[operaciones.ts] obtenerOperacionesPorEstado:', mensaje)

    return { ok: false, mensaje }
  }
}

/**
 * Devuelve los últimos N eventos de auditoría de Supabase, ordenados de más reciente a más antiguo.
 * El límite se normaliza entre 1 y `LIMITE_ACTIVIDAD_MAXIMO` (50).
 *
 * @param limite - Cantidad de eventos a devolver (default 10, máx 50).
 */
export async function obtenerActividadReciente(
  limite?: number
): Promise<RespuestaAPI<EventoAuditoria[]>> {
  // Normalizar el límite al rango permitido; si se omite, usar el valor por defecto
  const limiteNormalizado = Math.min(
    Math.max(limite ?? LIMITE_ACTIVIDAD_DEFAULT, 1),
    LIMITE_ACTIVIDAD_MAXIMO
  )

  try {
    const { data, error } = await supabase
      .from(TABLA_AUDITORIA)
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(limiteNormalizado)

    if (error) {
      return {
        ok: false,
        mensaje: `Error al obtener la actividad reciente: ${error.message}`,
      }
    }

    return {
      ok: true,
      // NOTA: casting `data as EventoAuditoria[]` — temporal hasta que se tipifique el cliente de Supabase
      datos: data as EventoAuditoria[],
    }
  } catch (err) {
    const mensaje =
      err instanceof Error
        ? err.message
        : 'Error desconocido al obtener la actividad reciente.'

    console.error('[operaciones.ts] obtenerActividadReciente:', mensaje)

    return { ok: false, mensaje }
  }
}
