import { actualizarEnIndexedDB } from '../composables/Formulario/useIndexedDBManager.js';
import { decryptData } from '~/composables/Formulario/crypto';

// Funcion para validar conexion a internet y enviar fomulario a API o a IndexedDB
export const editarProfesional = async (datos, reintento = false) => {
    const notificacionesStore = useNotificacionesStore();
    const config = useRuntimeConfig()
    const api = useApiRest();
    const token = decryptData(localStorage.getItem('token'))
console.log(datos)
    const online = navigator.onLine;
    if (online) {
        try {
            // mandar a api
            const formData = new FormData();

            // Campos de texto
            formData.append("id_infoUsuario", datos.info_usuario.id);
            formData.append("name", datos.info_usuario.name);
            formData.append("No_document", datos.info_usuario.No_document);
            formData.append("type_doc", datos.info_usuario.type_doc);
            formData.append("celular", datos.info_usuario.celular);
            formData.append("telefono", datos.info_usuario.telefono || "");
            formData.append("nacimiento", datos.info_usuario.nacimiento);
            formData.append("direccion", datos.info_usuario.direccion);
            formData.append("municipio", datos.info_usuario.municipio);
            formData.append("departamento", datos.info_usuario.departamento);
            formData.append("barrio", datos.info_usuario.barrio);
            formData.append("zona", datos.info_usuario.zona);

            formData.append("id", datos.id);
            formData.append("id_profesion", datos.id_profesion);
            formData.append("departamento_laboral", datos.departamento_laboral);
            formData.append("municipio_laboral", datos.municipio_laboral);
            formData.append("zona_laboral", datos.zona_laboral);
            formData.append("estado", 1);

            formData.append("correo", datos.user.correo);

            // Imagen reducida (Blob)
            if (datos.sello && datos.sello instanceof Blob && datos.sello.size > 0) {
                formData.append("selloFile", datos.sello, "sello.jpg");
            }

            formData.append("_method", "PUT");

            let options = {
                metodo: 'POST',
                url: config.public.profesionals + '/' + datos.id,
                token: token,
                formData: true,
                body: formData,
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
            notificacionesStore.options.icono = 'warning'
            notificacionesStore.options.titulo = '¡Ha ocurrido un problema!'
            notificacionesStore.options.texto = error
            notificacionesStore.options.tiempo = 3000
            notificacionesStore.simple()
            return false
        }
    } else {

        try {

            await actualizarEnIndexedDB({
                Profesional: {
                    ...datos,
                    sincronizado: 0,
                    editado: 1,
                }
            })

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
};