import { describe, it, expect } from 'vitest'
import {
    MODULOS,
    ACCIONES,
    generateModulePermissions,
    generateAllPermissions,
    extractModule,
    groupPermissions,
} from '~/data/permisos'

// ==================== CONSTANTES ====================
describe('MODULOS', () => {
    it('Contiene módulos esenciales', () => {
        expect(MODULOS.PACIENTES).toBe('Pacientes')
        expect(MODULOS.INSUMOS).toBe('Insumos')
        expect(MODULOS.HISTORIAS).toBe('Historias')
        expect(MODULOS.PROFESIONAL).toBe('Profesional')
        expect(MODULOS.CITAS).toBe('Citas')
    })

    it('Todos los módulos tienen valores string', () => {
        Object.values(MODULOS).forEach(valor => {
            expect(typeof valor).toBe('string')
            expect(valor.length).toBeGreaterThan(0)
        })
    })
})

describe('ACCIONES', () => {
    it('Tiene las 5 acciones base', () => {
        expect(Object.keys(ACCIONES)).toHaveLength(5)
        expect(ACCIONES.GET).toBe('get')
        expect(ACCIONES.POST).toBe('post')
        expect(ACCIONES.PUT).toBe('put')
        expect(ACCIONES.DELETE).toBe('delete')
        expect(ACCIONES.VIEW).toBe('view')
    })
})

// ==================== GENERACIÓN DE PERMISOS ====================
describe('generateModulePermissions', () => {
    it('Genera 5 permisos para un módulo', () => {
        const perms = generateModulePermissions('Insumos')
        expect(perms).toHaveLength(5)
    })

    it('Los permisos tienen formato correcto', () => {
        const perms = generateModulePermissions('Insumos')
        expect(perms).toContain('Insumos_get')
        expect(perms).toContain('Insumos_post')
        expect(perms).toContain('Insumos_put')
        expect(perms).toContain('Insumos_delete')
        expect(perms).toContain('Insumos_view')
    })

    it('Módulo con espacios reemplaza por guión bajo', () => {
        const perms = generateModulePermissions('Formas de pago')
        expect(perms).toContain('Formas_de_pago_get')
    })
})

describe('generateAllPermissions', () => {
    it('Genera permisos para todos los módulos', () => {
        const all = generateAllPermissions()
        expect(all.length).toBe(Object.keys(MODULOS).length * 5)
    })

    it('Incluye permisos de módulos específicos', () => {
        const all = generateAllPermissions()
        expect(all).toContain('Pacientes_get')
        expect(all).toContain('Insumos_delete')
        expect(all).toContain('Notas_view')
    })
})

// ==================== EXTRACCIÓN DE MÓDULO ====================
describe('extractModule', () => {
    it('Extrae módulo simple', () => {
        expect(extractModule('Insumos_post')).toBe('Insumos')
    })

    it('Extrae módulo con guiones bajos internos', () => {
        expect(extractModule('Formas_de_pago_get')).toBe('Formas_de_pago')
    })

    it('Extrae módulo con acción view', () => {
        expect(extractModule('Notas_view')).toBe('Notas')
    })
})

// ==================== AGRUPACIÓN DE PERMISOS ====================
describe('groupPermissions', () => {
    it('Agrupa permisos del mismo módulo', () => {
        const grouped = groupPermissions(['Insumos_get', 'Insumos_post', 'Notas_get'])
        expect(grouped).toEqual({
            Insumos: ['get', 'post'],
            Notas: ['get'],
        })
    })

    it('Maneja array vacío', () => {
        expect(groupPermissions([])).toEqual({})
    })

    it('Un solo permiso', () => {
        const grouped = groupPermissions(['Pacientes_delete'])
        expect(grouped).toEqual({ Pacientes: ['delete'] })
    })

    it('Todos los permisos de un módulo', () => {
        const perms = generateModulePermissions('Historias')
        const grouped = groupPermissions(perms)
        expect(grouped.Historias).toHaveLength(5)
        expect(grouped.Historias).toContain('get')
        expect(grouped.Historias).toContain('post')
        expect(grouped.Historias).toContain('put')
        expect(grouped.Historias).toContain('delete')
        expect(grouped.Historias).toContain('view')
    })
})
