import { guardarEnDB, actualizarEnIndexedDB } from '../composables/Formulario/useIndexedDBManager.js';
import { decryptData } from '~/composables/Formulario/crypto';

// Funcion para validar conexion a internet y enviar fomulario a API o a IndexedDB
export const actualizarMovimiento = async (datos, reintento= false) => {
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
                url: config.public.movimientos + '/' + datos.Movimientos.id,
                token: token,
                body: {
                    id_insumo: datos.Movimientos.id_insumo,
                    id_medico: datos.Movimientos.id_medico,
                    cantidadMovimiento: datos.Movimientos.cantidadMovimiento,
                    fechaMovimiento: datos.Movimientos.fechaMovimiento,
                    tipoMovimiento: datos.Movimientos.tipoMovimiento,
                    id_movimiento: datos.Movimientos.id_movimiento
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
            await actualizarEnIndexedDB(JSON.parse(JSON.stringify({Movimiento: {...datos.Movimientos, editado: 1, sincronizado: 0}})));
            notificacionesStore.options.icono = 'warning'
            notificacionesStore.options.titulo = 'Sin conexión';
            notificacionesStore.options.texto = 'Guardado localmente. Envialos cuando tengas conexion desde notificaciones.'
            notificacionesStore.options.tiempo = 3000
            await notificacionesStore.simple()
            const noEnviados = useNoEnviados()
            await noEnviados.cargarDocumentosNoEnviados()
            return true
        } catch {
            notificacionesStore.options.icono = 'warning'
            notificacionesStore.options.titulo = 'Datos incorrectos';
            notificacionesStore.options.texto = 'No se pudo guardar el formulario'
            notificacionesStore.options.tiempo = 3000
            await notificacionesStore.simple()
        }
    }
};