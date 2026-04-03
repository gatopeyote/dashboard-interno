'use client'

// Navegación lateral fija del dashboard.
// Resalta el enlace activo comparando con la ruta actual usando usePathname.
// Ancho fijo de 220px, fondo blanco, borde derecho gris.

import Link from 'next/link'
import { usePathname } from 'next/navigation'

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

interface EnlaceNav {
  href: string
  etiqueta: string
  icono: React.ReactNode
}

// ---------------------------------------------------------------------------
// Iconos SVG
// ---------------------------------------------------------------------------

function IconoInicio() {
  return (
    <svg
      className="h-5 w-5"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
      />
    </svg>
  )
}

function IconoClientes() {
  return (
    <svg
      className="h-5 w-5"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
      />
    </svg>
  )
}

function IconoUsuarios() {
  return (
    <svg
      className="h-5 w-5"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  )
}

function IconoReportes() {
  return (
    <svg
      className="h-5 w-5"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
      />
    </svg>
  )
}

function IconoOperaciones() {
  return (
    <svg
      className="h-5 w-5"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0H3"
      />
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Configuración de enlaces
// ---------------------------------------------------------------------------

const ENLACES: EnlaceNav[] = [
  { href: '/',            etiqueta: 'Inicio',      icono: <IconoInicio /> },
  { href: '/clientes',    etiqueta: 'Clientes',    icono: <IconoClientes /> },
  { href: '/usuarios',    etiqueta: 'Usuarios',    icono: <IconoUsuarios /> },
  { href: '/reportes',    etiqueta: 'Reportes',    icono: <IconoReportes /> },
  { href: '/operaciones', etiqueta: 'Operaciones', icono: <IconoOperaciones /> },
]

// ---------------------------------------------------------------------------
// Componente principal
// ---------------------------------------------------------------------------

export function NavLateral() {
  const rutaActual = usePathname()

  /**
   * Determina si un enlace debe marcarse como activo.
   * La raíz "/" solo es activa en la ruta exacta; el resto por prefijo.
   */
  const esActivo = (href: string): boolean => {
    if (href === '/') return rutaActual === '/'
    return rutaActual.startsWith(href)
  }

  return (
    <nav
      className="flex h-full w-[220px] flex-shrink-0 flex-col border-r border-gray-200 bg-white"
      aria-label="Navegación principal"
    >
      {/* Logotipo / nombre del sistema */}
      <div className="flex h-16 items-center border-b border-gray-200 px-5">
        <span className="text-sm font-semibold text-gray-900">Dashboard Interno</span>
      </div>

      {/* Lista de enlaces */}
      <ul className="flex-1 space-y-1 px-3 py-4">
        {ENLACES.map(({ href, etiqueta, icono }) => {
          const activo = esActivo(href)

          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={activo ? 'page' : undefined}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  activo
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {/* Icono con color heredado del texto */}
                <span className={activo ? 'text-indigo-600' : 'text-gray-400'}>
                  {icono}
                </span>
                {etiqueta}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
