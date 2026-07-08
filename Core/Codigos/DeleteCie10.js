import { decryptData } from '~/composables/Formulario/crypto';

export async function eliminarCie10(id) {
    const api = useApiRest();
    const config = useRuntimeConfig()
    const token = decryptData(localStorage.getItem('token'))

    const online = navigator.onLine;
    if (online) {
        try {
            let options = {
                metodo: 'DELETE',
                url: `${config.public.cie10}/${id}`,
                token: token
            }
            const respuesta = await api.functionCall(options)
            return respuesta
        } catch (error) {
            console.error('Fallo al eliminar', error);
            return { success: false, error: error.message }
        }
    }
    return { success: false, error: 'Sin conexión' }
}
