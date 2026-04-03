// Formulario para cambiar el rol de un usuario existente.
// Nombre y email son de solo lectura; únicamente el rol es editable.
// Valida que se seleccione un rol diferente al actual antes de enviar.
// No realiza llamadas a la base de datos; delega la persistencia al padre.

import { useState } from 'react'

import { OPCIONES_ROL } from '../lib/roles'
import type { RolUsuario, Usuario } from '../types'
import { IndicadorRol } from './IndicadorRol'

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

interface FormularioRolProps {
  /** Usuario al que se le va a cambiar el rol. */
  usuario: Usuario
  /** Callback ejecutado al confirmar el cambio con datos válidos. */
  onGuardar: (id: string, rol: RolUsuario) => void
  /** Callback ejecutado al cancelar sin guardar cambios. */
  onCancelar: () => void
}

// ---------------------------------------------------------------------------
// Constantes
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Componente principal
// ---------------------------------------------------------------------------

export function FormularioRol({ usuario, onGuardar, onCancelar }: FormularioRolProps) {
  // Estado del rol seleccionado; inicializa con el rol actual del usuario
  const [rolSeleccionado, setRolSeleccionado] = useState<RolUsuario>(usuario.rol)

  // Error de validación del campo rol
  const [errorRol, setErrorRol] = useState<string | undefined>(undefined)

  // Indica si el usuario ya intentó guardar al menos una vez
  const [enviado, setEnviado] = useState(false)

  // ---------------------------------------------------------------------------
  // Helpers de validación
  // ---------------------------------------------------------------------------

  /**
   * Valida el rol seleccionado.
   * Devuelve un mensaje de error o undefined si es válido.
   */
  const validarRol = (rol: RolUsuario): string | undefined => {
    if (rol === usuario.rol) {
      return 'El rol seleccionado es el mismo que el actual. Elige uno diferente.'
    }
    return undefined
  }

  // ---------------------------------------------------------------------------
  // Manejadores
  // ---------------------------------------------------------------------------

  /** Actualiza el rol y, si ya se intentó guardar, revalida en tiempo real. */
  const manejarCambioRol = (nuevoRol: RolUsuario) => {
    setRolSeleccionado(nuevoRol)

    if (enviado) {
      setErrorRol(validarRol(nuevoRol))
    }
  }

  /** Valida y, si todo es correcto, llama a onGuardar. */
  const manejarEnvio = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setEnviado(true)

    const error = validarRol(rolSeleccionado)
    setErrorRol(error)

    // Solo enviar si no hay error de validación
    if (error !== undefined) return

    onGuardar(usuario.id, rolSeleccionado)
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <form
      onSubmit={manejarEnvio}
      noValidate
      className="space-y-5 rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
    >
      {/* Título */}
      <h2 className="text-base font-semibold leading-6 text-gray-900">
        Cambiar rol de usuario
      </h2>

      {/* Contexto del usuario: campos de solo lectura */}
      <div className="rounded-md bg-gray-50 p-4 space-y-3">
        <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
          Usuario
        </p>

        {/* Nombre (solo lectura) */}
        <div>
          <span className="block text-xs text-gray-500">Nombre</span>
          <span className="block text-sm font-medium text-gray-900">{usuario.nombre}</span>
        </div>

        {/* Email (solo lectura) */}
        <div>
          <span className="block text-xs text-gray-500">Correo electrónico</span>
          <span className="block text-sm text-gray-700">{usuario.email}</span>
        </div>

        {/* Rol actual */}
        <div>
          <span className="block text-xs text-gray-500 mb-1">Rol actual</span>
          <IndicadorRol rol={usuario.rol} />
        </div>
      </div>

      {/* Campo: nuevo rol */}
      <div>
        <label htmlFor="nuevo-rol" className="block text-sm font-medium text-gray-700">
          Nuevo rol
          <span className="ml-0.5 text-red-500" aria-hidden="true">*</span>
        </label>
        <select
          id="nuevo-rol"
          value={rolSeleccionado}
          onChange={(e) => manejarCambioRol(e.target.value as RolUsuario)}
          aria-invalid={errorRol !== undefined}
          aria-describedby={errorRol ? 'nuevo-rol-error' : undefined}
          className={`mt-1 block w-full rounded-md border bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 ${
            errorRol
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
          }`}
        >
          {OPCIONES_ROL.map(({ valor, etiqueta }) => (
            <option key={valor} value={valor}>
              {etiqueta}
            </option>
          ))}
        </select>

        {/* Descripción del rol seleccionado */}
        {!errorRol && (
          <p className="mt-1 text-xs text-gray-500">
            {OPCIONES_ROL.find((op) => op.valor === rolSeleccionado)?.descripcion}
          </p>
        )}

        {/* Mensaje de error */}
        {errorRol && (
          <p id="nuevo-rol-error" className="mt-1 text-xs text-red-600" role="alert">
            {errorRol}
          </p>
        )}
      </div>

      {/* Acciones */}
      <div className="flex justify-end gap-3 pt-2">
        {/* Botón cancelar */}
        <button
          type="button"
          onClick={onCancelar}
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Cancelar
        </button>

        {/* Botón guardar cambio */}
        <button
          type="submit"
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Guardar cambio
        </button>
      </div>
    </form>
  )
}
