# Contexto: Código Fuente

Esta carpeta contiene todo el código de la aplicación.

## Subcarpetas
- `api/` → funciones que llaman a Supabase y Airtable (solo servidor)
- `components/` → componentes UI reutilizables
- `lib/` → clientes de Supabase y Airtable, helpers globales

## Regla importante
Las funciones en `api/` nunca deben importarse directamente en componentes del cliente.
Siempre pasar por una capa de servidor o un endpoint.
