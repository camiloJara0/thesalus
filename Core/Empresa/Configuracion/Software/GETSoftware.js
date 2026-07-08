import { decryptData } from '~/composables/Formulario/crypto';

export async function traerSoftware () {
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
                url: config.public.software,
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
        notificacionesStore.options.icono = 'warning'
        notificacionesStore.options.titulo = 'No hay internet intente en otro momento';
        notificacionesStore.options.tiempo = 3000
        await notificacionesStore.simple()
        return false
    }
}