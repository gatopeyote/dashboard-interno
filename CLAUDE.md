# Dashboard Interno

## ¿Qué es este proyecto?
Sistema interno de gestión con cuatro funciones principales:
- **Reportes y analytics**: métricas de negocio, gráficas y exportaciones
- **Gestión de usuarios/clientes**: altas, bajas, roles y accesos
- **Automatización de procesos**: flujos internos conectados a Airtable
- **Panel de operaciones**: vista unificada del estado del sistema

## Stack tecnológico
- **Frontend**: desplegado en Vercel (framework agnostic, preferir componentes simples)
- **Runtime**: Bun (usar `bun` en lugar de `npm` o `node` para todos los comandos)
- **Base de datos / auth**: Supabase (PostgreSQL + Row Level Security)
- **Datos operativos**: Airtable (fuente de verdad para procesos de negocio)
- **Control de versiones**: GitHub (ramas: main = producción, dev = desarrollo)

## Estructura de carpetas
- `src/api/` → llamadas a Supabase y Airtable
- `src/components/` → componentes UI reutilizables
- `src/lib/` → utilidades, helpers y configuración de clientes
- `docs/` → documentación técnica y de negocio

## Convenciones generales
- Usar TypeScript estricto (sin `any`)
- Variables y funciones en camelCase
- Nombres de archivos en kebab-case
- Comentarios en español
- Nunca hardcodear credenciales; usar variables de entorno

## Comandos frecuentes
```bash
bun dev          # levantar en desarrollo
bun build        # compilar para producción
bun test         # correr pruebas
bun run lint     # revisar código
```

## Variables de entorno necesarias
```
SUPABASE_URL=
SUPABASE_ANON_KEY=
AIRTABLE_API_KEY=
AIRTABLE_BASE_ID=
```

## Reglas importantes
- Siempre revisar RLS (Row Level Security) en Supabase antes de consultas
- Los cambios en Airtable son operativos: notificar al equipo antes de modificar estructura
- Toda nueva feature va primero a rama `dev`, nunca directo a `main`
- Antes de hacer deploy a Vercel, correr `bun build` localmente
