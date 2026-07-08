import { decryptData } from '~/composables/Formulario/crypto';
import { actualizarEnIndexedDB } from '~/composables/Formulario/useIndexedDBManager';

export async function guardarConvenio(form) {
    const api = useApiRest();
    const config = useRuntimeConfig()
    const token = decryptData(localStorage.getItem('token'))
    const notificacionesStore = useNotificacionesStore()

    const online = navigator.onLine;
    if (online) {
        try {
            const metodo = form.id ? 'POST' : 'POST';
            const url = form.id
                ? `${config.public.convenios}/${form.id}`
                : config.public.convenios;

            const formData = new FormData();
            formData.append("nombre", form.nombre);

            // Si form.logo es un Blob, conviértelo en File
            if (form.logo && form.logo instanceof Blob && form.logo.size > 0) {
                const file = new File([form.logo], "logo.jpg", { type: form.logo.type });
                formData.append("logo", file);
            }

            if (form.id) {
                formData.append("_method", "PUT");
                formData.append("id", form.id);
            }

            let options = {
                metodo: metodo,
                url: url,
                body: formData,
                formData: true,
                token: token
            }
            const respuesta = await api.functionCall(options)
            return true
        } catch (error) {
            console.error('Fallo al guardar', error);
            return { success: false, error: error.message }
        }
    } else {
        try {
            let file = null
            if (form.logo && form.logo instanceof Blob && form.logo.size > 0) {
                file = new File([form.logo], "logo.jpg", { type: form.logo.type });
            }
            await actualizarEnIndexedDB(JSON.parse(JSON.stringify( { Convenio: {...form, sincronizado: 0, logo: file} } )));

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
