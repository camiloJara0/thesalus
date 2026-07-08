import { traerdatosProfesion } from '~/Core/Empresa/Datos/Profesion/GETProfesion';
import { traerdatosSecciones } from '~/Core/Empresa/Datos/Profesion/GETSecciones';
import { guardarEnDB } from '~/composables/Formulario/useIndexedDBManager';

// Estructura de datos de Profesion
const estructuraDatosProfesion = {
    Profesion: {
        nombre: '',
        codigo: '',
        permisos: [],
        ListaPacientes: false,
        Diagnosticos_view: false,
    }
}

// Pinia Profesion
export const useDatosProfesionStore = defineStore('DatosProfesion', {
    state: () => ({
        Formulario: estructuraDatosProfesion,
        Datos: JSON.parse(JSON.stringify(estructuraDatosProfesion)), // estructura base compartida
        Profesiones: []
    }),

    getters: {
        async listProfesion(state) {
            const apiRest = useApiRest()
            const Profesiones = await apiRest.getData('Profesion', 'professions')

            state.Profesiones = Profesiones
            return Profesiones
        },
    },

    actions: {
        async listProfesiones() {
            const apiRest = useApiRest()
            const Profesiones = await apiRest.getData('Profesion', 'professions')

            return Profesiones
        },

        async listSecciones() {
            let permisos = await traerdatosSecciones()
            const mapa = {}

            permisos.forEach(({ id, nombre }) => {
                if (nombre === 'Diagnosticos_view' || nombre === 'ListaPacientes') return
                const [modulo, accion] = nombre.split('_')

                if (!mapa[modulo]) {
                mapa[modulo] = {
                    modulo,
                    acciones: []
                }
                }

                mapa[modulo].acciones.push({
                id,
                key: accion,
                nombre: `${modulo}_${accion}`
                })
            })

            return Object.values(mapa)
        },

        async traerSecciones() {
            let secciones = await traerdatosSecciones()

            const accionesMap = {
                get: "Ver",
                post: "Crear",
                put: "Editar",
                delete: "Eliminar",
                view: "Visualizar"
            };

            secciones = secciones.map(s => {
            // Dividir en [modulo, accion]
            const [modulo, accion] = s.nombre.split("_");
            
            // Buscar traducción de la acción
            const accionTraducida = accionesMap[accion] || accion;
            
            return {
                value: s.id,
                text: `${accionTraducida} ${modulo.toLowerCase()}`,
                nombre: `${modulo}_${accion}`
            };
            });

            return secciones
        },

        async traerPermisos(id) {
            let permisos = await traerdatosSecciones(id)
            return Object.values(permisos)
        },

        async indexDBDatos() {
        }

    }
});