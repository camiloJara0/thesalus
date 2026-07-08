import { decryptData } from '~/composables/Formulario/crypto';
import { useInsumoStore } from '~/stores/Entidades/Insumo';

// Funcion para validar conexion a internet y enviar fomulario a API o a IndexedDB
export const eliminarMovimiento = async (datos) => {
    const notificacionesStore = useNotificacionesStore();
    const api = useApiRest();
    const config = useRuntimeConfig()
    const token = decryptData(localStorage.getItem('token'))
    const insumoStore = useInsumoStore()

    // Guardar local
    const online = navigator.onLine;
    if (online) {
        try {
            // mandar a api
            let options = {
                metodo: 'DELETE',
                url: config.public.movimientos + '/' + datos.id,
                token: token,
                body: {
                    id: datos.id,
                }
            }
            const respuesta = await api.functionCall(options)

            if (respuesta.success) {
                await insumoStore.traer(true, true)
                await insumoStore.traerMovimiento(true, true)
                return true
            }
        } catch (error) {
            console.error('Fallo al enviar. Guardando localmente', error);
        }
    } else {
        notificacionesStore.options.icono = 'warning'
        notificacionesStore.options.titulo = 'Sin conexión';
        notificacionesStore.options.texto = 'Prueba cuendo tengas internet'
        notificacionesStore.options.tiempo = 3000
        await notificacionesStore.simple()
        return true
    }
};