// Helpers de formato compartidos entre componentes.

/**
 * Formatea una marca de tiempo ISO mostrando día, mes corto, año, hora y minutos en español.
 *
 * @param iso - Fecha en formato ISO 8601.
 */
export const formatearFechaHora = (iso: string): string => {
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))
}
