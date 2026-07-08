import { guardarEnDB, actualizarEnIndexedDB } from '~/composables/Formulario/useIndexedDBManager.js';
import { decryptData } from '~/composables/Formulario/crypto';

// funcion para Validar campos del formulario
export const validarYEnviarPermisosProfesional = async (datos) => {
    const notificacionesStore = useNotificacionesStore()

    // 🔍 Verificar campos obligatorios

    return await enviarFormulario(datos);
};

// Funcion para validar conexion a internet y enviar fomulario a API y IndexedDB
const enviarFormulario = async (datos, reintento = false) => {
    const notificacionesStore = useNotificacionesStore();
    const api = useApiRest();
    const config = useRuntimeConfig()
    const token = decryptData(localStorage.getItem('token'))
    
    const online = navigator.onLine;
    if (online) {
        try {
            // Mandar a API
            let options = {
                metodo: 'POST',
                url: config.public.solicitarPermiso,
                token: token,
                body: {
                    id_profesional: datos.Profesion.id_profesional,
                    id_seccion: datos.Profesion.id_seccion,
                }
            }
            const respuesta = await api.functionCall(options)

            if (respuesta.success) {
                // actualizar datos local
                sessionStorage.setItem('permisoSolicitado', true)
                return true
            }
        } catch (error) {
            console.error('Fallo al enviar. Guardando localmente', error);
        }
    } else {

        try {

            if(!reintento){

            }
            notificacionesStore.options.icono = 'warning'
            notificacionesStore.options.titulo = 'No hay internet';
            notificacionesStore.options.texto = 'Datos guardados localmente'
            notificacionesStore.options.tiempo = 3000
            await notificacionesStore.simple()
            return true

        } catch (error) {
            notificacionesStore.options.icono = 'warning'
            notificacionesStore.options.titulo = 'Datos incorrectos';
            notificacionesStore.options.texto = 'No se pudo guardar el formulario'
            notificacionesStore.options.tiempo = 3000
            await notificacionesStore.simple()
        }
    }
};