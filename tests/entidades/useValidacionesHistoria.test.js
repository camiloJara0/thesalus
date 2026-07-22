import { describe, it, expect } from 'vitest'
import {
    validarCamposHistoria,
    validarPresionArterial,
    validarFrecuenciaCardiaca,
    validarFrecuenciaRespiratoria,
    validarTemperatura,
    validarSaturacion,
    validarSignosVitales,
    validarHistoriaCompleta,
    validarHistoriaMedicina,
    validarHistoriaEvolucion,
    validarHistoriaTerapia,
    validarHistoriaNota,
    validarHistoriaTrabajoSocial,
    getValidadorPorTipo,
} from '~/composables/Formulario/useValidacionesHistoria'

import {
    historiaCompleta,
    historiaSinCamposObligatorios,
    historiaSignosInvalidos,
    historiaTAFormatoInvalido,
    historiaTAInvalida,
    historiaFCFueraDeRango,
    historiaMedicina,
    historiaMedicinaSinMotivo,
    historiaMedicinaSinImpresion,
    historiaEvolucion,
    historiaEvolucionSinMotivo,
    historiaTerapia,
    historiaTerapiaSinMotivo,
    historiaTerapiaSinPlan,
    historiaNota,
    historiaNotaSinMotivo,
    historiaTrabajoSocial,
    historiaTrabajoSocialSinMotivo,
    signosVitalesValidos,
    signosVitalesInvalidos,
    fcValidas,
    fcInvalidas,
    frValidas,
    frInvalidas,
    temperaturaValida,
    temperaturaInvalida,
    satValida,
    satInvalida,
} from '../fixtures/testDataHistoria'

// ==================== CAMPOS OBLIGATORIOS ====================
describe('validarCamposHistoria', () => {
    it('Historia completa válida', () => {
        expect(validarCamposHistoria(historiaCompleta)).toBeNull()
    })

    it('Historia sin campos obligatorios', () => {
        const result = validarCamposHistoria(historiaSinCamposObligatorios)
        expect(result).not.toBeNull()
        expect(result).toHaveProperty('No_document_paciente')
        expect(result).toHaveProperty('id_paciente')
        expect(result).toHaveProperty('id_profesional')
        expect(result).toHaveProperty('fecha')
    })

    it('Documento vacío', () => {
        const result = validarCamposHistoria({ ...historiaCompleta, No_document_paciente: '' })
        expect(result).not.toBeNull()
        expect(result).toHaveProperty('No_document_paciente')
    })

    it('Fecha vacía', () => {
        const result = validarCamposHistoria({ ...historiaCompleta, fecha: '' })
        expect(result).not.toBeNull()
        expect(result).toHaveProperty('fecha')
    })
})

// ==================== PRESIÓN ARTERIAL ====================
describe('validarPresionArterial', () => {
    signosVitalesValidos.forEach(({ label, ta, expected }) => {
        it(label, () => {
            const result = validarPresionArterial(ta)
            if (expected === null) {
                expect(result).toBeNull()
            } else {
                expect(result).toBeTypeOf('string')
            }
        })
    })

    signosVitalesInvalidos.forEach(({ label, ta, expected }) => {
        it(label, () => {
            const result = validarPresionArterial(ta)
            if (expected === null) {
                expect(result).toBeNull()
            } else {
                expect(result).toBeTypeOf('string')
            }
        })
    })

    it('TA sistólica fuera de rango', () => {
        const result = validarPresionArterial('40/80')
        expect(result).toBeTypeOf('string')
        expect(result).toContain('sistólica')
    })

    it('TA diastólica fuera de rango', () => {
        const result = validarPresionArterial('120/210')
        expect(result).toBeTypeOf('string')
        expect(result).toContain('diastólica')
    })
})

// ==================== FRECUENCIA CARDÍACA ====================
describe('validarFrecuenciaCardiaca', () => {
    fcValidas.forEach(({ label, fc, expected }) => {
        it(label, () => {
            const result = validarFrecuenciaCardiaca(fc)
            if (expected === null) {
                expect(result).toBeNull()
            } else {
                expect(result).toBeTypeOf('string')
            }
        })
    })

    fcInvalidas.forEach(({ label, fc, expected }) => {
        it(label, () => {
            const result = validarFrecuenciaCardiaca(fc)
            if (expected === null) {
                expect(result).toBeNull()
            } else {
                expect(result).toBeTypeOf('string')
            }
        })
    })
})

// ==================== FRECUENCIA RESPIRATORIA ====================
describe('validarFrecuenciaRespiratoria', () => {
    frValidas.forEach(({ label, fr, expected }) => {
        it(label, () => {
            const result = validarFrecuenciaRespiratoria(fr)
            if (expected === null) {
                expect(result).toBeNull()
            } else {
                expect(result).toBeTypeOf('string')
            }
        })
    })

    frInvalidas.forEach(({ label, fr, expected }) => {
        it(label, () => {
            const result = validarFrecuenciaRespiratoria(fr)
            if (expected === null) {
                expect(result).toBeNull()
            } else {
                expect(result).toBeTypeOf('string')
            }
        })
    })
})

// ==================== TEMPERATURA ====================
describe('validarTemperatura', () => {
    temperaturaValida.forEach(({ label, t, expected }) => {
        it(label, () => {
            const result = validarTemperatura(t)
            if (expected === null) {
                expect(result).toBeNull()
            } else {
                expect(result).toBeTypeOf('string')
            }
        })
    })

    temperaturaInvalida.forEach(({ label, t, expected }) => {
        it(label, () => {
            const result = validarTemperatura(t)
            if (expected === null) {
                expect(result).toBeNull()
            } else {
                expect(result).toBeTypeOf('string')
            }
        })
    })
})

// ==================== SATURACIÓN ====================
describe('validarSaturacion', () => {
    satValida.forEach(({ label, sat, expected }) => {
        it(label, () => {
            const result = validarSaturacion(sat)
            if (expected === null) {
                expect(result).toBeNull()
            } else {
                expect(result).toBeTypeOf('string')
            }
        })
    })

    satInvalida.forEach(({ label, sat, expected }) => {
        it(label, () => {
            const result = validarSaturacion(sat)
            if (expected === null) {
                expect(result).toBeNull()
            } else {
                expect(result).toBeTypeOf('string')
            }
        })
    })
})

// ==================== SIGNOS VITALES COMPLETOS ====================
describe('validarSignosVitales', () => {
    it('Todos los signos válidos', () => {
        expect(validarSignosVitales(historiaCompleta)).toBeNull()
    })

    it('Todos los signos inválidos', () => {
        const result = validarSignosVitales(historiaSignosInvalidos)
        expect(result).not.toBeNull()
        expect(result).toHaveProperty('ta')
        expect(result).toHaveProperty('fc')
        expect(result).toHaveProperty('fr')
        expect(result).toHaveProperty('t')
        expect(result).toHaveProperty('sat')
    })

    it('Solo TA inválida', () => {
        const result = validarSignosVitales({ ta: 'abc', fc: 72, fr: 16, t: 36.5, sat: 98 })
        expect(result).not.toBeNull()
        expect(result).toHaveProperty('ta')
        expect(result).not.toHaveProperty('fc')
    })
})

// ==================== HISTORIA COMPLETA ====================
describe('validarHistoriaCompleta', () => {
    it('Historia válida completa', () => {
        expect(validarHistoriaCompleta(historiaCompleta)).toBeNull()
    })

    it('Historia sin campos y sin signos', () => {
        const result = validarHistoriaCompleta(historiaSinCamposObligatorios)
        expect(result).not.toBeNull()
        expect(Object.keys(result).length).toBeGreaterThanOrEqual(4)
    })
})

// ==================== HISTORIA MEDICINA ====================
describe('validarHistoriaMedicina', () => {
    it('Historia de medicina válida', () => {
        expect(validarHistoriaMedicina(historiaMedicina)).toBeNull()
    })

    it('Sin motivo de consulta', () => {
        const result = validarHistoriaMedicina(historiaMedicinaSinMotivo)
        expect(result).not.toBeNull()
        expect(result).toHaveProperty('motivo_consulta')
    })

    it('Sin impresión diagnóstica', () => {
        const result = validarHistoriaMedicina(historiaMedicinaSinImpresion)
        expect(result).not.toBeNull()
        expect(result).toHaveProperty('impresion_diagnostica')
    })

    it('Sin campos obligatorios base', () => {
        const result = validarHistoriaMedicina(historiaSinCamposObligatorios)
        expect(result).not.toBeNull()
    })
})

// ==================== HISTORIA EVOLUCIÓN ====================
describe('validarHistoriaEvolucion', () => {
    it('Historia de evolución válida', () => {
        expect(validarHistoriaEvolucion(historiaEvolucion)).toBeNull()
    })

    it('Sin motivo de evolución', () => {
        const result = validarHistoriaEvolucion(historiaEvolucionSinMotivo)
        expect(result).not.toBeNull()
        expect(result).toHaveProperty('motivo_consulta')
    })
})

// ==================== HISTORIA TERAPIA ====================
describe('validarHistoriaTerapia', () => {
    it('Historia de terapia válida', () => {
        expect(validarHistoriaTerapia(historiaTerapia)).toBeNull()
    })

    it('Sin motivo de terapia', () => {
        const result = validarHistoriaTerapia(historiaTerapiaSinMotivo)
        expect(result).not.toBeNull()
        expect(result).toHaveProperty('motivo_consulta')
    })

    it('Sin plan de manejo', () => {
        const result = validarHistoriaTerapia(historiaTerapiaSinPlan)
        expect(result).not.toBeNull()
        expect(result).toHaveProperty('plan_manejo')
    })
})

// ==================== HISTORIA NOTA ====================
describe('validarHistoriaNota', () => {
    it('Historia nota válida', () => {
        expect(validarHistoriaNota(historiaNota)).toBeNull()
    })

    it('Sin motivo de nota', () => {
        const result = validarHistoriaNota(historiaNotaSinMotivo)
        expect(result).not.toBeNull()
        expect(result).toHaveProperty('motivo_consulta')
    })
})

// ==================== HISTORIA TRABAJO SOCIAL ====================
describe('validarHistoriaTrabajoSocial', () => {
    it('Historia trabajo social válida', () => {
        expect(validarHistoriaTrabajoSocial(historiaTrabajoSocial)).toBeNull()
    })

    it('Sin motivo de valoración', () => {
        const result = validarHistoriaTrabajoSocial(historiaTrabajoSocialSinMotivo)
        expect(result).not.toBeNull()
        expect(result).toHaveProperty('motivo_consulta')
    })
})

// ==================== GET VALIDADOR POR TIPO ====================
describe('getValidadorPorTipo', () => {
    it('Retorna validador de Medicina', () => {
        const fn = getValidadorPorTipo('Medicina')
        expect(fn).toBe(validarHistoriaMedicina)
    })

    it('Retorna validador de Evolución', () => {
        const fn = getValidadorPorTipo('Evolucion')
        expect(fn).toBe(validarHistoriaEvolucion)
    })

    it('Retorna validador de Terapia', () => {
        const fn = getValidadorPorTipo('Terapia')
        expect(fn).toBe(validarHistoriaTerapia)
    })

    it('Retorna validador de Nota', () => {
        const fn = getValidadorPorTipo('Nota')
        expect(fn).toBe(validarHistoriaNota)
    })

    it('Retorna validador de Trabajo Social', () => {
        const fn = getValidadorPorTipo('Trabajo Social')
        expect(fn).toBe(validarHistoriaTrabajoSocial)
    })

    it('Tipo desconocido retorna validador genérico', () => {
        const fn = getValidadorPorTipo('Desconocido')
        expect(fn).toBe(validarHistoriaCompleta)
    })
})

// ==================== INTEGRACIÓN ====================
describe('Integración: validación por tipo de consulta', () => {
    it('Medicina requiere motivo + impresión diagnóstica', () => {
        const medValidator = getValidadorPorTipo('Medicina')
        expect(medValidator(historiaMedicina)).toBeNull()
        expect(medValidator(historiaMedicinaSinMotivo)).not.toBeNull()
        expect(medValidator(historiaMedicinaSinImpresion)).not.toBeNull()
    })

    it('Terapia requiere motivo + plan de manejo', () => {
        const terapiaValidator = getValidadorPorTipo('Terapia')
        expect(terapiaValidator(historiaTerapia)).toBeNull()
        expect(terapiaValidator(historiaTerapiaSinMotivo)).not.toBeNull()
        expect(terapiaValidator(historiaTerapiaSinPlan)).not.toBeNull()
    })

    it('Todos los tipos requieren campos base', () => {
        const tipos = ['Medicina', 'Evolucion', 'Terapia', 'Nota', 'Trabajo Social']
        tipos.forEach(tipo => {
            const validator = getValidadorPorTipo(tipo)
            const result = validator(historiaSinCamposObligatorios)
            expect(result).not.toBeNull()
        })
    })
})
