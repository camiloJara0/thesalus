/**
 * Composable centralizado de permisos.
 * Reemplaza checks dispersos de varView.getPermisos.includes(...)
 * con una API consistente y testeable.
 *
 * Uso:
 *   const { hasPermiso, isAdmin, canRead, canPost } = usePermisos()
 *   if (hasPermiso('Insumos_delete')) { ... }
 *   if (isAdmin) { ... }
 *   if (canPost('Insumos')) { ... }
 */

import { MODULOS, ACCIONES, groupPermissions } from '~/data/permisos'

export function usePermisos() {
    const varView = useVarView()
    const permisos = computed(() => varView.getPermisos || [])
    const rol = computed(() => varView.getRol || '')

    // ─── Roles ──────────────────────────────────────────

    const isAdmin = computed(() => rol.value === 'Admin')
    const isProfesional = computed(() => rol.value === 'Profesional')

    // ─── Checks base ────────────────────────────────────

    /**
     * Verifica si el usuario tiene un permiso específico.
     * Ej: hasPermiso('Insumos_delete')
     */
    function hasPermiso(permiso) {
        return permisos.value.includes(permiso)
    }

    /**
     * Verifica si el usuario tiene TODOS los permisos dados.
     */
    function hasAllPermisos(...lista) {
        return lista.every(p => permisos.value.includes(p))
    }

    /**
     * Verifica si el usuario tiene AL MENOS UNO de los permisos dados.
     */
    function hasAnyPermiso(...lista) {
        return lista.some(p => permisos.value.includes(p))
    }

    // ─── Checks por módulo ──────────────────────────────

    function _permiso(modulo, accion) {
        return `${modulo}_${accion}`
    }

    /** Puede leer/listar registros del módulo */
    function canRead(modulo) {
        return hasPermiso(_permiso(modulo, ACCIONES.GET))
    }

    /** Puede crear registros en el módulo */
    function canPost(modulo) {
        return hasPermiso(_permiso(modulo, ACCIONES.POST))
    }

    /** Puede actualizar registros del módulo */
    function canPut(modulo) {
        return hasPermiso(_permiso(modulo, ACCIONES.PUT))
    }

    /** Puede eliminar registros del módulo */
    function canDelete(modulo) {
        return hasPermiso(_permiso(modulo, ACCIONES.DELETE))
    }

    /** Puede ver el módulo (acceso a la página) */
    function canView(modulo) {
        return hasPermiso(_permiso(modulo, ACCIONES.VIEW))
    }

    /** Puede acceder al módulo (view o get) */
    function canAccess(modulo) {
        return canView(modulo) || canRead(modulo)
    }

    // ─── Checks compuestos ──────────────────────────────

    /** CRUD completo para un módulo */
    function canFullCRUD(modulo) {
        return canRead(modulo) && canPost(modulo) && canPut(modulo) && canDelete(modulo)
    }

    /** Al menos lectura + escritura */
    function canReadAndWrite(modulo) {
        return canRead(modulo) && (canPost(modulo) || canPut(modulo))
    }

    // ─── Agrupación de permisos ─────────────────────────

    /** Permisos del usuario agrupados por módulo */
    const permisosPorModulo = computed(() => groupPermissions(permisos.value))

    /** Módulos a los que el usuario tiene acceso */
    const modulosAccesibles = computed(() => Object.keys(permisosPorModulo.value))

    // ─── Para formularios y builders ────────────────────

    /**
     * Retorna un objeto con los permisos comunes para una entidad.
     * Útil para form builders que necesitan saber si puedePost o puedePut.
     *
     * Ej: getEntityPermisos('Insumos')
     *   → { puedeGet: true, puedePost: true, puedePut: true, puedeDelete: false, puedeView: true }
     */
    function getEntityPermisos(modulo) {
        return {
            puedeGet: canRead(modulo),
            puedePost: canPost(modulo),
            puedePut: canPut(modulo),
            puedeDelete: canDelete(modulo),
            puedeView: canView(modulo),
        }
    }

    return {
        // Computed
        permisos,
        rol,
        isAdmin,
        isProfesional,
        permisosPorModulo,
        modulosAccesibles,
        // Methods
        hasPermiso,
        hasAllPermisos,
        hasAnyPermiso,
        canRead,
        canPost,
        canPut,
        canDelete,
        canView,
        canAccess,
        canFullCRUD,
        canReadAndWrite,
        getEntityPermisos,
    }
}
