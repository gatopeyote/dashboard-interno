// Tests unitarios para src/api/reportes.ts
// Verifican validaciones de entrada y helpers internos.

import { describe, expect, mock, test } from 'bun:test'

// Mock de dependencias
mock.module('../lib/supabase', () => ({
  supabase: {
    from: mock(() => ({
      select: mock(() => ({
        eq: mock(() => ({
          eq: mock(() => ({
            count: 0,
            error: null,
          })),
          gte: mock(() => ({ count: 0, error: null })),
          count: 0,
          error: null,
        })),
        order: mock(() => ({
          range: mock(() => ({ data: [], error: null, count: 0 })),
        })),
        count: 0,
        error: null,
      })),
    })),
  },
}))

mock.module('../lib/airtable', () => ({
  airtableFetch: mock(() =>
    Promise.resolve({ records: [], offset: undefined })
  ),
}))

import { obtenerResumenDiario, obtenerEventosAuditoria } from './reportes'

// ---------------------------------------------------------------------------
// obtenerResumenDiario
// ---------------------------------------------------------------------------

describe('obtenerResumenDiario — validaciones de entrada', () => {
  test('rechaza si la fecha está vacía', async () => {
    const resultado = await obtenerResumenDiario('')
    expect(resultado.ok).toBe(false)
    if (!resultado.ok) {
      expect(resultado.mensaje).toContain('fecha')
    }
  })
})

// ---------------------------------------------------------------------------
// obtenerEventosAuditoria
// ---------------------------------------------------------------------------

describe('obtenerEventosAuditoria — paginación', () => {
  test('acepta offset 0 por defecto', async () => {
    const resultado = await obtenerEventosAuditoria()
    // La llamada no debe lanzar un error de validación
    expect(resultado).toBeDefined()
  })

  test('acepta filtros opcionales sin error', async () => {
    const resultado = await obtenerEventosAuditoria({ tabla: 'clientes' })
    expect(resultado).toBeDefined()
  })
})
