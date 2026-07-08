import { decryptData } from '~/composables/Formulario/crypto';

export async function traerConvenios() {
    const api = useApiRest();
    const config = useRuntimeConfig()
    const token = decryptData(localStorage.getItem('token'))

    const online = navigator.onLine;
    if (online) {
        try {
            let options = {
                metodo: 'GET',
                url: config.public.convenios,
                token: token
            }
            const respuesta = await api.functionCall(options)
            if(respuesta.success){
                return respuesta.data || respuesta.convenios || []
            }
        } catch (error) {
            console.error('Fallo al traer datos', error);
        }
    }
    return []
}

export async function traerConvenioDetalle(id) {
    const api = useApiRest();
    const config = useRuntimeConfig()
    const token = decryptData(localStorage.getItem('token'))

    const online = navigator.onLine;
    if (online) {
        try {
            let options = {
                metodo: 'GET',
                url: `${config.public.convenios}/${id}`,
                token: token
            }
            const respuesta = await api.functionCall(options)
            if(respuesta.success){
                return respuesta.data || respuesta.convenio || {}
            }
        } catch (error) {
            console.error('Fallo al traer detalle', error);
        }
    }
    return {}
}
