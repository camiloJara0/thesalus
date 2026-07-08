import { traerNotas } from '~/Core/Historial/Notas/GETNotas';
import { guardarEnDB } from '~/composables/Formulario/useIndexedDBManager';

// Pinia NotasClinicas
export const useNotasStore = defineStore('Notas', {
    state: () => ({
        Formulario: {
            Nota: {
                id: '',
                fecha_nota: '',
                hora_nota: '',
                id_paciente: '',
                name_paciente: '',
                No_document_paciente: '',
                direccion: '',
                id_profesional: '',
                name_profesional: '',
                tipoAnalisis: '',
            },
            subjetivo: [],
            objetivo: [],
            actividades: [],
            plan: [],
            intervencion: [],
            evaluacion: [],
        },
        Notas: [],

    }),

    getters: {
        async listNotas(state) {
            const apiRest = useApiRest()
            const Notas = await apiRest.getData('Notas', 'notas')

            state.Notas = Notas
            return Notas
        },
    },

    actions: {
        async indexDBDatos() {

        },
    }
});