// Tarjeta de métrica individual: muestra un valor numérico o de texto destacado
// con título y descripción opcional. Incluye estado de carga con skeleton animado.

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

interface TarjetaMetricaProps {
  /** Texto del encabezado de la tarjeta. */
  titulo: string
  /** Valor principal a mostrar (número o cadena de texto). */
  valor: number | string
  /** Texto secundario debajo del valor; opcional. */
  descripcion?: string
  /** Cuando es true, renderiza un skeleton en lugar del contenido real. */
  cargando?: boolean
  /**
   * Cuando es true, resalta la tarjeta con borde y fondo rojo para llamar
   * la atención sobre valores críticos (p.ej. operaciones con error > 0).
   */
  destacar?: boolean
}

// ---------------------------------------------------------------------------
// Sub-componente: skeleton de carga
// ---------------------------------------------------------------------------

function EsqueletoTarjeta() {
  return (
    <div
      className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
      aria-busy="true"
      aria-label="Cargando métrica"
    >
      {/* Esqueleto del título */}
      <div className="h-4 w-2/5 animate-pulse rounded bg-gray-200" />
      {/* Esqueleto del valor grande */}
      <div className="mt-4 h-9 w-3/5 animate-pulse rounded bg-gray-200" />
      {/* Esqueleto de la descripción */}
      <div className="mt-3 h-3 w-4/5 animate-pulse rounded bg-gray-200" />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Componente principal
// ---------------------------------------------------------------------------

export function TarjetaMetrica({
  titulo,
  valor,
  descripcion,
  cargando = false,
  destacar = false,
}: TarjetaMetricaProps) {
  // --- Estado: cargando ---
  if (cargando) {
    return <EsqueletoTarjeta />
  }

  // Clases condicionales según si la tarjeta está en modo destacado (crítico)
  const clasesBorde = destacar
    ? 'border-red-300 bg-red-50'
    : 'border-gray-200 bg-white'
  const clasesValor = destacar
    ? 'text-red-700'
    : 'text-gray-900'

  return (
    <div className={`rounded-lg border p-6 shadow-sm ${clasesBorde}`}>
      {/* Título de la métrica */}
      <p className="text-sm font-medium text-gray-500">{titulo}</p>

      {/* Valor principal destacado */}
      <p className={`mt-2 text-3xl font-bold tracking-tight ${clasesValor}`}>
        {typeof valor === 'number' ? valor.toLocaleString('es-ES') : valor}
      </p>

      {/* Descripción opcional */}
      {descripcion !== undefined && (
        <p className="mt-2 text-sm text-gray-500">{descripcion}</p>
      )}
    </div>
  )
}
