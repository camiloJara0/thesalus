import { describe, it, expect, vi } from 'vitest'
import { ref } from 'vue'

const permisos = ref([])
const rol = ref('Profesional')

vi.mock('~/stores/varview', () => ({
    useVarView: () => ({
        getPermisos: permisos.value,
        getRol: rol.value,
    }),
}))

import { usePermisos } from '~/composables/usePermisos'

describe('usePermisos - permisos base', () => {
    it('hasPermiso es true para permisos base aunque el usuario no los tenga', () => {
        permisos.value = []
        const { hasPermiso } = usePermisos()
        expect(hasPermiso('Datos_get')).toBe(true)
        expect(hasPermiso('Citas_view')).toBe(true)
        expect(hasPermiso('Citas_get')).toBe(true)
        expect(hasPermiso('Pacientes_view')).toBe(true)
        expect(hasPermiso('Pacientes_get')).toBe(true)
        expect(hasPermiso('Historias_view')).toBe(true)
        expect(hasPermiso('Historias_get')).toBe(true)
    })

    it('hasPermiso respeta los permisos reales del usuario', () => {
        permisos.value = ['Insumos_delete']
        const { hasPermiso } = usePermisos()
        expect(hasPermiso('Insumos_delete')).toBe(true)
        expect(hasPermiso('Insumos_put')).toBe(false)
    })

    it('hasAllPermisos y hasAnyPermiso usan hasPermiso (incluye base)', () => {
        permisos.value = []
        const { hasAllPermisos, hasAnyPermiso } = usePermisos()
        expect(hasAllPermisos('Datos_get', 'Citas_view')).toBe(true)
        expect(hasAllPermisos('Datos_get', 'Insumos_delete')).toBe(false)
        expect(hasAnyPermiso('Datos_get', 'Insumos_delete')).toBe(true)
        expect(hasAnyPermiso('Insumos_delete', 'Insumos_put')).toBe(false)
    })
})
