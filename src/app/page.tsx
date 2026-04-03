// Página raíz: redirige automáticamente al módulo de operaciones.
import { redirect } from 'next/navigation'

export default function Home() {
  redirect('/operaciones')
}
