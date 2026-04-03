'use server'

// Server Actions del módulo de usuarios.
// Cada acción llama a la capa de API, registra auditoría y revalida la ruta.
// El userId es un placeholder hasta que se implemente autenticación.

import { revalidatePath } from 'next/cache'

import { invitarUsuario, actualizarRol, desactivarUsuario } from '../../api/usuarios'

import type { RespuestaAPI, RolUsuario, Usuario, UsuarioNuevo } from '../../types'

// ---------------------------------------------------------------------------
// Constante: usuario del sistema (placeholder de autenticación)
// ---------------------------------------------------------------------------

/** UUID del usuario de sistema usado hasta que se implemente auth real. */
const USUARIO_SISTEMA = '00000000-0000-0000-0000-000000000001'
// TODO: reemplazar con auth.uid() cuando se implemente autenticación

// ---------------------------------------------------------------------------
// Acciones
// ---------------------------------------------------------------------------

/**
 * Invita a un nuevo usuario al sistema y revalida la página de usuarios.
 *
 * @param datos - Campos requeridos: nombre, email y rol.
 */
export async function invitarUsuarioAction(
  datos: UsuarioNuevo
): Promise<RespuestaAPI<Usuario>> {
  const resultado = await invitarUsuario(datos, USUARIO_SISTEMA)

  if (resultado.ok) {
    revalidatePath('/usuarios')
  }

  return resultado
}

/**
 * Actualiza el rol de un usuario existente y revalida la ruta.
 *
 * @param id  - UUID del usuario a actualizar.
 * @param rol - Nuevo rol a asignar ('admin' | 'operador' | 'viewer').
 */
export async function actualizarRolAction(
  id: string,
  rol: RolUsuario
): Promise<RespuestaAPI<Usuario>> {
  const resultado = await actualizarRol(id, rol, USUARIO_SISTEMA)

  if (resultado.ok) {
    revalidatePath('/usuarios')
  }

  return resultado
}

/**
 * Desactiva un usuario (eliminación lógica) y revalida la ruta.
 *
 * @param id - UUID del usuario a desactivar.
 */
export async function desactivarUsuarioAction(
  id: string
): Promise<RespuestaAPI<Usuario>> {
  const resultado = await desactivarUsuario(id, USUARIO_SISTEMA)

  if (resultado.ok) {
    revalidatePath('/usuarios')
  }

  return resultado
}
