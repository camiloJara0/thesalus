/**
 * Validaciones puras para insumos y movimientos de inventario.
 * Extraídas de stores/Entidades/Insumo.js para ser testeables.
 *
 * Cada función retorna null si es válido, o un string con el mensaje de error.
 */

/**
 * Categorías válidas de insumos.
 */
export const CATEGORIAS_VALIDAS = [
    'Insumos médicos',
    'Medicamento',
    'Equipos médicos',
    'Otro',
]

/**
 * Tipos de movimiento válidos.
 */
export const TIPOS_MOVIMIENTO = ['Ingreso', 'Egreso', 'Devuelto']

/**
 * Valida campos obligatorios de un insumo según su categoría.
 * @param {Object} datos - Datos del insumo
 * @returns {null|Object} null si válido, { campo: mensaje } si hay errores
 */
export function validarInsumo(datos) {
    const errores = {}

    // ─── Campos base (siempre requeridos) ────────────
    if (!datos.nombre || datos.nombre.toString().trim() === '') {
        errores.nombre = 'El nombre es obligatorio'
    } else if (datos.nombre.trim().length < 3) {
        errores.nombre = 'El nombre debe tener mínimo 3 caracteres'
    }

    if (!datos.categoria || datos.categoria.toString().trim() === '') {
        errores.categoria = 'La categoría es obligatoria'
    } else if (!CATEGORIAS_VALIDAS.includes(datos.categoria)) {
        errores.categoria = `Categoría inválida. Opciones: ${CATEGORIAS_VALIDAS.join(', ')}`
    }

    if (datos.stock === '' || datos.stock === null || datos.stock === undefined) {
        errores.stock = 'El stock es obligatorio'
    } else {
        const stock = Number(datos.stock)
        if (isNaN(stock) || stock < 0) {
            errores.stock = 'El stock debe ser un número positivo'
        }
    }

    // ─── Campos según categoría ──────────────────────
    if (datos.categoria === 'Medicamento') {
        if (!datos.unidad || datos.unidad.trim() === '') errores.unidad = 'La unidad es obligatoria para medicamentos'
        if (!datos.activo || datos.activo.trim() === '') errores.activo = 'El ingrediente activo es obligatorio'
        if (!datos.lote || datos.lote.trim() === '') errores.lote = 'El lote es obligatorio para medicamentos'
        if (!datos.vencimiento) errores.vencimiento = 'La fecha de vencimiento es obligatoria para medicamentos'
        if (datos.vencimiento) {
            const err = validarFechaVencimiento(datos.vencimiento)
            if (err) errores.vencimiento = err
        }
    } else if (datos.categoria === 'Equipos médicos') {
        if (!datos.serial || datos.serial.trim() === '') errores.serial = 'El serial es obligatorio para equipos médicos'
    } else {
        // Insumos médicos, Otro
        if (!datos.unidad || datos.unidad.trim() === '') errores.unidad = 'La unidad es obligatoria'
        if (!datos.especificaciones || datos.especificaciones.trim() === '') errores.especificaciones = 'Las especificaciones son obligatorias'
        if (!datos.lote || datos.lote.trim() === '') errores.lote = 'El lote es obligatorio'
        if (!datos.vencimiento) errores.vencimiento = 'La fecha de vencimiento es obligatoria'
        if (!datos.ubicacion || datos.ubicacion.trim() === '') errores.ubicacion = 'La ubicación es obligatoria'
    }

    return Object.keys(errores).length > 0 ? errores : null
}

/**
 * Valida que la fecha de vencimiento no sea en el pasado.
 * @param {string} fecha - Formato YYYY-MM-DD
 * @returns {null|string}
 */
export function validarFechaVencimiento(fecha) {
    if (!fecha) return null
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return 'Formato de fecha inválido'
    const vencimiento = new Date(fecha)
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)
    if (vencimiento < hoy) return 'La fecha de vencimiento ya pasó'
    return null
}

/**
 * Valida campos obligatorios de un movimiento de inventario.
 * @param {Object} movimiento - { Movimientos: { ... }, Insumos: { stock } }
 * @returns {null|Object} null si válido, { campo: mensaje } si hay errores
 */
export function validarMovimiento(movimiento) {
    const errores = {}
    const mov = movimiento?.Movimientos

    if (!mov) {
        errores.Movimientos = 'Los datos del movimiento son obligatorios'
        return errores
    }

    // ─── Campos obligatorios ─────────────────────────
    if (!mov.cantidadMovimiento || mov.cantidadMovimiento <= 0) {
        errores.cantidadMovimiento = 'La cantidad es obligatoria y debe ser mayor a 0'
    }

    if (!mov.fechaMovimiento || mov.fechaMovimiento.trim() === '') {
        errores.fechaMovimiento = 'La fecha del movimiento es obligatoria'
    }

    if (!mov.tipoMovimiento || mov.tipoMovimiento.trim() === '') {
        errores.tipoMovimiento = 'El tipo de movimiento es obligatorio'
    } else if (!TIPOS_MOVIMIENTO.includes(mov.tipoMovimiento)) {
        errores.tipoMovimiento = `Tipo inválido. Opciones: ${TIPOS_MOVIMIENTO.join(', ')}`
    }

    if (!mov.id_medico) {
        errores.id_medico = 'El profesional responsable es obligatorio'
    }

    if (!mov.id_insumo) {
        errores.id_insumo = 'El insumo es obligatorio'
    }

    // ─── Reglas de negocio ───────────────────────────
    // Stock no puede ser negativo en egreso
    if (
        mov.tipoMovimiento === 'Egreso' &&
        mov.cantidadMovimiento &&
        movimiento.Insumos?.stock !== undefined
    ) {
        const stock = Number(movimiento.Insumos.stock)
        const cantidad = Number(mov.cantidadMovimiento)
        if (cantidad > stock) {
            errores.cantidadMovimiento = `La cantidad (${cantidad}) supera el stock actual (${stock})`
        }
    }

    // Devuelto requiere movimiento previo
    if (mov.tipoMovimiento === 'Devuelto' && !mov.id_movimiento) {
        errores.tipoMovimiento = 'Para devolver se requiere un movimiento previo'
    }

    // Cantidad no puede superar 9999
    if (mov.cantidadMovimiento && Number(mov.cantidadMovimiento) > 9999) {
        errores.cantidadMovimiento = 'La cantidad no puede superar 9999 unidades'
    }

    return Object.keys(errores).length > 0 ? errores : null
}

/**
 * Calcula el stock resultante después de un movimiento.
 * @param {number} stockActual
 * @param {string} tipoMovimiento - 'Ingreso' | 'Egreso' | 'Devuelto'
 * @param {number} cantidad
 * @returns {number} stock resultante
 */
export function calcularStock(stockActual, tipoMovimiento, cantidad) {
    const stock = Number(stockActual) || 0
    const cant = Number(cantidad) || 0

    switch (tipoMovimiento) {
        case 'Ingreso':
            return stock + cant
        case 'Egreso':
            return Math.max(0, stock - cant)
        case 'Devuelto':
            return stock + cant
        default:
            return stock
    }
}

/**
 * Valida que un movimiento no resulte en stock negativo.
 * @param {number} stockActual
 * @param {string} tipoMovimiento
 * @param {number} cantidad
 * @returns {null|string}
 */
export function validarStockMovimiento(stockActual, tipoMovimiento, cantidad) {
    if (tipoMovimiento === 'Egreso') {
        const stock = Number(stockActual) || 0
        const cant = Number(cantidad) || 0
        if (cant > stock) {
            return `La cantidad (${cant}) supera el stock actual (${stock})`
        }
    }
    return null
}
