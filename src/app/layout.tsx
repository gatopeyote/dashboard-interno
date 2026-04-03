import type { Metadata } from 'next'
import './globals.css'
import { NavLateral } from '../components/NavLateral'

export const metadata: Metadata = {
  title: 'Dashboard Interno',
  description: 'Sistema interno de gestión',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className="bg-gray-50 text-gray-900 antialiased">
        {/* Layout principal: sidebar fijo a la izquierda + contenido a la derecha */}
        <div className="flex h-screen overflow-hidden">
          {/* Sidebar de navegación */}
          <NavLateral />

          {/* Área de contenido principal con scroll independiente */}
          <main className="flex-1 overflow-y-auto p-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
