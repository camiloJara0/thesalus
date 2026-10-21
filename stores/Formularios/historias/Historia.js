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
            let historias = await this.datosHistoria

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
            const online = navigator.onLine;
            if (this.NoEnviados.length < 1 || !online) return

            for (let i = 0; i < this.NoEnviados.length; i++) {
                const res = await validarYEnviarRegistrarHistoria({ Analisis: this.NoEnviados[i] })

                if (res) {
                    await indexedDB.borrardato(this.NoEnviados[i].id, 'Analisis')
                }
            }

            // await store.analisisPaginado([{id: datos.id - 1}], 10, datos.servicio.name, datos.historia.id_paciente)
        },

        async obtenerAnalisis(key, fetchFn) {
            const indexedDB = useIndexedDBStore()
            const apiRest = useApiRest()

            // Claves volatiles (paginado, filtros): siempre van a red
            const volatil = /:(cursor|filtros|cambio):/.test(key)
            const TTL_CONSULTA = 120 * 1000

            // Cache fresca: sin llamada a red
            if (!volatil && !(await indexedDB.necesitaRefrescarConsulta(key, TTL_CONSULTA))) {
                indexedDB.almacen = 'Analisis'
                this.Analisis = await indexedDB.leerdatos()
                return this.Analisis
            }

            // 2. Traer online (o fallback a cache si fallo/offline)
            let analisis = null
            try {
                analisis = await fetchFn()
            } catch (e) {
                console.warn('obtenerAnalisis: fallo la consulta, se usa cache local', key, e)
            }

            if (!Array.isArray(analisis)) {
                indexedDB.almacen = 'Analisis'
                this.Analisis = await indexedDB.leerdatos()
                return this.Analisis
            }

            // El endpoint analisisPaciente devuelve arrays anidados (uno por plantilla)
            if (analisis.length > 0 && analisis.every(Array.isArray)) {
                analisis = analisis.flat()
            }

            // 3. Merge sin duplicados (base: cache completa en claves estables)
            let base = this.Analisis
            if (!volatil) {
                indexedDB.almacen = 'Analisis'
                base = await indexedDB.leerdatos()
            }

            const mapa = new Map(base.map(a => [a.id, a]))
            for (const item of this.Analisis) mapa.set(item.id, item)
            for (const item of analisis) mapa.set(item.id, item)
            this.Analisis = Array.from(mapa.values())

            // 4. Guardar offline y sellar el TTL
            if (!volatil) {
                await apiRest.postOfflineData('Analisis', this.Analisis)
                await indexedDB.marcarConsulta(key)
            }

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
            const indexedDB = useIndexedDBStore()
            const TTL_SEED = 30 * 24 * 60 * 60 * 1000

            // Datos de referencia: refrescar como maximo cada 30 dias
            if (!(await indexedDB.necesitaRefrescarConsulta('BD:seed', TTL_SEED))) return

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
                    await store.bulkPut(datos, almacen)
                }

            }

            // getData ya persiste en IndexedDB
            await apiRest.getData('Diagnosticos', 'diagnosticos')
            await apiRest.getData('DiagnosticosCIF', 'diagnosticosCIF')

            // Solo sellar si el plan de manejo cargo bien (para reintentar en el proximo login)
            if (dataPlan.success) {
                await indexedDB.marcarConsulta('BD:seed')
            }
        },

        async cargarConCache() {
        }

    }
});