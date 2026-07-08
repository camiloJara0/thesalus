import { decryptData } from '~/composables/Formulario/crypto';

export async function traerCie10() {
    const api = useApiRest();
    const config = useRuntimeConfig()
    const token = decryptData(localStorage.getItem('token'))

    const online = navigator.onLine;
    if (online) {
        try {
            let options = {
                metodo: 'GET',
                url: config.public.cie10,
                token: token
            }
            const respuesta = await api.functionCall(options)
            if(respuesta.success){
                return respuesta.data || respuesta.cie10 || []
            }
        } catch (error) {
            console.error('Fallo al traer datos', error);
        }
    }
    return []
}

export async function traerCie10Detalle(id) {
    const api = useApiRest();
    const config = useRuntimeConfig()
    const token = decryptData(localStorage.getItem('token'))

    const online = navigator.onLine;
    if (online) {
        try {
            let options = {
                metodo: 'GET',
                url: `${config.public.codesCie10}/${id}`,
                token: token
            }
            const respuesta = await api.functionCall(options)
            if(respuesta.success){
                return respuesta.data || respuesta.cie10 || {}
            }
        } catch (error) {
            console.error('Fallo al traer detalle', error);
        }
    }
    return {}
}
