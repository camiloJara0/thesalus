import { actualizarEnIndexedDB } from '../composables/Formulario/useIndexedDBManager.js';
import { decryptData } from '~/composables/Formulario/crypto';

// funcion para Validar campos del formulario cancelar cita
export const validarYEnviarCancelarCita = async (cita, motivo) => {
    cita.estado = 'cancelada'
    const datos = { Cita: { ...cita, motivo_cancelacion: motivo } }

    return await enviarFormularioEliminarCita(datos);
};

// Funcion para validar conexion a internet y enviar fomulario a API o a IndexedDB
export const enviarFormularioEliminarCita = async (datos, reintento = false) => {
    const notificacionesStore = useNotificacionesStore();
    const api = useApiRest();
    const config = useRuntimeConfig()
    const token = decryptData(localStorage.getItem('token'))

    const online = navigator.onLine;
    if (online) {
        try {
            // mandar a api

            let options = {
                metodo: 'DELETE',
                url: config.public.citas + '/' + datos.Cita.id,
                token: token,
                body: {
                    id: datos.Cita.id,
                    motivo_cancelacion: datos.Cita.motivo_cancelacion,
                    estado: datos.Cita.estado
                }
            }
            const respuesta = await api.functionCall(options)

            if (respuesta.success) {
                const datosActualizadosLocal = {
                    Cita: {
                        sincronizado: 1,
                        id: respuesta.data.id,
                        id_paciente: respuesta.data.id_paciente,
                        id_medico: respuesta.data.id_medico,
                        name_paciente: respuesta.data.name_paciente,
                        name_medico: respuesta.data.name_medico,
                        servicio: respuesta.data.servicio,
                        motivo: respuesta.data.motivo,
                        fecha: respuesta.data.fecha,
                        hora: respuesta.data.hora,
                        motivo_cancelacion: respuesta.data.motivo_cancelacion,
                        estado: respuesta.data.estado,
                    }
                }
                await actualizarEnIndexedDB(JSON.parse(JSON.stringify(datosActualizadosLocal)));
                console.log('datos actualizados')
                return true
            }

        } catch (error) {
            // notificacionesStore.options.icono = 'warning'
            // notificacionesStore.options.titulo = '¡Ha ocurrido un problema!'
            // notificacionesStore.options.texto = 'No se pudo enviar formulario, datos guardados localmente'
            // notificacionesStore.options.tiempo = 3000
            // notificacionesStore.simple()
            console.error('Fallo al enviar. Guardando localmente', error);
        }
    } else {
        try {
            if(!reintento){
                await guardarEnDB(JSON.parse(JSON.stringify({Cita: {...datos.Cita, sincronizado: 0}})));
            }
            notificacionesStore.options.icono = 'warning'
            notificacionesStore.options.titulo = 'No hay internet';
            notificacionesStore.options.texto = 'Datos guardados localmente'
            notificacionesStore.options.tiempo = 3000
            await notificacionesStore.simple()
            return true
        } catch {
            notificacionesStore.options.icono = 'warning'
            notificacionesStore.options.titulo = 'Datos incorrectos';
            notificacionesStore.options.texto = 'No se pudo guardar el formulario'
            notificacionesStore.options.tiempo = 3000
            await notificacionesStore.simple()
        }
    }
};