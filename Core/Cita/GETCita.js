import { decryptData } from '~/composables/Formulario/crypto';
export async function traerCitas () {
    const notificacionesStore = useNotificacionesStore();
    const api = useApiRest();
    const config = useRuntimeConfig()
    const token = decryptData(localStorage.getItem('token'))

    const online = navigator.onLine;
    if (online) {
        try {
            // mandar a api
            let options = {
                metodo: 'GET',
                url: config.public.citasHoy,
                token: token
            }
            const respuesta = await api.functionCall(options)

            if(respuesta.success){
                return respuesta.data
            }
        } catch (error) {
            console.error('Fallo al traer datos', error);
        }
    } else {
        return false
    }
}

export async function traerCitasHoy () {
    const api = useApiRest();
    const config = useRuntimeConfig()
    const token = decryptData(localStorage.getItem('token'))

    const online = navigator.onLine;
    if (online) {
        try {
            // mandar a api
            let options = {
                metodo: 'GET',
                url: config.public.citasHoy,
                token: token
            }
            const respuesta = await api.functionCall(options)

            if(respuesta.success){
                return respuesta.data
            }
        } catch (error) {
            console.error('Fallo al traer datos', error);
        }
    } else {
        return false
    }
}

export async function traerCitasPorRango (inicio, fin) {
    const api = useApiRest();
    const config = useRuntimeConfig()
    const token = decryptData(localStorage.getItem('token'))

    const online = navigator.onLine;
    if (online) {
        try {
            // mandar a api
            let options = {
                metodo: 'POST',
                url: config.public.citasPorRango,
                token: token,
                body: {
                    inicio,
                    fin,
                }
            }
            const respuesta = await api.functionCall(options)

            if(respuesta.success){
                return respuesta.data
            }
        } catch (error) {
            console.error('Fallo al traer datos', error);
        }
    } else {
        return false
    }
}

export async function traerCitasPaginadas (ultimo_id, por_pagina) {
    const api = useApiRest();
    const config = useRuntimeConfig()
    const token = decryptData(localStorage.getItem('token'))

    const online = navigator.onLine;
    if (online) {
        try {
            // mandar a api
            let options = {
                metodo: 'POST',
                url: config.public.citasPaginadas,
                token: token,
                body: {
                    ultimo_id,
                    por_pagina,
                }
            }
            const respuesta = await api.functionCall(options)

            if(respuesta.success){
                return respuesta.data
            }
        } catch (error) {
            console.error('Fallo al traer datos', error);
        }
    } else {
        return false
    }
}

export async function traerCitasFiltradas (configuracion) {
    const api = useApiRest();
    const config = useRuntimeConfig()
    const token = decryptData(localStorage.getItem('token'))

    const online = navigator.onLine;
    if (online) {
        try {
            // mandar a api
            let options = {
                metodo: 'POST',
                url: config.public.citasFiltradas,
                token: token,
                body: configuracion
            }
            const respuesta = await api.functionCall(options)

            if(respuesta.success){
                return respuesta.data
            }
        } catch (error) {
            console.error('Fallo al traer datos', error);
        }
    } else {
        return false
    }
}

export async function traerFiltros () {
    const api = useApiRest()
    const config = useRuntimeConfig()
    const token = decryptData(localStorage.getItem('token'))

    const online = navigator.onLine;
    if (online) {
        try {
            // mandar a api
            let options = {
                metodo: 'GET',
                url: config.public.filtrosCitas,
                token: token,
            }
            const respuesta = await api.functionCall(options)

            if(respuesta.success){
                return respuesta.data
            }
        } catch (error) {
            console.error('Fallo al traer datos', error);
        }
    } else {
        return false
    }
}