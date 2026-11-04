import { defineStore } from 'pinia'

const CLAVE = 'santa_preferencias'
const CLAVE_LEGADA = 'santa_agenda_vista'

export const ORDEN_TABS_DEFECTO = [
    'notas',
    'evoluciones',
    'terapias',
    'consultas',
    'trabajo-social',
    'diagnosticos',
    'medicamentos',
    'tratamientos',
]

export const DEFAULTS = {
    v: 1,
    tema: 'system',
    agenda: {
        vistaInicial: 'calendario',
        granularidad: 'mes',
        horaInicio: 7,
        horaFin: 19,
    },
    historial: {
        ordenTabs: [...ORDEN_TABS_DEFECTO],
    },
    ui: {
        densidadTablas: 'normal',
        filasPorPagina: 10,
    },
}

function clonar(valor) {
    return JSON.parse(JSON.stringify(valor))
}

function mezclar(base, extra) {
    const salida = clonar(base)
    if (!extra || typeof extra !== 'object') return salida
    for (const clave of Object.keys(extra)) {
        const valor = extra[clave]
        const destino = salida[clave]
        if (valor && typeof valor === 'object' && !Array.isArray(valor)
            && destino && typeof destino === 'object' && !Array.isArray(destino)) {
            salida[clave] = mezclar(destino, valor)
        } else if (valor !== undefined) {
            salida[clave] = valor
        }
    }
    return salida
}

function validar(datos) {
    const d = datos && typeof datos === 'object' ? datos : {}
    const out = clonar(DEFAULTS)

    out.tema = ['system', 'light', 'dark'].includes(d.tema) ? d.tema : out.tema

    const ag = d.agenda && typeof d.agenda === 'object' ? d.agenda : {}
    out.agenda.vistaInicial = ['lista', 'calendario'].includes(ag.vistaInicial)
        ? ag.vistaInicial : out.agenda.vistaInicial
    out.agenda.granularidad = ['dia', 'semana', 'mes'].includes(ag.granularidad)
        ? ag.granularidad : out.agenda.granularidad

    let horaInicio = Number.parseInt(ag.horaInicio, 10)
    let horaFin = Number.parseInt(ag.horaFin, 10)
    if (!Number.isFinite(horaInicio)) horaInicio = out.agenda.horaInicio
    if (!Number.isFinite(horaFin)) horaFin = out.agenda.horaFin
    horaInicio = Math.min(21, Math.max(4, horaInicio))
    horaFin = Math.min(23, Math.max(5, horaFin))
    if (horaFin <= horaInicio) horaFin = Math.min(23, horaInicio + 1)
    out.agenda.horaInicio = horaInicio
    out.agenda.horaFin = horaFin

    let orden = Array.isArray(d.historial?.ordenTabs)
        ? d.historial.ordenTabs.filter((x, i, arr) =>
            typeof x === 'string' && ORDEN_TABS_DEFECTO.includes(x) && arr.indexOf(x) === i)
        : []
    if (!orden.length) orden = [...ORDEN_TABS_DEFECTO]
    ORDEN_TABS_DEFECTO.forEach(id => { if (!orden.includes(id)) orden.push(id) })
    out.historial.ordenTabs = orden

    const ui = d.ui && typeof d.ui === 'object' ? d.ui : {}
    out.ui.densidadTablas = ['normal', 'compacta'].includes(ui.densidadTablas)
        ? ui.densidadTablas : out.ui.densidadTablas
    const filas = Number.parseInt(ui.filasPorPagina, 10)
    out.ui.filasPorPagina = [10, 25, 50, 100].includes(filas) ? filas : out.ui.filasPorPagina

    out.v = 1
    return out
}

export const usePreferencias = defineStore('preferencias', {
    state: () => ({
        datos: clonar(DEFAULTS),
    }),

    getters: {
        tema: (s) => s.datos.tema,
        agenda: (s) => s.datos.agenda,
        vistaInicial: (s) => s.datos.agenda.vistaInicial,
        granularidad: (s) => s.datos.agenda.granularidad,
        horaInicio: (s) => s.datos.agenda.horaInicio,
        horaFin: (s) => s.datos.agenda.horaFin,
        ordenTabs: (s) => s.datos.historial.ordenTabs,
        ui: (s) => s.datos.ui,
        densidadTablas: (s) => s.datos.ui.densidadTablas,
        filasPorPagina: (s) => s.datos.ui.filasPorPagina,
    },

    actions: {
        cargar() {
            let guardado = null
            try {
                const crudo = localStorage.getItem(CLAVE)
                guardado = crudo ? JSON.parse(crudo) : null
            } catch (e) {
                guardado = null
            }

            let datos = mezclar(DEFAULTS, guardado)

            // Migración desde la clave legada de la agenda (Fase 4)
            try {
                const legada = localStorage.getItem(CLAVE_LEGADA)
                if (legada !== null) {
                    const yaGuardado = guardado && guardado.agenda && guardado.agenda.granularidad
                    if (!yaGuardado && ['dia', 'semana', 'mes'].includes(legada)) {
                        datos.agenda.granularidad = legada
                    }
                    localStorage.removeItem(CLAVE_LEGADA)
                }
            } catch (e) { /* almacenamiento no disponible */ }

            this.datos = validar(datos)
            this.persistir()
        },

        set(ruta, valor) {
            const partes = String(ruta).split('.').filter(Boolean)
            if (!partes.length) return
            let destino = this.datos
            for (let i = 0; i < partes.length - 1; i++) {
                const clave = partes[i]
                if (!destino[clave] || typeof destino[clave] !== 'object') return
                destino = destino[clave]
            }
            destino[partes[partes.length - 1]] = valor
            this.persistir()
        },

        persistir() {
            try {
                localStorage.setItem(CLAVE, JSON.stringify(this.datos))
            } catch (e) { /* almacenamiento no disponible */ }
        },

        reiniciar() {
            this.datos = clonar(DEFAULTS)
            this.persistir()
            try {
                localStorage.removeItem(CLAVE_LEGADA)
            } catch (e) { /* almacenamiento no disponible */ }
        },
    },
})
