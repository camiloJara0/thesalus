import { describe, it, expect } from 'vitest'
import {
    validarInsumo,
    validarFechaVencimiento,
    validarMovimiento,
    calcularStock,
    validarStockMovimiento,
    CATEGORIAS_VALIDAS,
    TIPOS_MOVIMIENTO,
} from '~/composables/Formulario/useValidacionesInsumos'

import {
    insumoMedicamento,
    insumoEquipo,
    insumoMedico,
    insumoOtro,
    insumoSinNombre,
    insumoNombreCorto,
    insumoSinCategoria,
    insumoSinStock,
    insumoStockNegativo,
    insumoMedicamentoSinCampos,
    insumoEquipoSinSerial,
    insumoMedicoSinCampos,
    movimientoIngresoValido,
    movimientoEgresoValido,
    movimientoEgresoSinStock,
    movimientoDevueltoValido,
    movimientoSinMovimientos,
    movimientoSinCantidad,
    movimientoSinFecha,
    movimientoSinTipo,
    movimientoSinMedico,
    movimientoSinInsumo,
    movimientoTipoInvalido,
    movimientoCantidadMaxima,
    movimientoDevueltoSinMovimientoPrevio,
    stockTests,
} from '../fixtures/testDataInsumos'

// ==================== VALIDACIÓN DE INSUMOS ====================
describe('validarInsumo', () => {
    describe('Insumos medicamento', () => {
        it('Medicamento válido completo', () => {
            expect(validarInsumo(insumoMedicamento)).toBeNull()
        })

        it('Sin nombre', () => {
            const result = validarInsumo(insumoSinNombre)
            expect(result).not.toBeNull()
            expect(result).toHaveProperty('nombre')
        })

        it('Nombre muy corto', () => {
            const result = validarInsumo(insumoNombreCorto)
            expect(result).not.toBeNull()
            expect(result).toHaveProperty('nombre')
        })

        it('Sin categoría', () => {
            const result = validarInsumo(insumoSinCategoria)
            expect(result).not.toBeNull()
            expect(result).toHaveProperty('categoria')
        })

        it('Sin stock', () => {
            const result = validarInsumo(insumoSinStock)
            expect(result).not.toBeNull()
            expect(result).toHaveProperty('stock')
        })

        it('Stock negativo', () => {
            const result = validarInsumo(insumoStockNegativo)
            expect(result).not.toBeNull()
            expect(result).toHaveProperty('stock')
        })

        it('Medicamento sin campos requeridos', () => {
            const result = validarInsumo(insumoMedicamentoSinCampos)
            expect(result).not.toBeNull()
            expect(result).toHaveProperty('unidad')
            expect(result).toHaveProperty('activo')
            expect(result).toHaveProperty('lote')
            expect(result).toHaveProperty('vencimiento')
        })
    })

    describe('Equipos médicos', () => {
        it('Equipo válido', () => {
            expect(validarInsumo(insumoEquipo)).toBeNull()
        })

        it('Equipo sin serial', () => {
            const result = validarInsumo(insumoEquipoSinSerial)
            expect(result).not.toBeNull()
            expect(result).toHaveProperty('serial')
        })
    })

    describe('Insumos médicos / Otro', () => {
        it('Insumo médico válido', () => {
            expect(validarInsumo(insumoMedico)).toBeNull()
        })

        it('Otro insumo válido', () => {
            expect(validarInsumo(insumoOtro)).toBeNull()
        })

        it('Insumo médico sin campos requeridos', () => {
            const result = validarInsumo(insumoMedicoSinCampos)
            expect(result).not.toBeNull()
            expect(result).toHaveProperty('unidad')
            expect(result).toHaveProperty('especificaciones')
            expect(result).toHaveProperty('lote')
            expect(result).toHaveProperty('vencimiento')
            expect(result).toHaveProperty('ubicacion')
        })
    })

    describe('Validaciones generales', () => {
        it('Nombre con 3 caracteres exactos es válido', () => {
            expect(validarInsumo({ ...insumoMedicamento, nombre: 'ABC' })).toBeNull()
        })

        it('Stock en 0 es válido', () => {
            expect(validarInsumo({ ...insumoMedicamento, stock: 0 })).toBeNull()
        })

        it('Stock como string numérico es válido', () => {
            expect(validarInsumo({ ...insumoMedicamento, stock: '50' })).toBeNull()
        })

        it('Categoría inválida', () => {
            const result = validarInsumo({ ...insumoMedicamento, categoria: 'Inválida' })
            expect(result).not.toBeNull()
            expect(result).toHaveProperty('categoria')
        })
    })
})

// ==================== FECHA DE VENCIMIENTO ====================
describe('validarFechaVencimiento', () => {
    it('Fecha futura válida', () => {
        expect(validarFechaVencimiento('2030-12-31')).toBeNull()
    })

    it('Fecha pasada', () => {
        expect(validarFechaVencimiento('2020-01-01')).toBeTypeOf('string')
    })

    it('Formato inválido', () => {
        expect(validarFechaVencimiento('31-12-2030')).toBeTypeOf('string')
    })

    it('Vacía', () => {
        expect(validarFechaVencimiento('')).toBeNull()
    })

    it('Nula', () => {
        expect(validarFechaVencimiento(null)).toBeNull()
    })
})

// ==================== VALIDACIÓN DE MOVIMIENTOS ====================
describe('validarMovimiento', () => {
    describe('Movimientos válidos', () => {
        it('Ingreso válido', () => {
            expect(validarMovimiento(movimientoIngresoValido)).toBeNull()
        })

        it('Egreso válido', () => {
            expect(validarMovimiento(movimientoEgresoValido)).toBeNull()
        })

        it('Devuelto válido con movimiento previo', () => {
            expect(validarMovimiento(movimientoDevueltoValido)).toBeNull()
        })
    })

    describe('Campos obligatorios faltantes', () => {
        it('Sin datos de movimiento', () => {
            const result = validarMovimiento(movimientoSinMovimientos)
            expect(result).not.toBeNull()
            expect(result).toHaveProperty('Movimientos')
        })

        it('Sin cantidad', () => {
            const result = validarMovimiento(movimientoSinCantidad)
            expect(result).not.toBeNull()
            expect(result).toHaveProperty('cantidadMovimiento')
        })

        it('Sin fecha', () => {
            const result = validarMovimiento(movimientoSinFecha)
            expect(result).not.toBeNull()
            expect(result).toHaveProperty('fechaMovimiento')
        })

        it('Sin tipo', () => {
            const result = validarMovimiento(movimientoSinTipo)
            expect(result).not.toBeNull()
            expect(result).toHaveProperty('tipoMovimiento')
        })

        it('Sin médico', () => {
            const result = validarMovimiento(movimientoSinMedico)
            expect(result).not.toBeNull()
            expect(result).toHaveProperty('id_medico')
        })

        it('Sin insumo', () => {
            const result = validarMovimiento(movimientoSinInsumo)
            expect(result).not.toBeNull()
            expect(result).toHaveProperty('id_insumo')
        })
    })

    describe('Reglas de negocio', () => {
        it('Egreso supera stock', () => {
            const result = validarMovimiento(movimientoEgresoSinStock)
            expect(result).not.toBeNull()
            expect(result).toHaveProperty('cantidadMovimiento')
            expect(result.cantidadMovimiento).toContain('supera')
        })

        it('Tipo de movimiento inválido', () => {
            const result = validarMovimiento(movimientoTipoInvalido)
            expect(result).not.toBeNull()
            expect(result).toHaveProperty('tipoMovimiento')
        })

        it('Cantidad mayor a 9999', () => {
            const result = validarMovimiento(movimientoCantidadMaxima)
            expect(result).not.toBeNull()
            expect(result).toHaveProperty('cantidadMovimiento')
            expect(result.cantidadMovimiento).toContain('9999')
        })

        it('Devuelto sin movimiento previo', () => {
            const result = validarMovimiento(movimientoDevueltoSinMovimientoPrevio)
            expect(result).not.toBeNull()
            expect(result).toHaveProperty('tipoMovimiento')
            expect(result.tipoMovimiento).toContain('previo')
        })
    })
})

// ==================== CÁLCULO DE STOCK ====================
describe('calcularStock', () => {
    stockTests.forEach(({ label, stock, tipo, cantidad, expected }) => {
        it(label, () => {
            expect(calcularStock(stock, tipo, cantidad)).toBe(expected)
        })
    })

    it('Stock vacío + ingreso = cantidad', () => {
        expect(calcularStock('', 'Ingreso', 25)).toBe(25)
    })

    it('Stock null + ingreso = cantidad', () => {
        expect(calcularStock(null, 'Ingreso', 25)).toBe(25)
    })
})

// ==================== VALIDACIÓN DE STOCK ====================
describe('validarStockMovimiento', () => {
    it('Egreso dentro del stock', () => {
        expect(validarStockMovimiento(100, 'Egreso', 50)).toBeNull()
    })

    it('Egreso supera stock', () => {
        expect(validarStockMovimiento(10, 'Egreso', 50)).toBeTypeOf('string')
    })

    it('Ingreso no valida stock', () => {
        expect(validarStockMovimiento(10, 'Ingreso', 100)).toBeNull()
    })

    it('Devuelto no valida stock', () => {
        expect(validarStockMovimiento(10, 'Devuelto', 100)).toBeNull()
    })

    it('Stock 0 con egreso', () => {
        expect(validarStockMovimiento(0, 'Egreso', 1)).toBeTypeOf('string')
    })
})

// ==================== CONSTANTES ====================
describe('Constantes', () => {
    it('Categorías válidas incluye Medicamento', () => {
        expect(CATEGORIAS_VALIDAS).toContain('Medicamento')
    })

    it('Categorías válidas incluye Equipos médicos', () => {
        expect(CATEGORIAS_VALIDAS).toContain('Equipos médicos')
    })

    it('Tipos de movimiento son 3', () => {
        expect(TIPOS_MOVIMIENTO).toHaveLength(3)
    })

    it('Tipos incluye Ingreso, Egreso, Devuelto', () => {
        expect(TIPOS_MOVIMIENTO).toContain('Ingreso')
        expect(TIPOS_MOVIMIENTO).toContain('Egreso')
        expect(TIPOS_MOVIMIENTO).toContain('Devuelto')
    })
})
