import { guardarEnDB, actualizarEnIndexedDB } from '../composables/Formulario/useIndexedDBManager.js';
import { decryptData } from '~/composables/Formulario/crypto';

// Funcion para validar conexion a internet y enviar fomulario a API o a IndexedDB
export const actualizarInsumo = async (datos, reintento= false) => {
    const notificacionesStore = useNotificacionesStore();
    const api = useApiRest();
    const config = useRuntimeConfig()
    const token = decryptData(localStorage.getItem('token'))

    if(datos.Insumos.categoria == 'Equipos médicos' && datos.Tipo_equipo.nombre !== ""){
        datos.Insumos.nombre_tipo = datos.Tipo_equipo.nombre
        datos.Insumos.descripcion_tipo = datos.Tipo_equipo.descripcion
    }
    
    const online = navigator.onLine;
    if (online) {
        try {
            // mandar a api
            let options = {
                metodo: 'PUT',
                url: config.public.insumos + '/' + datos.Insumos.id,
                token: token,
                body: datos.Insumos

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
            await guardarEnDB(JSON.parse(JSON.stringify({Insumo: {...datos.Insumos, sincronizado: 0}})));
            notificacionesStore.options.icono = 'warning'
            notificacionesStore.options.titulo = 'No hay internet';
            notificacionesStore.options.texto = 'Datos guardados localmente'
            notificacionesStore.options.tiempo = 3000
            await notificacionesStore.simple()
            return true
        } catch {
            notificacionesStore.options.icono = 'warning'
            notificacionesStore.options.titulo = 'Datos incorrectos';
            notificacionesStore.options.texto = 'No se pudo guardar el formulario'
            notificacionesStore.options.tiempo = 3000
            await notificacionesStore.simple()
            return false
        }
    }
};