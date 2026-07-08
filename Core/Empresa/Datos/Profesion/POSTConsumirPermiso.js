import { decryptData, encryptData } from '~/composables/Formulario/crypto';

export async function consumirPermiso(data) {
    const notificacionesStore = useNotificacionesStore();
    const api = useApiRest();
    const config = useRuntimeConfig()
    const token = decryptData(localStorage.getItem('token'))
console.log(data)
    try {
        // Mandar a API
        let options = {
            metodo: 'POST',
            url: config.public.consumirPermiso,
            token: token,
            body: {
                permiso_id: data[0].permiso_id,
            }
        }
        const respuesta = await api.functionCall(options)

        if (respuesta.success) {
            // actualizar datos local
            sessionStorage.removeItem('permisosTemporales')
            const permisos = useVarView.getPermisos
            // Eliminar el permiso que coincide con data.nombre
            permisos = permisos.filter(p => p !== data[0].nombre);

            const permisosEncrypt = encryptData(permisos);

            sessionStorage.setItem('Permisos', permisosEncrypt);
            sessionStorage.removeItem('permisoSolicitado')
            return true
        }
    } catch (error) {
        console.error('Fallo al enviar. Guardando localmente', error);
    }
}