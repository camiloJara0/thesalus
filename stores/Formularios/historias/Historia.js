import { usePacientesStore } from '~/stores/Entidades/Paciente';
import { useIndexedDBStore } from '~/stores/indexedDB';
import { decryptData } from '~/composables/Formulario/crypto';
import { validarYEnviarRegistrarHistoria } from '~/Core/Historial/Historia/PostHistoria';
import { traerAnalisisInicial, traerAnalisisPaciente, traerAnalisisPaginado, traerAnalisisFiltrados, traerHistorias } from '~/Core/Historial/Historia/GetHistoria';
import { eliminarAnalisis } from '~/Core/Historial/Historia/DeleteAnalisis';

// Pinia HistoriasClinicas
export const useHistoriasStore = defineStore('HistoriaClinica', {
    state: () => ({
        Formulario: {
            Analisis: {
                motivo: '',
                acompañante: [],
                observacion: '',
                tratamiento: '',
                analisis: '',
                tipoAnalisis: '',
                id_historia: '',
                servicio: '',
                Diagnosticos: [],
                DiagnosticosCIF: [],
                Antecedentes: [],
                Enfermedad: {},
                historia: {
                    id: '',
                    fecha_historia: '',
                    id_paciente: '',
                    name_paciente: '',
                    type_doc_paciente: '',
                    No_document_paciente: '',
                    id_servicio: '',
                    id_medico: ''
                },
                ExamenFisico: {
                    id: '',
                    peso: '',
                    altura: '',
                    otros: '',
                    id_historia: '',
                    signosVitales: {
                        ta: '',
                        fc: '',
                        fr: '',
                        t: '',
                        SATo2: '',
                    },
                },
                Plan_manejo_medicamentos: [],
                Plan_manejo_procedimientos: [],
                Terapia: {
                    id_procedimiento: '',
                    sesion: '',
                    fecha: '',
                    hora: '',
                    objetivos: '',
                    evolucion: '',
                },
                Nota: {
                    subjetivo: [],
                    objetivo: [],
                    actividades: [],
                    plan: [],
                    intervencion: [],
                    evaluacion: [],
                },
                Historial_cambios_sonda: {
                    fecha_cambio: '',
                    observacion: '',
                    id: ''
                },
                Cita: {},
            },
        },
        Historias: [],
        Analisis: [],
        NoEnviados: [],
        Medicina: [],
        Notas: [],
        Evoluciones: [],
        Terapias: [],
        TrabajoSocial: [],
        showActualizarRegistro: false,
    }),

    getters: {
        async listHistorias(state) {
            const store = useIndexedDBStore()
            store.almacen = 'HistoriaClinica'
            const historias = await store.leerdatos()

            state.Historias = historias
            return historias
        },
        // Tabla Historias
        async datosHistoria() {
            return await traerHistorias()
        },

        numeroPendientes(state) {
            return state.NoEnviados.length;
        }
    },

    actions: {
        async cargarHistorias() {
            const store = useIndexedDBStore();
            store.almacen = 'HistoriaClinica';
            this.Historias = await store.leerdatos();
        },

        // Dashboard
        async ultimasHistorias() {
            const pacientesStore = usePacientesStore()
            let historias = await this.listHistorias
            // Validar que todos los objetos tengan el campo fecha_historia
            const faltanFechas = historias?.some(h => !h.fecha_historia || typeof h.fecha_historia !== 'string');

            if (faltanFechas) {
                // Volver a llamar si hay datos incompletos
                historias = await this.listHistorias;
            }
            const pacientes = await pacientesStore.traer(false)

            historias = historias.map((historia) => {
                const paciente = pacientes.find(p => p.id_paciente == historia.id_paciente)
                return {
                    ...historia,
                    ...paciente
                }
            })

            return historias?.sort(
                (a, b) => {
                    const fechaA = new Date(a.fecha_historia?.split('/').reverse().join('-'));
                    const fechaB = new Date(b.fecha_historia?.split('/').reverse().join('-'));
                    return fechaB - fechaA; // Orden descendente
                }).slice(0, 3);
        },

        async listDatos(id, Tabla, Campo = 'id_historia') {
            // Traer datos de indexedDB
            const store = useIndexedDBStore()
            store.almacen = Tabla
            const datosTabla = await store.leerdatos()

            // Array que devuelve los datos filtrados por historia
            const datos = datosTabla.filter((dato) => {
                return parseInt(dato[Campo]) === parseInt(id)
            })

            return datos
        },

        async traerNoEnviados() {
            const store = useIndexedDBStore()

            store.almacen = 'Analisis'
            this.NoEnviados = await store.leerNoEnviados()
            return this.NoEnviados
        },

        async sincronizar() {
            const indexedDB = useIndexedDBStore()
            indexedDB.almacen = 'Analisis'
            const online = navigator.onLine;
            if (this.NoEnviados.length < 1 || !online) return

            for (let i = 0; i < this.NoEnviados.length; i++) {
                const res = await validarYEnviarRegistrarHistoria({ Analisis: this.NoEnviados[i] })


                    indexedDB.borrardato(this.NoEnviados[i].id)

            }

            // await store.analisisPaginado([{id: datos.id - 1}], 10, datos.servicio.name, datos.historia.id_paciente)
        },

        async obtenerAnalisis(key, fetchFn) {
            const indexedDB = useIndexedDBStore()
            const apiRest = useApiRest()
            const varView = useVarView()

            // 1. Buscar key
            let keyAnalisis = await indexedDB.getData(key)

            if (keyAnalisis) {
                indexedDB.almacen = 'Analisis'
                let analisis = await indexedDB.leerdatos()

                this.Analisis = await analisis
                return this.Analisis
            }

            // 2. Traer online
            let analisis = []
            const online = await varView.isOnline
            if(online){
                analisis = await fetchFn()
            } else {
                indexedDB.almacen = 'Analisis'
                analisis = await indexedDB.leerdatos()
            }

            // 3. Merge sin duplicados
            const mapa = new Map(this.Analisis.map(a => [a.id, a]))

            for (const item of analisis) {
                mapa.set(item.id, item)
            }

            this.Analisis = Array.from(mapa.values())

            // 4. Guardar offline
            await apiRest.postOfflineData('KeyAnalisis', [{ key }])
            await apiRest.postOfflineData('Analisis', this.Analisis)

            return this.Analisis
        },

        async listAnalisis(online = true) {
            const apiRest = useApiRest()

            let analisis = []

            if (online) {
                analisis = await apiRest.getData('Analisis', 'analisis')
            } else {
                const store = useIndexedDBStore()
                store.almacen = 'Analisis'
                analisis = await store.leerdatos()
            }

            this.Analisis = analisis
            return analisis
        },

        async analisisInicial() {
            const key = `Analisis:inicio`

            return await this.obtenerAnalisis.call(this, key, () =>
                traerAnalisisInicial()
            )
        },

        async analisisPaciente(paciente_id) {
            this.contexto = 'Paciente'

            const key = `Analisis:paciente:${paciente_id}`

            return await this.obtenerAnalisis.call(this, key, () =>
                traerAnalisisPaciente(paciente_id)
            )
        },

        async analisisPaginado(datos, limite, servicio, paciente) {
            this.contexto = 'Tabla'

            const ultimo_id = datos.length > 0
                ? Math.min(...datos.map(a => a.id)) // 👈 importante (descendente)
                : 0

            const key = `Analisis:cursor:${ultimo_id}`

            return await this.obtenerAnalisis.call(this, key, () =>
                traerAnalisisPaginado(ultimo_id, limite, servicio, paciente)
            )
        },

        async analisisFiltrados(filtros) {
            this.contexto = 'Filtrar'

            let filtrosCompletos = {
                paciente_id: this.Formulario.Analisis.historia.id_paciente,
                servicio: filtros["servicio.name"],
                profesional: filtros["profesional.info_usuario.name"],
                ...filtros
            }
            const key = `Analisis:filtros:${JSON.stringify(filtros)}`

            return await this.obtenerAnalisis.call(this, key, () =>
                traerAnalisisFiltrados(filtrosCompletos)
            )
        },

        async eliminar(analisis) {
            await eliminarAnalisis(analisis)
        },

        async indexDBDatos() {
            const apiRest = useApiRest()
            const token = decryptData(localStorage.getItem('token'))
            const config = useRuntimeConfig()


            const dataPlan = await apiRest.functionCall({
                metodo: 'GET',
                url: config.public.traeDatosPlanManejo,
                token: token
            })

            if (dataPlan.success) {
                // guardar en IndexedDB para uso offline
                const store = useIndexedDBStore();
                // Definir mapeo entre nombre del almacén y propiedad en dataHistoria
                const coleccionesPlan = {
                    Plan_manejo_medicamentos: dataPlan.medicamentos,
                    Plan_manejo_procedimientos: dataPlan.procedimientos,
                    Plan_manejo_insumos: dataPlan.insumos,
                    Plan_manejo_equipos: dataPlan.equipos,
                };

                // Recorremos cada colección y guardamos en IndexedDB
                for (const [almacen, datos] of Object.entries(coleccionesPlan)) {
                    store.almacen = almacen;
                    store.bulkPut(datos)
                }

            }

            const diagnosticos = await apiRest.getData('Diagnosticos', 'diagnosticos')
            await apiRest.postOfflineData('Diagnosticos', diagnosticos)

            const diagnosticosCif = await apiRest.getData('DiagnosticosCIF', 'diagnosticosCIF')
            await apiRest.postOfflineData('DiagnosticosCIF', diagnosticosCif)
        },

        async cargarConCache() {
        }

    }
});