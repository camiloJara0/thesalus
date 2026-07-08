import { guardarEnDB } from '../composables/Formulario/useIndexedDBManager.js';
import { decryptData } from '~/composables/Formulario/crypto';

// funcion para Validar campos del formulario Nuevo Paciente
export const validarYEnviarKardex = async (datos) => {
    const notificacionesStore = useNotificacionesStore();
    console.log(datos)
    // 🔍 Validar campos obligatorios
    const errores = []

    if(errores.length > 0) {
        errores.forEach(msg => {
            notificacionesStore.options.icono = 'error';
            notificacionesStore.options.titulo = 'Información inválida';
            notificacionesStore.options.texto = msg;
            notificacionesStore.options.tiempo = 5000;
            notificacionesStore.simple();
        });
        return false;
    }

    return await enviarFormularioKardex(datos);
};

// Funcion para validar conexion a internet y enviar fomulario a API o a IndexedDB
export const enviarFormularioKardex = async (datos, reintento = false) => {
    const notificacionesStore = useNotificacionesStore();
    const api = useApiRest();
    const config = useRuntimeConfig()
    const token = decryptData(localStorage.getItem('token'))

    const online = navigator.onLine;
    if (online) {
        try {
            // mandar a api
            let options = {
                metodo: 'POST',
                url: config.public.kardex,
                token: token,
                body: {
                    id_paciente: datos.paciente_id,
                    responsable: datos.responsable,
                    kit_cateterismo: datos.kit_cateterismo,
                    rango: datos.rango,
                    kit_cambioSonda: datos.kit_cambioSonda,
                    kit_gastro: datos.kit_gastro,
                    traqueo: datos.traqueo,
                    equipos_biomedicos: datos.equipos_biomedicos,
                    oxigeno: datos.oxigeno,
                    estado: datos.estado,
                    vm: datos.vm,
                    ultimoCambio: datos.ultimoCambio,
                    observacion: datos.observacion,
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

