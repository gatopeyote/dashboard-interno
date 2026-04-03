// Tipos e interfaces del dominio para el dashboard interno.
// Reflejan directamente el esquema de la base de datos en Supabase.

// ---------------------------------------------------------------------------
// Clientes
// ---------------------------------------------------------------------------

/** Estados posibles de un cliente dentro del sistema. */
export type EstadoCliente = 'activo' | 'inactivo' | 'pendiente'

/** Representa un cliente registrado en la base de datos. */
export interface Cliente {
  /** Identificador único del cliente (UUID generado por Supabase). */
  id: string
  /** Nombre completo o razón social del cliente. */
  nombre: string
  /** Correo electrónico de contacto principal. */
  email: string
  /** Estado operativo actual del cliente. */
  estado: EstadoCliente
  /** Indica si el registro está activo; false equivale a eliminación lógica. */
  activo: boolean
  /** Fecha y hora de creación del registro en formato ISO 8601. */
  creado_en: string
}

/** Datos requeridos para crear un nuevo cliente. */
export interface ClienteNuevo {
  nombre: string
  email: string
  estado: EstadoCliente
}

/** Campos permitidos al actualizar un cliente existente. */
export interface ClienteActualizable {
  nombre?: string
  email?: string
  estado?: EstadoCliente
}

// ---------------------------------------------------------------------------
// Auditoría
// ---------------------------------------------------------------------------

/** Registro de una acción realizada sobre cualquier tabla del sistema. */
export interface EventoAuditoria {
  /** Identificador único del evento (UUID). */
  id: string
  /** ID del usuario que ejecutó la acción. */
  usuario_id: string
  /** Descripción de la acción realizada (p.ej. 'crear', 'actualizar', 'desactivar'). */
  accion: string
  /** Nombre de la tabla afectada. */
  tabla: string
  /** ID del registro afectado dentro de la tabla. */
  registro_id: string
  /** Marca de tiempo del momento en que ocurrió el evento (ISO 8601). */
  timestamp: string
}

/** Datos necesarios para insertar un nuevo evento de auditoría. */
export interface EventoAuditoriaNew {
  usuario_id: string
  accion: string
  tabla: string
  registro_id: string
}

// ---------------------------------------------------------------------------
// Usuarios
// ---------------------------------------------------------------------------

/** Roles posibles dentro del sistema. */
export type RolUsuario = 'admin' | 'operador' | 'viewer'

/** Representa un usuario del sistema con su rol y estado de acceso. */
export interface Usuario {
  /** Identificador único del usuario (UUID generado por Supabase). */
  id: string
  /** Correo electrónico del usuario (usado como credencial de acceso). */
  email: string
  /** Nombre completo del usuario. */
  nombre: string
  /** Rol que determina los permisos del usuario dentro del sistema. */
  rol: RolUsuario
  /** Indica si el usuario tiene acceso activo al sistema. */
  activo: boolean
  /** Fecha y hora de creación del registro en formato ISO 8601. */
  creado_en: string
}

/** Datos requeridos para invitar a un nuevo usuario al sistema. */
export interface UsuarioNuevo {
  nombre: string
  email: string
  rol: RolUsuario
}

/** Campos permitidos al actualizar un usuario existente. */
export interface UsuarioActualizable {
  nombre?: string
  rol?: RolUsuario
}

// ---------------------------------------------------------------------------
// Respuestas genéricas de la capa de API
// ---------------------------------------------------------------------------

/** Respuesta exitosa que envuelve un resultado tipado. */
export interface RespuestaExitosa<T> {
  ok: true
  datos: T
}

/** Respuesta de error con mensaje descriptivo en español. */
export interface RespuestaError {
  ok: false
  mensaje: string
}

/** Unión discriminada para el resultado de cualquier operación de API. */
export type RespuestaAPI<T> = RespuestaExitosa<T> | RespuestaError

// ---------------------------------------------------------------------------
// Airtable — registros operativos
// ---------------------------------------------------------------------------

/**
 * Registro de operación proveniente de la tabla `Operaciones` en Airtable.
 * Los nombres de campo son genéricos; se completarán al conectar la base real.
 */
export interface RegistroOperacion {
  /** Identificador único del registro en Airtable. */
  id: string
  /** Nombre o descripción de la operación. */
  nombre: string
  /** Estado actual de la operación. */
  estado: EstadoOperacion
  /** Fecha de la operación en formato ISO 8601. */
  fecha: string
}

/**
 * Registro de cliente proveniente de la tabla `Clientes` en Airtable.
 * Complementa la información operativa almacenada en Supabase.
 */
export interface RegistroClienteAirtable {
  /** Identificador único del registro en Airtable. */
  id: string
  /** Nombre del cliente en Airtable. */
  nombre: string
  /** Estado operativo del cliente según Airtable. */
  estado: string
}

// ---------------------------------------------------------------------------
// Operaciones — panel de estado del sistema
// ---------------------------------------------------------------------------

/** Estados posibles de una operación en Airtable. */
export type EstadoOperacion = 'pendiente' | 'completada' | 'error'

/** Vista unificada del estado del sistema, combinando métricas de Supabase y Airtable. */
export interface EstadoSistema {
  /** Total de clientes con estado activo en Supabase. */
  clientesActivos: number
  /** Total de usuarios con acceso activo en Supabase. */
  usuariosActivos: number
  /** Cantidad de operaciones en estado 'pendiente' en Airtable. */
  operacionesPendientes: number
  /** Cantidad de operaciones en estado 'completada' en Airtable. */
  operacionesCompletadas: number
  /** Cantidad de operaciones en estado 'error' en Airtable. */
  operacionesConError: number
  /**
   * Indica si los conteos de Airtable son parciales (solo primera página, máx 100 registros).
   * true cuando el total de operaciones en Airtable supera 100.
   */
  conteosParciales: boolean
  /** Últimos eventos de auditoría del sistema. */
  actividadReciente: EventoAuditoria[]
  /** Marca de tiempo de cuándo se generó este estado (ISO 8601). */
  actualizadoEn: string
}

// ---------------------------------------------------------------------------
// Reportes — métricas y resúmenes
// ---------------------------------------------------------------------------

/** Resumen diario del estado del sistema, combinando Supabase y Airtable. */
export interface ResumenDiario {
  /** Fecha del resumen en formato ISO 8601 (solo fecha, sin hora). */
  fecha: string
  /** Total de clientes con estado activo en Supabase. */
  totalClientesActivos: number
  /** Total de usuarios con acceso activo en Supabase. */
  totalUsuariosActivos: number
  /** Cantidad de operaciones registradas en Airtable para la fecha indicada. */
  operacionesDelDia: number
  /** Marca de tiempo de cuándo se generó este resumen (ISO 8601). */
  actualizadoEn: string
}

/** Métricas agregadas del estado de la cartera de clientes en Supabase. */
export interface MetricasClientes {
  /** Total de clientes con estado 'activo'. */
  totalActivos: number
  /** Total de clientes con estado 'inactivo'. */
  totalInactivos: number
  /** Total de clientes con estado 'pendiente'. */
  totalPendientes: number
  /** Clientes creados en los últimos 7 días naturales. */
  altasUltimos7Dias: number
  /** Marca de tiempo de cuándo se generó esta métrica (ISO 8601). */
  actualizadoEn: string
}
