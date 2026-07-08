import { decryptData } from '~/composables/Formulario/crypto';
import { guardarEnDB, actualizarEnIndexedDB } from '~/composables/Formulario/useIndexedDBManager.js';
import { useCie10Store } from '~/stores/Entidades/Cie10';

export async function guardarCie10(formData) {
    const api = useApiRest();
    const config = useRuntimeConfig()
    const token = decryptData(localStorage.getItem('token'))
    const notificacionesStore = useNotificacionesStore()
    const storeCie10 = useCie10Store()

    const online = navigator.onLine;
    if (online) {
        try {
            const metodo = formData.id ? 'PUT' : 'POST';
            const url = formData.id 
                ? `${config.public.cie10}/${formData.id}` 
                : config.public.cie10;
                
            let options = {
                metodo: metodo,
                url: url,
                body: formData,
                token: token
            }
            const respuesta = await api.functionCall(options)
            await storeCie10.traer(true, true)
            return true
        } catch (error) {
            console.error('Fallo al guardar', error);
            return { success: false, error: error.message }
        }
    } else {
            try {
    
                const datosLocal = {
                    Cie10: {
                        sincronizado: 0,
                        editado: formData.id ? 1 : 0,
                        ...formData
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
}
