# Dashboard Interno

Sistema interno de gestión con reportes, usuarios, clientes y automatización de procesos.

## Stack
- **Runtime**: Bun
- **Base de datos / Auth**: Supabase
- **Datos operativos**: Airtable
- **Deploy**: Vercel
- **Versiones**: GitHub

## Inicio rápido

```bash
# Instalar dependencias
bun install

# Configurar variables de entorno
cp .env.example .env.local
# (editar .env.local con tus credenciales)

# Levantar en desarrollo
bun dev
```

## Variables de entorno necesarias

```
SUPABASE_URL=
SUPABASE_ANON_KEY=
AIRTABLE_API_KEY=
AIRTABLE_BASE_ID=
```

## Agentes disponibles (Claude Code)

| Agente | Para qué |
|---|---|
| `backend-agent` | API, Supabase, Airtable, lógica de servidor |
| `frontend-agent` | Componentes UI, páginas, formularios |
| `qa-agent` | Revisión de código antes de merge |
| `deploy-agent` | Checklist y verificación antes de deploy |
| `reportes-agent` | Reportes, métricas y exportaciones |

## Flujo de trabajo con agentes

```
Nueva feature:
  1. backend-agent → crea la API
  2. frontend-agent → crea la UI
  3. qa-agent → revisa todo
  4. deploy-agent → verifica el deploy
```
