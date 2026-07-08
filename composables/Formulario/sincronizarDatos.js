// import { enviarFormulario } from "~/Core/Empresa/Datos/Eps/POSTEps";
// import { enviarFormularioPutEPS } from "~/Core/Empresa/Datos/Eps/PUTEps";
// import { enviarFormularioProfesion } from "~/Core/Empresa/Datos/Profesion/POSTProfesion";
// import { enviarFormularioPutProfesion } from "~/Core/Empresa/Datos/Profesion/PUTProfesion";
// import { enviarFormularioHistoria } from "~/Core/Historial/Historia/PostHistoria";
// import { enviarFormularioNota } from "~/Core/Historial/Notas/POSTNota";
// import { enviarFormularioPutNota } from "~/Core/Historial/Notas/PUTNota";
// import { enviarFormularioEliminarCita } from "~/Core/Usuarios/Cita/CancelarCita";
// import { enviarFormularioCita } from "~/Core/Usuarios/Cita/POSTCita";
// import { enviarFormularioPaciente } from "~/Core/Paciente/POSTPaciente";
// import { enviarFormularioPutPaciente } from "~/Core/Paciente/PUTPaciente";
// import { enviarFormularioProfesional } from "~/Core/Profesional/POSTMedico";
// import { enviarFormularioPutMedico } from "~/Core/Profesional/PUTMedico";

// async function sincronizarEntidad({
//   nombreEntidad,
//   claveRelacion = null,
//   nombreRelacion = null,
//   construirObjeto,
//   enviarFuncion,
//   actualizarFuncion
// }) {
//   const store = useIndexedDBStore();

//   // 1. Leer registros pendientes de sincronización
//   store.almacen = nombreEntidad;

//   const registrosPendientes = (await store.leerdatos()).filter(r => r.sincronizado === 0);

//   if (registrosPendientes.length === 0 || !navigator.onLine) return;

//   for (const registro of registrosPendientes) {

//     // 2. Obtener datos relacionales si aplica
//     let relacion = null;
//     if (claveRelacion && nombreRelacion) {
//       store.almacen = nombreRelacion;
//       relacion = (await store.leerdatos()).find(r => r.id_temporal === registro[claveRelacion]);
//     }

//     // 3. Construir objeto completo
//     const esActualizacion = !!registro.id;
//     let objetoCompleto;
//     try {
//       objetoCompleto = await construirObjeto(registro, esActualizacion, relacion);
//       console.log(objetoCompleto)
//     } catch (e) {
//       console.error('Error construyendo objeto para sincronizar:', e);
//       continue; // pasa al siguiente registro
//     }

//     const maxIntentos = 3;
//     let intentos = 0;
//     let exito = false;

//     // 4. Enviar a la API
//     while (intentos < maxIntentos && !exito) {
//       try {
//         intentos++;
//         console.log(`Intento ${intentos} de sincronizar ${nombreEntidad} → id_temp: ${registro.id_temporal}`);

//         if (registro.id && esActualizacion) {
//           console.log('actualizando....')
//           await actualizarFuncion(objetoCompleto, true);
//           console.log(`✅ Actualización exitosa (${nombreEntidad}): id ${registro.id}`);
//         } else {
//           await enviarFuncion(objetoCompleto, true);
//           console.log(`✅ Envío exitoso (${nombreEntidad}): id_temporal ${registro.id_temporal}`);
//         }

//         exito = true; // si no lanza error, sale del bucle
//       } catch (error) {
//         console.warn(`⚠️ Fallo intento ${intentos} para ${nombreEntidad}:`, error);

//         // Si no fue el último intento, esperar un poco (backoff exponencial)
//         if (intentos < maxIntentos) {
//           const delay = 1000 * intentos; // 1s, luego 2s, luego 3s...
//           console.log(`⏳ Reintentando en ${delay / 5000}s...`);
//           await new Promise(res => setTimeout(res, delay));
//         } else {
//           console.error(`❌ Error definitivo al sincronizar ${nombreEntidad} ${registro.id_temporal}`);
//           // window.location.reload()
//           return
//         }
//       }
//     }

//   }
// }

// export function iniciarSincronizacionPeriodica(intervalo = 10000) {
//   const tareasSincronizacion = [
//     {
//       nombreEntidad: 'EPS',
//       construirObjeto: (registro, esActualizacion) => ({
//         EPS: {
//           id_temporal: registro.id_temporal,
//           ...(esActualizacion ? {id: registro.id} : {}),
//           nombre: registro.nombre,
//           codigo: registro.codigo,
//           nit: registro.nit,
//         }
//       }),
//       enviarFuncion: enviarFormulario,
//       actualizarFuncion: enviarFormularioPutEPS
//     },
//     {
//       nombreEntidad: 'Profesion',
//       construirObjeto: (registro, esActualizacion) => ({
//         Profesion: {
//           ...(esActualizacion ? { id: registro.id } : {}),
//           id_temporal: registro.id_temporal,
//           nombre: registro.nombre,
//           codigo: registro.codigo,
//           permisos: registro.permisos
//         }
//       }),
//       enviarFuncion: enviarFormularioProfesion,
//       actualizarFuncion: enviarFormularioPutProfesion
//     },
//     {
//       nombreEntidad: 'Cita',
//       construirObjeto: (registro, esActualizacion) => ({
//         Cita: {
//           ...registro,
//           ...(esActualizacion ? { id: registro.id } : {}),
//           id_temporal: registro.id_temporal
//         }
//       }),
//       enviarFuncion: enviarFormularioCita,
//       actualizarFuncion: enviarFormularioEliminarCita
//     },
//     {
//       nombreEntidad: 'Nota',
//       construirObjeto: (registro, esActualizacion) => ({
//         Nota: {
//           ...registro,
//           ...(esActualizacion ? { id: registro.id } : {}),
//           id_temporal: registro.id_temporal
//         }
//       }),
//       enviarFuncion: enviarFormularioNota,
//       actualizarFuncion: enviarFormularioPutNota
//     },
//     {
//       nombreEntidad: 'Paciente',
//       claveRelacion: 'id_infoUsuario',
//       nombreRelacion: 'InformacionUser',
//       construirObjeto: (registro, esActualizacion, InformacionUser,) => ({
//         Paciente: {
//           ...registro,
//           ...(esActualizacion ? { id: registro.id } : {}),
//           id_temporal: registro.id_temporal
//         },
//         InformacionUser: {
//           ...InformacionUser,
//           ...(esActualizacion ? { id: InformacionUser.id } : {}),
//           id_temporal: InformacionUser.id_temporal
//         }
//       }),
//       enviarFuncion: enviarFormularioPaciente,
//       actualizarFuncion: enviarFormularioPutPaciente
//     },
//     {
//       nombreEntidad: 'Profesional',
//       claveRelacion: 'id_infoUsuario',
//       nombreRelacion: 'InformacionUser',
//       construirObjeto: (registro, esActualizacion, InformacionUser) => ({
//         Profesional: {
//           ...registro,
//           ...(esActualizacion ? { id: registro.id } : {}),
//           id_temporal: registro.id_temporal
//         },
//         InformacionUser: {
//           ...InformacionUser,
//           ...(esActualizacion ? { id: InformacionUser.id } : {}),
//           id_temporal: InformacionUser.id_temporal
//         },
//         User: {
//           correo: InformacionUser.correo
//         }
//       }),
//       enviarFuncion: enviarFormularioProfesional,
//       actualizarFuncion: enviarFormularioPutMedico
//     },
//     {
//       nombreEntidad: 'HistoriaClinica',
//       construirObjeto: async (registro, esActualizacion) => {
//         const store = useIndexedDBStore();

//         // === Cargar relaciones locales ===
//         store.almacen = 'Analisis';
//         const analisisList = (await store.leerdatos()) || [];

//         // tomar primer analisis (si existe)
//         const analisis = analisisList
//         .find(a =>  a.sincronizado == 0 && !a.id);
//         const analisisIdTemp = analisis?.id_temporal ?? null;
//         console.log(analisisIdTemp)
//         store.almacen = 'Diagnosticos';
//         const todosDiagnosticos = (await store.leerdatos()) || [];
//         const diagnosticos = analisisIdTemp
//           ? todosDiagnosticos.filter(d => d.id_analisis === analisisIdTemp)
//           : [];

//         store.almacen = 'Antecedentes';
//         const antecedentesAll = (await store.leerdatos()) || [];
//         const antecedentes = antecedentesAll.filter(a => a.id_paciente === registro.id_paciente);

//         store.almacen = 'Enfermedad';
//         const todasEnfermedades = (await store.leerdatos()) || [];
//         const enfermedades = analisisIdTemp
//           ? todasEnfermedades.filter(e => e.id_analisis === analisisIdTemp)
//           : [];

//         store.almacen = 'ExamenFisico';
//         const todosExamenes = (await store.leerdatos()) || [];
//         const examenes = analisisIdTemp
//           ? todosExamenes.filter(e => e.id_analisis === analisisIdTemp)
//           : [];

//         store.almacen = 'Cita';
//         const todasCitas = (await store.leerdatos()) || [];
//         // tomar la cita asociada al análisis (si existe)
//         const cita = analisisIdTemp ? (todasCitas.find(c => c.id_analisis === analisisIdTemp) || {}) : {};

//         // planes
//         const planes = {};
//         for (const tipo of [
//           'Plan_manejo_medicamentos',
//           'Plan_manejo_procedimientos',
//           'Plan_manejo_insumos',
//           'Plan_manejo_equipos'
//         ]) {
//           store.almacen = tipo;
//           const todos = (await store.leerdatos()) || [];
//           planes[tipo] = analisisIdTemp ? todos.filter(p => p.id_analisis === analisisIdTemp) : [];
//         }

//         // seleccionar registros concretos (si no existen, usar valores por defecto)
//         const examenFisico = examenes.length ? examenes[0] : {};
//         const enfermedad = enfermedades.length ? enfermedades[0] : {};

//         // === Construir objeto con seguridad ===
//         const body = {
//           HistoriaClinica: {
//             ...(esActualizacion ? { id: registro.id } : {}),
//             ...(registro.id_temporal ? { id_temporal: registro.id_temporal } : {}),
//             fecha_historia: registro.fecha_historia ?? null,
//             id_paciente: registro.id_paciente
//           },
//           Analisis: {
//             ...(analisis?.id_temporal ? { id_temporal: analisis.id_temporal } : {}),
//             motivo: analisis?.motivo ?? null,
//             observacion: analisis?.observacion ?? null,
//             tratamiento: analisis?.tratamiento ?? null,
//             analisis: analisis?.analisis ?? null,
//             tipoAnalisis: analisis?.tipoAnalisis ?? null,
//             id_medico: analisis?.id_medico ?? registro.id_medico ?? null
//           },
//           Diagnosticos: (diagnosticos || []).map(d => ({
//             ...(d.id_temporal ? { id_temporal: d.id_temporal } : {}),
//             descripcion: d.descripcion ?? null,
//             codigo: d.codigo ?? null
//           })),
//           Antecedentes: (antecedentes || []).map(a => ({
//             ...(a.id_temporal ? { id_temporal: a.id_temporal } : {}),
//             tipo: a.tipo ?? null,
//             descripcion: a.descripcion ?? null,
//             id_paciente: registro.id_paciente
//           })),
//           Enfermedad: {
//             ...(enfermedad?.id_temporal ? { id_temporal: enfermedad.id_temporal } : {}),
//             valor: enfermedad?.valor ?? null,
//             fecha_diagnostico: enfermedad?.fecha_diagnostico ?? null,
//             fecha_rehabilitacion: enfermedad?.fecha_rehabilitacion ?? null,
//             id_paciente: registro.id_paciente
//           },
//           ExamenFisico: {
//             ...(examenFisico?.id_temporal ? { id_temporal: examenFisico.id_temporal } : {}),
//             Peso: examenFisico?.Peso ?? null,
//             altura: examenFisico?.altura ?? null,
//             otros: examenFisico?.otros ?? null,
//             signosVitales: examenFisico?.signosVitales
//               ? {
//                 ta: examenFisico.signosVitales.ta ?? null,
//                 fc: examenFisico.signosVitales.fc ?? null,
//                 fr: examenFisico.signosVitales.fr ?? null,
//                 t: examenFisico.signosVitales.t ?? null,
//                 SATo2: examenFisico.signosVitales.SATo2 ?? null
//               }
//               : {}
//           },
//           Plan_manejo_medicamentos: (planes.Plan_manejo_medicamentos || []).map(m => ({
//             ...(m.id_temporal ? { id_temporal: m.id_temporal } : {}),
//             medicamento: m.medicamento ?? null,
//             dosis: m.dosis ?? null,
//             cantidad: m.cantidad != null ? parseInt(m.cantidad) : null
//           })),
//           Plan_manejo_procedimientos: (planes.Plan_manejo_procedimientos || []).map(p => ({
//             ...(p.id_temporal ? { id_temporal: p.id_temporal } : {}),
//             procedimiento: p.procedimiento ?? null,
//             codigo: p.codigo ?? null,
//             fecha: p.fecha ?? null
//           })),
//           Plan_manejo_insumos: (planes.Plan_manejo_insumos || []).map(i => ({
//             ...(i.id_temporal ? { id_temporal: i.id_temporal } : {}),
//             nombre: i.nombre ?? null,
//             cantidad: i.cantidad != null ? parseInt(i.cantidad) : null
//           })),
//           Plan_manejo_equipos: (planes.Plan_manejo_equipos || []).map(e => ({
//             ...(e.id_temporal ? { id_temporal: e.id_temporal } : {}),
//             descripcion: e.descripcion ?? null,
//             uso: e.uso ?? null
//           })),
//           Cita: {
//             ...(cita?.id ? { id: cita.id } : {}),
//             ...(cita?.id_temporal ? { id_temporal: cita.id_temporal } : {}),
//             // otros campos de la cita si los necesitas:
//             fecha: cita?.fecha ?? null,
//             id_medico: cita?.id_medico ?? null
//           }
//         };

//         return body;
//       },
//       enviarFuncion: enviarFormularioHistoria,
//       // actualizarFuncion: actualizarHistoriaClinicaAPI
//     }
//   ];

//   setInterval(() => {
//     tareasSincronizacion.forEach(async (tarea) => {
//       try {
//         await sincronizarEntidad(tarea);
//       } catch (error) {
//         console.error(`Error en sincronización de ${tarea.nombreEntidad}:`, error);
//       }
//     });
//   }, intervalo);
// }
