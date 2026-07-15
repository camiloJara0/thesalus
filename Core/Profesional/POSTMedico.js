import { decryptData } from '~/composables/Formulario/crypto';
import { guardarEnDB } from '~/composables/Formulario/useIndexedDBManager';

// Funcion para validar conexion a internet y enviar fomulario a API o a IndexedDB
export const guardarProfesional = async (datos, reintento = false) => {
    const notificacionesStore = useNotificacionesStore();
    const api = useApiRest();
    const config = useRuntimeConfig()
    const token = decryptData(localStorage.getItem('token'))
    const varView = useVarView()

    const online = navigator.onLine;
    if (online) {
        try {
            const formData = new FormData();

            // Campos de texto
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

            formData.append("id_profesion", datos.id_profesion);
            formData.append("departamento_laboral", datos.departamento_laboral);
            formData.append("municipio_laboral", datos.municipio_laboral);
            formData.append("zona_laboral", datos.zona_laboral);

            formData.append("correo", datos.user.correo);

            const usuario = varView.getUser
            formData.append("id_correoCreador", usuario.id);

            // Imagen reducida (Blob)
            if (datos.sello) {
                formData.append("selloFile", datos.sello, "sello.jpg");
            }

            let options = {
                metodo: 'POST',
                url: config.public.profesionals,
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
            console.error('Fallo al enviar. Guardando localmente', error);
            notificacionesStore.options.icono = 'warning'
            notificacionesStore.options.titulo = '¡Ha ocurrido un problema!'
            notificacionesStore.options.texto = error
            notificacionesStore.options.tiempo = 3000
            notificacionesStore.simple()
            return false
        }
    } else {
        try {
            await guardarEnDB(JSON.parse(JSON.stringify( { Profesional: {...datos, sincronizado: 0, } } )));

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
            notificacionesStore.options.texto = `No se pudo guardar el formulario ${error}`
            notificacionesStore.options.tiempo = 3000
            await notificacionesStore.simple()
        }
    }
};

export function reducirImagen(file, maxWidth = 200, maxHeight = 200, calidad = 0.7) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = e => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d");

                let width = img.width;
                let height = img.height;

                // Mantener proporción
                if (width > height) {
                    if (width > maxWidth) {
                        height *= maxWidth / width;
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width *= maxHeight / height;
                        height = maxHeight;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);

                // Exportar como Blob comprimido
                canvas.toBlob(
                    blob => {
                        if (blob) resolve(blob);
                        else reject(new Error("No se pudo generar el blob"));
                    },
                    "image/jpeg",
                    calidad // 70% de calidad
                );
            };
            img.src = e.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}