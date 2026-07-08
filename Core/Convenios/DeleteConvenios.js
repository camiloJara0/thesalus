import { decryptData } from '~/composables/Formulario/crypto';
import { useConvenioStore } from '~/stores/Entidades/Convenio';

export async function eliminarConvenio(id) {
    const api = useApiRest();
    const config = useRuntimeConfig()
    const token = decryptData(localStorage.getItem('token'))
    const notificacionesStore = useNotificacionesStore()
    const store = useConvenioStore()

    const online = navigator.onLine;
    if (online) {
        try {
            let options = {
                metodo: 'DELETE',
                url: `${config.public.convenios}/${id}`,
                token: token
            }
            const respuesta = await api.functionCall(options)
            await store.traer(true, true)
            return respuesta
        } catch (error) {
            console.error('Fallo al eliminar', error);
            return { success: false, error: error.message }
        }
    } else {
        try {
            await actualizarEnIndexedDB(JSON.parse(JSON.stringify( { Convenio: {...form, sincronizado: 0, estado: 0} } )));

            notificacionesStore.options.icono = 'warning'
            notificacionesStore.options.titulo = 'No hay internet';
            notificacionesStore.options.texto = 'Datos guardados localmente'
            notificacionesStore.options.tiempo = 3000
            await notificacionesStore.simple()
            return true
        } catch (error) {
            notificacionesStore.options.icono = 'warning'
            notificacionesStore.options.titulo = 'Datos incorrectos';
            notificacionesStore.options.texto = `No se pudo guardar el formulario ${error}`
            notificacionesStore.options.tiempo = 3000
            await notificacionesStore.simple()
        }
    }
}
