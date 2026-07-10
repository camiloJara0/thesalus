import { decryptData } from '~/composables/Formulario/crypto';
import { guardarEnDB, actualizarEnIndexedDB } from '~/composables/Formulario/useIndexedDBManager.js';
import { useVadecumStore } from '~/stores/Entidades/Vadecum';

export async function guardarVadecum(formData) {
    const api = useApiRest();
    const config = useRuntimeConfig()
    const token = decryptData(localStorage.getItem('token'))
    const notificacionesStore = useNotificacionesStore()
    const store = useVadecumStore()

    const online = navigator.onLine;
    if (online) {
        try {
            const metodo = formData.id ? 'PUT' : 'POST';
            const url = formData.id
                ? `${config.public.codesVadecum}/${formData.id}`
                : config.public.codesVadecum;

            let options = {
                metodo: metodo,
                url: url,
                body: formData,
                token: token
            }
            const respuesta = await api.functionCall(options)
            await store.traer(true, true)
            return true
        } catch (error) {
            console.error('Fallo al guardar', error);
            return { success: false, error: error.message }
        }
    } else {
        try {

            const datosLocal = {
                Vadecum: {
                    sincronizado: 0,
                    editado: formData.id ? 1 : 0,
                    ...formData
                }
            }
            await actualizarEnIndexedDB(JSON.parse(JSON.stringify(datosLocal)));
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
}
