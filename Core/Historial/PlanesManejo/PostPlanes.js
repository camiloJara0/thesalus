import { guardarEnDB } from '../composables/Formulario/useIndexedDBManager.js';
import { useCalendarioCitas } from '~/stores/Calendario.js';
import { decryptData } from '~/composables/Formulario/crypto';
import { actualizarEnIndexedDB } from '~/composables/Formulario/useIndexedDBManager.js';
import { usePacientesStore } from '~/stores/Entidades/Paciente.js';
import { useInsumoStore } from '~/stores/Entidades/Insumo.js';

// funcion para Validar campos del formulario Historia Clinica
export const validarYEnviarPlan = async (datos) => {
    const notificacionesStore = useNotificacionesStore();
    const calendarioStore = useCalendarioCitas();
    const varView = useVarView();
    const pacientesStore = usePacientesStore();
    const user = varView.getUser
    const store = useIndexedDBStore()

    store.almacen = 'Profesional'
    const profesionales = await store.leerdatos()

    const profesional = profesionales.find(p => parseInt(p.id_infoUsuario) === parseInt(user.id))

    const errores = [];
    // --- Validaciones por tipo de consulta ---
    switch (varView.tipoHistoria) {

        case 'Medicamento':
            datos.Plan_manejo_medicamentos = datos.Plan_manejo_medicamentos?
                datos.Plan_manejo_medicamentos.filter(d => d && Object.values(d).some(v => v !== '' && v != null))
                .map((m, i) => {
                    if (!m.id_insumo || isNaN(parseInt(m.cantidad))) {
                        errores.push(`Producto ${i + 1} incompleto o cantidad inválida.`);
                    }

                    return {
                        ...m,
                        id_paciente: pacientesStore.PacienteSeleccionado,
                        id_medico: profesional?.id || parseInt(datos.id_profesional)
                    };
                }) : []

            datos.Plan_manejo_insumos = datos.Plan_manejo_insumos?
                datos.Plan_manejo_insumos.filter(d => d && Object.values(d).some(v => v !== '' && v != null))
                .map((m, i) => {
                    if (!m.id_insumo || isNaN(parseInt(m.cantidad))) {
                        errores.push(`Producto prestable ${i + 1} incompleto o cantidad inválida.`);
                    }

                    return {
                        ...m,
                        id_paciente: pacientesStore.PacienteSeleccionado,
                        id_medico: profesional?.id || parseInt(datos.id_profesional)
                    };
                }) : []

            if (!Array.isArray(datos.Plan_manejo_medicamentos)) {
                errores.push("El plan de medicamentos debe ser un arreglo.");
            }

            if (errores.length > 0) return mostrarErrores(errores, notificacionesStore);

            // Ahora tienes cada medicamento con id_paciente e id_medico
            const medicamentos = {...datos.Plan_manejo_medicamentos, ...datos.Plan_manejo_insumos};

            return await enviarFormularioActualizarMedicamento({ Plan_manejo_medicamentos: medicamentos, id_paciente: pacientesStore.PacienteSeleccionado, id_medico: profesional?.id || parseInt(datos.id_profesional)});

        case 'Tratamientos':
            if (!datos.Plan_manejo_procedimientos?.procedimiento) errores.push("El procedimiento es obligatorio.");
            if (!datos.Plan_manejo_procedimientos?.codigo) errores.push("El codigo del procedimiento es obligatorio.");
            if (!datos.Plan_manejo_procedimientos?.dias_asignados) errores.push("Los dias asignados es obligatorio.");

            if (errores.length > 0) return mostrarErrores(errores, notificacionesStore);

            const tratamientos = {
                ...datos.Plan_manejo_procedimientos
            }
            return await enviarFormularioActualizarTratamiento(tratamientos);

        default:
            errores.push("Tipo de consulta no soportado.");
            return mostrarErrores(errores, notificacionesStore);
    }
};

function mostrarErrores(errores, notificacionesStore) {
    errores.forEach(msg => {
        notificacionesStore.options.icono = 'error';
        notificacionesStore.options.titulo = 'Información inválida';
        notificacionesStore.options.texto = msg;
        notificacionesStore.options.tiempo = 5000;
        notificacionesStore.simple();
    });
    return false;
}

// Funcion para validar conexion a internet y enviar fomulario a API o a IndexedDB

const enviarFormularioActualizarMedicamento = async (datos) => {
    const notificacionesStore = useNotificacionesStore();
    const api = useApiRest();
    const config = useRuntimeConfig()
    const token = decryptData(localStorage.getItem('token'))
    const insumoStore = useInsumoStore()

    // Guardar Local
    const online = navigator.onLine;
    if (online) {
        try {
            // mandar a api
            const respuesta = await fetch(`${config.public.api}/${config.public.planManejoMedicamentos}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/pdf',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(datos)
            });

            if(!respuesta.success || !respuesta.ok) {
                notificacionesStore.options.icono = 'warning'
                notificacionesStore.options.titulo = '¡Ha ocurrido un problema!'
                notificacionesStore.options.texto = respuesta.message || 'Comprueba cantidad del insumo o fecha de prestacion'
                notificacionesStore.options.tiempo = 3000
                notificacionesStore.simple()
                return false
            }

            // Detectar si la respuesta es PDF o JSON
            const contentType = respuesta.headers.get('Content-Type');

            if (contentType && !contentType.includes('application/pdf')) {
                return false
            }
            const blob = await respuesta.blob();
            const url = window.URL.createObjectURL(blob);

            // Leer el nombre desde el header
            const disposition = respuesta.headers.get('Content-Disposition');
            let fileName = `ActaEntrega.pdf`;
            if (disposition) {
                const match = disposition.match(/filename\*?=(?:UTF-8''|")?([^";]+)/);
                if (match && match[1]) {
                    fileName = decodeURIComponent(match[1]);
                }
            }

            // Descargar el archivo
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);

            setTimeout(() => window.URL.revokeObjectURL(url), 10000);

            await insumoStore.traerMovimiento(true, true)
            await insumoStore.traerPrestaciones(true, true)
            return true

        } catch (error) {
            console.error('Fallo al enviar.', error);
        }
    } else {
        notificacionesStore.options.icono = 'warning'
        notificacionesStore.options.titulo = 'Sin conexión';
        notificacionesStore.options.texto = 'Se guardará localmente'
        notificacionesStore.options.tiempo = 3000
        await notificacionesStore.simple()
        await guardarEnDB(JSON.parse(JSON.stringify(datos)), "HistoriaClinica");
        return true
    }
}

const enviarFormularioActualizarTratamiento = async (datos) => {
    const notificacionesStore = useNotificacionesStore();
    const api = useApiRest();
    const config = useRuntimeConfig()
    const token = decryptData(localStorage.getItem('token'))

    // Guardar Local
    const online = navigator.onLine;
    if (online) {
        try {
            // mandar a api
            let options = {
                metodo: 'PUT',
                url: config.public.planManejoProcedimientos + '/' + datos.id,
                token: token,
                body: datos
            }
            const respuesta = await api.functionCall(options)

            if (respuesta.success) {
                // Actualizar local
                const datosActualizar = {
                    Plan_manejo_procedimientos: {
                        id: respuesta.data.id,
                        procedimiento: respuesta.data.procedimiento,
                        codigo: respuesta.data.codigo,
                        dias_asignados: respuesta.data.dias_asignados,
                    }
                };
                await actualizarEnIndexedDB(JSON.stringify(datosActualizar))
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
        notificacionesStore.options.icono = 'warning'
        notificacionesStore.options.titulo = 'Sin conexión';
        notificacionesStore.options.texto = 'Se guardará localmente'
        notificacionesStore.options.tiempo = 3000
        await notificacionesStore.simple()
        await guardarEnDB(JSON.parse(JSON.stringify(datos)), "HistoriaClinica");
        return true
    }
}