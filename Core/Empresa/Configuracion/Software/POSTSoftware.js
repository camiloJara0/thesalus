import { useNotificacionesStore } from '~/stores/notificaciones.js'
import { guardarEnDB, actualizarEnIndexedDB } from '~/composables/Formulario/useIndexedDBManager.js';
import { decryptData } from '~/composables/Formulario/crypto';

// funcion para Validar campos del formulario Nuevo Paciente
export const validarYEnviarDatosSoftware = async (datos) => {

    return await enviarFormulario(datos);
};

// Funcion para validar conexion a internet y enviar fomulario a API o a IndexedDB
const enviarFormulario = async (datos) => {
    const notificacionesStore = useNotificacionesStore();
    const api = useApiRest();
    const config = useRuntimeConfig()
    const token = decryptData(localStorage.getItem('token'))

    const nombreValor = Object.keys(datos.Software)[0];
    const datosLocal = {
        Tipo: nombreValor,
        idSoftware: datos.Software[nombreValor].id,
        pin: datos.Software[nombreValor].pin,
        testID: datos.Software[nombreValor].testID,
        sincronizado: 0
    }
    const id_temporal = await guardarEnDB(JSON.parse(JSON.stringify(datosLocal)));

    const online = navigator.onLine;
    if (online) {
        try {
            const nombreValor = Object.keys(datos.Software)[0];
            // mandar a api
            let options = {
                metodo: 'POST',
                url: config.public.software,
                token: token,
                body: {
                    Tipo: nombreValor,
                    idSoftware: datos.Software[nombreValor].id,
                    pin: datos.Software[nombreValor].pin,
                    testID: datos.Software[nombreValor].testID
                }
            }
            const respuesta = await api.functionCall(options)

            if (respuesta.success) {
                const datosActualizadosLocal = {
                    Software: {
                        id_temporal: id_temporal.data,
                        sincronizado: 1,
                        id: respuesta.data.id,
                        Tipo: respuesta.data.Tipo,
                        idSoftware: respuesta.data.idSoftware,
                        pin: respuesta.data.pin,
                        testID: respuesta.data.testID
                    }
                }
                await actualizarEnIndexedDB(JSON.parse(JSON.stringify(datosActualizadosLocal)));
                return true
            }

        } catch (error) {
            console.error('Fallo al enviar. Guardando localmente', error);
            // await guardarEnDB(JSON.parse(JSON.stringify(datos)));
        }
    } else {
        notificacionesStore.options.icono = 'warning'
        notificacionesStore.options.titulo = 'No hay internet intente en otro momento';
        notificacionesStore.options.texto = 'en desarrollo'
        notificacionesStore.options.tiempo = 3000
        await notificacionesStore.simple()
        return true
    }
};