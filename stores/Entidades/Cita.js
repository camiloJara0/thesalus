import { useApiRest } from "~/stores/apiRest";

export const useCitaStore = defineStore('Cita', {
    state: () => ({
        Formulario: {
            Cita: {
                id_paciente: '',
                id_profesional: '',
                id_servicio: '',
                fecha: new Date().toISOString().split('T')[0],
                hora: '',
                motivo: '',
                tipo: false, // Consulta presencial o no
                tratamiento_id: '',
                observaciones: '',
                estado: 1,
            },
        },
        Citas: [] // Lista de citas
    }),

    getters: {

    },

    actions: {

        async guardar(datos) {
            this.validar(datos.Cita)
            const api = useApiRest();
            const config = useRuntimeConfig()
            const token = decryptData(localStorage.getItem('token'))

            let options = {
                metodo: 'POST',
                url: config.public.cita,
                token: token,
                body: datos
            }

            return await api.functionCall(options)
        },

        async actualizar(datos) {
            this.validar(datos.Cita)
            const api = useApiRest();
            const config = useRuntimeConfig()
            const token = decryptData(localStorage.getItem('token'))

            let options = {
                metodo: 'PUT',
                url: `${config.public.cita}/${datos.Cita.id}`,
                token: token,
                body: datos
            }

            return await api.functionCall(options)
        },

        async cancelar(id) {
            const api = useApiRest();
            const config = useRuntimeConfig()
            const token = decryptData(localStorage.getItem('token'))

            let options = {
                metodo: 'DELETE',
                url: `${config.public.cita}/${id}`,
                token: token
            }

            return await api.functionCall(options)
        },

        async traer(filtros = {}) {
            const api = useApiRest();
            const config = useRuntimeConfig()
            const token = decryptData(localStorage.getItem('token'))

            const online = navigator.onLine;
            if (online) {
                try {
                    let url = config.public.cita;
                    const queryParams = new URLSearchParams(filtros);
                    if (queryParams.toString()) {
                        url += `?${queryParams.toString()}`;
                    }

                    let options = {
                        metodo: 'GET',
                        url: url,
                        token: token
                    }
                    const respuesta = await api.functionCall(options)
                    if (respuesta.success) {
                        this.Citas = respuesta.data || [];
                        return this.Citas;
                    }
                } catch (error) {
                    console.error('Fallo al traer citas', error);
                }
            }
            return [];
        },

        async traerPorPaciente(id_paciente) {
            return await this.traer({ id_paciente });
        },

        async traerPorProfesional(id_profesional) {
            return await this.traer({ id_profesional });
        },

        async traerPorFecha(fecha) {
            return await this.traer({ fecha });
        },

        async validar (datos) {
            const notificaciones = useNotificacionesStore();

            const camposObligatorios = [
                'id_paciente', 'id_profesional', 'id_servicio', 'fecha', 'hora'
            ]

            const camposFaltantes = camposObligatorios.filter(campo => !datos[campo] || datos[campo].toString().trim() === '');

            if (camposFaltantes.length > 0) {
                notificaciones.options.icono = 'error';
                notificaciones.options.titulo = 'Datos incompletos';
                notificaciones.options.texto = `Faltan los siguientes campos: ${camposFaltantes.join(', ')}`;
                notificaciones.options.tiempo = 6000;
                await notificaciones.simple();
                return false;
            }

            // 🕐 Validar formato de hora (HH:mm)
            if (!/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(datos.hora)) {
                notificaciones.options.icono = 'error';
                notificaciones.options.titulo = 'Hora inválida';
                notificaciones.options.texto = 'La hora debe tener el formato HH:mm';
                notificaciones.options.tiempo = 5000;
                await notificaciones.simple();
                return false;
            }

            // 📅 Validar que la fecha no sea en el pasado
            const fechaSeleccionada = new Date(datos.fecha);
            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0);

            if (fechaSeleccionada < hoy) {
                notificaciones.options.icono = 'error';
                notificaciones.options.titulo = 'Fecha inválida';
                notificaciones.options.texto = 'No se pueden agendar citas en fechas pasadas';
                notificaciones.options.tiempo = 5000;
                await notificaciones.simple();
                return false;
            }

            return true;
        }

    }
});
