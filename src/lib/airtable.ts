// Cliente de Airtable — acceso a la REST API usando fetch nativo.
// No se usa ningún SDK; todas las peticiones son HTTP directas.
//
// Documentación de referencia: https://airtable.com/developers/web/api/introduction
//
// NOTA: Los castings explícitos en `airtableFetch` son temporales hasta que se
// generen tipos concretos por tabla. El genérico <T> permite tipar los campos
// en el punto de uso sin introducir `any` en este módulo.

// ---------------------------------------------------------------------------
// Validación temprana de variables de entorno
// ---------------------------------------------------------------------------

if (!process.env.AIRTABLE_API_KEY) {
  throw new Error('Variable de entorno AIRTABLE_API_KEY no definida.')
}
if (!process.env.AIRTABLE_BASE_ID) {
  throw new Error('Variable de entorno AIRTABLE_BASE_ID no definida.')
}

// ---------------------------------------------------------------------------
// Tipos públicos de Airtable
// ---------------------------------------------------------------------------

/** Representa un único registro devuelto por la API de Airtable. */
export interface AirtableRecord<T> {
  /** Identificador único del registro (prefijo "rec…"). */
  id: string
  /** Objeto con los campos y valores del registro. */
  fields: T
  /** Fecha y hora de creación del registro en formato ISO 8601. */
  createdTime: string
}

/**
 * Respuesta de lista de la API de Airtable.
 * Cuando hay más registros de los que caben en una página, se incluye `offset`.
 */
export interface AirtableResponse<T> {
  /** Lista de registros de la página actual. */
  records: AirtableRecord<T>[]
  /**
   * Token de paginación devuelto por Airtable cuando existen más registros.
   * Debe pasarse como parámetro `offset` en la siguiente petición.
   */
  offset?: string
}

// ---------------------------------------------------------------------------
// Constantes internas
// ---------------------------------------------------------------------------

/** URL base de la REST API de Airtable (versión 0). */
const BASE_URL = 'https://api.airtable.com/v0'

// ---------------------------------------------------------------------------
// Función principal
// ---------------------------------------------------------------------------

/**
 * Realiza una petición GET a una tabla de Airtable y devuelve los registros paginados.
 *
 * @param tableName - Nombre exacto de la tabla en Airtable (sensible a mayúsculas).
 * @param params    - Parámetros opcionales de query string (p.ej. pageSize, offset, filterByFormula).
 * @returns         Promesa con la respuesta tipada de Airtable.
 *
 * @throws Error si la respuesta HTTP no es exitosa, con el mensaje devuelto por la API.
 */
export async function airtableFetch<T>(
  tableName: string,
  params?: Record<string, string>
): Promise<AirtableResponse<T>> {
  // Las variables ya fueron validadas en el arranque; la aserción es segura aquí
  // NOTA: casting via `as string` justificado — validación en tiempo de arranque garantiza valor
  const apiKey = process.env.AIRTABLE_API_KEY as string
  const baseId = process.env.AIRTABLE_BASE_ID as string

  // Construcción de la URL con query string opcional
  const url = new URL(`${BASE_URL}/${baseId}/${encodeURIComponent(tableName)}`)

  if (params) {
    for (const [clave, valor] of Object.entries(params)) {
      url.searchParams.set(clave, valor)
    }
  }

  const respuesta = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
  })

  if (!respuesta.ok) {
    // Intentar leer el cuerpo del error para un mensaje más descriptivo
    let detalle = `HTTP ${respuesta.status} ${respuesta.statusText}`
    try {
      // NOTA: casting via `unknown` antes de acceder a propiedades — evita `any`
      const cuerpoError = await respuesta.json() as { error?: { message?: string } }
      if (cuerpoError.error?.message) {
        detalle = cuerpoError.error.message
      }
    } catch {
      // Si el cuerpo no es JSON válido, mantener el mensaje HTTP genérico
    }

    throw new Error(
      `Error al consultar la tabla "${tableName}" en Airtable: ${detalle}`
    )
  }

  // NOTA: casting via `unknown` antes del tipo final — la forma del JSON coincide con AirtableResponse<T>
  return respuesta.json() as Promise<AirtableResponse<T>>
}
