import { decryptData } from '~/composables/Formulario/crypto';
export const traerCeldasPintadas = async () => {
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
                    url: config.public.celdaColors,
                    token: token,
                }
                
                const respuesta = await api.functionCall(options)

            if (respuesta.success) {
                return respuesta.data
            }
        } catch (error) {
            console.error('Fallo al enviar.', error);
        }
    } else {
        console.log('error guardando colores')
    }
};