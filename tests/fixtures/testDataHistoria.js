/**
 * Datos de prueba para historias clínicas.
 */

export const historiaCompleta = {
    No_document_paciente: '1234567890',
    id_paciente: 1,
    id_profesional: 1,
    fecha: '2026-07-22',
    motivo_consulta: 'Dolor de cabeza persistente',
    antecedentes: 'Hipertensión arterial',
    antecedentes_quirurgicos: 'Apendicectomía 2015',
    alergias: 'Penicilina',
    medicamentos_actuales: 'Losartán 50mg',
    ta: '130/85',
    fc: 72,
    fr: 16,
    t: 36.5,
    sat: 98,
    examen_fisico: 'Cabeza normocéfala, pupils isocóricas',
    impresion_diagnostica: 'Cefalea tensional',
    plan_manejo: 'Analgesia oral, control de tensión',
    observaciones: 'Paciente estable',
    estado: 1,
}

export const historiaSinCamposObligatorios = {
    No_document_paciente: '',
    id_paciente: null,
    id_profesional: null,
    fecha: '',
    motivo_consulta: '',
    ta: '',
    fc: '',
    fr: '',
    t: '',
    sat: '',
}

export const historiaSignosInvalidos = {
    ...historiaCompleta,
    ta: '500/300',
    fc: 250,
    fr: 80,
    t: 50,
    sat: 110,
}

export const historiaTAFormatoInvalido = {
    ...historiaCompleta,
    ta: '130-85',
}

export const historiaTAInvalida = {
    ...historiaCompleta,
    ta: 'abc/def',
}

export const historiaFCFueraDeRango = {
    ...historiaCompleta,
    fc: 15,
}

export const historiaMedicina = {
    ...historiaCompleta,
    motivo_consulta: 'Dolor abdominal bajo',
    impresion_diagnostica: 'Apendicitis aguda',
    plan_manejo: 'Cirugía de urgencia',
}

export const historiaMedicinaSinMotivo = {
    ...historiaCompleta,
    motivo_consulta: '',
    impresion_diagnostica: 'Apendicitis',
}

export const historiaMedicinaSinImpresion = {
    ...historiaCompleta,
    motivo_consulta: 'Dolor',
    impresion_diagnostica: '',
}

export const historiaEvolucion = {
    ...historiaCompleta,
    motivo_consulta: 'Evolución postquirúrgica día 3',
}

export const historiaEvolucionSinMotivo = {
    ...historiaCompleta,
    motivo_consulta: '',
}

export const historiaTerapia = {
    ...historiaCompleta,
    motivo_consulta: 'Sesión de fisioterapia',
    plan_manejo: 'Ejercicios de fortalecimiento 3 veces por semana',
}

export const historiaTerapiaSinMotivo = {
    ...historiaCompleta,
    motivo_consulta: '',
    plan_manejo: 'Ejercicios',
}

export const historiaTerapiaSinPlan = {
    ...historiaCompleta,
    motivo_consulta: 'Sesión',
    plan_manejo: '',
}

export const historiaNota = {
    ...historiaCompleta,
    motivo_consulta: 'Nota de evolución',
}

export const historiaNotaSinMotivo = {
    ...historiaCompleta,
    motivo_consulta: '',
}

export const historiaTrabajoSocial = {
    ...historiaCompleta,
    motivo_consulta: 'Valoración socioeconómica',
}

export const historiaTrabajoSocialSinMotivo = {
    ...historiaCompleta,
    motivo_consulta: '',
}

// ─── Signos vitales válidos ────────────────────────────

export const signosVitalesValidos = [
    { label: 'TA normal', ta: '120/80', expected: null },
    { label: 'TA sistólica baja', ta: '90/60', expected: null },
    { label: 'TA alta', ta: '180/120', expected: null },
    { label: 'TA límite 50/20', ta: '50/20', expected: null },
    { label: 'TA límite 300/200', ta: '300/200', expected: null },
    { label: 'TA vacía', ta: '', expected: null },
    { label: 'TA nula', ta: null, expected: null },
]

export const signosVitalesInvalidos = [
    { label: 'TA sin barra', ta: '12080', expected: 'error' },
    { label: 'TA con letras', ta: 'abc/def', expected: 'error' },
    { label: 'TA sistólica < 50', ta: '40/80', expected: 'error' },
    { label: 'TA diastólica > 200', ta: '120/210', expected: 'error' },
    { label: 'TA formato inválido', ta: '130-85', expected: 'error' },
]

export const fcValidas = [
    { label: 'FC normal', fc: 72, expected: null },
    { label: 'FC mínima', fc: 30, expected: null },
    { label: 'FC máxima', fc: 200, expected: null },
    { label: 'FC vacía', fc: '', expected: null },
    { label: 'FC nula', fc: null, expected: null },
]

export const fcInvalidas = [
    { label: 'FC muy baja', fc: 25, expected: 'error' },
    { label: 'FC muy alta', fc: 210, expected: 'error' },
    { label: 'FC texto', fc: 'rapido', expected: 'error' },
]

export const frValidas = [
    { label: 'FR normal', fr: 16, expected: null },
    { label: 'FR mínima', fr: 8, expected: null },
    { label: 'FR máxima', fr: 60, expected: null },
    { label: 'FR vacía', fr: '', expected: null },
]

export const frInvalidas = [
    { label: 'FR muy baja', fr: 5, expected: 'error' },
    { label: 'FR muy alta', fr: 70, expected: 'error' },
]

export const temperaturaValida = [
    { label: 'T normal', t: 36.5, expected: null },
    { label: 'T mínima', t: 30, expected: null },
    { label: 'T máxima', t: 45, expected: null },
    { label: 'T vacía', t: '', expected: null },
]

export const temperaturaInvalida = [
    { label: 'T muy baja', t: 29, expected: 'error' },
    { label: 'T muy alta', t: 46, expected: 'error' },
]

export const satValida = [
    { label: 'Sat normal', sat: 98, expected: null },
    { label: 'Sat mínima', sat: 0, expected: null },
    { label: 'Sat máxima', sat: 100, expected: null },
    { label: 'Sat vacía', sat: '', expected: null },
]

export const satInvalida = [
    { label: 'Sat > 100', sat: 105, expected: 'error' },
    { label: 'Sat negativa', sat: -5, expected: 'error' },
]
