// Constantes y metadatos de roles del sistema.
// Centraliza las opciones de rol para evitar duplicación entre formularios.

import type { RolUsuario } from '../types/index'

/** Opciones de rol con etiqueta y descripción para uso en formularios. */
export const OPCIONES_ROL: {
  valor: RolUsuario
  etiqueta: string
  descripcion: string
}[] = [
  {
    valor: 'admin',
    etiqueta: 'Admin',
    descripcion: 'Acceso completo al sistema, incluyendo gestión de usuarios.',
  },
  {
    valor: 'operador',
    etiqueta: 'Operador',
    descripcion: 'Puede gestionar clientes y procesos, sin acceso a configuración.',
  },
  {
    valor: 'viewer',
    etiqueta: 'Viewer',
    descripcion: 'Solo lectura. No puede realizar cambios en el sistema.',
  },
]
