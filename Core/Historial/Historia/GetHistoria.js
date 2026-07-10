import { decryptData } from '~/composables/Formulario/crypto';
export async function traerHistorias () {
    const notificacionesStore = useNotificacionesStore();
    const api = useApiRest();
    const config = useRuntimeConfig()
    const token = decryptData(localStorage.getItem('token'))
    const varView = useVarView()
    const rol = varView.getRol;

    const online = navigator.onLine;
    if (online) {
        try {
            let filtrar = !varView.getPermisos.includes('ListaPacientes')
            let historias = []

            if(rol === 'Profesional' && filtrar ) {
                const pacientesFiltrados = await api.functionCall({
                metodo: 'POST',
                url: config.public.pacientesConHistoria,
                token: token,
                body: {id_profesional: varView.getUser.id_profesional}
                })
                historias = pacientesFiltrados.data
            } else {
                const dataPacientes = await api.functionCall({
                metodo: 'GET',
                url: config.public.historiasClinicas,
                token: token
                })
                historias = dataPacientes.data
            }

            return historias
        } catch (error) {
            console.error('Fallo al traer datos', error);
        }
    } else {
        return false
    }
}

export async function traerAnalisisInicial () {
    const api = useApiRest();
    const config = useRuntimeConfig()
    const token = decryptData(localStorage.getItem('token'))

    const online = navigator.onLine;
    if (online) {
        try {
            // mandar a api
            let options = {
                metodo: 'GET',
                url: config.public.analisisInicial,
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

export async function traerAnalisisPaciente (id) {
    const api = useApiRest();
    const config = useRuntimeConfig()
    const token = decryptData(localStorage.getItem('token'))

    const online = navigator.onLine;
    if (online) {
        try {
            // mandar a api
            let options = {
                metodo: 'POST',
                url: config.public.analisisPaciente,
                token: token,
                body: {
                    id
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

export async function traerAnalisisPaginado (ultimo_id, por_pagina, servicio, paciente_id) {
    const api = useApiRest();
    const config = useRuntimeConfig()
    const token = decryptData(localStorage.getItem('token'))

    const online = navigator.onLine;
    if (online) {
        try {
            // mandar a api
            let options = {
                metodo: 'POST',
                url: config.public.analisisPaginado,
                token: token,
                body: {
                    ultimo_id,
                    por_pagina,
                    servicio,
                    paciente_id,
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

export async function traerAnalisisFiltrados (configuracion) {
    const api = useApiRest();
    const config = useRuntimeConfig();
    const token = decryptData(localStorage.getItem('token'));

    const online = navigator.onLine;
    if (online) {
        try {
            // mandar a api
            let options = {
                metodo: 'POST',
                url: config.public.analisisFiltrado,
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

export async function traerFiltrosHistoria () {
    const api = useApiRest()
    const config = useRuntimeConfig()
    const token = decryptData(localStorage.getItem('token'))

    const online = navigator.onLine;
    if (online) {
        try {
            // mandar a api
            let options = {
                metodo: 'GET',
                url: config.public.filtrosAnalisis,
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