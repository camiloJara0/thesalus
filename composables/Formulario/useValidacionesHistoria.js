/**
 * Validaciones puras para historias clínicas.
 * Extraídas de stores/Entidades/Historia.js para ser testeables.
 *
 * Cada función retorna null si es válido, o un string con el mensaje de error.
 */

import { validarFechaFormato, validarFormatoPresionArterial } from '~/composables/Formulario/useValidaciones'

/**
 * Valida los campos obligatorios de una historia clínica.
 * @param {Object} datos - Los campos de HistoriaClinica
 * @returns {null|Object} null si válido, { campo: mensaje } si hay errores
 */
export function validarCamposHistoria(datos) {
    const errores = {}

    if (!datos.No_document_paciente || datos.No_document_paciente.toString().trim() === '') {
        errores.No_document_paciente = 'El documento del paciente es obligatorio'
    }
    if (!datos.id_paciente) {
        errores.id_paciente = 'El paciente es obligatorio'
    }
    if (!datos.id_profesional) {
        errores.id_profesional = 'El profesional es obligatorio'
    }
    if (!datos.fecha || datos.fecha.toString().trim() === '') {
        errores.fecha = 'La fecha es obligatoria'
    }

    return Object.keys(errores).length > 0 ? errores : null
}

/**
 * Valida formato de presión arterial (TA).
 * Debe tener formato "120/80" con 2-3 dígitos por lado.
 * @param {string} ta
 * @returns {null|string} null si válido, string con error
 */
export function validarPresionArterial(ta) {
    if (!ta || ta === '') return null
    if (!/^\d{2,3}\/\d{2,3}$/.test(ta)) {
        return 'La TA debe tener el formato "120/80"'
    }
    const [sistolica, diastolica] = ta.split('/').map(Number)
    if (sistolica < 50 || sistolica > 300) {
        return 'La presión sistólica debe estar entre 50 y 300'
    }
    if (diastolica < 20 || diastolica > 200) {
        return 'La presión diastólica debe estar entre 20 y 200'
    }
    return null
}

/**
 * Valida frecuencia cardíaca.
 * Debe ser un número entre 30 y 200 lpm.
 * @param {string|number} fc
 * @returns {null|string}
 */
export function validarFrecuenciaCardiaca(fc) {
    if (!fc || fc === '') return null
    const num = parseInt(fc)
    if (isNaN(num)) return 'La frecuencia cardíaca debe ser un número'
    if (num < 30 || num > 200) return 'La FC debe estar entre 30 y 200 lpm'
    return null
}

/**
 * Valida frecuencia respiratoria.
 * Debe ser un número entre 8 y 60 rpm.
 * @param {string|number} fr
 * @returns {null|string}
 */
export function validarFrecuenciaRespiratoria(fr) {
    if (!fr || fr === '') return null
    const num = parseInt(fr)
    if (isNaN(num)) return 'La frecuencia respiratoria debe ser un número'
    if (num < 8 || num > 60) return 'La FR debe estar entre 8 y 60 rpm'
    return null
}

/**
 * Valida temperatura corporal.
 * Debe ser un número entre 30 y 45 °C.
 * @param {string|number} t
 * @returns {null|string}
 */
export function validarTemperatura(t) {
    if (!t || t === '') return null
    const num = parseFloat(t)
    if (isNaN(num)) return 'La temperatura debe ser un número'
    if (num < 30 || num > 45) return 'La temperatura debe estar entre 30°C y 45°C'
    return null
}

/**
 * Valida saturación de oxígeno.
 * Debe ser un número entre 0 y 100 %.
 * @param {string|number} sat
 * @returns {null|string}
 */
export function validarSaturacion(sat) {
    if (!sat || sat === '') return null
    const num = parseInt(sat)
    if (isNaN(num)) return 'La saturación debe ser un número'
    if (num < 0 || num > 100) return 'La saturación debe estar entre 0 y 100%'
    return null
}

/**
 * Valida signos vitales completos de una historia clínica.
 * @param {Object} datos - { ta, fc, fr, t, sat }
 * @returns {null|Object} null si válido, { campo: mensaje } si hay errores
 */
export function validarSignosVitales(datos) {
    const errores = {}

    const ta = validarPresionArterial(datos.ta)
    if (ta) errores.ta = ta

    const fc = validarFrecuenciaCardiaca(datos.fc)
    if (fc) errores.fc = fc

    const fr = validarFrecuenciaRespiratoria(datos.fr)
    if (fr) errores.fr = fr

    const t = validarTemperatura(datos.t)
    if (t) errores.t = t

    const sat = validarSaturacion(datos.sat)
    if (sat) errores.sat = sat

    return Object.keys(errores).length > 0 ? errores : null
}

/**
 * Valida una historia clínica completa (campos + signos vitales).
 * @param {Object} datos - HistoriaClinica completa
 * @returns {null|Object} null si válido, { campo: mensaje } si hay errores
 */
export function validarHistoriaCompleta(datos) {
    const erroresCampos = validarCamposHistoria(datos)
    const erroresSignos = validarSignosVitales(datos)

    const errores = {
        ...(erroresCampos || {}),
        ...(erroresSignos || {}),
    }

    return Object.keys(errores).length > 0 ? errores : null
}

/**
 * Determina el tipo de consulta y retorna las validaciones específicas.
 * Mapeado desde varView.tipoConsulta.plantilla.
 * @param {string} tipoConsulta
 * @returns {Function} función de validación específica
 */
export function getValidadorPorTipo(tipoConsulta) {
    const validadores = {
        Medicina: validarHistoriaMedicina,
        Evolucion: validarHistoriaEvolucion,
        Terapia: validarHistoriaTerapia,
        Nota: validarHistoriaNota,
        'Trabajo Social': validarHistoriaTrabajoSocial,
    }
    return validadores[tipoConsulta] || validarHistoriaCompleta
}

export function validarHistoriaMedicina(datos) {
    const errores = {}
    const campos = validarCamposHistoria(datos)
    if (campos) Object.assign(errores, campos)
    if (!datos.motivo_consulta || datos.motivo_consulta.trim() === '') {
        errores.motivo_consulta = 'El motivo de consulta es obligatorio'
    }
    if (!datos.impresion_diagnostica || datos.impresion_diagnostica.trim() === '') {
        errores.impresion_diagnostica = 'La impresión diagnóstica es obligatoria'
    }
    return Object.keys(errores).length > 0 ? errores : null
}

export function validarHistoriaEvolucion(datos) {
    const errores = {}
    const campos = validarCamposHistoria(datos)
    if (campos) Object.assign(errores, campos)
    if (!datos.motivo_consulta || datos.motivo_consulta.trim() === '') {
        errores.motivo_consulta = 'El motivo de evolución es obligatorio'
    }
    return Object.keys(errores).length > 0 ? errores : null
}

export function validarHistoriaTerapia(datos) {
    const errores = {}
    const campos = validarCamposHistoria(datos)
    if (campos) Object.assign(errores, campos)
    if (!datos.motivo_consulta || datos.motivo_consulta.trim() === '') {
        errores.motivo_consulta = 'El motivo de terapia es obligatorio'
    }
    if (!datos.plan_manejo || datos.plan_manejo.trim() === '') {
        errores.plan_manejo = 'El plan de manejo es obligatorio en terapia'
    }
    return Object.keys(errores).length > 0 ? errores : null
}

export function validarHistoriaNota(datos) {
    const errores = {}
    const campos = validarCamposHistoria(datos)
    if (campos) Object.assign(errores, campos)
    if (!datos.motivo_consulta || datos.motivo_consulta.trim() === '') {
        errores.motivo_consulta = 'El motivo de la nota es obligatorio'
    }
    return Object.keys(errores).length > 0 ? errores : null
}

export function validarHistoriaTrabajoSocial(datos) {
    const errores = {}
    const campos = validarCamposHistoria(datos)
    if (campos) Object.assign(errores, campos)
    if (!datos.motivo_consulta || datos.motivo_consulta.trim() === '') {
        errores.motivo_consulta = 'El motivo de la valoración es obligatorio'
    }
    return Object.keys(errores).length > 0 ? errores : null
}
