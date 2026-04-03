// Formulario de alta y edición de clientes.
// Si recibe la prop `cliente`, opera en modo edición (pre-rellena los campos).
// Si no la recibe, opera en modo alta (campos en blanco).
// La validación se ejecuta antes de llamar a `onGuardar`.
// No realiza llamadas a la base de datos; delega la persistencia al padre.

import { useState } from 'react'

import type { Cliente, ClienteNuevo, EstadoCliente } from '../types'

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

interface FormularioClienteProps {
  /** Cliente existente para edición. Si es undefined, el formulario es de alta. */
  cliente?: Cliente
  /** Callback ejecutado al confirmar el formulario con datos válidos. */
  onGuardar: (datos: ClienteNuevo) => void
  /** Callback ejecutado al cancelar sin guardar cambios. */
  onCancelar: () => void
}

// Estado interno del formulario
interface CamposFormulario {
  nombre: string
  email: string
  estado: EstadoCliente
}

// Errores de validación por campo
interface ErroresCampos {
  nombre?: string
  email?: string
  estado?: string
}

// ---------------------------------------------------------------------------
// Constantes
// ---------------------------------------------------------------------------

/** Regex estándar para validar formato de email. */
const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Opciones disponibles para el selector de estado. */
const OPCIONES_ESTADO: { valor: EstadoCliente; etiqueta: string }[] = [
  { valor: 'activo', etiqueta: 'Activo' },
  { valor: 'inactivo', etiqueta: 'Inactivo' },
  { valor: 'pendiente', etiqueta: 'Pendiente' },
]

// ---------------------------------------------------------------------------
// Helpers de validación
// ---------------------------------------------------------------------------

/**
 * Valida los campos del formulario y devuelve un objeto de errores.
 * Si no hay errores, devuelve un objeto vacío.
 */
function validarCampos(campos: CamposFormulario): ErroresCampos {
  const errores: ErroresCampos = {}

  if (campos.nombre.trim().length === 0) {
    errores.nombre = 'El nombre es obligatorio.'
  } else if (campos.nombre.trim().length < 2) {
    errores.nombre = 'El nombre debe tener al menos 2 caracteres.'
  }

  if (campos.email.trim().length === 0) {
    errores.email = 'El correo electrónico es obligatorio.'
  } else if (!REGEX_EMAIL.test(campos.email.trim())) {
    errores.email = 'Ingresa un correo electrónico válido (ej: usuario@dominio.com).'
  }

  if (!OPCIONES_ESTADO.some((op) => op.valor === campos.estado)) {
    errores.estado = 'Selecciona un estado válido.'
  }

  return errores
}

// ---------------------------------------------------------------------------
// Sub-componente: campo de texto con etiqueta y error
// ---------------------------------------------------------------------------

interface CampoTextoProps {
  id: string
  etiqueta: string
  tipo?: 'text' | 'email'
  valor: string
  error?: string
  placeholder?: string
  onChange: (valor: string) => void
}

function CampoTexto({
  id,
  etiqueta,
  tipo = 'text',
  valor,
  error,
  placeholder,
  onChange,
}: CampoTextoProps) {
  const tieneError = error !== undefined && error.length > 0

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {etiqueta}
        <span className="ml-0.5 text-red-500" aria-hidden="true">*</span>
      </label>
      <input
        id={id}
        type={tipo}
        value={valor}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={tieneError}
        aria-describedby={tieneError ? `${id}-error` : undefined}
        className={`mt-1 block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 ${
          tieneError
            ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500'
            : 'border-gray-300 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500'
        }`}
      />
      {/* Mensaje de error visible bajo el campo */}
      {tieneError && (
        <p id={`${id}-error`} className="mt-1 text-xs text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Componente principal
// ---------------------------------------------------------------------------

export function FormularioCliente({ cliente, onGuardar, onCancelar }: FormularioClienteProps) {
  const esEdicion = cliente !== undefined

  // Estado de los campos del formulario
  const [campos, setCampos] = useState<CamposFormulario>({
    nombre: cliente?.nombre ?? '',
    email: cliente?.email ?? '',
    estado: cliente?.estado ?? 'pendiente',
  })

  // Errores de validación (solo se muestran tras el primer intento de envío)
  const [errores, setErrores] = useState<ErroresCampos>({})

  // Indica si el usuario ya intentó enviar el formulario al menos una vez
  const [enviado, setEnviado] = useState(false)

  // ---------------------------------------------------------------------------
  // Manejadores
  // ---------------------------------------------------------------------------

  /** Actualiza un campo individual y, si ya se intentó enviar, revalida. */
  const actualizarCampo = <K extends keyof CamposFormulario>(
    clave: K,
    valor: CamposFormulario[K],
  ) => {
    const nuevosCampos = { ...campos, [clave]: valor }
    setCampos(nuevosCampos)

    // Revalidar en tiempo real después del primer intento de envío
    if (enviado) {
      setErrores(validarCampos(nuevosCampos))
    }
  }

  /** Valida y, si todo es correcto, llama a onGuardar. */
  const manejarEnvio = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setEnviado(true)

    const erroresActuales = validarCampos(campos)
    setErrores(erroresActuales)

    // Solo enviar si no hay ningún error de validación
    const sinErrores = Object.keys(erroresActuales).length === 0
    if (!sinErrores) return

    onGuardar({
      nombre: campos.nombre.trim(),
      email: campos.email.trim(),
      estado: campos.estado,
    })
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
      {/* Título dinámico según modo */}
      <h2 className="text-base font-semibold leading-6 text-gray-900">
        {esEdicion ? 'Editar cliente' : 'Nuevo cliente'}
      </h2>

      {/* Campo: nombre */}
      <CampoTexto
        id="nombre"
        etiqueta="Nombre"
        valor={campos.nombre}
        error={errores.nombre}
        placeholder="Nombre completo o razón social"
        onChange={(valor) => actualizarCampo('nombre', valor)}
      />

      {/* Campo: email */}
      <CampoTexto
        id="email"
        etiqueta="Correo electrónico"
        tipo="email"
        valor={campos.email}
        error={errores.email}
        placeholder="usuario@dominio.com"
        onChange={(valor) => actualizarCampo('email', valor)}
      />

      {/* Campo: estado */}
      <div>
        <label htmlFor="estado" className="block text-sm font-medium text-gray-700">
          Estado
        </label>
        <select
          id="estado"
          value={campos.estado}
          onChange={(e) => actualizarCampo('estado', e.target.value as EstadoCliente)}
          aria-invalid={errores.estado !== undefined}
          aria-describedby={errores.estado ? 'estado-error' : undefined}
          className={`mt-1 block w-full rounded-md border bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 ${
            errores.estado
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
          }`}
        >
          {OPCIONES_ESTADO.map(({ valor, etiqueta }) => (
            <option key={valor} value={valor}>
              {etiqueta}
            </option>
          ))}
        </select>
        {/* Mensaje de error del estado */}
        {errores.estado && (
          <p id="estado-error" className="mt-1 text-xs text-red-600" role="alert">
            {errores.estado}
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

        {/* Botón guardar */}
        <button
          type="submit"
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          {esEdicion ? 'Guardar cambios' : 'Crear cliente'}
        </button>
      </div>
    </form>
  )
}
