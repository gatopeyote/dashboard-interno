'use client'

// Vista de clientes: componente cliente que orquesta la tabla, el modal y las acciones.
// Recibe la lista inicial de clientes como prop del Server Component padre.
// Las mutaciones se ejecutan a través de Server Actions y muestran errores al usuario.

import { useState } from 'react'

import { TablaClientes } from '../../components/TablaClientes'
import { FormularioCliente } from '../../components/FormularioCliente'
import {
  crearClienteAction,
  actualizarClienteAction,
  desactivarClienteAction,
} from './acciones'

import type { Cliente, ClienteNuevo } from '../../types'

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

/** Estado del modal: cerrado, modo crear o modo editar. */
type EstadoModal = 'crear' | 'editar' | null

interface ClientesViewProps {
  /** Lista inicial de clientes cargada por el Server Component. */
  clientes: Cliente[]
}

// ---------------------------------------------------------------------------
// Componente
// ---------------------------------------------------------------------------

export function ClientesView({ clientes }: ClientesViewProps) {
  // Control del modal y del cliente en edición
  const [modalAbierto, setModalAbierto] = useState<EstadoModal>(null)
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null)

  // Estado optimista local: reflejar cambios mientras revalida el servidor
  const [listaLocal, setListaLocal] = useState<Cliente[]>(clientes)

  // Estado de error de las server actions para mostrar al usuario
  const [errorAccion, setErrorAccion] = useState<string | null>(null)

  // Indica si hay una acción en curso (deshabilita botones)
  const [guardando, setGuardando] = useState(false)

  // ---------------------------------------------------------------------------
  // Manejadores de modal
  // ---------------------------------------------------------------------------

  /** Abre el modal en modo crear. */
  const abrirCrear = () => {
    setClienteSeleccionado(null)
    setErrorAccion(null)
    setModalAbierto('crear')
  }

  /** Abre el modal en modo editar con el cliente recibido. */
  const abrirEditar = (cliente: Cliente) => {
    setClienteSeleccionado(cliente)
    setErrorAccion(null)
    setModalAbierto('editar')
  }

  /** Cierra el modal y limpia el estado de selección. */
  const cerrarModal = () => {
    setModalAbierto(null)
    setClienteSeleccionado(null)
    setErrorAccion(null)
  }

  // ---------------------------------------------------------------------------
  // Manejadores de acciones
  // ---------------------------------------------------------------------------

  /**
   * Guarda un cliente: crea uno nuevo o actualiza el existente.
   * Llama a la server action correspondiente y actualiza la lista local.
   */
  const manejarGuardar = async (datos: ClienteNuevo) => {
    setGuardando(true)
    setErrorAccion(null)

    try {
      if (modalAbierto === 'crear') {
        // --- Crear cliente ---
        const resultado = await crearClienteAction(datos)

        if (!resultado.ok) {
          setErrorAccion(resultado.mensaje)
          return
        }

        // Añadir al inicio de la lista local
        setListaLocal((prev) => [resultado.datos, ...prev])
      } else if (modalAbierto === 'editar' && clienteSeleccionado !== null) {
        // --- Actualizar cliente ---
        const resultado = await actualizarClienteAction(clienteSeleccionado.id, datos)

        if (!resultado.ok) {
          setErrorAccion(resultado.mensaje)
          return
        }

        // Reemplazar el registro actualizado en la lista local
        setListaLocal((prev) =>
          prev.map((c) => (c.id === resultado.datos.id ? resultado.datos : c))
        )
      }

      cerrarModal()
    } finally {
      setGuardando(false)
    }
  }

  /**
   * Desactiva un cliente.
   * Elimina el registro de la lista local inmediatamente (eliminación lógica).
   */
  const manejarDesactivar = async (cliente: Cliente) => {
    const confirmado = window.confirm(
      `¿Desactivar al cliente "${cliente.nombre}"? Esta acción se puede revertir desde la base de datos.`
    )
    if (!confirmado) return

    setGuardando(true)
    setErrorAccion(null)

    try {
      const resultado = await desactivarClienteAction(cliente.id)

      if (!resultado.ok) {
        setErrorAccion(resultado.mensaje)
        return
      }

      // Quitar el cliente de la lista local (ya no está activo)
      setListaLocal((prev) => prev.filter((c) => c.id !== cliente.id))
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
          <h1 className="text-xl font-semibold text-gray-900">Clientes</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gestiona el alta, edición y desactivación de clientes.
          </p>
        </div>

        {/* Botón para abrir el modal de creación */}
        <button
          onClick={abrirCrear}
          disabled={guardando}
          className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {/* Icono + */}
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Nuevo cliente
        </button>
      </div>

      {/* Mensaje de error de una acción (crear/editar/desactivar) */}
      {errorAccion !== null && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3" role="alert">
          <p className="text-sm font-medium text-red-700">Error al guardar</p>
          <p className="mt-0.5 text-sm text-red-600">{errorAccion}</p>
        </div>
      )}

      {/* Modal de creación / edición */}
      {modalAbierto !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={(e) => {
            // Cerrar al pulsar fuera del formulario
            if (e.target === e.currentTarget) cerrarModal()
          }}
        >
          <div className="w-full max-w-md">
            <FormularioCliente
              cliente={modalAbierto === 'editar' ? clienteSeleccionado ?? undefined : undefined}
              onGuardar={manejarGuardar}
              onCancelar={cerrarModal}
            />
          </div>
        </div>
      )}

      {/* Tabla de clientes */}
      <TablaClientes
        clientes={listaLocal}
        cargando={false}
        error={null}
        onEditar={abrirEditar}
        onDesactivar={manejarDesactivar}
      />
    </div>
  )
}
