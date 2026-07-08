import { guardarEnDB, actualizarEnIndexedDB } from '~/composables/Formulario/useIndexedDBManager.js';
import { decryptData } from '~/composables/Formulario/crypto';

// Funcion para validar conexion a internet y enviar fomulario a API y IndexedDB
export const actualizarServicio = async (datos, reintento = false) => {
    const notificacionesStore = useNotificacionesStore();
    const api = useApiRest();
    const config = useRuntimeConfig()
    const token = decryptData(localStorage.getItem('token'))

    const online = navigator.onLine;
    if (online) {
        try {
            // Mandar a API
            let options = {
                metodo: 'PUT',
                url: config.public.servicios+ '/' + datos.Servicio.id,
                token: token,
                body: {
                    id: datos.Servicio.id,
                    plantilla: datos.Servicio.plantilla,
                    name: datos.Servicio.name,
                }
            }
            const respuesta = await api.functionCall(options)

            if (respuesta.success) {
                return true
            }
        } catch (error) {
            console.error('Fallo al enviar.', error);
        }
    } else {

        try {

            const datosLocal = {
                Servicio: {
                    sincronizado: 0,
                    editado: 1,
                    id: datos.Servicio.id,
                    name: datos.Servicio.name,
                    plantilla: datos.Servicio.plantilla,
                }
            }
            await actualizarEnIndexedDB(JSON.parse(JSON.stringify(datosLocal)));

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