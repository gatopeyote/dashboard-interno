// Tests unitarios para src/api/clientes.ts
// Verifican validaciones de entrada y el comportamiento esperado de cada función.
// El cliente de Supabase se reemplaza con un mock para evitar dependencias externas.

import { describe, expect, mock, test, beforeEach } from 'bun:test'

// Mock del módulo de Supabase antes de importar la función bajo prueba
const mockSingle = mock(() => ({ data: null, error: { message: 'error simulado' } }))
const mockSelect = mock(() => ({ eq: mockEq, single: mockSingle }))
const mockInsert = mock(() => ({ select: () => ({ single: mockSingle }) }))
const mockUpdate = mock(() => ({ eq: mockEq }))
const mockEq = mock(() => ({ eq: mockEq, single: mockSingle, select: () => ({ single: mockSingle }), order: () => ({ data: [], error: null }) }))
const mockFrom = mock(() => ({
  select: mockSelect,
  insert: mockInsert,
  update: mockUpdate,
}))

mock.module('../lib/supabase', () => ({
  supabase: { from: mockFrom },
}))

mock.module('../lib/auditoria', () => ({
  registrarAuditoria: mock(() => Promise.resolve()),
}))

import { crearCliente, actualizarCliente, desactivarCliente } from './clientes'

// ---------------------------------------------------------------------------
// crearCliente
// ---------------------------------------------------------------------------

describe('crearCliente — validaciones de entrada', () => {
  test('rechaza si el nombre está vacío', async () => {
    const resultado = await crearCliente(
      { nombre: '', email: 'test@ejemplo.com', estado: 'activo' },
      'usuario-123'
    )
    expect(resultado.ok).toBe(false)
    if (!resultado.ok) {
      expect(resultado.mensaje).toContain('nombre')
    }
  })

  test('rechaza si el nombre solo tiene espacios', async () => {
    const resultado = await crearCliente(
      { nombre: '   ', email: 'test@ejemplo.com', estado: 'activo' },
      'usuario-123'
    )
    expect(resultado.ok).toBe(false)
  })

  test('rechaza si el email está vacío', async () => {
    const resultado = await crearCliente(
      { nombre: 'Empresa ABC', email: '', estado: 'activo' },
      'usuario-123'
    )
    expect(resultado.ok).toBe(false)
    if (!resultado.ok) {
      expect(resultado.mensaje).toContain('correo')
    }
  })
})

// ---------------------------------------------------------------------------
// actualizarCliente
// ---------------------------------------------------------------------------

describe('actualizarCliente — validaciones de entrada', () => {
  test('rechaza si el id está vacío', async () => {
    const resultado = await actualizarCliente('', { nombre: 'Nuevo nombre' }, 'usuario-123')
    expect(resultado.ok).toBe(false)
    if (!resultado.ok) {
      expect(resultado.mensaje).toContain('ID')
    }
  })

  test('rechaza si no se proporcionan campos para actualizar', async () => {
    const resultado = await actualizarCliente('uuid-123', {}, 'usuario-123')
    expect(resultado.ok).toBe(false)
    if (!resultado.ok) {
      expect(resultado.mensaje).toContain('campos')
    }
  })
})

// ---------------------------------------------------------------------------
// desactivarCliente
// ---------------------------------------------------------------------------

describe('desactivarCliente — validaciones de entrada', () => {
  test('rechaza si el id está vacío', async () => {
    const resultado = await desactivarCliente('', 'usuario-123')
    expect(resultado.ok).toBe(false)
    if (!resultado.ok) {
      expect(resultado.mensaje).toContain('ID')
    }
  })
})
