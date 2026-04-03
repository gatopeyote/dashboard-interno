// API de Airtable — lectura de datos operativos para el dashboard.
// Este módulo es de SOLO LECTURA; nunca modifica registros en Airtable.
//
// Tablas consumidas:
//   - `Operaciones` → procesos y flujos de negocio
//   - `Clientes`    → espejo operativo de clientes (distinto del registro en Supabase)
//
// NOTA: Los castings `fields as RegistroOperacion` y similares son temporales hasta
// que se definan los tipos exactos de cada tabla al conectar la base real de Airtable.

import { airtableFetch } from '../lib/airtable'

import type {
  AirtableResponse,
  AirtableRecord,
} from '../lib/airtable'

import type {
  RegistroOperacion,
  RegistroClienteAirtable,
  RespuestaAPI,
} from '../types/index'

// ---------------------------------------------------------------------------
// Constantes internas
// ---------------------------------------------------------------------------

/** Nombre exacto de la tabla de operaciones en Airtable. */
const TABLA_OPERACIONES = 'Operaciones'

/** Nombre exacto de la tabla de clientes en Airtable. */
const TABLA_CLIENTES_AIRTABLE = 'Clientes'

/** Número máximo de registros por página (límite de la API de Airtable: 100). */
const REGISTROS_POR_PAGINA = 100

// ---------------------------------------------------------------------------
// Helpers internos
// ---------------------------------------------------------------------------

/**
 * Convierte un registro crudo de Airtable en un `RegistroOperacion`.
 * Los campos se mapean por nombre; los valores ausentes se normalizan a cadena vacía.
 *
 * @param registro - Registro bruto devuelto por `airtableFetch`.
 */
function mapearOperacion(registro: AirtableRecord<Partial<RegistroOperacion>>): RegistroOperacion {
  return {
    id: registro.id,
    // NOTA: casting implícito vía `?? ''` — garantiza string aunque el campo no exista
    nombre: registro.fields.nombre ?? '',
    estado: registro.fields.estado ?? '',
    fecha:  registro.fields.fecha  ?? '',
  }
}

/**
 * Convierte un registro crudo de Airtable en un `RegistroClienteAirtable`.
 *
 * @param registro - Registro bruto devuelto por `airtableFetch`.
 */
function mapearClienteAirtable(
  registro: AirtableRecord<Partial<RegistroClienteAirtable>>
): RegistroClienteAirtable {
  return {
    id:     registro.id,
    // NOTA: casting implícito vía `?? ''` — garantiza string aunque el campo no exista
    nombre: registro.fields.nombre ?? '',
    estado: registro.fields.estado ?? '',
  }
}

// ---------------------------------------------------------------------------
// Funciones públicas de lectura
// ---------------------------------------------------------------------------

/**
 * Obtiene una página de registros de la tabla `Operaciones`.
 * Máximo 100 registros por llamada; usar el `offset` devuelto para paginar.
 *
 * @param pagina - Número de página (se usa internamente para calcular el offset
 *                 si la respuesta anterior lo proporcionó). Pasar el offset
 *                 directamente con el parámetro homónimo de `airtableFetch`.
 *                 Actualmente este argumento no se usa para calcular offset
 *                 numérico porque Airtable usa tokens opacos, no índices.
 *                 Se reserva para compatibilidad futura.
 * @param offset - Token de paginación devuelto por una llamada previa.
 */
export async function obtenerOperaciones(
  pagina?: number,
  offset?: string
): Promise<RespuestaAPI<{ registros: RegistroOperacion[]; offset?: string }>> {
  // El parámetro `pagina` se declara para mantener consistencia de interfaz con
  // otros módulos del dashboard, pero Airtable pagina con tokens opacos, no índices.
  void pagina

  try {
    const params: Record<string, string> = {
      pageSize: String(REGISTROS_POR_PAGINA),
    }

    if (offset) {
      params.offset = offset
    }

    // NOTA: casting genérico `Partial<RegistroOperacion>` — los campos reales se
    // completarán cuando se conecte la base; Partial evita errores de tipos en tiempo de build
    const respuesta: AirtableResponse<Partial<RegistroOperacion>> =
      await airtableFetch<Partial<RegistroOperacion>>(TABLA_OPERACIONES, params)

    const registros = respuesta.records.map(mapearOperacion)

    return {
      ok: true,
      datos: {
        registros,
        ...(respuesta.offset ? { offset: respuesta.offset } : {}),
      },
    }
  } catch (err) {
    const mensaje =
      err instanceof Error
        ? err.message
        : 'Error desconocido al obtener operaciones de Airtable.'

    console.error('[airtable.ts] obtenerOperaciones:', mensaje)

    return { ok: false, mensaje }
  }
}

/**
 * Obtiene una página de registros de la tabla `Clientes` en Airtable.
 * Máximo 100 registros por llamada; usar el `offset` devuelto para paginar.
 *
 * @param pagina - Reservado para compatibilidad de interfaz (ver nota en `obtenerOperaciones`).
 * @param offset - Token de paginación devuelto por una llamada previa.
 */
export async function obtenerClientesAirtable(
  pagina?: number,
  offset?: string
): Promise<RespuestaAPI<{ registros: RegistroClienteAirtable[]; offset?: string }>> {
  void pagina

  try {
    const params: Record<string, string> = {
      pageSize: String(REGISTROS_POR_PAGINA),
    }

    if (offset) {
      params.offset = offset
    }

    // NOTA: casting genérico `Partial<RegistroClienteAirtable>` — misma razón que en obtenerOperaciones
    const respuesta: AirtableResponse<Partial<RegistroClienteAirtable>> =
      await airtableFetch<Partial<RegistroClienteAirtable>>(TABLA_CLIENTES_AIRTABLE, params)

    const registros = respuesta.records.map(mapearClienteAirtable)

    return {
      ok: true,
      datos: {
        registros,
        ...(respuesta.offset ? { offset: respuesta.offset } : {}),
      },
    }
  } catch (err) {
    const mensaje =
      err instanceof Error
        ? err.message
        : 'Error desconocido al obtener clientes de Airtable.'

    console.error('[airtable.ts] obtenerClientesAirtable:', mensaje)

    return { ok: false, mensaje }
  }
}
