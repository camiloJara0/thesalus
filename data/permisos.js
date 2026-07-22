/**
 * Composable centralizado de permisos.
 * Reemplaza los checks dispersos de `varView.getPermisos.includes(...)`
 * con una API clara y consistente.
 */

export const MODULOS = {
    PACIENTES: 'Pacientes',
    PROFESIONAL: 'Profesional',
    CITAS: 'Citas',
    HISTORIAS: 'Historias',
    CONSULTAS: 'Consultas',
    ANALISIS: 'Análisis',
    EVOLUCIONES: 'Evoluciones',
    NOTAS: 'Notas',
    TRATAMIENTOS: 'Tratamientos',
    MEDICACION: 'Medicacion',
    INSUMOS: 'Insumos',
    KARDEX: 'Kardex',
    CONFIGURACION: 'Configuracion',
    RESOLUCIONES: 'Resoluciones',
    INVENTARIOS: 'Inventarios',
    DATOS: 'Datos',
    USUARIOS: 'Usuarios',
    NEGOCIOS: 'Negocios',
    PRODUCTOS: 'Productos',
    FORMAS_DE_PAGO: 'Formas de pago',
    IMPUESTOS: 'Impuestos',
    CAJAS: 'Cajas',
    CREAR: 'Crear',
    RIPS: 'Rips',
    REPORTES: 'Reportes',
}

export const ACCIONES = {
    GET: 'get',
    POST: 'post',
    PUT: 'put',
    DELETE: 'delete',
    VIEW: 'view',
}

/**
 * Genera todas las cadenas de permiso para un módulo.
 * Ej: generateModulePermissions('Insumos') → ['Insumos_get', 'Insumos_post', ...]
 */
export function generateModulePermissions(modulo) {
    return Object.values(ACCIONES).map(
        accion => `${modulo.replace(/\s+/g, '_')}_${accion}`
    )
}

/**
 * Genera permisos para todos los módulos conocidos.
 */
export function generateAllPermissions() {
    return Object.values(MODULOS).flatMap(generateModulePermissions)
}

/**
 * Extrae el nombre del módulo desde una cadena de permiso.
 * Ej: 'Insumos_post' → 'Insumos'
 */
export function extractModule(permiso) {
    const parts = permiso.split('_')
    parts.pop()
    return parts.join('_')
}

/**
 * Agrupa permisos por módulo.
 * Ej: groupPermissions(['Insumos_get', 'Insumos_post', 'Notas_get'])
 *   → { Insumos: ['get', 'post'], Notas: ['get'] }
 */
export function groupPermissions(permisos) {
    const grouped = {}
    for (const permiso of permisos) {
        const parts = permiso.split('_')
        const accion = parts.pop()
        const modulo = parts.join('_')
        if (!grouped[modulo]) grouped[modulo] = []
        grouped[modulo].push(accion)
    }
    return grouped
}
