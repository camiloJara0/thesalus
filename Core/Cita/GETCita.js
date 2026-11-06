import { decryptData } from '~/composables/Formulario/crypto';
import { solicitudUnica, esAbortada } from '~/composables/useSolicitudUnica';

function tokenActual() {
    return decryptData(localStorage.getItem('token'))
}

function fallo(error, contexto) {
    if (esAbortada(error)) return undefined // respuesta obsoleta descartada
    console.error('Fallo al traer datos', contexto, error)
    return undefined
}

export async function traerCitas () {
    return await traerCitasHoy()
}

export async function traerCitasHoy () {
    if (!navigator.onLine) return false
    const config = useRuntimeConfig()
    const token = tokenActual()

    return await solicitudUnica('citasHoy', 'hoy', async (signal) => {
        try {
            const api = useApiRest()
            const respuesta = await api.functionCall({
                metodo: 'GET',
                url: config.public.citasHoy,
                token,
                signal,
            })
            if (respuesta?.success) return respuesta.data
        } catch (error) {
            return fallo(error, 'citasHoy')
        }
    })
}

export async function traerCitasPorRango (inicio, fin) {
    if (!navigator.onLine) return false
    const config = useRuntimeConfig()
    const token = tokenActual()

    return await solicitudUnica('citasPorRango', `${inicio}:${fin}`, async (signal) => {
        try {
            const api = useApiRest()
            const respuesta = await api.functionCall({
                metodo: 'POST',
                url: config.public.citasPorRango,
                token,
                body: { inicio, fin },
                signal,
            })
            if (respuesta?.success) return respuesta.data
        } catch (error) {
            return fallo(error, 'citasPorRango')
        }
    })
}

export async function traerCitasPaginadas (ultimo_id, por_pagina) {
    if (!navigator.onLine) return false
    const config = useRuntimeConfig()
    const token = tokenActual()

    return await solicitudUnica('citasPaginadas', `${ultimo_id}:${por_pagina}`, async (signal) => {
        try {
            const api = useApiRest()
            const respuesta = await api.functionCall({
                metodo: 'POST',
                url: config.public.citasPaginadas,
                token,
                body: { ultimo_id, por_pagina },
                signal,
            })
            if (respuesta?.success) return respuesta.data
        } catch (error) {
            return fallo(error, 'citasPaginadas')
        }
    })
}

export async function traerCitasFiltradas (configuracion) {
    if (!navigator.onLine) return false
    const config = useRuntimeConfig()
    const token = tokenActual()

    const filtros = {
        estado: configuracion.estado,
        fecha_año: configuracion.fecha_año,
        fecha_mes: configuracion.fecha_mes,
        name_medico: configuracion.name_medico ?? configuracion['profesional.info_usuario.name'] ?? null,
        servicio: configuracion.servicio ?? configuracion['servicio.name'] ?? null,
    }

    return await solicitudUnica('citasFiltradas', JSON.stringify(filtros), async (signal) => {
        try {
            const api = useApiRest()
            const respuesta = await api.functionCall({
                metodo: 'POST',
                url: config.public.citasFiltradas,
                token,
                body: filtros,
                signal,
            })
            if (respuesta?.success) return respuesta.data
        } catch (error) {
            return fallo(error, 'citasFiltradas')
        }
    })
}

// Catálogo compartido: promesa singleton (1 petición para cualquier consumidor).
let promesaFiltros = null

async function fetchFiltros() {
    if (!navigator.onLine) return false
    const config = useRuntimeConfig()
    const token = tokenActual()

    try {
        const api = useApiRest()
        const respuesta = await api.functionCall({
            metodo: 'GET',
            url: config.public.filtrosCitas,
            token,
        })
        if (respuesta?.success) return respuesta.data
    } catch (error) {
        return fallo(error, 'filtrosCitas')
    }
}

export function traerFiltros ({ fuerza = false } = {}) {
    if (fuerza) promesaFiltros = null
    if (!promesaFiltros) {
        promesaFiltros = fetchFiltros().then((data) => {
            if (!data) promesaFiltros = null // fallo: permitir reintento
            return data
        })
    }
    return promesaFiltros
}

export async function infoCitas () {
    if (!navigator.onLine) return false
    const config = useRuntimeConfig()
    const token = tokenActual()

    return await solicitudUnica('infoCitas', 'actual', async (signal) => {
        try {
            const api = useApiRest()
            const respuesta = await api.functionCall({
                metodo: 'GET',
                url: config.public.infoCitas,
                token,
                signal,
            })
            if (respuesta?.success) return respuesta.data
        } catch (error) {
            return fallo(error, 'infoCitas')
        }
    })
}
