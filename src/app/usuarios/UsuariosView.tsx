'use client'

// Vista de usuarios: componente cliente que orquesta la tabla, modales y acciones.
// Recibe la lista inicial de usuarios como prop del Server Component padre.
// Las mutaciones se ejecutan a través de Server Actions y muestran errores al usuario.

import { useState } from 'react'

import { TablaUsuarios } from '../../components/TablaUsuarios'
import { FormularioInvitacion } from '../../components/FormularioInvitacion'
import { FormularioRol } from '../../components/FormularioRol'
import {
  invitarUsuarioAction,
  actualizarRolAction,
  desactivarUsuarioAction,
} from './acciones'

import type { RolUsuario, Usuario, UsuarioNuevo } from '../../types'

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

/** Estado del modal: cerrado, invitar nuevo usuario o editar rol de uno existente. */
type EstadoModal = 'invitar' | 'editarRol' | null

interface UsuariosViewProps {
  /** Lista inicial de usuarios cargada por el Server Component. */
  usuarios: Usuario[]
}

// ---------------------------------------------------------------------------
// Componente
// ---------------------------------------------------------------------------

export function UsuariosView({ usuarios }: UsuariosViewProps) {
  // Control del modal activo
  const [modalAbierto, setModalAbierto] = useState<EstadoModal>(null)
  // Usuario seleccionado para editar rol
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<Usuario | null>(null)

  // Estado local de la lista para reflejar cambios optimistas
  const [listaLocal, setListaLocal] = useState<Usuario[]>(usuarios)

  // Error de las server actions para mostrar al usuario
  const [errorAccion, setErrorAccion] = useState<string | null>(null)

  // Indica si hay una acción en curso
  const [guardando, setGuardando] = useState(false)

  // ---------------------------------------------------------------------------
  // Manejadores de modal
  // ---------------------------------------------------------------------------

  /** Abre el modal de invitación de nuevo usuario. */
  const abrirInvitar = () => {
    setErrorAccion(null)
    setModalAbierto('invitar')
  }

  /** Abre el modal de edición de rol para el usuario indicado. */
  const abrirEditarRol = (usuario: Usuario) => {
    setUsuarioSeleccionado(usuario)
    setErrorAccion(null)
    setModalAbierto('editarRol')
  }

  /** Cierra el modal activo y limpia el estado de selección. */
  const cerrarModal = () => {
    setModalAbierto(null)
    setUsuarioSeleccionado(null)
    setErrorAccion(null)
  }

  // ---------------------------------------------------------------------------
  // Manejadores de acciones
  // ---------------------------------------------------------------------------

  /**
   * Invita a un nuevo usuario.
   * Llama a la server action y añade el registro a la lista local.
   */
  const manejarInvitar = async (datos: UsuarioNuevo) => {
    setGuardando(true)
    setErrorAccion(null)

    try {
      const resultado = await invitarUsuarioAction(datos)

      if (!resultado.ok) {
        setErrorAccion(resultado.mensaje)
        return
      }

      // Añadir al inicio de la lista local
      setListaLocal((prev) => [resultado.datos, ...prev])
      cerrarModal()
    } finally {
      setGuardando(false)
    }
  }

  /**
   * Actualiza el rol de un usuario existente.
   * Reemplaza el registro actualizado en la lista local.
   */
  const manejarGuardarRol = async (id: string, rol: RolUsuario) => {
    setGuardando(true)
    setErrorAccion(null)

    try {
      const resultado = await actualizarRolAction(id, rol)

      if (!resultado.ok) {
        setErrorAccion(resultado.mensaje)
        return
      }

      // Reemplazar el usuario actualizado en la lista local
      setListaLocal((prev) =>
        prev.map((u) => (u.id === resultado.datos.id ? resultado.datos : u))
      )
      cerrarModal()
    } finally {
      setGuardando(false)
    }
  }

  /**
   * Desactiva un usuario.
   * Elimina el registro de la lista local inmediatamente (eliminación lógica).
   */
  const manejarDesactivar = async (id: string) => {
    const usuario = listaLocal.find((u) => u.id === id)
    const nombre = usuario?.nombre ?? 'este usuario'

    const confirmado = window.confirm(
      `¿Desactivar a "${nombre}"? Esta acción se puede revertir desde la base de datos.`
    )
    if (!confirmado) return

    setGuardando(true)
    setErrorAccion(null)

    try {
      const resultado = await desactivarUsuarioAction(id)

      if (!resultado.ok) {
        setErrorAccion(resultado.mensaje)
        return
      }

      // Quitar el usuario de la lista local
      setListaLocal((prev) => prev.filter((u) => u.id !== id))
    } finally {
      setGuardando(false)
    }
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="space-y-6">
      {/* Cabecera de página */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Usuarios</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gestiona el acceso, roles e invitaciones de usuarios del sistema.
          </p>
        </div>

        {/* Botón para invitar nuevo usuario */}
        <button
          onClick={abrirInvitar}
          disabled={guardando}
          className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {/* Icono + */}
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Invitar usuario
        </button>
      </div>

      {/* Mensaje de error de una acción */}
      {errorAccion !== null && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3" role="alert">
          <p className="text-sm font-medium text-red-700">Error al guardar</p>
          <p className="mt-0.5 text-sm text-red-600">{errorAccion}</p>
        </div>
      )}

      {/* Modal de invitación */}
      {modalAbierto === 'invitar' && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) cerrarModal()
          }}
        >
          <div className="w-full max-w-md">
            <FormularioInvitacion
              onInvitar={manejarInvitar}
              onCancelar={cerrarModal}
            />
          </div>
        </div>
      )}

      {/* Modal de edición de rol */}
      {modalAbierto === 'editarRol' && usuarioSeleccionado !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) cerrarModal()
          }}
        >
          <div className="w-full max-w-md">
            <FormularioRol
              usuario={usuarioSeleccionado}
              onGuardar={manejarGuardarRol}
              onCancelar={cerrarModal}
            />
          </div>
        </div>
      )}

      {/* Tabla de usuarios */}
      <TablaUsuarios
        usuarios={listaLocal}
        cargando={false}
        error={null}
        onEditarRol={abrirEditarRol}
        onDesactivar={manejarDesactivar}
      />
    </div>
  )
}
