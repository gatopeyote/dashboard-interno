# Contexto: Componentes UI

Componentes reutilizables del dashboard.

## Convenciones
- Un archivo por componente
- Nombre del archivo = nombre del componente en PascalCase
- Siempre exportar como named export (no default export)
- Props tipadas con `interface`

## Componentes base esperados
- `TablaClientes.tsx` → tabla con paginación
- `FormularioCliente.tsx` → alta/edición de clientes
- `GraficaMetricas.tsx` → gráfica de métricas del dashboard
- `IndicadorEstado.tsx` → badge de estado (activo/inactivo/pendiente)
- `ExportarReporte.tsx` → botón de descarga CSV

## Estados obligatorios en cada componente
Todo componente que carga datos debe manejar:
- Estado de carga: mostrar skeleton o spinner
- Estado vacío: mensaje cuando no hay datos
- Estado de error: mensaje amigable al usuario
