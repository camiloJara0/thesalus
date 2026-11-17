import { describe, it, expect } from 'vitest'
import {
    MODULOS,
    ACCIONES,
    generateModulePermissions,
    generateAllPermissions,
    extractModule,
    groupPermissions,
    PERMISOS_BASE,
    PERMISOS_NO_APLICA,
    PERMISOS_OCULTOS,
    esPermisoOculto,
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

// ==================== PERMISOS BASE ====================
describe('PERMISOS_BASE', () => {
    it('Tiene exactamente los 7 permisos base', () => {
        expect(PERMISOS_BASE).toEqual([
            'Datos_get',
            'Citas_view',
            'Citas_get',
            'Pacientes_view',
            'Pacientes_get',
            'Historias_view',
            'Historias_get',
        ])
    })

    it('No contiene duplicados', () => {
        expect(new Set(PERMISOS_BASE).size).toBe(PERMISOS_BASE.length)
    })
})

// ==================== PERMISOS NO APLICA ====================
describe('PERMISOS_NO_APLICA', () => {
    it('Tiene exactamente los 24 permisos que no aplican', () => {
        expect(PERMISOS_NO_APLICA).toHaveLength(24)
    })

    it('No se solapa con los permisos base', () => {
        const interseccion = PERMISOS_NO_APLICA.filter(p => PERMISOS_BASE.includes(p))
        expect(interseccion).toEqual([])
    })

    it('Incluye los permisos esperados', () => {
        expect(PERMISOS_NO_APLICA).toContain('Codigos_delete')
        expect(PERMISOS_NO_APLICA).toContain('Citas_delete')
        expect(PERMISOS_NO_APLICA).toContain('Pacientes_delete')
        expect(PERMISOS_NO_APLICA).toContain('Historias_post')
        expect(PERMISOS_NO_APLICA).toContain('Evoluciones_get')
        expect(PERMISOS_NO_APLICA).toContain('Notas_post')
        expect(PERMISOS_NO_APLICA).toContain('Medicacion_get')
        expect(PERMISOS_NO_APLICA).toContain('MedicinaGeneral_post')
        expect(PERMISOS_NO_APLICA).toContain('TrabajoSocial_get')
        expect(PERMISOS_NO_APLICA).toContain('Terapias_post')
        expect(PERMISOS_NO_APLICA).toContain('Tratamientos_get')
    })
})

// ==================== PERMISOS OCULTOS ====================
describe('PERMISOS_OCULTOS y esPermisoOculto', () => {
    it('Es la unión de base y no-aplica sin duplicados (31)', () => {
        expect(PERMISOS_OCULTOS).toHaveLength(31)
        expect(new Set(PERMISOS_OCULTOS).size).toBe(31)
    })

    it('esPermisoOculto detecta permisos base', () => {
        PERMISOS_BASE.forEach(p => expect(esPermisoOculto(p)).toBe(true))
    })

    it('esPermisoOculto detecta permisos no-aplica', () => {
        PERMISOS_NO_APLICA.forEach(p => expect(esPermisoOculto(p)).toBe(true))
    })

    it('esPermisoOculto deja pasar permisos operativos', () => {
        expect(esPermisoOculto('Insumos_get')).toBe(false)
        expect(esPermisoOculto('Kardex_post')).toBe(false)
        expect(esPermisoOculto('ListaPacientes')).toBe(false)
        expect(esPermisoOculto('Diagnosticos_view')).toBe(false)
    })

    it('esPermisoOculto oculta todo el prefijo Backoffice_', () => {
        expect(esPermisoOculto('Backoffice_view')).toBe(true)
        expect(esPermisoOculto('Backoffice_errores')).toBe(true)
        expect(esPermisoOculto('Backoffice_respaldos')).toBe(true)
        expect(esPermisoOculto('Backoffice')).toBe(false)
    })
})
