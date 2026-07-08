import { guardarEnDB, actualizarEnIndexedDB } from '~/composables/Formulario/useIndexedDBManager.js';
import { decryptData } from '~/composables/Formulario/crypto';

// funcion para Validar campos del formulario Nueva Nota
export const validarYEnviarActualizarNota = async (datos) => {
    const notificacionesStore = useNotificacionesStore()

    const nota = datos?.Nota;
    const errores = [];
            // Validar que todos los campos estén presentes y no vacíos
            if (
                !nota?.direccion ||
                !nota?.fecha_nota ||
                !nota?.hora_nota ||
                !nota?.subjetivo ||
                !nota?.objetivo ||
                !nota?.actividades ||
                !nota?.plan ||
                !nota?.intervencion ||
                !nota?.evaluacion ||
                !nota?.tipoAnalisis
            ) {
                const msg = 'Todos los campos son obligatorios. Verifica que no haya ninguno vacío.';
                notificacionesStore.options.icono = 'error';
                notificacionesStore.options.titulo = 'Información inválida.';
                notificacionesStore.options.texto = msg;
                notificacionesStore.options.tiempo = 5000;
                notificacionesStore.simple();
                return;
            }

            datos.Nota.objetivo.forEach((i, idx) => {
                if (!i.descripcion || !i.hora) {
                    errores.push(`Descripcion ${idx + 1} de ${i.tipo} incompleto.`);
                }
            });

            datos.Nota.subjetivo.forEach((i, idx) => {
                if (!i.descripcion || !i.hora) {
                    errores.push(`Descripcion ${idx + 1} de ${i.tipo} incompleto.`);
                }
            });

            datos.Nota.actividades.forEach((i, idx) => {
                if (!i.descripcion || !i.hora) {
                    errores.push(`Descripcion ${idx + 1} de ${i.tipo} incompleto.`);
                }
            });

            datos.Nota.plan.forEach((i, idx) => {
                if (!i.descripcion || !i.hora) {
                    errores.push(`Descripcion ${idx + 1} de ${i.tipo} incompleto.`);
                }
            });

            datos.Nota.intervencion.forEach((i, idx) => {
                if (!i.descripcion || !i.hora) {
                    errores.push(`Descripcion ${idx + 1} de ${i.tipo} incompleto.`);
                }
            });

            datos.Nota.evaluacion.forEach((i, idx) => {
                if (!i.descripcion || !i.hora) {
                    errores.push(`Descripcion ${idx + 1} de ${i.tipo} incompleto.`);
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

    return await enviarFormularioPutNota(datos);
};

// Funcion para validar conexion a internet y enviar fomulario a API o a IndexedDB
export const enviarFormularioPutNota = async (datos, reintento = false) => {
    const notificacionesStore = useNotificacionesStore();
    const api = useApiRest();
    const config = useRuntimeConfig()
    const token = decryptData(localStorage.getItem('token'))

    datos.Nota.Descripcion = [
        ...datos.Nota.objetivo,
        ...datos.Nota.subjetivo,
        ...datos.Nota.actividades,
        ...datos.Nota.plan,
        ...datos.Nota.intervencion,
        ...datos.Nota.evaluacion,
    ]

    const online = navigator.onLine;
    if (online) {
        try {
            // mandar a api
            let options = {
                metodo: 'PUT',
                url: config.public.notas + '/' + datos.Nota.id,
                token: token,
                body: {
                    Nota: {
                        id: datos.Nota.id,
                        direccion: datos.Nota.direccion,
                        fecha_nota: datos.Nota.fecha_nota,
                        hora_nota: datos.Nota.hora_nota,
                        tipoAnalisis: datos.Nota.tipoAnalisis,
                    },
                    Descripcion: (datos.Nota.Descripcion ?? []).map(d => ({
                        id: d.id,
                        id_nota: d.id_nota,
                        descripcion: d.descripcion,
                        hora: d.hora,
                        tipo: d.tipo,
                    })),
                }
            }
            const respuesta = await api.functionCall(options)

            if (respuesta.success) {
                // const datosActualizadosLocal = {
                //     Nota: {
                //         sincronizado: 1,
                //         id: respuesta.data.id,
                //         direccion: respuesta.data.direccion,
                //         fecha_nota: respuesta.data.fecha_nota,
                //         hora_nota: respuesta.data.hora_nota,
                //         nota: respuesta.data.nota,
                //         tipoAnalisis: respuesta.data.tipoAnalisis,
                //     }
                // }
                // await actualizarEnIndexedDB(JSON.parse(JSON.stringify(datosActualizadosLocal)));
                console.log('datos actualizados')
                return true
            }

        } catch (error) {
            console.error('Fallo al enviar. Guardando localmente', error);
        }
    } else {
        try {
            if (!reintento) {
                await actualizarEnIndexedDB(JSON.parse(JSON.stringify({ Nota: { ...datos.Nota, sincronizado: 0 } })));
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