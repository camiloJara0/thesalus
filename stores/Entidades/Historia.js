import { useApiRest } from "~/stores/apiRest";

export const useHistoriaStore = defineStore('Historia', {
    state: () => ({
        Formulario: {
            HistoriaClinica: {
                type_doc_paciente: '',
                No_document_paciente: '',
                id_paciente: '',
                id_profesional: '',
                fecha: new Date().toISOString().split('T')[0],
                motivo_consulta: '',
                antecedentes: '',
                antecedentes_quirurgicos: '',
                alergias: '',
                medicamentos_actuales: '',
                ta: '', // Presión arterial
                fc: '', // Frecuencia cardíaca
                fr: '', // Frecuencia respiratoria
                t: '',  // Temperatura
                sat: '', // Saturación de oxígeno
                examen_fisico: '',
                impresion_diagnostica: '',
                plan_manejo: '',
                observaciones: '',
                estado: 1,
            },
            Diagnosticos: [],
            Medicamentos: [],
        },
        Historias: [] // Lista de historias clínicas
    }),

    getters: {

    },

    actions: {

        async guardar(datos) {
            this.validar(datos.HistoriaClinica)
            const api = useApiRest();
            const config = useRuntimeConfig()
            const token = decryptData(localStorage.getItem('token'))

            let options = {
                metodo: 'POST',
                url: config.public.historia,
                token: token,
                body: datos
            }

            return await api.functionCall(options)
        },

        async actualizar(datos) {
            this.validar(datos.HistoriaClinica)
            const api = useApiRest();
            const config = useRuntimeConfig()
            const token = decryptData(localStorage.getItem('token'))

            let options = {
                metodo: 'PUT',
                url: `${config.public.historia}/${datos.HistoriaClinica.id}`,
                token: token,
                body: datos
            }

            return await api.functionCall(options)
        },

        async traer(id_paciente) {
            const api = useApiRest();
            const config = useRuntimeConfig()
            const token = decryptData(localStorage.getItem('token'))

            const online = navigator.onLine;
            if (online) {
                try {
                    let options = {
                        metodo: 'GET',
                        url: `${config.public.historia}?id_paciente=${id_paciente}`,
                        token: token
                    }
                    const respuesta = await api.functionCall(options)
                    if (respuesta.success) {
                        this.Historias = respuesta.data || [];
                        return this.Historias;
                    }
                } catch (error) {
                    console.error('Fallo al traer historias', error);
                }
            }
            return [];
        },

        async validar (datos) {
            const notificaciones = useNotificacionesStore();

            const camposObligatorios = [
                'No_document_paciente', 'id_paciente', 'id_profesional', 'fecha'
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

            // 📋 Validar formato de vital signs si se proporcionan
            if (datos.ta && !/^\d{2,3}\/\d{2,3}$/.test(datos.ta)) {
                notificaciones.options.icono = 'error';
                notificaciones.options.titulo = 'Presión arterial inválida';
                notificaciones.options.texto = 'La TA debe tener el formato "120/80"';
                notificaciones.options.tiempo = 5000;
                await notificaciones.simple();
                return false;
            }

            if (datos.fc && (isNaN(parseInt(datos.fc)) || parseInt(datos.fc) < 30 || parseInt(datos.fc) > 100)) {
                notificaciones.options.icono = 'error';
                notificaciones.options.titulo = 'Frecuencia cardíaca inválida';
                notificaciones.options.texto = 'La FC debe estar entre 30 y 100';
                notificaciones.options.tiempo = 5000;
                await notificaciones.simple();
                return false;
            }

            return true;
        }

    }
});
