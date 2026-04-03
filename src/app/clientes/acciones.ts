'use server'

// Server Actions del módulo de clientes.
// Cada acción llama a la capa de API, registra auditoría y revalida la ruta.
// El userId es un placeholder hasta que se implemente autenticación.

import { revalidatePath } from 'next/cache'

import { crearCliente, actualizarCliente, desactivarCliente } from '../../api/clientes'

import type { ClienteActualizable, ClienteNuevo, RespuestaAPI, Cliente } from '../../types'

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
 * Crea un nuevo cliente y revalida la página de clientes.
 *
 * @param datos - Campos requeridos para el alta: nombre, email y estado.
 */
export async function crearClienteAction(
  datos: ClienteNuevo
): Promise<RespuestaAPI<Cliente>> {
  const resultado = await crearCliente(datos, USUARIO_SISTEMA)

  if (resultado.ok) {
    revalidatePath('/clientes')
  }

  return resultado
}

/**
 * Actualiza los campos permitidos de un cliente existente y revalida la ruta.
 *
 * @param id    - UUID del cliente a actualizar.
 * @param datos - Campos a modificar (parcial: nombre, email, estado).
 */
export async function actualizarClienteAction(
  id: string,
  datos: ClienteActualizable
): Promise<RespuestaAPI<Cliente>> {
  const resultado = await actualizarCliente(id, datos, USUARIO_SISTEMA)

  if (resultado.ok) {
    revalidatePath('/clientes')
  }

  return resultado
}

/**
 * Desactiva un cliente (eliminación lógica) y revalida la ruta.
 *
 * @param id - UUID del cliente a desactivar.
 */
export async function desactivarClienteAction(
  id: string
): Promise<RespuestaAPI<Cliente>> {
  const resultado = await desactivarCliente(id, USUARIO_SISTEMA)

  if (resultado.ok) {
    revalidatePath('/clientes')
  }

  return resultado
}
