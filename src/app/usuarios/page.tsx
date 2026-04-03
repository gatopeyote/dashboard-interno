// Página de usuarios — Server Component.
// Obtiene los usuarios desde Supabase y los pasa a UsuariosView.
// Si la carga falla muestra un mensaje de error en lugar de la vista.

export const dynamic = 'force-dynamic'

import { obtenerUsuarios } from '../../api/usuarios'
import { UsuariosView } from './UsuariosView'

export default async function PaginaUsuarios() {
  const resultado = await obtenerUsuarios()

  // Si la API devuelve error, mostrar mensaje sin romper el layout
  if (!resultado.ok) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6">
        <p className="text-sm font-medium text-red-700">
          No se pudieron cargar los usuarios
        </p>
        <p className="mt-1 text-sm text-red-600">{resultado.mensaje}</p>
      </div>
    )
  }

  return <UsuariosView usuarios={resultado.datos} />
}
