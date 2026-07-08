import { decryptData } from '~/composables/Formulario/crypto';

export async function traerVadecum() {
    const api = useApiRest();
    const config = useRuntimeConfig()
    const token = decryptData(localStorage.getItem('token'))

    const online = navigator.onLine;
    if (online) {
        try {
            let options = {
                metodo: 'GET',
                url: config.public.codesVadecum,
                token: token
            }
            const respuesta = await api.functionCall(options)
            if(respuesta.success){
                return respuesta.data || respuesta.vadecum || []
            }
        } catch (error) {
            console.error('Fallo al traer datos', error);
        }
    }
    return []
}

export async function traerVadecumDetalle(id) {
    const api = useApiRest();
    const config = useRuntimeConfig()
    const token = decryptData(localStorage.getItem('token'))

    const online = navigator.onLine;
    if (online) {
        try {
            let options = {
                metodo: 'GET',
                url: `${config.public.codesVadecum}/${id}`,
                token: token
            }
            const respuesta = await api.functionCall(options)
            if(respuesta.success){
                return respuesta.data || respuesta.vadecum || {}
            }
        } catch (error) {
            console.error('Fallo al traer detalle', error);
        }
    }
    return {}
}
