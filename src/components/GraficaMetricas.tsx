// Gráfica de barras construida con HTML/CSS y Tailwind, sin librería externa.
// Cada barra tiene altura proporcional al valor máximo del conjunto de datos.
// Maneja estados: cargando (skeleton), vacío y error.

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

interface DatoGrafica {
  /** Etiqueta visible en el eje X (nombre del período, categoría, etc.). */
  etiqueta: string
  /** Valor numérico que determina la altura de la barra. */
  valor: number
}

interface GraficaMetricasProps {
  /** Array de puntos de datos a representar. */
  datos: DatoGrafica[]
  /** Título que se muestra encima de la gráfica. */
  titulo: string
  /** Indica si los datos se están cargando. */
  cargando: boolean
  /** Mensaje de error si la carga falló; null si no hay error. */
  error: string | null
}

// ---------------------------------------------------------------------------
// Constantes
// ---------------------------------------------------------------------------

/** Altura máxima en píxeles de las barras. */
const ALTURA_MAXIMA_PX = 160

// ---------------------------------------------------------------------------
// Sub-componente: skeleton de carga
// ---------------------------------------------------------------------------

function EsqueletoGrafica() {
  return (
    <div
      className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
      aria-busy="true"
      aria-label="Cargando gráfica"
    >
      {/* Esqueleto del título */}
      <div className="h-5 w-1/3 animate-pulse rounded bg-gray-200" />

      {/* Barras de placeholder */}
      <div className="mt-6 flex items-end gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="animate-pulse rounded-t bg-gray-200"
            style={{ height: `${40 + (i % 3) * 40}px`, flex: 1 }}
          />
        ))}
      </div>

      {/* Línea base */}
      <div className="mt-2 h-px w-full bg-gray-200" />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Componente principal
// ---------------------------------------------------------------------------

export function GraficaMetricas({
  datos,
  titulo,
  cargando,
  error,
}: GraficaMetricasProps) {
  // --- Estado: cargando ---
  if (cargando) {
    return <EsqueletoGrafica />
  }

  // --- Estado: error ---
  if (error !== null) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 shadow-sm">
        <p className="text-sm font-medium text-gray-900">{titulo}</p>
        <div className="mt-4 text-center">
          <p className="text-sm font-medium text-red-700">
            No se pudo cargar la gráfica
          </p>
          <p className="mt-1 text-sm text-red-600">{error}</p>
        </div>
      </div>
    )
  }

  // --- Estado: sin datos ---
  if (datos.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-medium text-gray-900">{titulo}</p>
        <div className="mt-8 text-center">
          <p className="text-sm font-medium text-gray-500">Sin datos disponibles</p>
          <p className="mt-1 text-sm text-gray-400">
            No hay información para mostrar en este período.
          </p>
        </div>
      </div>
    )
  }

  // Valor máximo para calcular proporciones
  const valorMaximo = Math.max(...datos.map((d) => d.valor))

  /**
   * Calcula la altura en píxeles de una barra dado su valor.
   * Garantiza un mínimo de 4px para que la barra siempre sea visible.
   */
  const calcularAltura = (valor: number): number => {
    if (valorMaximo === 0) return 4
    return Math.max(4, Math.round((valor / valorMaximo) * ALTURA_MAXIMA_PX))
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      {/* Título */}
      <p className="text-sm font-semibold text-gray-900">{titulo}</p>

      {/* Área de barras */}
      <div
        className="mt-6 flex items-end gap-1.5"
        style={{ minHeight: `${ALTURA_MAXIMA_PX}px` }}
        role="img"
        aria-label={`Gráfica de barras: ${titulo}`}
      >
        {datos.map((dato) => {
          const altura = calcularAltura(dato.valor)

          return (
            <div
              key={dato.etiqueta}
              className="group relative flex flex-1 flex-col items-center"
            >
              {/* Tooltip con valor exacto al pasar el cursor */}
              <div className="pointer-events-none absolute bottom-full mb-1 hidden rounded bg-gray-800 px-2 py-1 text-xs text-white group-hover:block">
                {dato.valor.toLocaleString('es-ES')}
              </div>

              {/* Barra */}
              <div
                className="w-full rounded-t bg-indigo-500 transition-all duration-300 hover:bg-indigo-600"
                style={{ height: `${altura}px` }}
              />
            </div>
          )
        })}
      </div>

      {/* Línea base y etiquetas del eje X */}
      <div className="mt-0.5 border-t border-gray-300" />
      <div className="mt-1 flex gap-1.5">
        {datos.map((dato) => (
          <div key={dato.etiqueta} className="flex flex-1 justify-center">
            <span className="truncate text-center text-xs text-gray-500">
              {dato.etiqueta}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
