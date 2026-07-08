import { guardarEnDB, actualizarEnIndexedDB } from '~/composables/Formulario/useIndexedDBManager.js';
import { decryptData } from '~/composables/Formulario/crypto';

// Funcion para validar conexion a internet y enviar fomulario a API y IndexedDB
export const enviarProfesion = async (datos, reintento = false) => {
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
            // Mandar a API
            let options = {
                metodo: 'POST',
                url: config.public.professions,
                token: token,
                body: {
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

            if(!reintento){
                const datosLocal = {
                    Profesion: {
                        sincronizado: 0,
                        nombre: datos.Profesion.nombre,
                        codigo: datos.Profesion.codigo,
                        permisos: datos.Profesion.permisos,
                    }
                }
                await guardarEnDB(JSON.parse(JSON.stringify(datosLocal)));
            }
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
};