import { decryptData } from '~/composables/Formulario/crypto';
export async function traerdatosSecciones (id = null) {
    const notificacionesStore = useNotificacionesStore();
    const api = useApiRest();
    const config = useRuntimeConfig()
    const token = decryptData(localStorage.getItem('token'))

    const online = navigator.onLine;
    if (online) {
        try {
            let respuesta
            if(id){
                let options = {
                    metodo: 'GET',
                    url: config.public.professions + '/' + id,
                    token: token
                }
                respuesta = await api.functionCall(options)
            } else {
                // mandar a api
                let options = {
                    metodo: 'GET',
                    url: config.public.secciones,
                    token: token
                }
                respuesta = await api.functionCall(options)
            }

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