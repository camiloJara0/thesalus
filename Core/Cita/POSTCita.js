import { guardarEnDB, actualizarEnIndexedDB } from '~/composables/Formulario/useIndexedDBManager.js';
import { useNotificacionesStore } from '~/stores/notificaciones.js'
import { decryptData } from '~/composables/Formulario/crypto';
import { useDatosServicioStore } from '~/stores/Formularios/empresa/Servicio';
import { useCitasStore } from '~/stores/Formularios/citas/Cita';

// funcion para Validar campos del formulario Nueva Cita
export const validarYEnviarNuevaCita = async (datos) => {
    const notificacionesStore = useNotificacionesStore();
    const varView = useVarView()
    const cita = datos.Cita;

    let camposObligatorios = [
            'id_paciente',
            'id_medico',
            'id_servicio',
            'motivo',
            'fecha',
    ]
    const servicioStore = useDatosServicioStore()
    const serviciosPlantilla = await servicioStore.listServicios()
    const tipoConsulta = serviciosPlantilla.find((s) => {
        return s.name === cita.servicio
    })?.plantilla

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

    if(fechaFinal < fechaInicial){
        notificacionesStore.options.icono = 'error';
        notificacionesStore.options.titulo = 'Informacion invalida.';
        notificacionesStore.options.texto = `Valida el Rango de fecha de cumplimiento de Cita.`;
        notificacionesStore.options.tiempo = 5000;
        notificacionesStore.simple();
        return false;
    }

    // Validar hora
    const validarHora = (horaStr) => {
        if (!horaStr) return false;

        const [hora, minutos] = horaStr.split(":").map(Number);
        const horaIngresada = hora + minutos / 60;

        const horaMinima = 5;   // 5:00 AM
        const horaMaxima = 22;  // 10:00 PM

        return horaIngresada >= horaMinima && horaIngresada <= horaMaxima;
    };

    if (!validarHora(cita.hora) && cita.hora) {
        notificacionesStore.options.icono = 'error';
        notificacionesStore.options.titulo = 'Informacion invalida.';
        notificacionesStore.options.texto = 'La hora debe estar entre las 5:00 AM y las 10:00 PM.';
        notificacionesStore.options.tiempo = 5000;
        notificacionesStore.simple();
        return false;
    }

    if (cita.cantidadCitas > 1) {
        const cantidad = parseInt(cita.cantidadCitas) || 0;

        if (tipoConsulta === 'Terapia' && cita.id_procedimiento) {
            const dias_restantes = varView.tratamientos.find(tratamiento => {
                return parseInt(tratamiento.id) === parseInt(cita.id_procedimiento)
            })?.dias_restantes

            if (cantidad > dias_restantes) {
                notificacionesStore.options.icono = 'warning';
                notificacionesStore.options.titulo = 'Informacion invalida.';
                notificacionesStore.options.texto = 'Cantidad de Citas mayor a las restantes';
                notificacionesStore.options.tiempo = 5000;
                notificacionesStore.simple();
                return false;
            }
        }

        if(datos.Cita.motivo === 'Atención domiciliaria') {
            datos.Cita.intervaloCitas = 1

            // Diferencia en milisegundos
            const diffMs = fechaFinal - fechaInicial;
            // Convertir a días
            const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1; 
            // +1 para incluir el día inicial
            // Validar si caben todas las citas
            if (datos.Cita.cantidadCitas > diffDias) {
                notificacionesStore.options.icono = 'warning';
                notificacionesStore.options.titulo = 'Información inválida.';
                notificacionesStore.options.texto = 'Cantidad de citas mayor al rango de fechas';
                notificacionesStore.options.tiempo = 5000;
                notificacionesStore.simple();
                return false;
            }
        }

        varView.cargando = true
        await enviarVariasCitas(datos);
        varView.cargando = false
        return true;
    }

    return await enviarFormularioCita({ ...datos });
};
// Utilidad para convertir string "YYYY-MM-DD" a Date
function parseFechaISO(iso) {
    const [y, m, d] = iso.split('-').map(Number);
    return new Date(y, m - 1, d);
}

// Funcion para validar conexion a internet y enviar fomulario a API o a IndexedDB
export const enviarFormularioCita = async (datos, reintento = false) => {
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
                metodo: 'POST',
                url: config.public.citas,
                token: token,
                body: {
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
                    dias_asignados: datos.Cita.cantidadCitas
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
            await guardarEnDB(JSON.parse(JSON.stringify({ Cita: { ...datos.Cita, sincronizado: 0 } })));
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

const enviarVariasCitas = async (datos) => {
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
                metodo: 'POST',
                url: config.public.variasCitas,
                token: token,
                body: datos
            }
            const respuesta = await api.functionCall(options)

            if (respuesta.success) {
                citasStore.mesCitaGuardada = datos.Cita.fecha
                if (datos.Cita.fechaHasta) {
                    // Si ya viene definida, úsala
                    citasStore.fechaHastaCitaGuardada = datos.Cita.fechaHasta;
                } else {
                    // Calcular fecha final en base a cantidad de citas e intervalo
                    const cantidad = parseInt(datos.Cita.cantidadCitas) || 1;
                    const intervalo = parseInt(datos.Cita.intervaloCitas) || 1;

                    const fechaInicial = new Date(datos.Cita.fecha);
                    const fechaFinal = new Date(fechaInicial);

                    // Sumar (cantidad - 1) * intervalo días
                    fechaFinal.setDate(fechaFinal.getDate() + ((cantidad - 1) * intervalo));

                    // Guardar en formato YYYY-MM-DD
                    citasStore.fechaHastaCitaGuardada = fechaFinal.toISOString().split("T")[0];
                }
                return true
            }
        } catch (error) {
            console.error('Fallo al enviar. Guardando localmente', error);
        }
    } else {
        try {
            // await guardarEnDB(JSON.parse(JSON.stringify({ Cita: { ...datos.Cita, sincronizado: 0 } })));
            notificacionesStore.options.icono = 'warning'
            notificacionesStore.options.titulo = 'No hay internet';
            notificacionesStore.options.texto = 'Intente cuando su dispositivo tenga conexion a internet!'
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
}