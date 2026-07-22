/**
 * Datos de prueba para insumos y movimientos.
 */

export const insumoMedicamento = {
    nombre: 'Paracetamol 500mg',
    categoria: 'Medicamento',
    stock: 100,
    unidad: 'Caja',
    activo: 'Paracetamol',
    lote: 'LOT-2026-001',
    vencimiento: '2027-12-31',
    ubicacion: 'Estante A-1',
    es_prestable: '0',
}

export const insumoEquipo = {
    nombre: 'Monitor de Signos Vitales',
    categoria: 'Equipos médicos',
    stock: 5,
    serial: 'MON-ABC-123',
    tipo_equipo_id: 1,
    ubicacion: 'Sala 3',
}

export const insumoMedico = {
    nombre: 'Jeringa 10ml',
    categoria: 'Insumos médicos',
    stock: 500,
    unidad: 'Unidad',
    especificaciones: 'Descartable, estéril',
    lote: 'JER-2026-010',
    vencimiento: '2028-06-30',
    ubicacion: 'Almacén B-2',
    es_prestable: '1',
}

export const insumoOtro = {
    nombre: 'Guantes Nitrilo Talla M',
    categoria: 'Otro',
    stock: 2000,
    unidad: 'Caja',
    especificaciones: 'Nitrilo, sin polvo, talla M',
    lote: 'GUA-2026-005',
    vencimiento: '2028-01-15',
    ubicacion: 'Almacén C-1',
    es_prestable: '1',
}

export const insumoSinNombre = {
    ...insumoMedicamento,
    nombre: '',
}

export const insumoNombreCorto = {
    ...insumoMedicamento,
    nombre: 'Pa',
}

export const insumoSinCategoria = {
    nombre: 'Item Test',
    categoria: '',
    stock: 10,
}

export const insumoSinStock = {
    nombre: 'Item Test',
    categoria: 'Otro',
    stock: '',
}

export const insumoStockNegativo = {
    ...insumoMedicamento,
    stock: -5,
}

export const insumoMedicamentoSinCampos = {
    nombre: 'Medicamento',
    categoria: 'Medicamento',
    stock: 50,
    unidad: '',
    activo: '',
    lote: '',
    vencimiento: '',
}

export const insumoEquipoSinSerial = {
    nombre: 'Equipo',
    categoria: 'Equipos médicos',
    stock: 1,
    serial: '',
}

export const insumoMedicoSinCampos = {
    nombre: 'Insumo',
    categoria: 'Insumos médicos',
    stock: 100,
    unidad: '',
    especificaciones: '',
    lote: '',
    vencimiento: '',
    ubicacion: '',
}

// ─── Movimientos ──────────────────────────────────────

export const movimientoIngresoValido = {
    Movimientos: {
        cantidadMovimiento: 50,
        fechaMovimiento: '2026-07-22',
        tipoMovimiento: 'Ingreso',
        id_medico: 1,
        id_insumo: 1,
    },
    Insumos: { stock: 100 },
}

export const movimientoEgresoValido = {
    Movimientos: {
        cantidadMovimiento: 30,
        fechaMovimiento: '2026-07-22',
        tipoMovimiento: 'Egreso',
        id_medico: 1,
        id_insumo: 1,
    },
    Insumos: { stock: 100 },
}

export const movimientoEgresoSinStock = {
    Movimientos: {
        cantidadMovimiento: 150,
        fechaMovimiento: '2026-07-22',
        tipoMovimiento: 'Egreso',
        id_medico: 1,
        id_insumo: 1,
    },
    Insumos: { stock: 100 },
}

export const movimientoDevueltoValido = {
    Movimientos: {
        cantidadMovimiento: 10,
        fechaMovimiento: '2026-07-22',
        tipoMovimiento: 'Devuelto',
        id_medico: 1,
        id_insumo: 1,
        id_movimiento: 5,
    },
    Insumos: { stock: 100 },
}

export const movimientoSinMovimientos = {
    Movimientos: null,
    Insumos: { stock: 100 },
}

export const movimientoSinCantidad = {
    Movimientos: {
        cantidadMovimiento: 0,
        fechaMovimiento: '2026-07-22',
        tipoMovimiento: 'Ingreso',
        id_medico: 1,
        id_insumo: 1,
    },
    Insumos: { stock: 100 },
}

export const movimientoSinFecha = {
    Movimientos: {
        cantidadMovimiento: 10,
        fechaMovimiento: '',
        tipoMovimiento: 'Ingreso',
        id_medico: 1,
        id_insumo: 1,
    },
    Insumos: { stock: 100 },
}

export const movimientoSinTipo = {
    Movimientos: {
        cantidadMovimiento: 10,
        fechaMovimiento: '2026-07-22',
        tipoMovimiento: '',
        id_medico: 1,
        id_insumo: 1,
    },
    Insumos: { stock: 100 },
}

export const movimientoSinMedico = {
    Movimientos: {
        cantidadMovimiento: 10,
        fechaMovimiento: '2026-07-22',
        tipoMovimiento: 'Ingreso',
        id_medico: null,
        id_insumo: 1,
    },
    Insumos: { stock: 100 },
}

export const movimientoSinInsumo = {
    Movimientos: {
        cantidadMovimiento: 10,
        fechaMovimiento: '2026-07-22',
        tipoMovimiento: 'Ingreso',
        id_medico: 1,
        id_insumo: null,
    },
    Insumos: { stock: 100 },
}

export const movimientoTipoInvalido = {
    Movimientos: {
        cantidadMovimiento: 10,
        fechaMovimiento: '2026-07-22',
        tipoMovimiento: 'Devolución',
        id_medico: 1,
        id_insumo: 1,
    },
    Insumos: { stock: 100 },
}

export const movimientoCantidadMaxima = {
    Movimientos: {
        cantidadMovimiento: 10000,
        fechaMovimiento: '2026-07-22',
        tipoMovimiento: 'Ingreso',
        id_medico: 1,
        id_insumo: 1,
    },
    Insumos: { stock: 100 },
}

export const movimientoDevueltoSinMovimientoPrevio = {
    Movimientos: {
        cantidadMovimiento: 5,
        fechaMovimiento: '2026-07-22',
        tipoMovimiento: 'Devuelto',
        id_medico: 1,
        id_insumo: 1,
        id_movimiento: null,
    },
    Insumos: { stock: 100 },
}

// ─── Cálculo de stock ─────────────────────────────────

export const stockTests = [
    { label: 'Ingreso suma al stock', stock: 100, tipo: 'Ingreso', cantidad: 50, expected: 150 },
    { label: 'Egreso resta del stock', stock: 100, tipo: 'Egreso', cantidad: 30, expected: 70 },
    { label: 'Devuelto suma al stock', stock: 100, tipo: 'Devuelto', cantidad: 10, expected: 110 },
    { label: 'Egreso no baja de 0', stock: 10, tipo: 'Egreso', cantidad: 50, expected: 0 },
    { label: 'Stock 0 con ingreso', stock: 0, tipo: 'Ingreso', cantidad: 25, expected: 25 },
    { label: 'Stock vacío con ingreso', stock: '', tipo: 'Ingreso', cantidad: 10, expected: 10 },
    { label: 'Tipo desconocido no cambia', stock: 100, tipo: 'Otro', cantidad: 50, expected: 100 },
]
