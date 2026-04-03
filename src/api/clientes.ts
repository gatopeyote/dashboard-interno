// API de clientes — operaciones CRUD sobre la tabla `clientes`.
// Toda escritura registra un evento en `eventos_auditoria`.
// Los registros NUNCA se eliminan físicamente; se usa el campo `activo = false`.
//
// NOTA: Los castings `data as Cliente` son temporales hasta que se generen los tipos
// tipados de Supabase con `supabase gen types typescript --project-id <id> > src/types/supabase.ts`
// y se reemplace `createClient` por `createClient<Database>` en src/lib/supabase.ts.

import { supabase } from '../lib/supabase'
import { registrarAuditoria } from '../lib/auditoria'

import type {
  Cliente,
  ClienteActualizable,
  ClienteNuevo,
  RespuestaAPI,
} from '../types/index'

// ---------------------------------------------------------------------------
// Constantes internas
// ---------------------------------------------------------------------------

/** Nombre de la tabla principal de clientes. */
const TABLA_CLIENTES = 'clientes'

// ---------------------------------------------------------------------------
// Lectura
// ---------------------------------------------------------------------------

/**
 * Devuelve todos los clientes activos (activo = true).
 * Los registros desactivados se excluyen por defecto.
 */
export async function obtenerClientes(): Promise<RespuestaAPI<Cliente[]>> {
  const { data, error } = await supabase
    .from(TABLA_CLIENTES)
    .select('*')
    .eq('activo', true)
    .order('creado_en', { ascending: false })

  if (error) {
    return {
      ok: false,
      mensaje: `Error al obtener la lista de clientes: ${error.message}`,
    }
  }

  return { ok: true, datos: data as Cliente[] }
}

/**
 * Devuelve un único cliente por su UUID.
 * Retorna error si no existe o si fue desactivado.
 *
 * @param id - UUID del cliente a buscar.
 */
export async function obtenerClientePorId(
  id: string
): Promise<RespuestaAPI<Cliente>> {
  if (!id) {
    return { ok: false, mensaje: 'Se requiere un ID válido para buscar el cliente.' }
  }

  const { data, error } = await supabase
    .from(TABLA_CLIENTES)
    .select('*')
    .eq('id', id)
    .eq('activo', true)
    .single()

  if (error) {
    return {
      ok: false,
      mensaje: `No se encontró el cliente con ID "${id}": ${error.message}`,
    }
  }

  return { ok: true, datos: data as Cliente }
}

// ---------------------------------------------------------------------------
// Escritura
// ---------------------------------------------------------------------------

/**
 * Crea un nuevo cliente y registra el evento de auditoría correspondiente.
 *
 * @param nuevoCliente - Datos del cliente a crear.
 * @param usuarioId    - ID del usuario que realiza la acción (para auditoría).
 */
export async function crearCliente(
  nuevoCliente: ClienteNuevo,
  usuarioId: string
): Promise<RespuestaAPI<Cliente>> {
  if (!nuevoCliente.nombre?.trim()) {
    return { ok: false, mensaje: 'El nombre del cliente es obligatorio.' }
  }
  if (!nuevoCliente.email?.trim()) {
    return { ok: false, mensaje: 'El correo electrónico del cliente es obligatorio.' }
  }

  const { data, error } = await supabase
    .from(TABLA_CLIENTES)
    .insert({ ...nuevoCliente, activo: true })
    .select()
    .single()

  if (error) {
    return {
      ok: false,
      mensaje: `No se pudo crear el cliente: ${error.message}`,
    }
  }

  const clienteCreado = data as Cliente

  await registrarAuditoria({
    usuario_id: usuarioId,
    accion: 'crear',
    tabla: TABLA_CLIENTES,
    registro_id: clienteCreado.id,
  })

  return { ok: true, datos: clienteCreado }
}

/**
 * Actualiza los campos permitidos de un cliente existente y registra auditoría.
 *
 * @param id           - UUID del cliente a actualizar.
 * @param cambios      - Campos a modificar (parcial).
 * @param usuarioId    - ID del usuario que realiza la acción (para auditoría).
 */
export async function actualizarCliente(
  id: string,
  cambios: ClienteActualizable,
  usuarioId: string
): Promise<RespuestaAPI<Cliente>> {
  if (!id) {
    return { ok: false, mensaje: 'Se requiere un ID válido para actualizar el cliente.' }
  }

  if (Object.keys(cambios).length === 0) {
    return { ok: false, mensaje: 'No se proporcionaron campos para actualizar.' }
  }

  const { data, error } = await supabase
    .from(TABLA_CLIENTES)
    .update(cambios)
    .eq('id', id)
    .eq('activo', true)
    .select()
    .single()

  if (error) {
    return {
      ok: false,
      mensaje: `No se pudo actualizar el cliente con ID "${id}": ${error.message}`,
    }
  }

  const clienteActualizado = data as Cliente

  await registrarAuditoria({
    usuario_id: usuarioId,
    accion: 'actualizar',
    tabla: TABLA_CLIENTES,
    registro_id: clienteActualizado.id,
  })

  return { ok: true, datos: clienteActualizado }
}

/**
 * Desactiva un cliente estableciendo `activo = false`.
 * El registro NO se elimina de la base de datos.
 *
 * @param id        - UUID del cliente a desactivar.
 * @param usuarioId - ID del usuario que realiza la acción (para auditoría).
 */
export async function desactivarCliente(
  id: string,
  usuarioId: string
): Promise<RespuestaAPI<Cliente>> {
  if (!id) {
    return { ok: false, mensaje: 'Se requiere un ID válido para desactivar el cliente.' }
  }

  const { data, error } = await supabase
    .from(TABLA_CLIENTES)
    .update({ activo: false, estado: 'inactivo' })
    .eq('id', id)
    .eq('activo', true)
    .select()
    .single()

  if (error) {
    return {
      ok: false,
      mensaje: `No se pudo desactivar el cliente con ID "${id}": ${error.message}`,
    }
  }

  const clienteDesactivado = data as Cliente

  await registrarAuditoria({
    usuario_id: usuarioId,
    accion: 'desactivar',
    tabla: TABLA_CLIENTES,
    registro_id: clienteDesactivado.id,
  })

  return { ok: true, datos: clienteDesactivado }
}
