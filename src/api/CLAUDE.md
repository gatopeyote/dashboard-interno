# Contexto: API

Aquí viven todas las funciones que llaman a servicios externos.

## Archivos esperados
- `clientes.ts` → CRUD de clientes en Supabase
- `usuarios.ts` → gestión de usuarios y roles
- `reportes.ts` → consultas de métricas y agregaciones
- `airtable.ts` → lectura de datos operativos desde Airtable

## Convención de nombres
- Funciones que leen: `obtener*` (ej: `obtenerClientes`)
- Funciones que crean: `crear*` (ej: `crearCliente`)
- Funciones que actualizan: `actualizar*`
- Funciones que desactivan: `desactivar*` (nunca `eliminar*`)

## Siempre incluir
- Tipado de retorno explícito
- Manejo de errores con mensaje descriptivo
- Registro en `eventos_auditoria` para escrituras
