// Tests unitarios para src/api/usuarios.ts
// Verifican validaciones de entrada. El cliente de Supabase se mockea.

import { describe, expect, mock, test } from 'bun:test'

// Mock de dependencias antes de importar el módulo bajo prueba
mock.module('../lib/supabase', () => ({
  supabase: {
    from: mock(() => ({
      select: mock(() => ({
        eq: mock(() => ({
          eq: mock(() => ({ single: mock(() => ({ data: null, error: { message: 'error simulado' } })) })),
          single: mock(() => ({ data: null, error: { message: 'error simulado' } })),
          order: mock(() => ({ data: [], error: null })),
        })),
      })),
      insert: mock(() => ({
        select: mock(() => ({
          single: mock(() => ({ data: null, error: { message: 'error simulado' } })),
        })),
      })),
      update: mock(() => ({
        eq: mock(() => ({
          eq: mock(() => ({
            select: mock(() => ({
              single: mock(() => ({ data: null, error: { message: 'error simulado' } })),
            })),
          })),
        })),
      })),
    })),
  },
}))

mock.module('../lib/auditoria', () => ({
  registrarAuditoria: mock(() => Promise.resolve()),
}))

import { invitarUsuario, actualizarRol, desactivarUsuario } from './usuarios'

// ---------------------------------------------------------------------------
// invitarUsuario
// ---------------------------------------------------------------------------

describe('invitarUsuario — validaciones de entrada', () => {
  test('rechaza si el nombre está vacío', async () => {
    const resultado = await invitarUsuario(
      { nombre: '', email: 'test@ejemplo.com', rol: 'viewer' },
      'admin-123'
    )
    expect(resultado.ok).toBe(false)
    if (!resultado.ok) {
      expect(resultado.mensaje).toContain('nombre')
    }
  })

  test('rechaza si el email está vacío', async () => {
    const resultado = await invitarUsuario(
      { nombre: 'Ana García', email: '', rol: 'operador' },
      'admin-123'
    )
    expect(resultado.ok).toBe(false)
    if (!resultado.ok) {
      expect(resultado.mensaje).toContain('correo')
    }
  })

  test('rechaza si el rol no está definido', async () => {
    const resultado = await invitarUsuario(
      { nombre: 'Ana García', email: 'ana@ejemplo.com', rol: '' as 'viewer' },
      'admin-123'
    )
    expect(resultado.ok).toBe(false)
    if (!resultado.ok) {
      expect(resultado.mensaje).toContain('rol')
    }
  })
})

// ---------------------------------------------------------------------------
// actualizarRol
// ---------------------------------------------------------------------------

describe('actualizarRol — validaciones de entrada', () => {
  test('rechaza si el id está vacío', async () => {
    const resultado = await actualizarRol('', 'admin', 'admin-123')
    expect(resultado.ok).toBe(false)
    if (!resultado.ok) {
      expect(resultado.mensaje).toContain('ID')
    }
  })

  test('rechaza si el rol no está definido', async () => {
    const resultado = await actualizarRol('uuid-123', '' as 'admin', 'admin-123')
    expect(resultado.ok).toBe(false)
    if (!resultado.ok) {
      expect(resultado.mensaje).toContain('rol')
    }
  })
})

// ---------------------------------------------------------------------------
// desactivarUsuario
// ---------------------------------------------------------------------------

describe('desactivarUsuario — validaciones de entrada', () => {
  test('rechaza si el id está vacío', async () => {
    const resultado = await desactivarUsuario('', 'admin-123')
    expect(resultado.ok).toBe(false)
    if (!resultado.ok) {
      expect(resultado.mensaje).toContain('ID')
    }
  })
})
