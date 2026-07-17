import { actualizarEnIndexedDB } from '../composables/Formulario/useIndexedDBManager.js';
import { decryptData } from '~/composables/Formulario/crypto';

// Funcion para validar conexion a internet y enviar fomulario a API o a IndexedDB
export const actualizarPaciente = async (datos, reintento = false) => {
    const notificacionesStore = useNotificacionesStore();

    const api = useApiRest();
    const config = useRuntimeConfig()
    const token = decryptData(localStorage.getItem('token'))

    // añadir solo nuevos
    const Plan_manejo_procedimientos = (datos.Plan_manejo_procedimientos ?? [])
        .filter(p => !p.id) // elimina los que tengan id definido
        .map(p => ({
            procedimiento: p.procedimiento,
            codigo: p.codigo,
            id_medico: p.id_medico,
            dias_asignados: p.dias_asignados,
        }));

    const Antecedentes = (datos.Antecedentes ?? [])
        .filter(a => !a.id) // elimina los que tengan id definido
        .map(a => ({
            tipo: a.tipo,
            descripcion: a.descripcion,
        }));

    datos.Paciente.Plan_manejo_procedimientos = Plan_manejo_procedimientos || [];
    datos.Paciente.Antecedentes = Antecedentes || [];
    datos.Paciente.estado = 1

    const online = navigator.onLine;
    if (online) {
        try {
            // mandar a api
            let options = {
                metodo: 'PUT',
                url: config.public.pacientes + '/' + datos.Paciente.id,
                token: token,
                body: datos.Paciente
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
            const datosActualizadosLocal = {
                Paciente: {
                    ...datos.Paciente,
                    editado: 1,
                    sincronizado: 0, // marcar como no sincronizado
                },
            }

            await actualizarEnIndexedDB(JSON.parse(JSON.stringify(datosActualizadosLocal)));

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