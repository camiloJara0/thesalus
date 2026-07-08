import { actualizarEnIndexedDB } from '../composables/Formulario/useIndexedDBManager.js';
import { decryptData } from '~/composables/Formulario/crypto';

// funcion para Validar campos del formulario Modificar Usuario
export const validarYEnviarModificarAdministrador = async (datos) => {
    return await enviarFormulario(datos);
};

// Funcion para validar conexion a internet y enviar fomulario a API o a IndexedDB
const enviarFormulario = async (datos) => {
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
                url: config.public.informacionUsers + '/' + datos.InformacionUser.id,
                token: token,
                body: {
                    id: datos.InformacionUser.id,
                    name: datos.InformacionUser.name,
                    No_document: datos.InformacionUser.No_document,
                    type_doc: datos.InformacionUser.type_doc,
                    celular: datos.InformacionUser.celular,
                    telefono: datos.InformacionUser.telefono || null,
                    nacimiento: datos.InformacionUser.nacimiento,
                    direccion: datos.InformacionUser.direccion,
                    municipio: datos.InformacionUser.municipio,
                    departamento: datos.InformacionUser.departamento,
                    barrio: datos.InformacionUser.barrio,
                    zona: datos.InformacionUser.zona,

                    correo: datos.User.correo,
                    contraseña: datos.User.contraseña
                }
            }

            const respuesta = await api.functionCall(options)

            if (respuesta.success) {
                return true
            } else {
                notificacionesStore.options.icono = 'warning'
                notificacionesStore.options.titulo = '¡Ha ocurrido un problema!'
                notificacionesStore.options.texto = respuesta.message
                notificacionesStore.options.tiempo = 3000
                notificacionesStore.simple()
                return false
            }

        } catch (error) {
            console.error('Fallo al enviar. Guardando localmente', error);
        }

    } else {
        notificacionesStore.options.icono = 'warning'
        notificacionesStore.options.titulo = 'Sin conexión';
        notificacionesStore.options.texto = 'Se guardará localmente'
        notificacionesStore.options.tiempo = 3000
        await notificacionesStore.simple()
        await actualizarEnIndexedDB(JSON.parse(JSON.stringify(datos)));
        return true
    }
};