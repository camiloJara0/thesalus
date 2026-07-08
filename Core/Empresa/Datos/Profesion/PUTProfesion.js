import { guardarEnDB, actualizarEnIndexedDB } from '~/composables/Formulario/useIndexedDBManager.js';
import { decryptData } from '~/composables/Formulario/crypto';

// Funcion para validar conexion a internet y enviar fomulario a API o a IndexedDB
export const actualizarProfesion = async (datos, reintento = false) => {
    const notificacionesStore = useNotificacionesStore();
    const api = useApiRest();
    const config = useRuntimeConfig()
    const token = decryptData(localStorage.getItem('token'))

    if (datos.Profesion.ListaPacientes === true) {
        datos.Profesion.permisos.push("ListaPacientes")
    } else {
        datos.Profesion.permisos = datos.Profesion.permisos.filter(permiso => permiso !== "ListaPacientes")
    }

    if (datos.Profesion.Diagnosticos_view === true) {
        datos.Profesion.permisos.push("Diagnosticos_view")
    } else {
        datos.Profesion.permisos = datos.Profesion.permisos.filter(permiso => permiso !== "Diagnosticos_view")
    }

    const online = navigator.onLine;
    if (online) {
        try {
            // mandar a api
            let options = {
                metodo: 'PUT',
                url: config.public.professions + '/' + datos.Profesion.id,
                token: token,
                body: {
                    id: datos.Profesion.id,
                    codigo: datos.Profesion.codigo,
                    nombre: datos.Profesion.nombre,
                    permisos: datos.Profesion.permisos,
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
            if (!reintento) {
                // Actualizar local
                await actualizarEnIndexedDB(JSON.parse(JSON.stringify({
                    Profesion: {
                        codigo: datos.Profesion.codigo,
                        nombre: datos.Profesion.nombre,
                        permisos: datos.Profesion.permisos,
                        id: datos.Profesion.id,
                        editado: 1,
                        sincronizado: 0
                    }
                })));
            }
            notificacionesStore.options.icono = 'warning'
            notificacionesStore.options.titulo = 'No hay internet';
            notificacionesStore.options.texto = 'Datos guardados localmente'
            notificacionesStore.options.tiempo = 3000
            await notificacionesStore.simple()
            return true
        } catch {
            notificacionesStore.options.icono = 'warning'
            notificacionesStore.options.titulo = 'No hay internet intente en otro momento';
            notificacionesStore.options.texto = 'en desarrollo'
            notificacionesStore.options.tiempo = 3000
            await notificacionesStore.simple()
            return true
        }
    }
};