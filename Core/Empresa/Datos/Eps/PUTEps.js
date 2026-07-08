import { guardarEnDB, actualizarEnIndexedDB } from '~/composables/Formulario/useIndexedDBManager.js';
import { decryptData } from '~/composables/Formulario/crypto';

// Funcion para validar conexion a internet y enviar fomulario a API o a IndexedDB
export const actualizarEps = async (datos, reintento = false) => {
    const notificacionesStore = useNotificacionesStore();
    const api = useApiRest();
    const config = useRuntimeConfig()
    const token = decryptData(localStorage.getItem('token'))

    const online = navigator.onLine;
    if (online) {
        try {
            // mandar a api
            let options = {
                metodo: 'PUT',
                url: config.public.eps + '/' + datos.EPS.id,
                token: token,
                body: {
                    id: datos.EPS.id,
                    nombre: datos.EPS.nombre,
                    codigo: datos.EPS.codigo,
                    nit: datos.EPS.nit,
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

        try {
            if(!reintento){
                await actualizarEnIndexedDB({
                    EPS: {
                        ...datos.EPS,
                        id_temporal: datos.EPS.id_temporal,
                        id: datos.EPS.id,
                        estado: 1,
                        sincronizado: 0
                    }
                })
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