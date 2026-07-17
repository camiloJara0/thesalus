import { defineStore } from "pinia";
import {
    fetchPlantillas,
    fetchCamposPlantilla,
    fetchCamposDisponibles,
    fetchRegistrosPaciente,
    guardarRegistros,
    crearPlantilla,
    actualizarPlantilla,
    eliminarPlantilla,
    crearCampo,
    actualizarCampo,
    eliminarCampo,
    agregarCampoPlantilla,
    eliminarCampoPlantilla,
    fetchRegistrosPlantilla,
} from "~/Core/Pacientes/KardexAPI";

export const useKardexStore = defineStore('Kardex', {
    state: () => ({
        Formulario: {
            Campo: {
                nombre: '',
                titulo: '',
                tipo: '',
                opciones: '',
                descripcion: '',
                valor_defecto: ''
            },
            Kardex: {
                valores: {

                },
            },
            Plantilla: {
                nombre: '',
                descripcion: '',
                estado: ''
            }
        },
        plantillas: [],
        plantillaActiva: null,
        camposPlantilla: [],
        camposDisponibles: [],
        registrosPaciente: {},
        todosLosRegistros: {},
        cargando: false,
        showCampo: false,
        showPlantilla: false
    }),

    getters: {
        getPlantillaActiva: (state) => state.plantillaActiva,
        getCamposPlantilla: (state) => state.camposPlantilla,
        getRegistros: (state) => (pacienteId) => {
            if (!state.todosLosRegistros) return {};
            return state.todosLosRegistros[pacienteId] || {};
        },
    },

    actions: {
        async cargarPlantillas() {
            this.cargando = true;
            try {
                this.plantillas = await fetchPlantillas();
            } finally {
                this.cargando = false;
            }
        },

        async seleccionarPlantilla(plantillaId) {
            this.cargando = true;
            try {
                this.plantillaActiva = this.plantillas.find(p => p.id === plantillaId) || null;
                if (plantillaId) {
                    this.camposPlantilla = await fetchCamposPlantilla(plantillaId);
                    await this.cargarTodosLosRegistros(plantillaId)
                } else {
                    this.camposPlantilla = [];
                }
            } finally {
                this.cargando = false;
            }
        },

        async cargarCamposDisponibles() {
            this.cargando = true;
            try {
                this.camposDisponibles = await fetchCamposDisponibles();
            } finally {
                this.cargando = false;
            }
        },

        async cargarRegistrosPaciente(pacienteId, plantillaId = null) {
            try {
                const registros = await fetchRegistrosPaciente(pacienteId, plantillaId);
                const mapa = {};
                registros.forEach(r => {
                    mapa[r.id_campo] = r.valor;
                });
                this.registrosPaciente = { ...this.registrosPaciente, [pacienteId]: mapa };
                this.todosLosRegistros = { ...this.todosLosRegistros, [pacienteId]: mapa };
            } catch (error) {
                console.error('Error cargando registros kardex:', error);
            }
        },

        async cargarTodosLosRegistros(plantillaId) {
            const registros = await fetchRegistrosPlantilla(plantillaId);
            const mapa = {};
            registros.forEach(r => {
                if (!mapa[r.id_paciente]) mapa[r.id_paciente] = {};
                mapa[r.id_paciente][r.id_campo] = r.valor;
            });
            this.todosLosRegistros = mapa;
        },

        async guardarRegistrosPaciente(pacienteId, registros) {
            const payload = {
                id_paciente: pacienteId,
                registros: Object.entries(registros).map(([campoId, valor]) => ({
                    id_campo: Number(campoId),
                    valor: valor ?? ''
                }))
            };
            const exito = await guardarRegistros(payload);
            if (exito) {
                this.todosLosRegistros = { ...this.todosLosRegistros, [pacienteId]: { ...registros } };
                this.registrosPaciente = { ...this.registrosPaciente, [pacienteId]: { ...registros } };
            }
            return exito;
        },

        async crearPlantilla(data) {
            const resultado = await crearPlantilla(data);
            if (resultado) await this.cargarPlantillas();
            return resultado;
        },

        async actualizarPlantilla(id, data) {
            const exito = await actualizarPlantilla(id, data);
            if (exito) await this.cargarPlantillas();
            return exito;
        },

        async eliminarPlantilla(id) {
            const exito = await eliminarPlantilla(id);
            if (exito) {
                await this.cargarPlantillas();
                if (this.plantillaActiva?.id === id) {
                    this.plantillaActiva = null;
                    this.camposPlantilla = [];
                }
            }
            return exito;
        },

        async crearCampo(data) {
            const resultado = await crearCampo(data);
            if (resultado) await this.cargarCamposDisponibles();
            return resultado;
        },

        async actualizarCampo(id, data) {
            const exito = await actualizarCampo(id, data);
            if (exito) {
                await this.cargarCamposDisponibles();
                if (this.plantillaActiva) {
                    await this.seleccionarPlantilla(this.plantillaActiva.id);
                }
            }
            return exito;
        },

        async eliminarCampo(id) {
            const exito = await eliminarCampo(id);
            if (exito) await this.cargarCamposDisponibles();
            return exito;
        },

        async agregarCampoPlantilla(plantillaId, data) {
            const exito = await agregarCampoPlantilla(plantillaId, data);
            if (exito) await this.seleccionarPlantilla(plantillaId);
            return exito;
        },

        async eliminarCampoPlantilla(plantillaId, campoId) {
            const exito = await eliminarCampoPlantilla(plantillaId, campoId);
            if (exito) await this.seleccionarPlantilla(plantillaId);
            return exito;
        },
    },
});
