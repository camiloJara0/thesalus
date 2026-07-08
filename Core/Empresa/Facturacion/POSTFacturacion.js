import { guardarEnDB, actualizarEnIndexedDB } from '~/composables/Formulario/useIndexedDBManager.js';
import { decryptData } from '~/composables/Formulario/crypto';

// funcion para Validar campos del formulario Nuevo Paciente
export const validarYEnviarDatosFacturacion = async (datos) => {
    console.log(datos)
    return await enviarFormulario(datos);
};

// Funcion para validar conexion a internet y enviar fomulario a API o a IndexedDB
const enviarFormulario = async (datos) => {
    const notificacionesStore = useNotificacionesStore();
    const api = useApiRest();
    const config = useRuntimeConfig()
    const token = decryptData(localStorage.getItem('token'))
    const online = navigator.onLine;

    const id_temporal = await guardarEnDB(JSON.parse(JSON.stringify({Facturacion: {...datos.Facturacion, sincronizado: 0}})));

    if (online) {
        try {
            // mandar a api
            let options = {
                metodo: 'POST',
                url: config.public.facturaciones,
                token: token,
                body: {
                        id_empresa: 1,
                        claveTecnica: datos.Facturacion.claveTecnica,
                        descripcion: datos.Facturacion.descripcion,
                        fechaInicial: datos.Facturacion.fechaInicial,
                        fechaHasta: datos.Facturacion.fechaHasta,
                        fechaResolucion: datos.Facturacion.fechaResolucion,
                        no_resolucion: datos.Facturacion.no_resolucion,
                        numeroInicial: datos.Facturacion.numeroInicial,
                        numeroHasta: datos.Facturacion.numeroHasta,
                        prefijo: datos.Facturacion.prefijo,
                        tipoDocumento: datos.Facturacion.tipoDocumento,
                }
            }
            const respuesta = await api.functionCall(options)

            if (respuesta.success) {
                const datosActualizadosLocal = {
                    Facturacion: {
                        id_temporal: id_temporal.data,
                        sincronizado: 1,
                        id: respuesta.data.id,
                        id_empresa: 1,
                        claveTecnica: respuesta.data.claveTecnica,
                        descripcion: respuesta.data.descripcion,
                        fechaInicial: respuesta.data.fechaInicial,
                        fechaHasta: respuesta.data.fechaHasta,
                        fechaResolucion: respuesta.data.fechaResolucion,
                        no_resolucion: respuesta.data.no_resolucion,
                        numeroInicial: respuesta.data.numeroInicial,
                        numeroHasta: respuesta.data.numeroHasta,
                        prefijo: respuesta.data.prefijo,
                        tipoDocumento: respuesta.data.tipoDocumento,
                    }
                }
                await actualizarEnIndexedDB(JSON.parse(JSON.stringify(datosActualizadosLocal)));
                console.log('datos actualizados')
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