import { decryptData } from '~/composables/Formulario/crypto';

export const validarYEnviarEliminarUsuario = async (datos) => {
    return await enviarFormulario(datos);
};

// Funcion para validar conexion a internet y enviar fomulario a API o a IndexedDB
const enviarFormulario = async (datos) => {
    const notificacionesStore = useNotificacionesStore();
    const api = useApiRest();
    const config = useRuntimeConfig()
    const token = decryptData(localStorage.getItem('token'))

    const online = navigator.onLine;
    if (online) {
        try {
            // mandar a api
            let options = {
                metodo: 'DELETE',
                url: config.public.informacionUsers + '/' + datos.id,
                token: token,
                body: {
                    id: datos.id,
                }
            }
            const respuesta = await api.functionCall(options)

            if (respuesta.success) {
                return true
            }

        } catch (error) {
            console.error('Fallo al enviar. Guardando localmente', error);
        }
    } else {
        notificacionesStore.options.icono = 'warning'
        notificacionesStore.options.titulo = 'Sin conexión';
        notificacionesStore.options.texto = 'Se guardará localmente'
        notificacionesStore.options.tiempo = 3000
        await notificacionesStore.simple()
        return true
    }
};