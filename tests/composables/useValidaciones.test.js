import { describe, it, expect } from 'vitest'
import {
    validarCelular,
    validarTelefono,
    validarEmail,
    validarDocumento,
    validarNombre,
    validarPassword,
    validarPasswordFortaleza,
    validarFechaFormato,
    validarFechaNoPasada,
    validarFechaNacimiento,
    validarHora,
    validarFormatoPresionArterial,
    validarDireccion,
    validarSelectRequerido,
    validarCamposRequeridos,
} from '~/composables/Formulario/useValidaciones'

import {
    celularTests,
    telefonoTests,
    emailTests,
    documentoTests,
    nombreTests,
    passwordTests,
    fechaFormatoTests,
    fechaNoPasadaTests,
    fechaNacimientoTests,
    horaTests,
    presionTests,
    direccionTests,
    selectRequeridoTests,
    pacienteCompleto,
    pacienteCompletoInvalido,
    profesionalCompleto,
    citaCompleta,
    citaFechaPasada,
    citaHoraInvalida,
} from '../fixtures/testData'

// ==================== CELULAR ====================
describe('validarCelular', () => {
    celularTests.forEach(({ label, value, expected }) => {
        it(label, () => {
            const result = validarCelular(value)
            if (expected === null) {
                expect(result).toBeNull()
            } else {
                expect(result).toBeTypeOf('string')
                expect(result).toContain('10 dígitos')
            }
        })
    })
})

// ==================== TELÉFONO ====================
describe('validarTelefono', () => {
    telefonoTests.forEach(({ label, value, expected }) => {
        it(label, () => {
            const result = validarTelefono(value)
            if (expected === null) {
                expect(result).toBeNull()
            } else {
                expect(result).toBeTypeOf('string')
                expect(result).toContain('6 y 10 dígitos')
            }
        })
    })
})

// ==================== EMAIL ====================
describe('validarEmail', () => {
    emailTests.forEach(({ label, value, expected }) => {
        it(label, () => {
            const result = validarEmail(value)
            if (expected === null) {
                expect(result).toBeNull()
            } else {
                expect(result).toBeTypeOf('string')
                expect(result).toContain('correo')
            }
        })
    })
})

// ==================== DOCUMENTO ====================
describe('validarDocumento', () => {
    documentoTests.forEach(({ label, value, expected }) => {
        it(label, () => {
            const result = validarDocumento(value)
            if (expected === null) {
                expect(result).toBeNull()
            } else {
                expect(result).toBeTypeOf('string')
                expect(result).toContain('documento')
            }
        })
    })
})

// ==================== NOMBRE ====================
describe('validarNombre', () => {
    nombreTests.forEach(({ label, value, expected }) => {
        it(label, () => {
            const result = validarNombre(value)
            if (expected === null) {
                expect(result).toBeNull()
            } else {
                expect(result).toBeTypeOf('string')
                expect(result).toContain('nombre')
            }
        })
    })
})

// ==================== PASSWORD ====================
describe('validarPassword', () => {
    passwordTests.forEach(({ label, value, expected }) => {
        it(label, () => {
            const result = validarPassword(value)
            if (expected === null) {
                expect(result).toBeNull()
            } else {
                expect(result).toBeTypeOf('string')
                expect(result).toContain('contraseña')
            }
        })
    })
})

describe('validarPasswordFortaleza', () => {
    it('Password débil (solo minúsculas)', () => {
        const result = validarPasswordFortaleza('abcdef')
        expect(result.level).toBe(1)
        expect(result.text).toContain('débil')
    })

    it('Password media (letras y números)', () => {
        const result = validarPasswordFortaleza('abcde123')
        expect(result.level).toBe(2)
        expect(result.text).toContain('media')
    })

    it('Password fuerte (letras, números, símbolo, mayúscula)', () => {
        const result = validarPasswordFortaleza('Abcde123!')
        expect(result.level).toBe(3)
        expect(result.text).toContain('fuerte')
    })

    it('Password vacío', () => {
        const result = validarPasswordFortaleza('')
        expect(result.level).toBe(0)
    })
})

// ==================== FECHA FORMATO ====================
describe('validarFechaFormato', () => {
    fechaFormatoTests.forEach(({ label, value, expected }) => {
        it(label, () => {
            const result = validarFechaFormato(value)
            if (expected === null) {
                expect(result).toBeNull()
            } else {
                expect(result).toBeTypeOf('string')
            }
        })
    })
})

// ==================== FECHA NO PASADA ====================
describe('validarFechaNoPasada', () => {
    fechaNoPasadaTests.forEach(({ label, value, expected }) => {
        it(label, () => {
            const result = validarFechaNoPasada(value)
            if (expected === null) {
                expect(result).toBeNull()
            } else {
                expect(result).toBeTypeOf('string')
            }
        })
    })
})

// ==================== FECHA NACIMIENTO ====================
describe('validarFechaNacimiento', () => {
    fechaNacimientoTests.forEach(({ label, value, tipoDoc, expected }) => {
        it(label, () => {
            const result = validarFechaNacimiento(value, tipoDoc)
            if (expected === null) {
                expect(result).toBeNull()
            } else {
                expect(result).toBeTypeOf('string')
            }
        })
    })
})

// ==================== HORA ====================
describe('validarHora', () => {
    horaTests.forEach(({ label, value, expected }) => {
        it(label, () => {
            const result = validarHora(value)
            if (expected === null) {
                expect(result).toBeNull()
            } else {
                expect(result).toBeTypeOf('string')
                expect(result).toContain('hora')
            }
        })
    })
})

// ==================== PRESIÓN ARTERIAL ====================
describe('validarFormatoPresionArterial', () => {
    presionTests.forEach(({ label, value, expected }) => {
        it(label, () => {
            const result = validarFormatoPresionArterial(value)
            if (expected === null) {
                expect(result).toBeNull()
            } else {
                expect(result).toBeTypeOf('string')
            }
        })
    })
})

// ==================== DIRECCIÓN ====================
describe('validarDireccion', () => {
    direccionTests.forEach(({ label, value, expected }) => {
        it(label, () => {
            const result = validarDireccion(value)
            if (expected === null) {
                expect(result).toBeNull()
            } else {
                expect(result).toBeTypeOf('string')
                expect(result).toContain('dirección')
            }
        })
    })
})

// ==================== SELECT REQUERIDO ====================
describe('validarSelectRequerido', () => {
    selectRequeridoTests.forEach(({ label, value, expected }) => {
        it(label, () => {
            const result = validarSelectRequerido(value)
            if (expected === null) {
                expect(result).toBeNull()
            } else {
                expect(result).toBeTypeOf('string')
                expect(result).toContain('obligatorio')
            }
        })
    })
})

// ==================== VALIDACIÓN DE CAMPOS REQUERIDOS ====================
describe('validarCamposRequeridos', () => {
    it('Todos los campos presentes - válido', () => {
        const campos = [
            { path: 'info_usuario.name', label: 'Nombre' },
            { path: 'info_usuario.celular', label: 'Celular' },
        ]
        const result = validarCamposRequeridos(pacienteCompleto, campos)
        expect(result).toBeNull()
    })

    it('Campo faltante - inválido', () => {
        const campos = [
            { path: 'info_usuario.name', label: 'Nombre' },
            { path: 'info_usuario.celular', label: 'Celular' },
        ]
        const result = validarCamposRequeridos(pacienteCompletoInvalido, campos)
        expect(result).not.toBeNull()
        expect(result).toHaveProperty('info_usuario.celular')
    })

    it('Campos anidados profundos', () => {
        const campos = [
            { path: 'eps.codigo', label: 'Código EPS' },
        ]
        const result = validarCamposRequeridos(pacienteCompletoInvalido, campos)
        expect(result).not.toBeNull()
    })
})

// ==================== VALIDACIONES INTEGRADAS ====================
describe('Validación integrada de formulario de Paciente', () => {
    it('Paciente completo válido - todas las validaciones pasan', () => {
        expect(validarNombre(pacienteCompleto.info_usuario.name)).toBeNull()
        expect(validarDocumento(pacienteCompleto.info_usuario.No_document)).toBeNull()
        expect(validarCelular(pacienteCompleto.info_usuario.celular)).toBeNull()
        expect(validarTelefono(pacienteCompleto.info_usuario.telefono)).toBeNull()
        expect(validarFechaNacimiento(pacienteCompleto.info_usuario.nacimiento, pacienteCompleto.type_doc)).toBeNull()
        expect(validarDireccion(pacienteCompleto.info_usuario.direccion)).toBeNull()
    })

    it('Paciente inválido - múltiples validaciones fallan', () => {
        expect(validarNombre(pacienteCompletoInvalido.info_usuario.name)).not.toBeNull()
        expect(validarDocumento(pacienteCompletoInvalido.info_usuario.No_document)).not.toBeNull()
        expect(validarCelular(pacienteCompletoInvalido.info_usuario.celular)).toBeNull() // opcional
        expect(validarTelefono(pacienteCompletoInvalido.info_usuario.telefono)).toBeNull() // opcional
        expect(validarFechaNacimiento(pacienteCompletoInvalido.info_usuario.nacimiento, pacienteCompletoInvalido.type_doc)).not.toBeNull()
        expect(validarDireccion(pacienteCompletoInvalido.info_usuario.direccion)).not.toBeNull()
    })
})

describe('Validación integrada de formulario de Profesional', () => {
    it('Profesional completo válido', () => {
        expect(validarNombre(profesionalCompleto.info_usuario.name)).toBeNull()
        expect(validarDocumento(profesionalCompleto.info_usuario.No_document)).toBeNull()
        expect(validarCelular(profesionalCompleto.info_usuario.celular)).toBeNull()
        expect(validarEmail(profesionalCompleto.user.correo)).toBeNull()
        expect(validarFechaNacimiento(profesionalCompleto.info_usuario.nacimiento, 'CC')).toBeNull()
    })

    it('Profesional con email inválido', () => {
        expect(validarEmail('correo-invalido')).not.toBeNull()
        expect(validarEmail('sin@')).not.toBeNull()
        expect(validarEmail('@sin-dominio.com')).not.toBeNull()
    })
})

describe('Validación integrada de formulario de Cita', () => {
    it('Cita válida', () => {
        expect(validarFechaNoPasada(citaCompleta.fecha)).toBeNull()
        expect(validarHora(citaCompleta.hora)).toBeNull()
        expect(validarSelectRequerido(citaCompleta.id_paciente)).toBeNull()
        expect(validarSelectRequerido(citaCompleta.id_medico)).toBeNull()
        expect(validarSelectRequerido(citaCompleta.id_servicio)).toBeNull()
    })

    it('Cita con fecha pasada', () => {
        expect(validarFechaNoPasada(citaFechaPasada.fecha)).not.toBeNull()
    })

    it('Cita con hora inválida', () => {
        expect(validarHora(citaHoraInvalida.hora)).not.toBeNull()
    })

    it('Cita con campos obligatorios vacíos', () => {
        expect(validarSelectRequerido(null)).not.toBeNull()
        expect(validarSelectRequerido('')).not.toBeNull()
        expect(validarSelectRequerido(undefined)).not.toBeNull()
    })
})

// ==================== EDGE CASES ====================
describe('Edge Cases', () => {
    it('Strings con solo espacios', () => {
        expect(validarNombre('   ')).not.toBeNull()
        expect(validarCelular('          ')).not.toBeNull()
    })

    it('Números como string vs número', () => {
        expect(validarCelular(3101234567)).toBeNull()
        expect(validarCelular('3101234567')).toBeNull()
    })

    it('Booleanos', () => {
        expect(validarSelectRequerido(true)).toBeNull()
        expect(validarSelectRequerido(false)).not.toBeNull()
    })

    it('Arrays y objetos', () => {
        expect(validarSelectRequerido([])).toBeNull()
        expect(validarSelectRequerido({})).toBeNull()
    })

    it('Fechas bisiestas límite', () => {
        expect(validarFechaFormato('2024-02-29')).toBeNull()
        expect(validarFechaFormato('2023-02-29')).not.toBeNull()
        expect(validarFechaFormato('2000-02-29')).toBeNull()
        expect(validarFechaFormato('1900-02-29')).not.toBeNull()
    })

    it('Hora límite 23:59', () => {
        expect(validarHora('23:59')).toBeNull()
        expect(validarHora('24:00')).not.toBeNull()
    })

    it('Documento en límites exactos', () => {
        expect(validarDocumento('1234567')).toBeNull()
        expect(validarDocumento('1234567890')).toBeNull()
        expect(validarDocumento('123456')).not.toBeNull()
        expect(validarDocumento('12345678901')).not.toBeNull()
    })
})
