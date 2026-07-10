import { guardarEnDB, actualizarEnIndexedDB } from '~/composables/Formulario/useIndexedDBManager.js';
import { useNotificacionesStore } from '~/stores/notificaciones.js'
import { decryptData } from '~/composables/Formulario/crypto';
import { useDatosServicioStore } from '~/stores/Formularios/empresa/Servicio';
import { useCitasStore } from '~/stores/Formularios/citas/Cita';

// funcion para Validar campos del formulario Nueva Cita
export const validarYEnviarActualizarCita = async (datos) => {
    const notificacionesStore = useNotificacionesStore();
    const varView = useVarView()
    const cita = datos.Cita;

    let camposObligatorios = []
    const servicioStore = useDatosServicioStore()
    const serviciosPlantilla = await servicioStore.listServicios()
    const tipoConsulta = serviciosPlantilla.find((s) => {
        return s.name === cita.servicio
    })?.plantilla

    if (tipoConsulta === 'Terapia') {
        camposObligatorios = [
            'id_paciente',
            'id_medico',
            'servicio',
            'motivo',
            'fecha',
            'motivo_edicion'
        ];
    } else {
        camposObligatorios = [
            'id_paciente',
            'id_medico',
            'servicio',
            'motivo',
            'fecha',
            'motivo_edicion'
        ];
    }

    if (datos.Cita.tipo) {
        camposObligatorios.push(
            'intervaloCitas',
            'cantidadCitas',);
    }
    // Validar campos vacíos

    const camposVacios = camposObligatorios.filter(campo => {
        const valor = cita[campo];
        return valor === undefined || valor === null || valor === '';
    });

    if (camposVacios.length > 0) {
        notificacionesStore.options.icono = 'error';
        notificacionesStore.options.titulo = 'Informacion invalida.';
        notificacionesStore.options.texto = `Faltan campos por llenar: ${camposVacios.join(', ')}`;
        notificacionesStore.options.tiempo = 5000;
        notificacionesStore.simple();
        return false;
    }

    const fechaInicial = parseFechaISO(datos.Cita.fecha)
    const fechaFinal = parseFechaISO(datos.Cita.fechaHasta)

    if(datos.Cita.motivo !== 'Atención domiciliaria') {
        cita.fechaHasta = null
    }

    if (fechaFinal < fechaInicial && datos.Cita.motivo === 'Atención domiciliaria') {
        notificacionesStore.options.icono = 'error';
        notificacionesStore.options.titulo = 'Informacion invalida.';
        notificacionesStore.options.texto = `Valida el Rango de fecha de cumplimiento de Cita.`;
        notificacionesStore.options.tiempo = 5000;
        notificacionesStore.simple();
        return false;
    }

    if (cita.cantidadCitas > 1) {

        return false;
    }

    return await enviarFormularioCita({ ...datos });
};

// Utilidad para convertir string "YYYY-MM-DD" a Date
function parseFechaISO(iso) {
    const [y, m, d] = iso.split('-').map(Number);
    return new Date(y, m - 1, d);
}

// Funcion para validar conexion a internet y enviar fomulario a API o a IndexedDB
const enviarFormularioCita = async (datos, reintento = false) => {
    const notificacionesStore = useNotificacionesStore();
    const api = useApiRest();
    const config = useRuntimeConfig()
    const token = decryptData(localStorage.getItem('token'))
    const citasStore = useCitasStore()

    const online = navigator.onLine;
    if (online) {
        try {
            // mandar a api
            let options = {
                metodo: 'PUT',
                url: config.public.citas + '/' + datos.Cita.id,
                token: token,
                body: {
                    id: datos.Cita.id,
                    id_paciente: datos.Cita.id_paciente,
                    id_medico: datos.Cita.id_medico,
                    id_servicio: datos.Cita.id_servicio,
                    motivo: datos.Cita.motivo,
                    fecha: datos.Cita.fecha,
                    fechaHasta: datos.Cita.fechaHasta,
                    hora: datos.Cita.hora,
                    id_procedimiento: datos.Cita.id_procedimiento,

                    procedimiento: datos.Cita.procedimiento,
                    codigo: datos.Cita.codigo,
                    dias_asignados: datos.Cita.cantidadCitas,
                    motivo_edicion: datos.Cita.motivo_edicion,
                }
            }
            const respuesta = await api.functionCall(options)

            if (respuesta.success) {
                citasStore.mesCitaGuardada = respuesta.data.fecha
                return true
            }
        } catch (error) {
            console.error('Fallo al enviar. Guardando localmente', error);
        }
    } else {
        try {
            if (!reintento) {
                await actualizarEnIndexedDB(JSON.parse(JSON.stringify({ Cita: { ...datos.Cita, editado: 1, sincronizado: 0 } })));
            }
            notificacionesStore.options.icono = 'warning'
            notificacionesStore.options.titulo = 'Sin conexión';
            notificacionesStore.options.texto = 'Guardado localmente. Envialos cuando tengas conexion desde notificaciones.'
            notificacionesStore.options.tiempo = 3000
            await notificacionesStore.simple()
            const noEnviados = useNoEnviados()
            await noEnviados.cargarDocumentosNoEnviados()
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