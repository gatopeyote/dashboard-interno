// Cliente de Supabase — punto único de conexión para toda la aplicación.
// Las variables de entorno deben estar definidas antes de inicializar el cliente.
//
// REQUISITO RLS: Este cliente usa SUPABASE_ANON_KEY (rol anónimo).
// Antes del primer deploy, verificar que las políticas RLS de las tablas
// `clientes`, `usuarios` y `eventos_auditoria` permiten las operaciones
// esperadas para el contexto en que se ejecuta cada módulo.

import { createClient } from '@supabase/supabase-js'

// Validación temprana para detectar configuración faltante en tiempo de arranque
if (!process.env.SUPABASE_URL) {
  throw new Error('Variable de entorno SUPABASE_URL no definida.')
}
if (!process.env.SUPABASE_ANON_KEY) {
  throw new Error('Variable de entorno SUPABASE_ANON_KEY no definida.')
}

// Instancia compartida del cliente de Supabase
export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)
