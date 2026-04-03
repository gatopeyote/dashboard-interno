// API de usuarios — gestión de roles y accesos sobre la tabla `usuarios`.
// Toda escritura registra un evento en `eventos_auditoria`.
// Los registros NUNCA se eliminan físicamente; se usa el campo `activo = false`.
//
// NOTA: Los castings `data as Usuario` son temporales hasta que se generen los tipos
// tipados de Supabase con `supabase gen types typescript --project-id <id> > src/types/supabase.ts`
// y se reemplace `createClient` por `createClient<Database>` en src/lib/supabase.ts.

import { supabase } from '../lib/supabase'
import { registrarAuditoria } from '../lib/auditoria'

import type {
  RespuestaAPI,
  RolUsuario,
  Usuario,
  UsuarioNuevo,
} from '../types/index'

// ---------------------------------------------------------------------------
// Constantes internas
// ---------------------------------------------------------------------------

/** Nombre de la tabla principal de usuarios. */
const TABLA_USUARIOS = 'usuarios'

// ---------------------------------------------------------------------------
// Lectura
// ---------------------------------------------------------------------------

/**
 * Devuelve todos los usuarios activos (activo = true), ordenados por fecha de creación descendente.
 * Los registros desactivados se excluyen por defecto.
 */
export async function obtenerUsuarios(): Promise<RespuestaAPI<Usuario[]>> {
  const { data, error } = await supabase
    .from(TABLA_USUARIOS)
    .select('*')
    .eq('activo', true)
    .order('creado_en', { ascending: false })

  if (error) {
    return {
      ok: false,
      mensaje: `Error al obtener la lista de usuarios: ${error.message}`,
    }
  }

  // NOTA: casting temporal hasta contar con tipos generados por Supabase CLI.
  return { ok: true, datos: data as Usuario[] }
}

/**
 * Devuelve un único usuario activo por su UUID.
 * Retorna error si no existe o si fue desactivado.
 *
 * @param id - UUID del usuario a buscar.
 */
export async function obtenerUsuarioPorId(
  id: string
): Promise<RespuestaAPI<Usuario>> {
  if (!id) {
    return { ok: false, mensaje: 'Se requiere un ID válido para buscar el usuario.' }
  }

  const { data, error } = await supabase
    .from(TABLA_USUARIOS)
    .select('*')
    .eq('id', id)
    .eq('activo', true)
    .single()

  if (error) {
    return {
      ok: false,
      mensaje: `No se encontró el usuario con ID "${id}": ${error.message}`,
    }
  }

  // NOTA: casting temporal hasta contar con tipos generados por Supabase CLI.
  return { ok: true, datos: data as Usuario }
}

// ---------------------------------------------------------------------------
// Escritura
// ---------------------------------------------------------------------------

/**
 * Invita a un nuevo usuario al sistema insertando su registro con activo = true.
 * Registra el evento de auditoría correspondiente.
 *
 * @param datos     - Datos del usuario a crear (nombre, email, rol).
 * @param usuarioId - ID del usuario que realiza la acción (para auditoría).
 */
export async function invitarUsuario(
  datos: UsuarioNuevo,
  usuarioId: string
): Promise<RespuestaAPI<Usuario>> {
  if (!datos.nombre?.trim()) {
    return { ok: false, mensaje: 'El nombre del usuario es obligatorio.' }
  }
  if (!datos.email?.trim()) {
    return { ok: false, mensaje: 'El correo electrónico del usuario es obligatorio.' }
  }
  if (!datos.rol) {
    return { ok: false, mensaje: 'El rol del usuario es obligatorio.' }
  }

  const { data, error } = await supabase
    .from(TABLA_USUARIOS)
    .insert({ ...datos, activo: true })
    .select()
    .single()

  if (error) {
    return {
      ok: false,
      mensaje: `No se pudo invitar al usuario: ${error.message}`,
    }
  }

  // NOTA: casting temporal hasta contar con tipos generados por Supabase CLI.
  const usuarioCreado = data as Usuario

  await registrarAuditoria({
    usuario_id: usuarioId,
    accion: 'invitar',
    tabla: TABLA_USUARIOS,
    registro_id: usuarioCreado.id,
  })

  return { ok: true, datos: usuarioCreado }
}

/**
 * Actualiza únicamente el campo `rol` de un usuario activo.
 * Registra el evento de auditoría correspondiente.
 *
 * @param id        - UUID del usuario a actualizar.
 * @param rol       - Nuevo rol a asignar ('admin' | 'operador' | 'viewer').
 * @param usuarioId - ID del usuario que realiza la acción (para auditoría).
 */
export async function actualizarRol(
  id: string,
  rol: RolUsuario,
  usuarioId: string
): Promise<RespuestaAPI<Usuario>> {
  if (!id) {
    return { ok: false, mensaje: 'Se requiere un ID válido para actualizar el rol.' }
  }
  if (!rol) {
    return { ok: false, mensaje: 'Se requiere especificar el nuevo rol del usuario.' }
  }

  const { data, error } = await supabase
    .from(TABLA_USUARIOS)
    .update({ rol })
    .eq('id', id)
    .eq('activo', true)
    .select()
    .single()

  if (error) {
    return {
      ok: false,
      mensaje: `No se pudo actualizar el rol del usuario con ID "${id}": ${error.message}`,
    }
  }

  // NOTA: casting temporal hasta contar con tipos generados por Supabase CLI.
  const usuarioActualizado = data as Usuario

  await registrarAuditoria({
    usuario_id: usuarioId,
    accion: 'actualizar_rol',
    tabla: TABLA_USUARIOS,
    registro_id: usuarioActualizado.id,
  })

  return { ok: true, datos: usuarioActualizado }
}

/**
 * Desactiva un usuario estableciendo `activo = false`.
 * El registro NO se elimina de la base de datos.
 * Registra el evento de auditoría correspondiente.
 *
 * @param id        - UUID del usuario a desactivar.
 * @param usuarioId - ID del usuario que realiza la acción (para auditoría).
 */
export async function desactivarUsuario(
  id: string,
  usuarioId: string
): Promise<RespuestaAPI<Usuario>> {
  if (!id) {
    return { ok: false, mensaje: 'Se requiere un ID válido para desactivar el usuario.' }
  }

  const { data, error } = await supabase
    .from(TABLA_USUARIOS)
    .update({ activo: false })
    .eq('id', id)
    .eq('activo', true)
    .select()
    .single()

  if (error) {
    return {
      ok: false,
      mensaje: `No se pudo desactivar el usuario con ID "${id}": ${error.message}`,
    }
  }

  // NOTA: casting temporal hasta contar con tipos generados por Supabase CLI.
  const usuarioDesactivado = data as Usuario

  await registrarAuditoria({
    usuario_id: usuarioId,
    accion: 'desactivar',
    tabla: TABLA_USUARIOS,
    registro_id: usuarioDesactivado.id,
  })

  return { ok: true, datos: usuarioDesactivado }
}
