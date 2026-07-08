import { useNotificacionesStore } from '../../stores/notificaciones.js'

// funcion para Validar campos del formulario Nuevo Paciente
export const validarYEnviarRecuperarContraseña = async (datos) => {
    return await enviarFormulario(datos.Usuario);
};

// Funcion para validar conexion a internet y enviar fomulario a API o a IndexedDB
const enviarFormulario = async (datos) => {
    const varView = useVarView()
    varView.cargando = true
    const notificacionesStore = useNotificacionesStore();
    const api = useApiRest();
    const config = useRuntimeConfig()

    const online = navigator.onLine;
    if (online) {
        try {
            // mandar a api
        let options = {
                metodo: 'POST',
                url: config.public.recuperarContraseña,
                body: {
                    correo: datos.correo.toLowerCase(),
                }
            }
            const respuesta = await api.functionCall(options)

            if (respuesta.success) {
                    notificacionesStore.options.icono = 'success'
                    notificacionesStore.options.background = '#22c55e'
                    notificacionesStore.options.position = 'top-end'
                    notificacionesStore.options.texto = '¡Codigo enviado a tu correo!'
                    notificacionesStore.options.tiempo = 1500
                    notificacionesStore.mensaje()
                return true
            } else {
                    notificacionesStore.options.icono = 'error'
                    notificacionesStore.options.background = '#d33'
                    notificacionesStore.options.position = 'top-end'
                    notificacionesStore.options.texto = 'Correo no Registrado!'
                    notificacionesStore.options.tiempo = 1500
                    notificacionesStore.mensaje()
            }
        } catch (error) {
            console.error('Fallo al enviar.', error);
        } finally {
            varView.cargando = false
        }
    } else {
        notificacionesStore.options.icono = 'warning'
        notificacionesStore.options.titulo = 'No hay internet intente en otro momento';
        notificacionesStore.options.texto = 'Recuperar contraseña cuando halla internet'
        notificacionesStore.options.tiempo = 3000
        await notificacionesStore.simple()
        varView.cargando = false
        return true
    }
};