// Página de clientes — Server Component.
// Obtiene los clientes desde Supabase y los pasa a ClientesView.
// Si la carga falla muestra un mensaje de error en lugar de la vista.

import { obtenerClientes } from '../../api/clientes'
import { ClientesView } from './ClientesView'

export default async function PaginaClientes() {
  const resultado = await obtenerClientes()

  // Si la API devuelve error, mostrar mensaje sin romper el layout
  if (!resultado.ok) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6">
        <p className="text-sm font-medium text-red-700">
          No se pudieron cargar los clientes
        </p>
        <p className="mt-1 text-sm text-red-600">{resultado.mensaje}</p>
      </div>
    )
  }

  return <ClientesView clientes={resultado.datos} />
}
