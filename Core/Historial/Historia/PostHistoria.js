
import { useCalendarioCitas } from '~/stores/Calendario.js';
import { enviarTerapia } from './Terapia.js';
import { enviarEvolucion } from './Evolucion.js';
import { enviarTrabajoSocial } from './TrabajoSocial.js';
import { enviarNota } from './Nota.js';
import { enviarMedicina } from './Medicina.js';
import { useCitasStore } from '~/stores/Formularios/citas/Cita.js';

// funcion para Validar campos del formulario Historia Clinica
export const validarYEnviarRegistrarHistoria = async (datos) => {
    const notificacionesStore = useNotificacionesStore();
    const calendarioStore = useCalendarioCitas();
    const varView = useVarView();
    const { hasPermiso } = usePermisos()
    const citasStore = useCitasStore();
    citasStore.mesCitaGuardada = datos.Analisis.Cita.fecha;

    const errores = [];
    // --- Validaciones por tipo de consulta ---
    switch (varView.tipoConsulta.plantilla) {
        case 'Terapia':
            datos.Analisis.historia.fecha_historia = calendarioStore.fechaActual.split('/').reverse().join('-');
            if (!datos.Analisis.Terapia?.sesion) errores.push("La sesión es obligatoria.");
            if (!datos.Analisis.Terapia?.fecha) errores.push("La fecha es obligatoria.");
            if (!datos.Analisis.Terapia?.hora) errores.push("La hora es obligatoria.");
            if (!datos.Analisis.Terapia?.objetivos) errores.push("El objetivo es obligatorio.");
            if (!datos.Analisis.Terapia?.evolucion) errores.push("La evolución es obligatoria.");

            // Validar Diagnosticos
            datos.Analisis.Diagnosticos = datos.Analisis.Diagnosticos.filter(d => Object.keys(d).length > 0 && Object.values(d).some(v => v !== '' || v != null))
            datos.Analisis.Diagnosticos.forEach((i, idx) => {
                if (!i.descripcion || !i.codigo) {
                    errores.push(`Diagnostico ${idx + 1} incompleto o codigo incompleto.`);
                }
            });

            datos.Analisis.DiagnosticosCIF = datos.Analisis.DiagnosticosCIF.filter(d => Object.keys(d).length > 0 && Object.values(d).some(v => v !== '' || v != null))
            datos.Analisis.DiagnosticosCIF.forEach((i, idx) => {
                if (!i.descripcion || !i.codigo) {
                    errores.push(`Diagnostico CIF ${idx + 1} incompleto o codigo incompleto.`);
                }
            });

            if (errores.length > 0) return mostrarErrores(errores, notificacionesStore);

            return await enviarTerapia(datos);

        case 'Evolucion':
            datos.Analisis.historia.fecha_historia = calendarioStore.fechaActual.split('/').reverse().join('-');
            if (!datos.Analisis?.analisis) errores.push("El análisis es obligatorio.");
            if (!datos.Analisis?.motivo) errores.push("El motivo de consulta es obligatorio.");

            datos.Analisis.Diagnosticos = datos.Analisis.Diagnosticos.filter(d => Object.keys(d).length > 0 && Object.values(d).some(v => v !== '' || v != null));
            // Validar Diagnosticos
            datos.Analisis.Diagnosticos.forEach((i, idx) => {
                if (!i.descripcion || !i.codigo) {
                    errores.push(`Diagnostico ${idx + 1} incompleto o codigo incompleto.`);
                }
            });

            datos.Analisis.Plan_manejo_medicamentos = datos.Analisis.Plan_manejo_medicamentos.filter(d => {
                return d && Object.values(d).some(v => v !== '' && v != null);
            });
            if (!Array.isArray(datos.Analisis.Plan_manejo_medicamentos)) {
                errores.push("El plan de medicamentos debe ser un arreglo.");
            } else {
                datos.Analisis.Plan_manejo_medicamentos.forEach((m, i) => {
                    if (!m.medicamento || !m.dosis || isNaN(parseInt(m.cantidad))) {
                        errores.push(`Medicamento ${i + 1} incompleto o cantidad inválida.`);
                    }
                });
            }

            // Validar Examen Físico
            const examenT = datos.Analisis.ExamenFisico;
            if (!examenT?.peso || isNaN(examenT.peso)) errores.push("El peso debe ser un número.");
            if (!examenT?.altura || isNaN(examenT.altura)) errores.push("La altura debe ser un número.");
            if (!examenT?.signosVitales) {
                errores.push("Los signos vitales son obligatorios.");
            } else {
                const sv = examenT.signosVitales;
                if (!sv.ta || !sv.fc || !sv.fr || !sv.t || !sv.SATo2) {
                    errores.push("Todos los signos vitales deben estar completos.");
                }
            }

            if (errores.length > 0) return mostrarErrores(errores, notificacionesStore);

            return await enviarEvolucion(datos);

        case 'Trabajo Social':
            datos.Analisis.historia.fecha_historia = calendarioStore.fechaActual.split('/').reverse().join('-');
            if (!datos.Analisis?.analisis) errores.push("El análisis es obligatorio.");
            if (!datos.Analisis?.motivo) errores.push("El motivo de consulta es obligatorio.");
            if (!datos.Analisis?.observacion) errores.push("La observacion de la consulta es obligatorio.");
            if (!datos.Analisis?.tipoAnalisis) errores.push("El tipo de analisis es obligatorio.");
            if (!datos.Analisis?.tratamiento) errores.push("El tratamiento es obligatorio.");

            datos.Analisis.Diagnosticos = datos.Analisis.Diagnosticos.filter(d => Object.keys(d).length > 0 && Object.values(d).some(v => v !== '' || v != null))
            // Validar Diagnosticos
            datos.Analisis.Diagnosticos.forEach((i, idx) => {
                if (!i.descripcion || !i.codigo) {
                    errores.push(`Diagnostico ${idx + 1} incompleto o codigo incompleto.`);
                }
            });

            datos.Analisis.Plan_manejo_medicamentos = datos.Analisis.Plan_manejo_medicamentos.filter(d => {
                return d && Object.values(d).some(v => v !== '' && v != null);
            });
            if (!Array.isArray(datos.Analisis.Plan_manejo_medicamentos)) {
                errores.push("El plan de medicamentos debe ser un arreglo.");
            } else {
                datos.Analisis.Plan_manejo_medicamentos.forEach((m, i) => {
                    if (!m.medicamento || !m.dosis || isNaN(parseInt(m.cantidad))) {
                        errores.push(`Medicamento ${i + 1} incompleto o cantidad inválida.`);
                    }
                });
            }

            if (errores.length > 0) return mostrarErrores(errores, notificacionesStore);

            return await enviarTrabajoSocial(datos);

        case 'Nota':
            const nota = datos.Analisis.Nota;
            datos.Analisis.historia.fecha_historia = calendarioStore.fechaActual.split('/').reverse().join('-');
            // Validar que todos los campos estén presentes y no vacíos
            if (
                !nota?.direccion ||
                !nota?.fecha_nota ||
                !nota?.hora_nota ||
                !nota?.subjetivo.length ||
                !nota?.objetivo.length ||
                !nota?.actividades.length ||
                !nota?.plan.length ||
                !nota?.intervencion.length ||
                !nota?.evaluacion.length
            ) {
                const msg = 'Todos los campos son obligatorios. Verifica que no haya ninguno vacío.';
                notificacionesStore.options.icono = 'error';
                notificacionesStore.options.titulo = 'Información inválida.';
                notificacionesStore.options.texto = msg;
                notificacionesStore.options.tiempo = 5000;
                notificacionesStore.simple();
                return;
            }

            datos.Analisis.Nota.objetivo = datos.Analisis.Nota.objetivo.filter(d => Object.keys(d).length > 0 && Object.values(d).some(v => v !== '' || v != null)),
                datos.Analisis.Nota.objetivo.forEach((i, idx) => {
                    if (!i.descripcion || !i.hora) {
                        errores.push(`Descripcion ${idx + 1} de Objetivo incompleto.`);
                    }
                });

            datos.Analisis.Nota.subjetivo = datos.Analisis.Nota.subjetivo.filter(d => Object.keys(d).length > 0 && Object.values(d).some(v => v !== '' || v != null)),
                datos.Analisis.Nota.subjetivo.forEach((i, idx) => {
                    if (!i.descripcion || !i.hora) {
                        errores.push(`Descripcion ${idx + 1} de Subjetivo incompleto.`);
                    }
                });

            datos.Analisis.Nota.actividades = datos.Analisis.Nota.actividades.filter(d => Object.keys(d).length > 0 && Object.values(d).some(v => v !== '' || v != null)),
                datos.Analisis.Nota.actividades.forEach((i, idx) => {
                    if (!i.descripcion || !i.hora) {
                        errores.push(`Descripcion ${idx + 1} de Actividades incompleto.`);
                    }
                });

            datos.Analisis.Nota.plan = datos.Analisis.Nota.plan.filter(d => Object.keys(d).length > 0 && Object.values(d).some(v => v !== '' || v != null)),
                datos.Analisis.Nota.plan.forEach((i, idx) => {
                    if (!i.descripcion || !i.hora) {
                        errores.push(`Descripcion ${idx + 1} de Plan incompleto.`);
                    }
                });

            datos.Analisis.Nota.intervencion = datos.Analisis.Nota.intervencion.filter(d => Object.keys(d).length > 0 && Object.values(d).some(v => v !== '' || v != null)),
                datos.Analisis.Nota.intervencion.forEach((i, idx) => {
                    if (!i.descripcion || !i.hora) {
                        errores.push(`Descripcion ${idx + 1} de Intervencion incompleto.`);
                    }
                });

            datos.Analisis.Nota.evaluacion = datos.Analisis.Nota.evaluacion.filter(d => Object.keys(d).length > 0 && Object.values(d).some(v => v !== '' || v != null)),
                datos.Analisis.Nota.evaluacion.forEach((i, idx) => {
                    if (!i.descripcion || !i.hora) {
                        errores.push(`Descripcion ${idx + 1} de Evaluacion incompleto.`);
                    }
                });

            datos.Analisis.Diagnosticos = datos.Analisis.Diagnosticos.filter(d => Object.keys(d).length > 0 && Object.values(d).some(v => v !== '' || v != null)),
                datos.Analisis.Diagnosticos.forEach((d, i) => {
                    if (!d.descripcion || !d.codigo) {
                        errores.push(`Diagnóstico ${i + 1} incompleto.`);
                    }
                });

            datos.Analisis.Descripcion = [
                ...(datos.Analisis.Nota.objetivo ?? [])
                    .map(d => ({ ...d, tipo: 'objetivo' }))
                    .filter(d => !Object.values(d).every(v => v === '' || v == null)),

                ...(datos.Analisis.Nota.subjetivo ?? [])
                    .map(d => ({ ...d, tipo: 'subjetivo' }))
                    .filter(d => !Object.values(d).every(v => v === '' || v == null)),

                ...(datos.Analisis.Nota.actividades ?? [])
                    .map(d => ({ ...d, tipo: 'actividades' }))
                    .filter(d => !Object.values(d).every(v => v === '' || v == null)),

                ...(datos.Analisis.Nota.plan ?? [])
                    .map(d => ({ ...d, tipo: 'plan' }))
                    .filter(d => !Object.values(d).every(v => v === '' || v == null)),

                ...(datos.Analisis.Nota.intervencion ?? [])
                    .map(d => ({ ...d, tipo: 'intervencion' }))
                    .filter(d => !Object.values(d).every(v => v === '' || v == null)),

                ...(datos.Analisis.Nota.evaluacion ?? [])
                    .map(d => ({ ...d, tipo: 'evaluacion' }))
                    .filter(d => !Object.values(d).every(v => v === '' || v == null)),
            ];

            // Mostrar errores o continuar
            if (errores.length > 0) {
                errores.forEach(msg => {
                    notificacionesStore.options.icono = 'error';
                    notificacionesStore.options.titulo = 'Informacion invalida.';
                    notificacionesStore.options.texto = msg;
                    notificacionesStore.options.tiempo = 5000;
                    notificacionesStore.simple();
                });
                return false;
            }

            return await enviarNota(datos)

        case 'Medicina':
            datos.Analisis.historia.fecha_historia = calendarioStore.fechaActual;

            const puedePostAnalisis = hasPermiso('Analisis_post')

            // Validacion si no se registran medicamentos
            if (datos.Analisis.Plan_manejo_medicamentos?.length < 1 && puedePostAnalisis) {
                notificacionesStore.options.icono = 'warning'
                notificacionesStore.options.title = 'Historia sin plan de medicamentos'
                notificacionesStore.options.html = '¿Deseas registrar <strong>medicamentos</strong>?'
                notificacionesStore.options.confirmtext = 'Si'
                notificacionesStore.options.canceltext = 'No, continuar'
                let res = await notificacionesStore.alertRespuesta();
                if (res === 'confirmado') {
                    varView.showMedicinas = true;
                    return false
                };
            }

            // Validacion si no se registran procedimientos
            if (datos.Analisis.Plan_manejo_procedimientos?.length < 1 && puedePostAnalisis) {
                notificacionesStore.options.icono = 'warning'
                notificacionesStore.options.title = 'Historia sin plan de procedimientos'
                notificacionesStore.options.html = '¿Deseas registrar <strong>Procedimiento</strong>?'
                notificacionesStore.options.confirmtext = 'Si'
                notificacionesStore.options.canceltext = 'No, continuar'
                let resp = await notificacionesStore.alertRespuesta();
                if (resp === 'confirmado') {
                    varView.showProcedimientos = true;
                    return false
                }
            }


            // Validar Analisis
            const analisis = datos.Analisis;
            if (!analisis?.motivo && puedePostAnalisis) errores.push("El motivo de consulta es obligatorio.");
            if (!analisis?.observacion && puedePostAnalisis) errores.push("La observación es obligatoria.");
            if (!analisis?.tratamiento && puedePostAnalisis) errores.push("El tratamiento es obligatorio.");
            if (!analisis?.analisis && puedePostAnalisis) errores.push("El análisis es obligatorio.");
            if (!analisis?.tipoAnalisis && puedePostAnalisis) errores.push("El tipo de análisis es obligatorio.");


            datos.Analisis.Diagnosticos = datos.Analisis.Diagnosticos.filter(d => Object.keys(d).length > 0 && Object.values(d).some(v => v !== '' || v != null))
            // Validar Diagnosticos
            if (datos.Analisis.Diagnosticos.length === 0 && puedePostAnalisis) {
                errores.push("Debe haber por lo menos un diagnostico.");
            } else {
                datos.Analisis.Diagnosticos.forEach((d, i) => {
                    if (!d.descripcion || !d.codigo) {
                        errores.push(`Diagnóstico ${i + 1} incompleto.`);
                    }
                });
            }

            datos.Analisis.Antecedentes = datos.Analisis.Antecedentes.filter(d => Object.keys(d).length > 0 && Object.values(d).some(v => v !== '' || v != null))
            // Validar Antecedentes
            if (!Array.isArray(datos.Analisis.Antecedentes)) {
                errores.push("Los antecedentes deben ser un arreglo.");
            } else {
                datos.Analisis.Antecedentes.forEach((a, i) => {
                    if (!a.tipo || !a.descripcion) {
                        errores.push(`Antecedente ${i + 1} incompleto.`);
                    }
                });
            }

            // Validar Enfermedad
            const enfermedad = datos.Analisis.Enfermedad;
            if (!enfermedad?.valor) errores.push("La descripción de la enfermedad actual es obligatoria.");

            // Validar Examen Físico
            const examen = datos.Analisis.ExamenFisico;
            if (!examen?.peso || isNaN(examen.peso)) errores.push("El peso debe ser un número.");
            if (!examen?.altura || isNaN(examen.altura)) errores.push("La altura debe ser un número.");
            if (!examen?.signosVitales) {
                errores.push("Los signos vitales son obligatorios.");
            } else {
                const sv = examen.signosVitales;
                if (!sv.ta || !sv.fc || !sv.fr || !sv.t || !sv.SATo2) {
                    errores.push("Todos los signos vitales deben estar completos.");
                }
            }

            // Validar Plan de Medicamentos
            datos.Analisis.Plan_manejo_medicamentos = datos.Analisis.Plan_manejo_medicamentos.filter(d => {
                return d && Object.values(d).some(v => v !== '' && v != null);
            });
            if (!Array.isArray(datos.Analisis.Plan_manejo_medicamentos)) {
                errores.push("El plan de medicamentos debe ser un arreglo.");
            } else {
                datos.Analisis.Plan_manejo_medicamentos.forEach((m, i) => {
                    if (!m.medicamento || !m.dosis || isNaN(parseInt(m.cantidad))) {
                        errores.push(`Medicamento ${i + 1} incompleto o cantidad inválida.`);
                    }
                });
            }

            // Validar Procedimientos
            datos.Analisis.Plan_manejo_procedimientos = datos.Analisis.Plan_manejo_procedimientos.filter(d => {
                return d && Object.values(d).some(v => v !== '' && v != null);
            });
            datos.Analisis.Plan_manejo_procedimientos.forEach((p, i) => {
                if (!p.procedimiento || !p.codigo) {
                    errores.push(`Procedimiento ${i + 1} incompleto.`);
                }
            });

            // Mostrar errores o continuar
            if (errores.length > 0) {
                errores.forEach(msg => {
                    notificacionesStore.options.icono = 'error';
                    notificacionesStore.options.titulo = 'Informacion invalida.';
                    notificacionesStore.options.texto = msg;
                    notificacionesStore.options.tiempo = 5000;
                    notificacionesStore.simple();
                });
                return false;
            }

            return await enviarMedicina(datos);

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