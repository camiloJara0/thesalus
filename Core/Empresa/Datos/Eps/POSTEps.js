import { guardarEnDB, actualizarEnIndexedDB } from '~/composables/Formulario/useIndexedDBManager.js';
import { decryptData } from '~/composables/Formulario/crypto';

// Funcion para validar conexion a internet y enviar fomulario a API o a IndexedDB
export const enviarEps = async (datos, reintento = false) => {
    const notificacionesStore = useNotificacionesStore();
    const api = useApiRest();
    const config = useRuntimeConfig()
    const token = decryptData(localStorage.getItem('token'))

    const online = navigator.onLine;
    if (online) {
        try {
            // mandar a api
            let options = {
                metodo: 'POST',
                url: config.public.eps,
                token: token,
                body: {
                    nombre: datos.EPS.nombre,
                    codigo: datos.EPS.codigo,
                    nit: datos.EPS.nit,
                }
            }
            const respuesta = await api.functionCall(options)

            if (respuesta.success) {
                // Actualizar local
                return true
            }
        } catch (error) {
            console.error('Fallo al enviar. Guardado localmente', error);
        }
    } else {
        try {
            if(!reintento){
                const datosActualizadosLocal = {
                    EPS: {
                        sincronizado: 0,
                        nombre: datos.EPS.nombre,
                        codigo: datos.EPS.codigo,
                        nit: datos.EPS.nit,
                    }
                }
                await guardarEnDB(JSON.parse(JSON.stringify(datosActualizadosLocal)));
            }
            notificacionesStore.options.icono = 'warning'
            notificacionesStore.options.titulo = 'Sin conexión';
            notificacionesStore.options.texto = 'Guardado localmente. Envialos cuando tengas conexion desde notificaciones.'
            notificacionesStore.options.tiempo = 3000
            await notificacionesStore.simple()
            const noEnviados = useNoEnviados()
            await noEnviados.cargarDocumentosNoEnviados()
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