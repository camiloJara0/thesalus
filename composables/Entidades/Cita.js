import { useCitasStore } from '~/stores/Formularios/citas/Cita'
import { usePacientesStore } from "~/stores/Entidades/Paciente"
import { useHistoriasStore } from '~/stores/Formularios/historias/Historia'
import { useDatosServicioStore } from '~/stores/Formularios/empresa/Servicio'
import { mapCampos } from '~/components/organism/Forms/useFormulario';
import { validarYEnviarCancelarCita } from '~/Core/Cita/CancelarCita';

export function useCitaActions({ fecha }) {
    const citasStore = useCitasStore()
    const pacientesStore = usePacientesStore()
    const historiasStore = useHistoriasStore()
    const servicioStore = useDatosServicioStore()
    const varView = useVarView()

    const notificacionesStore = useNotificacionesStore()
    const {
        alertRespuestaInput,
        simple,
        mensaje,
        options
    } = notificacionesStore

    function parseFechaISO(iso) {
        const [y, m, d] = iso.split('-').map(Number);
        return new Date(y, m - 1, d); // siempre local, sin UTC
    }

    /* =========================
       CANCELAR CITA
    ========================= */
    async function cancelarCita(cita) {
        options.icono = 'warning'
        options.titulo = 'Deseas Cancelar la cita?'
        options.html = `Se cancelara la cita de: <span>${cita.paciente.info_usuario.name}</span>`
        options.input = 'text'
        options.inputAtributes = { placeholder: 'Motivo de cancelacion' }
        options.confirmtext = 'Si, Cancelar'
        options.canceltext = 'Atras'

        const respuesta = await alertRespuestaInput()

        if (respuesta.estado !== 'confirmado') return

        if (!respuesta.valor) {
            options.position = 'top-end'
            options.texto = 'Ingrese un motivo de cancelacion.'
            options.background = '#d33'
            options.tiempo = 1500
            mensaje()
            return
        }

        const res = validarYEnviarCancelarCita(cita, respuesta.valor)

        if (res) {
            options.position = 'top-end'
            options.texto = 'Cita Cancelada con exito.'
            options.background = '#6bc517'
            options.tiempo = 1500
            mensaje()
            options.background = '#d33'
        }
    }

    /* =========================
       ACTUALIZAR CITA
    ========================= */
    function actualizarCita(cita) {
        mapCampos(cita, citasStore.Formulario);
        varView.rangoCita = cita.motivo === 'Atención domiciliaria'
        varView.showActualizarCita = true
    }

    /* =========================
       MOSTRAR MOTIVOS
    ========================= */
    function showMotivoCancelacion(cita) {
        options.icono = 'info'
        options.titulo = 'Motivo de cancelacion'
        options.texto = cita.motivo_cancelacion || 'Cita cancelada!'
        options.tiempo = 5000
        simple()
    }

    function showMotivoEdicion(cita) {
        options.icono = 'info'
        options.titulo = 'Motivo de edición'
        options.texto = cita.motivo_edicion || 'La cita ha sido editada!'
        options.tiempo = 5000
        simple()
    }

    /* =========================
       OBSERVACIÓN PROFESIONAL
    ========================= */
    async function showObservacion(cita) {
        options.icono = 'info'
        options.titulo = 'Observacion de la Cita'
        options.texto = `Cita Realizada con id de analisis: ${cita.id_analisis}` || 'Cita Realizada con exito!'
        options.tiempo = 5000
        simple()
    }

    function normalizarFecha(fecha) {
        const f = new Date(fecha);
        f.setHours(0, 0, 0, 0); // fuerza a medianoche
        return f;
    }

    function parseFechaLocal(fechaStr) {
        const [year, month, day] = fechaStr.split('-').map(Number);
        return new Date(year, month - 1, day); // año, mes (0-based), día
    }


    /* =========================
       ACTIVAR CITA
    ========================= */
    async function activarCita(data) {

        const cita = JSON.parse(JSON.stringify(data))

        if (!cita.fechaHasta) {
            cita.fechaHasta = cita.fecha
        }

        const now = new Date()
        const horaActual = now.toTimeString().slice(0, 5)

        const fechaHoy = normalizarFecha(new Date());
        const fechaHasta = parseFechaLocal(cita.fechaHasta);

        if (fechaHoy > fechaHasta) {
            options.icono = 'warning'
            options.titulo = 'Rango vencido'
            options.texto = 'Consulta con un administrador para habilitar Cita!'
            options.tiempo = 3000
            simple()
            return
        }

        prepararHistoria(cita)
        varView.tipoConsulta = cita.servicio

        if (!varView.tipoConsulta) {
            options.icono = 'warning'
            options.titulo = 'No se encontro el tipo de servicio'
            options.tiempo = 3000
            simple()
            return
        }

        resolverPlantilla(cita, horaActual)
        varView.showNuevaHistoria = true
    }

    /* =========================
       HELPERS INTERNOS
    ========================= */
    function prepararHistoria(cita) {
        historiasStore.Formulario.Analisis.historia.name_paciente = cita.paciente.info_usuario.name
        historiasStore.Formulario.Analisis.historia.type_doc_paciente = cita.paciente.info_usuario.type_doc
        historiasStore.Formulario.Analisis.historia.No_document_paciente = cita.paciente.info_usuario.No_document
        historiasStore.Formulario.Analisis.historia.id_paciente = cita.paciente.id

        historiasStore.Formulario.Analisis.id_medico = cita.profesional.id
        historiasStore.Formulario.Analisis.id_servicio = cita.servicio.id


        historiasStore.Formulario.Analisis.servicio = cita.servicio.name
        historiasStore.Formulario.Analisis.Cita = { ...cita }
    }

    async function resolverPlantilla(cita, horaActual) {
        const historiaStore = useHistoriasStore()
        const indexedDB = useIndexedDBStore()
        const fechaForm = fecha?.value
            ? fecha.value.split('/').reverse().join('-')
            : cita.fecha

        if (varView.tipoConsulta.plantilla === 'Terapia') {
            Object.assign(historiasStore.Formulario.Analisis.Terapia, {
                id_procedimiento: cita.id_procedimiento,
                fecha: fechaForm,
                hora: horaActual
            })
        }

        if (varView.tipoConsulta.plantilla === 'Nota') {
            Object.assign(historiasStore.Formulario.Analisis.Nota, {
                direccion: cita.paciente.info_usuario.direccion,
                fecha_nota: fechaForm,
                hora_nota: horaActual
            })
        }

        if (varView.tipoConsulta.plantilla === 'Evolucion') {
            const allAnalisis = await indexedDB.listDatos(cita.paciente.id, 'Analisis', 'historia.id_paciente')
            const ultimosAnalisisConExamenes = allAnalisis.filter(a => a.examen_fisico && a.examen_fisico.signosVitales)
            const ultimoAnalisisConExamenes = ultimosAnalisisConExamenes[ultimosAnalisisConExamenes.length - 1]

            if (!ultimoAnalisisConExamenes && ultimoAnalisisConExamenes?.length < 1 && !ultimoAnalisisConExamenes.examen_fisico) return

            Object.assign(historiasStore.Formulario.Analisis.ExamenFisico, {
                signosVitales : {
                    ta: ultimoAnalisisConExamenes?.examen_fisico.signosVitales.ta,
                    fc: ultimoAnalisisConExamenes?.examen_fisico.signosVitales.fc,
                    fr: ultimoAnalisisConExamenes?.examen_fisico.signosVitales.fr,
                    t: ultimoAnalisisConExamenes?.examen_fisico.signosVitales.t,
                    SATo2: ultimoAnalisisConExamenes?.examen_fisico.signosVitales.SATo2,
                },
                peso: ultimoAnalisisConExamenes?.examen_fisico.peso,
                altura: ultimoAnalisisConExamenes?.examen_fisico.altura,
            })
        }
    }

    function actualizarHistoria(analisis) {
        activarCita(analisis.Cita)
        historiasStore.Formulario.Analisis = JSON.parse(JSON.stringify(analisis))
    }

    return {
        cancelarCita,
        actualizarCita,
        showMotivoCancelacion,
        showMotivoEdicion,
        showObservacion,
        activarCita,
        parseFechaISO,
        actualizarHistoria
    }
}
